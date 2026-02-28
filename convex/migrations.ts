import { mutation } from "./_generated/server";

export const migrateUserVars = mutation({
    args: {},
    handler: async (ctx) => {
        const vars = await ctx.db.query("user_vars").collect();
        let updated = 0;

        for (const doc of vars) {
            const patch: any = {};

            if (doc.lastModified === undefined || doc.lastModified === null) {
                patch.lastModified = Date.now();
            }

            if (doc.createdAt === undefined || doc.createdAt === null) {
                patch.createdAt = doc.lastModified ?? Date.now();
            }

            if (doc.privacy === undefined || doc.privacy === null) {
                patch.privacy = "PRIVATE";
            }

            if (Object.keys(patch).length > 0) {
                await ctx.db.patch(doc._id, patch);
                updated += 1;
            }
        }

        return { scanned: vars.length, updated };
    },
});

export const resetDevData = mutation({
    args: {},
    handler: async (ctx) => {
        const vars = await ctx.db.query("user_vars").collect();
        for (const doc of vars) {
            await ctx.db.delete(doc._id);
        }

        const perms = await ctx.db.query("permissions").collect();
        for (const doc of perms) {
            await ctx.db.delete(doc._id);
        }

        return { deletedVars: vars.length, deletedPerms: perms.length };
    },
});
