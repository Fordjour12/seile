import { toDateKey } from "./date";
import { notifyOverdueSummary, syncSchedulerNotifications } from "./notifications";
import { reconcileSchedulerTasks } from "./repository";
import type { SchedulerTask } from "./types";

export async function synchronizeSchedulerState(options?: {
  notifyOverdueSummary?: boolean;
}): Promise<SchedulerTask[]> {
  const tasks = await reconcileSchedulerTasks(toDateKey(new Date()));
  try {
    await syncSchedulerNotifications(tasks);
  } catch (error) {
    console.warn("Failed to sync scheduler notifications", error);
  }

  if (options?.notifyOverdueSummary) {
    try {
      await notifyOverdueSummary(tasks);
    } catch (error) {
      console.warn("Failed to send scheduler overdue summary", error);
    }
  }

  return tasks;
}
