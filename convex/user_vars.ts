import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const get = query({
    args: {
        key: v.string(),
        targetUserToken: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        // Default to "Me" if no target is specified
        const targetUserToken = args.targetUserToken ?? identity?.subject;

        if (!targetUserToken) return null;

        const record = await ctx.db
            .query("user_vars")
            .withIndex("by_user_key", (q) =>
                q.eq("userToken", targetUserToken).eq("key", args.key)
            )
            .unique();

        if (!record) return null;


        const isUserTheVariableOwner = identity?.subject === targetUserToken;

        if (isUserTheVariableOwner || record.isPublic) {
            return record.value;
        }
        return null;
    },
});

export const set = mutation({
    args: {
        key: v.string(),
        value: v.any(),
        isPublic: v.boolean(),
        searchString: v.optional(v.string())
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

        if (record) {
            await ctx.db.patch(record._id, {
                value: args.value,
                isPublic: args.isPublic,
                searchString: args.searchString
            });
        } else {
            await ctx.db.insert("user_vars", {
                userToken,
                key: args.key,
                value: args.value,
                isPublic: args.isPublic,
                searchString: args.searchString
            });
        }
    },

});

export const search = query({
    args: {
        query: v.string(),
        keyFilter: v.string(),
        minQueryLength: v.optional(v.number()) // Default: 2
    },
    handler: async (ctx, args) => {

        const minLength = args.minQueryLength ?? 2;

        if (args.query.length < minLength) return [];

        const results = await ctx.db
            .query("user_vars")
            .withSearchIndex("search_string", (q) =>
                q.search("searchString", args.query).eq("key", args.keyFilter)
            )
            .take(10);

        // Return clean results
        return results.map((r) => ({
            userId: r.userToken,
            data: r.value
        }));
    },
});