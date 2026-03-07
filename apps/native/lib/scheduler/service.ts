import { toDateKey } from "./date";
import { notifyOverdueSummary, syncSchedulerNotifications } from "./notifications";
import { reconcileSchedulerTasks } from "./repository";
import type { SchedulerTask } from "./types";

export async function synchronizeSchedulerState(options?: {
  notifyOverdueSummary?: boolean;
}): Promise<SchedulerTask[]> {
  const tasks = await reconcileSchedulerTasks(toDateKey(new Date()));
  await syncSchedulerNotifications(tasks);

  if (options?.notifyOverdueSummary) {
    await notifyOverdueSummary(tasks);
  }

  return tasks;
}
