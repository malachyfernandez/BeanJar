import { v } from "convex/values";
import { query } from "./_generated/server";
import { devWarn } from "../utils/devWarnings";

export const search = query({
    args: {
        key: v.string(),
        searchFor: v.optional(v.string()),
        filterFor: v.optional(v.string()),
        userIds: v.optional(v.array(v.string())),
        returnTop: v.optional(v.number()),
        sortKey: v.optional(v.string()),
        showAll: v.optional(v.boolean()),
        searchMode: v.optional(v.union(v.literal("RELEVANCE"), v.literal("SORTED"))),
    },
    handler: async (ctx, args) => {
        const limit = args.returnTop ?? 10;
        const identity = await ctx.auth.getUserIdentity();
        const viewerUserId = identity?.subject;
        const showAll = args.showAll ?? false;
        const searchMode = args.searchMode ?? "RELEVANCE";

        const sortKey = args.sortKey ?? "PROPERTY_TIME_CREATED";

        let results: any[] = [];

        const sharedVarIds = viewerUserId
            ? (await ctx.db
                .query("permissions")
                .withIndex("by_user", (q) => q.eq("allowedUserId", viewerUserId))
                .collect()
            ).map((p) => p.varId)
            : [];

        const sharedVarIdSet = new Set(sharedVarIds.map((id) => id.toString()));

        const includeViewerPrivate = showAll && !!viewerUserId;

        const maybeAddViewerDoc = async () => {
            if (!includeViewerPrivate) return;

            if (args.userIds && args.userIds.length > 0 && !args.userIds.includes(viewerUserId!)) {
                return;
            }

            const viewerDoc = await ctx.db
                .query("user_vars")
                .withIndex("by_user_key", (q) => q.eq("userToken", viewerUserId!).eq("key", args.key))
                .unique();
            if (!viewerDoc) return;
            if (args.filterFor && viewerDoc.filterString !== args.filterFor) return;

            const seen = new Set(results.map((d) => d._id.toString()));
            if (!seen.has(viewerDoc._id.toString())) {
                results.push(viewerDoc);
            }
        };

        // Strategy 1: Full Text Search
        // Used when 'searchFor' is present. Sorts by relevance.
        if (args.searchFor) {
            const normalizedSearchFor = args.searchFor.trim().toLowerCase();

            if (searchMode === "SORTED") {
                const wantsCreatedSort = sortKey === "PROPERTY_TIME_CREATED";
                const wantsModifiedSort = sortKey === "PROPERTY_LAST_MODIFIED";
                const hasFilter = typeof args.filterFor === "string" && args.filterFor.length > 0;
                const hasUserIds = !!args.userIds && args.userIds.length > 0;

                const maxScan = Math.min(Math.max(limit * 200, 200), 5000);
                let scannedPublic = 0;
                let scannedShared = 0;

                // 1) Scan PUBLIC docs in the requested sort order (createdAt/lastModified only).
                // For non-property sorts we fall back to lastModified for scan order.
                const canIndexSort = wantsCreatedSort || wantsModifiedSort;
                const scanOrderKey = wantsCreatedSort ? "PROPERTY_TIME_CREATED" : "PROPERTY_LAST_MODIFIED";

                if (hasUserIds && canIndexSort) {
                    // Per-user scanning: take a window per user, then filter by search substring.
                    const perUserTake = Math.max(Math.ceil(maxScan / args.userIds!.length), limit);
                    const publicCandidates: any[] = [];
                    for (const uid of args.userIds!) {
                        if (hasFilter) {
                            const q = ctx.db.query("user_vars").withIndex(
                                wantsCreatedSort
                                    ? "by_key_user_privacy_filter_created"
                                    : "by_key_user_privacy_filter_modified",
                                (q) =>
                                    q
                                        .eq("key", args.key)
                                        .eq("userToken", uid)
                                        .eq("privacy", "PUBLIC")
                                        .eq("filterString", args.filterFor)
                            );
                            const docs = await q.order("desc").take(perUserTake);
                            scannedPublic += docs.length;
                            publicCandidates.push(...docs);
                        } else {
                            const q = ctx.db.query("user_vars").withIndex(
                                wantsCreatedSort ? "by_key_user_privacy_created" : "by_key_user_privacy_modified",
                                (q) => q.eq("key", args.key).eq("userToken", uid).eq("privacy", "PUBLIC")
                            );
                            const docs = await q.order("desc").take(perUserTake);
                            scannedPublic += docs.length;
                            publicCandidates.push(...docs);
                        }
                        if (scannedPublic >= maxScan) break;
                    }

                    results = publicCandidates.filter((doc) => {
                        const s = (doc.searchString ?? "").toString().toLowerCase();
                        return s.includes(normalizedSearchFor);
                    });
                } else {
                    if (hasFilter && canIndexSort) {
                        const q = ctx.db.query("user_vars").withIndex(
                            wantsCreatedSort
                                ? "by_key_privacy_filter_created"
                                : "by_key_privacy_filter_modified",
                            (q) =>
                                q
                                    .eq("key", args.key)
                                    .eq("privacy", "PUBLIC")
                                    .eq("filterString", args.filterFor)
                        );

                        const candidates = await q.order("desc").take(maxScan);
                        scannedPublic += candidates.length;

                        const userIdSet = hasUserIds ? new Set(args.userIds) : undefined;
                        results = candidates.filter((doc) => {
                            if (userIdSet && !userIdSet.has(doc.userToken)) return false;
                            const s = (doc.searchString ?? "").toString().toLowerCase();
                            return s.includes(normalizedSearchFor);
                        });
                    } else {
                        // When we can't index-sort (value sort), scan by lastModified.
                        const q = ctx.db.query("user_vars").withIndex(
                            wantsCreatedSort ? "by_key_privacy_created" : "by_key_privacy_modified",
                            (q) => q.eq("key", args.key).eq("privacy", "PUBLIC")
                        );

                        const candidates = await q.order("desc").take(maxScan);
                        scannedPublic += candidates.length;

                        const userIdSet = hasUserIds ? new Set(args.userIds) : undefined;
                        results = candidates.filter((doc) => {
                            if (userIdSet && !userIdSet.has(doc.userToken)) return false;
                            if (hasFilter && doc.filterString !== args.filterFor) return false;
                            const s = (doc.searchString ?? "").toString().toLowerCase();
                            return s.includes(normalizedSearchFor);
                        });

                        if (!canIndexSort) {
                            devWarn(
                                "in_memory_value_sort",
                                `useUserVariableGet: searchMode=SORTED is scanning with ${scanOrderKey} and then sorting by value field '${String(sortKey)}' in-memory. This can be expensive. scannedPublic=${scannedPublic}`
                            );
                        }
                    }
                }

                if (hasUserIds && !canIndexSort) {
                    devWarn(
                        "in_memory_userIds_filter_in_search",
                        `useUserVariableGet: searchMode=SORTED + userIds requires extra in-memory filtering when value-field sorting is requested. scannedPublic=${scannedPublic}, userIdsCount=${args.userIds!.length}`
                    );
                }

                // 2) Append shared docs (whitelist) that match the substring search.
                if (sharedVarIds.length > 0) {
                    const sharedDocs: any[] = [];
                    for (const id of sharedVarIds) {
                        const doc = await ctx.db.get(id);
                        scannedShared += 1;
                        if (!doc) continue;
                        if (doc.key !== args.key) continue;
                        if (doc.privacy === "PUBLIC") continue;
                        if (hasFilter && doc.filterString !== args.filterFor) continue;
                        if (hasUserIds && !args.userIds!.includes(doc.userToken)) continue;
                        const s = (doc.searchString ?? "").toString().toLowerCase();
                        if (!s.includes(normalizedSearchFor)) continue;
                        sharedDocs.push(doc);
                    }
                    results = results.concat(sharedDocs);
                }

                await maybeAddViewerDoc();

                devWarn(
                    "sorted_search_mode",
                    `useUserVariableGet: searchMode=SORTED is not very scalable. scannedPublic=${scannedPublic}, scannedShared=${scannedShared}, key='${args.key}', sortKey='${String(sortKey)}', filterFor='${String(args.filterFor ?? "")}', userIdsCount=${args.userIds?.length ?? 0}. Consider searchMode=RELEVANCE for large datasets.`
                );

                // The final sorting/slice happens in the unified sorting block below.
            } else {
                // We over-fetch and then apply the requested sortKey in-memory.
                // This keeps the API semantics consistent (sort is guaranteed),
                // but may be less efficient than a dedicated search+sort index.
                const searchTake = Math.min(Math.max(limit * 10, limit), 200);
                const publicResults = await ctx.db
                    .query("user_vars")
                    .withSearchIndex("search_and_filter", (q) => {
                        let search = q.search("searchString", args.searchFor!);
                        search = search.eq("key", args.key);

                        if (args.filterFor) {
                            search = search.eq("filterString", args.filterFor);
                        }
                        // We only search PUBLIC items in the search index for now
                        // to keep it fast and simple.
                        search = search.eq("privacy", "PUBLIC");

                        return search;
                    })
                    .take(searchTake);

                results = publicResults;

                // For shared (whitelist) variables we can't efficiently apply search relevance
                // without another search index strategy. We append accessible shared docs.
                if (sharedVarIds.length > 0 && results.length < limit) {
                    const sharedDocs: any[] = [];
                    for (const id of sharedVarIds) {
                        if (sharedDocs.length >= searchTake - results.length) break;
                        const doc = await ctx.db.get(id);
                        if (!doc) continue;
                        if (doc.key !== args.key) continue;
                        if (doc.privacy === "PUBLIC") continue;
                        if (args.filterFor && doc.filterString !== args.filterFor) continue;
                        if (args.userIds && args.userIds.length > 0 && !args.userIds.includes(doc.userToken)) continue;
                        sharedDocs.push(doc);
                    }

                    // Sort shared docs by lastModified descending to keep things predictable.
                    sharedDocs.sort((a, b) => (b.lastModified ?? 0) - (a.lastModified ?? 0));
                    results = results.concat(sharedDocs).slice(0, searchTake);
                }

                if (args.userIds && args.userIds.length > 0) {
                    devWarn(
                        "in_memory_userIds_filter_in_search",
                        `useUserVariableGet: userIds filtering during searchMode=RELEVANCE is partially in-memory (sharedDocs) and not applied to the PUBLIC search index results. userIdsCount=${args.userIds.length}`
                    );
                }

                await maybeAddViewerDoc();
            }
        } 
        // Strategy 2: Database Filter & Sort
        // Used when NO search term is present. Sorts by lastModified.
        else {
            const wantsCreatedSort = sortKey === "PROPERTY_TIME_CREATED";
            const wantsModifiedSort = sortKey === "PROPERTY_LAST_MODIFIED";
            const isPropertySort = wantsCreatedSort || wantsModifiedSort;

            const hasFilter = typeof args.filterFor === "string" && args.filterFor.length > 0;
            const hasUserIds = !!args.userIds && args.userIds.length > 0;

            const takeN = limit;

            if (isPropertySort) {
                if (hasUserIds) {
                    const allowedIds = new Set(args.userIds);
                    const perUserDocs: any[] = [];
                    for (const uid of args.userIds!) {
                        // Only fetch PUBLIC docs here; shared docs are handled via permissions table.
                        if (hasFilter) {
                            const q = ctx.db.query("user_vars").withIndex(
                                wantsCreatedSort
                                    ? "by_key_user_privacy_filter_created"
                                    : "by_key_user_privacy_filter_modified",
                                (q) =>
                                    q
                                        .eq("key", args.key)
                                        .eq("userToken", uid)
                                        .eq("privacy", "PUBLIC")
                                        .eq("filterString", args.filterFor)
                            );
                            const doc = await q.order("desc").first();
                            if (doc && allowedIds.has(doc.userToken)) {
                                perUserDocs.push(doc);
                            }
                        } else {
                            const q = ctx.db.query("user_vars").withIndex(
                                wantsCreatedSort
                                    ? "by_key_user_privacy_created"
                                    : "by_key_user_privacy_modified",
                                (q) => q.eq("key", args.key).eq("userToken", uid).eq("privacy", "PUBLIC")
                            );
                            const doc = await q.order("desc").first();
                            if (doc && allowedIds.has(doc.userToken)) {
                                perUserDocs.push(doc);
                            }
                        }
                    }

                    results = perUserDocs;
                } else {
                    if (hasFilter) {
                        const q = ctx.db.query("user_vars").withIndex(
                            wantsCreatedSort
                                ? "by_key_privacy_filter_created"
                                : "by_key_privacy_filter_modified",
                            (q) =>
                                q
                                    .eq("key", args.key)
                                    .eq("privacy", "PUBLIC")
                                    .eq("filterString", args.filterFor)
                        );
                        results = await q.order("desc").take(takeN);
                    } else {
                        const q = ctx.db.query("user_vars").withIndex(
                            wantsCreatedSort ? "by_key_privacy_created" : "by_key_privacy_modified",
                            (q) => q.eq("key", args.key).eq("privacy", "PUBLIC")
                        );
                        results = await q.order("desc").take(takeN);
                    }
                }
            } else {
                // Value-property sort: use a stable/fast index to fetch candidates, then sort in-memory.
                let q = ctx.db.query("user_vars").withIndex("by_key_privacy_modified", (q) =>
                    q.eq("key", args.key).eq("privacy", "PUBLIC")
                );
                if (hasFilter) {
                    q = q.filter((q) => q.eq(q.field("filterString"), args.filterFor));
                }
                const candidates = await q.order("desc").take(Math.min(limit * 20, 200));
                if (hasUserIds) {
                    const allowedIds = new Set(args.userIds);
                    results = candidates.filter((doc) => allowedIds.has(doc.userToken));
                } else {
                    results = candidates;
                }

                devWarn(
                    "in_memory_value_sort",
                    `useUserVariableGet: value-field sortKey='${String(sortKey)}' requires in-memory sorting after fetching candidates. candidatesFetched=${candidates.length}, key='${args.key}'`
                );
            }

            // Append shared-with-viewer variables (whitelist) if we have room.
            if (sharedVarIds.length > 0 && results.length < limit) {
                const sharedDocs: any[] = [];
                for (const id of sharedVarIds) {
                    if (sharedDocs.length >= limit - results.length) break;
                    const doc = await ctx.db.get(id);
                    if (!doc) continue;
                    if (doc.key !== args.key) continue;
                    if (doc.privacy === "PUBLIC") continue;
                    if (args.filterFor && doc.filterString !== args.filterFor) continue;
                    if (args.userIds && args.userIds.length > 0 && !args.userIds.includes(doc.userToken)) continue;
                    sharedDocs.push(doc);
                }

                sharedDocs.sort((a, b) => (b.lastModified ?? 0) - (a.lastModified ?? 0));

                // De-dupe in case a doc is PUBLIC and already included.
                const seen = new Set(results.map((d) => d._id.toString()));
                for (const doc of sharedDocs) {
                    if (results.length >= limit) break;
                    if (seen.has(doc._id.toString())) continue;
                    results.push(doc);
                }
            }

            await maybeAddViewerDoc();
        }

        // Apply final in-memory sorting based on sortKey once we have a unified result list
        if (sortKey && results.length > 1) {
            results.sort((a, b) => {
                if (sortKey === "PROPERTY_TIME_CREATED") {
                    return (b.createdAt ?? 0) - (a.createdAt ?? 0);
                }
                if (sortKey === "PROPERTY_LAST_MODIFIED") {
                    return (b.lastModified ?? 0) - (a.lastModified ?? 0);
                }
                const av = a.value?.[sortKey];
                const bv = b.value?.[sortKey];

                const aUndef = av === undefined || av === null;
                const bUndef = bv === undefined || bv === null;
                if (aUndef && bUndef) return 0;
                if (aUndef) return 1;
                if (bUndef) return -1;

                if (typeof av === "number" && typeof bv === "number") {
                    return bv - av;
                }

                return String(bv).localeCompare(String(av));
            });
        }

        results = results.slice(0, limit);

        // Map to the clean structure expected by the frontend
        // We return the whole document structure so the client can use .value, .lastModified, etc.
        return results.map((doc) => ({
            ...doc,
        }));
    },
});