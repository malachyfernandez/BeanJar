import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const privacyValidator = v.union(
    v.literal("PUBLIC"),
    v.literal("PRIVATE"),
    v.object({ allowList: v.array(v.string()) })
);

const primitiveIndexValue = v.union(v.string(), v.number(), v.boolean());

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

        // Stored config
        privacy: privacyValidator,
        filterKey: v.optional(v.string()),
        searchKeys: v.optional(v.array(v.string())),
        sortKey: v.optional(v.string()),

        // Server-derived query values
        filterValue: v.optional(primitiveIndexValue),
        searchValue: v.optional(v.string()),
        sortValue: v.optional(primitiveIndexValue),
    })
        .index("by_user_key", ["userToken", "key"])
        .index("by_key_privacy_sort", ["key", "privacy", "sortValue"])
        .index("by_key_privacy_filter_sort", [
            "key",
            "privacy",
            "filterValue",
            "sortValue",
        ])
        .searchIndex("search_public", {
            searchField: "searchValue",
            filterFields: ["key", "filterValue", "privacy"],
        }),

    permissions: defineTable({
        varId: v.id("user_vars"),
        allowedUserId: v.string(),
    })
        .index("by_user", ["allowedUserId"])
        .index("by_var", ["varId"]),
});