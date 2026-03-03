import { mutation } from "./_generated/server";

export const backfillAccountsV2 = mutation({
  args: {},
  handler: async (ctx) => {
    const accounts = (await ctx.db.query("accounts").collect()) as Array<{
      _id: string;
      type?: string;
      status?: string;
      isArchived?: boolean;
    }>;

    let updatedCount = 0;

    for (const account of accounts) {
      const nextStatus = account.status ?? (account.isArchived ? "archived" : "active");
      const nextType = account.type === "bank" ? "checking" : account.type;

      const patch: Record<string, unknown> = {};

      if (account.status !== nextStatus) {
        patch.status = nextStatus;
      }

      if (account.type !== nextType && nextType) {
        patch.type = nextType;
      }

      if (Object.keys(patch).length > 0) {
        patch.updatedAt = Date.now();
        await ctx.db.patch(account._id as any, patch as any);
        updatedCount += 1;
      }
    }

    return {
      scannedCount: accounts.length,
      updatedCount,
    };
  },
});
