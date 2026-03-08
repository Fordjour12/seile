import { buildLocalDueDateTime, toDateKey } from "./date";
import { buildOverdueDigest, getUpcomingNotificationBody, shouldScheduleTaskNotification } from "./helpers";
import type { SchedulerTask } from "./types";

const SCHEDULER_CHANNEL_ID = "scheduler-reminders";
let hasConfiguredNotifications = false;
let lastOverdueDigest = "";

type NotificationsModule = typeof import("expo-notifications");

let notificationsModule: NotificationsModule | null | undefined;

function getNotificationsModule(): NotificationsModule | null {
  if (notificationsModule !== undefined) {
    return notificationsModule;
  }

  try {
    notificationsModule = require("expo-notifications") as NotificationsModule;
  } catch {
    notificationsModule = null;
  }

  return notificationsModule;
}

function configureNotificationHandler() {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }

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
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return false;
  }

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
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const schedulerNotifications = scheduled.filter(
    (item) => item.content.data?.scope === "scheduler",
  );

  await Promise.all(
    schedulerNotifications.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
  );
}

export async function syncSchedulerNotifications(tasks: SchedulerTask[]): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }

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
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }

  const overdueTasks = tasks.filter((item) => item.status === "overdue");
  const digest = buildOverdueDigest(overdueTasks);
  if (!digest) {
    lastOverdueDigest = "";
    return;
  }

  if (digest === lastOverdueDigest) {
    return;
  }

  const granted = await ensureSchedulerNotificationAccess();
  if (!granted) {
    return;
  }

  lastOverdueDigest = digest;
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
}
