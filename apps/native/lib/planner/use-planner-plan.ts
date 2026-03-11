import { useLocalSearchParams } from "expo-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { useState } from "react";

import { asId } from "@/lib/backend-api";
import { plannerApi } from "@/lib/planner/api";

type PlannerPlanItem = {
  _id: string;
  title: string;
  itemType: string;
  status: "pending" | "done" | "moved" | "dropped";
  date: string;
  startTime?: string;
  endTime?: string;
  priority: string;
  effort: string;
  locked: boolean;
};

export function usePlannerPlan() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const planId = rawId ? asId<"plans">(rawId) : undefined;

  const plan = useQuery(
    plannerApi["planner/queries"].getPlanById,
    planId ? { id: planId } : "skip",
  );
  const setPlanItemStatus = useMutation(plannerApi["planner/mutations"].setPlanItemStatus);
  const replanWeeklyPlan = useAction(plannerApi["planner/actions"].replanWeeklyPlan);
  const reviewWeeklyPlan = useAction(plannerApi["planner/actions"].reviewWeeklyPlan);

  const [status, setStatus] = useState("Plan ready.");
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const groupedItems = groupPlanItems((plan?.items ?? []) as PlannerPlanItem[]);

  const runTask = async (key: string, callback: () => Promise<unknown>, successMessage: string) => {
    if (busyKey) {
      return;
    }

    setBusyKey(key);
    setStatus("Working...");
    try {
      await callback();
      setStatus(successMessage);
    } catch (error) {
      setStatus(formatPlannerError(error));
    } finally {
      setBusyKey(null);
    }
  };

  const toggleItemDone = async (
    itemId: string,
    currentStatus: PlannerPlanItem["status"],
  ) => {
    const nextStatus = currentStatus === "done" ? "pending" : "done";

    await runTask(
      `item-${itemId}`,
      () =>
        setPlanItemStatus({
          itemId: toPlanItemId(itemId),
          status: nextStatus,
        }),
      nextStatus === "done" ? "Plan item marked done." : "Plan item moved back to pending.",
    );
  };

  const replan = async () => {
    if (!planId) {
      return;
    }

    await runTask(
      "replan",
      () => replanWeeklyPlan({ planId }),
      "Planner rechecked the remainder of the week.",
    );
  };

  const review = async () => {
    if (!planId) {
      return;
    }

    await runTask(
      "review",
      () => reviewWeeklyPlan({ planId }),
      "Weekly review generated.",
    );
  };

  return {
    plan,
    groupedItems,
    status,
    busyKey,
    toggleItemDone,
    replan,
    review,
  };
}

function groupPlanItems(items: PlannerPlanItem[]) {
  const groups = new Map<string, PlannerPlanItem[]>();

  for (const item of items) {
    const section = groups.get(item.date);
    if (section) {
      section.push(item);
    } else {
      groups.set(item.date, [item]);
    }
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, sectionItems]) => ({
      date,
      label: formatPlanDateLabel(date),
      items: sectionItems.sort((left, right) => {
        const leftKey = `${left.startTime ?? "99:99"}-${left.title}`;
        const rightKey = `${right.startTime ?? "99:99"}-${right.title}`;
        return leftKey.localeCompare(rightKey);
      }),
    }));
}

function formatPlanDateLabel(date: string) {
  const value = new Date(`${date}T12:00:00Z`);
  return value.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatPlannerError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Planner action failed.";
}

function toPlanItemId(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Invalid plan item id.");
  }

  return asId<"planItems">(trimmed);
}
