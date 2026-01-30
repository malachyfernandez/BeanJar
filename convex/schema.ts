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
        isPublic: v.boolean(),
        searchString: v.optional(v.string()),
    })
        .index("by_user_key", ["userToken", "key"])
        .searchIndex("search_string", {
            searchField: "searchString",
            filterFields: ["key"]
        }),

});