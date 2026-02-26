import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

type Privacy = "PUBLIC" | "PRIVATE" | { allowList: string[] };

function buildSearchString(value: any, searchKeys?: string[], manual?: string) {
    if (typeof manual === "string" && manual.trim().length > 0) return manual;
    if (!searchKeys || searchKeys.length === 0) return undefined;
    if (value === null || value === undefined) return undefined;

    const parts: string[] = [];
    for (const k of searchKeys) {
        const v = value?.[k];
        if (typeof v === "string") parts.push(v);
        else if (typeof v === "number" || typeof v === "boolean") parts.push(String(v));
    }

    const s = parts.join(" ").trim();
    return s.length > 0 ? s : undefined;
}

function buildFilterString(value: any, filterKey?: string, manual?: string) {
    if (typeof manual === "string" && manual.trim().length > 0) return manual;
    if (!filterKey) return undefined;
    if (value === null || value === undefined) return undefined;

    const v = value?.[filterKey];
    if (typeof v === "string") return v;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    return undefined;
}

export const get = query({
    args: {
        key: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        const userToken = identity?.subject;
        if (!userToken) return null;

        const record = await ctx.db
            .query("user_vars")
            .withIndex("by_user_key", (q) => q.eq("userToken", userToken).eq("key", args.key))
            .unique();

        if (!record) return null;

        return record;
    },
});

export const set = mutation({
    args: {
        key: v.string(),
        value: v.any(),
        privacy: v.union(
            v.literal("PUBLIC"),
            v.literal("PRIVATE"),
            v.object({ allowList: v.array(v.string()) })
        ),
        filterKey: v.optional(v.string()),
        searchKeys: v.optional(v.array(v.string())),
        filterString: v.optional(v.string()),
        searchString: v.optional(v.string()),
    },

    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const userToken = identity.subject;

        const record = await ctx.db
            .query("user_vars")
            .withIndex("by_user_key", (q) =>
                q.eq("userToken", userToken).eq("key", args.key)
            )
            .unique();

        const now = Date.now();

        const privacy: Privacy = args.privacy;
        const nextFilterKey = args.filterKey;
        const nextSearchKeys = args.searchKeys;
        const computedSearchString = buildSearchString(args.value, nextSearchKeys, args.searchString);
        const computedFilterString = buildFilterString(args.value, nextFilterKey, args.filterString);

        let varId = record?._id;

        if (record) {
            await ctx.db.patch(record._id, {
                value: args.value,
                lastModified: now,
                privacy,
                filterKey: nextFilterKey,
                searchKeys: nextSearchKeys,
                filterString: computedFilterString,
                searchString: computedSearchString,
            });
        } else {
            varId = await ctx.db.insert("user_vars", {
                userToken,
                key: args.key,
                value: args.value,
                lastModified: now,
                createdAt: now,
                privacy,
                filterKey: nextFilterKey,
                searchKeys: nextSearchKeys,
                filterString: computedFilterString,
                searchString: computedSearchString,
            });
        }

        if (!varId) throw new Error("Failed to resolve variable id");

        // Permissions sync (scalable whitelist privacy)
        if (typeof privacy === "object" && privacy !== null) {
            const desired = new Set(privacy.allowList);
            const existing = await ctx.db
                .query("permissions")
                .withIndex("by_var", (q) => q.eq("varId", varId))
                .collect();

            const existingSet = new Set(existing.map((p) => p.allowedUserId));

            for (const p of existing) {
                if (!desired.has(p.allowedUserId)) {
                    await ctx.db.delete(p._id);
                }
            }

            for (const allowedUserId of desired) {
                if (!existingSet.has(allowedUserId)) {
                    await ctx.db.insert("permissions", {
                        varId,
                        allowedUserId,
                    });
                }
            }
        } else {
            // If not a whitelist privacy mode, remove any stale permissions rows.
            const existing = await ctx.db
                .query("permissions")
                .withIndex("by_var", (q) => q.eq("varId", varId))
                .collect();
            for (const p of existing) {
                await ctx.db.delete(p._id);
            }
        }
    },
});