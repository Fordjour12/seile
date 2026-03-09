import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";

import { buildLocalDueDateTime, toDateKey } from "./date";
import { buildOverdueDigest, getUpcomingNotificationBody, shouldScheduleTaskNotification } from "./helpers";
import type { SchedulerTask } from "./types";

const SCHEDULER_CHANNEL_ID = "scheduler-reminders";
const OVERDUE_DIGEST_STORAGE_KEY = "scheduler-overdue-digest";
let hasConfiguredNotifications = false;
let lastOverdueDigest = "";
let overdueDigestLoaded = false;

function configureNotificationHandler() {
  if (hasConfiguredNotifications) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  hasConfiguredNotifications = true;
}

export async function ensureSchedulerNotificationAccess(): Promise<boolean> {
  configureNotificationHandler();

  if (process.env.EXPO_OS === "android") {
    await Notifications.setNotificationChannelAsync(SCHEDULER_CHANNEL_ID, {
      name: "Scheduler reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 180, 120, 180],
      lightColor: "#7C6EFA",
    });
  }

  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function cancelSchedulerNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const schedulerNotifications = scheduled.filter(
    (item) => item.content.data?.scope === "scheduler",
  );

  await Promise.all(
    schedulerNotifications.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
  );
}

async function loadPersistedOverdueDigest(): Promise<string> {
  if (overdueDigestLoaded) {
    return lastOverdueDigest;
  }

  try {
    lastOverdueDigest =
      (await SecureStore.getItemAsync(OVERDUE_DIGEST_STORAGE_KEY)) ?? "";
  } catch {
    lastOverdueDigest = "";
  }

  overdueDigestLoaded = true;
  return lastOverdueDigest;
}

async function persistOverdueDigest(digest: string): Promise<void> {
  lastOverdueDigest = digest;
  overdueDigestLoaded = true;

  try {
    if (digest) {
      await SecureStore.setItemAsync(OVERDUE_DIGEST_STORAGE_KEY, digest);
      return;
    }

    await SecureStore.deleteItemAsync(OVERDUE_DIGEST_STORAGE_KEY);
  } catch {
    // Ignore storage failures and fall back to in-memory digest tracking.
  }
}

export async function syncSchedulerNotifications(tasks: SchedulerTask[]): Promise<void> {
  const granted = await ensureSchedulerNotificationAccess();
  if (!granted) {
    return;
  }

  await cancelSchedulerNotifications();

  const todayDate = toDateKey(new Date());
  for (const task of tasks) {
    if (!shouldScheduleTaskNotification(task)) {
      continue;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: task.title,
        body: getUpcomingNotificationBody(task, todayDate),
        data: {
          scope: "scheduler",
          taskId: task.id,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: buildLocalDueDateTime(task.dueDate, task.time),
        channelId: process.env.EXPO_OS === "android" ? SCHEDULER_CHANNEL_ID : undefined,
      },
    });
  }
}

export async function notifyOverdueSummary(tasks: SchedulerTask[]): Promise<void> {
  const overdueTasks = tasks.filter((item) => item.status === "overdue");
  const digest = buildOverdueDigest(overdueTasks);
  if (!digest) {
    await persistOverdueDigest("");
    return;
  }

  const previousDigest = await loadPersistedOverdueDigest();
  if (digest === previousDigest) {
    return;
  }

  const granted = await ensureSchedulerNotificationAccess();
  if (!granted) {
    return;
  }

  const preview = overdueTasks
    .slice(0, 3)
    .map((item) => item.title)
    .join(", ");

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `You have ${overdueTasks.length} overdue task${overdueTasks.length === 1 ? "" : "s"}`,
      body: preview || "Open Scheduler to catch up.",
      data: {
        scope: "scheduler",
        kind: "overdue-summary",
      },
    },
    trigger: null,
  });

  await persistOverdueDigest(digest);
}
