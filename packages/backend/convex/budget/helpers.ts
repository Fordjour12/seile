import type { Doc } from "../_generated/dataModel";

export function periodDateRange(year: number, month: number): { start: number; end: number } {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0).getTime();
  const end = new Date(year, month, 0, 23, 59, 59, 999).getTime();
  return { start, end };
}

export async function computeActualSpend(
  ctx: any,
  userId: string,
  categoryId: string,
  periodStart: number,
  periodEnd: number,
): Promise<number> {
  const rows: Doc<"transactions">[] = await ctx.db
    .query("transactions")
    .withIndex("by_userId_category", (q: any) => q.eq("userId", userId).eq("categoryId", categoryId))
    .filter((q: any) =>
      q.and(
        q.eq(q.field("kind"), "expense"),
        q.gte(q.field("occurredAt"), periodStart),
        q.lte(q.field("occurredAt"), periodEnd),
      ),
    )
    .collect();

  return rows.reduce((sum, row) => sum + row.amount, 0);
}

export function computeEnvelopeComputed(allocatedAmount: number, rolloverAmount: number, actualSpend: number) {
  const effectiveAllocation = allocatedAmount + rolloverAmount;
  const remaining = effectiveAllocation - actualSpend;
  const overspent = remaining < 0;
  const spendPercent = effectiveAllocation <= 0 ? 0 : Math.min(100, (actualSpend / effectiveAllocation) * 100);

  return { effectiveAllocation, remaining, overspent, spendPercent };
}
