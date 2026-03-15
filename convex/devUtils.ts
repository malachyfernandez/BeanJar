import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Nuke all tables - DEV ONLY
 * Deletes all data from every table in the database.
 * WARNING: This will permanently delete ALL data!
 */
export const nukeAllTables = mutation({
  args: {
    confirm: v.literal("NUKE_ALL_DATA"),
  },
  handler: async (ctx, args) => {
    const tables = [
      "globals",
      "user_vars",
      "permissions", 
      "user_var_public_counts",
      "user_var_owner_counts",
      "user_var_shared_counts",
      "user_list_definitions",
      "user_lists",
      "list_permissions",
      "user_list_public_counts",
      "user_list_owner_counts",
      "user_list_shared_counts",
    ] as const;

    const deletedCounts: Record<string, number> = {};

    for (const table of tables) {
      const allDocs = await ctx.db.query(table).collect();
      for (const doc of allDocs) {
        await ctx.db.delete(doc._id);
      }
      deletedCounts[table] = allDocs.length;
    }

    return {
      message: "All tables nuked successfully",
      deletedCounts,
    };
  },
});

/**
 * Get table counts - DEV ONLY
 * Returns the number of documents in each table.
 */
export const getTableCounts = mutation({
  handler: async (ctx) => {
    const tables = [
      "globals",
      "user_vars",
      "permissions",
      "user_var_public_counts", 
      "user_var_owner_counts",
      "user_var_shared_counts",
      "user_list_definitions",
      "user_lists",
      "list_permissions",
      "user_list_public_counts",
      "user_list_owner_counts",
      "user_list_shared_counts",
    ] as const;

    const counts: Record<string, number> = {};

    for (const table of tables) {
      const allDocs = await ctx.db.query(table).collect();
      counts[table] = allDocs.length;
    }

    return counts;
  },
});
