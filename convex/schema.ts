import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

    globals: defineTable({
        key: v.string(),
        value: v.any(),
    }).index("by_key", ["key"]),

    user_vars: defineTable({
        userToken: v.string(),
        key: v.string(),
        value: v.any(),

        // Metadata
        lastModified: v.number(),
        createdAt: v.number(),

        // Configuration
        privacy: v.union(
            v.literal("PUBLIC"),
            v.literal("PRIVATE"),
            v.object({ allowList: v.array(v.string()) })
        ),
        filterKey: v.optional(v.string()),
        searchKeys: v.optional(v.array(v.string())),

        // Indexed Fields
        filterString: v.optional(v.string()),
        searchString: v.optional(v.string()),
    })
        .index("by_user_key", ["userToken", "key"])
        .index("by_key_privacy_modified", ["key", "privacy", "lastModified"])
        .index("by_key_privacy_created", ["key", "privacy", "createdAt"])
        .index("by_key_privacy_filter_modified", ["key", "privacy", "filterString", "lastModified"])
        .index("by_key_privacy_filter_created", ["key", "privacy", "filterString", "createdAt"])
        .index("by_key_user_privacy_modified", ["key", "userToken", "privacy", "lastModified"])
        .index("by_key_user_privacy_created", ["key", "userToken", "privacy", "createdAt"])
        .index("by_key_user_privacy_filter_modified", ["key", "userToken", "privacy", "filterString", "lastModified"])
        .index("by_key_user_privacy_filter_created", ["key", "userToken", "privacy", "filterString", "createdAt"])
        .searchIndex("search_and_filter", {
            searchField: "searchString",
            filterFields: ["key", "filterString", "privacy"]
        }),

    permissions: defineTable({
        varId: v.id("user_vars"),
        allowedUserId: v.string(),
    })
    .index("by_user", ["allowedUserId"])
    .index("by_var", ["varId"]),

});