import * as Notifications from "expo-notifications";

const FOCUS_BLOCK_CHANNEL_ID = "focus-blocks";
let hasConfiguredFocusNotifications = false;

function configureFocusNotificationHandler() {
  if (hasConfiguredFocusNotifications) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  hasConfiguredFocusNotifications = true;
}

async function ensureFocusNotificationAccess(): Promise<boolean> {
  configureFocusNotificationHandler();

  if (process.env.EXPO_OS === "android") {
    await Notifications.setNotificationChannelAsync(FOCUS_BLOCK_CHANNEL_ID, {
      name: "Focus blocks",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 180, 120, 180],
      lightColor: "#6B5ECD",
      sound: "default",
    });
  }

  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function cancelFocusBlockNotification(
  activityId: string,
): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const focusNotifications = scheduled.filter(
    (item) =>
      item.content.data?.scope === "first-run-focus-block" &&
      item.content.data?.activityId === activityId,
  );

  await Promise.all(
    focusNotifications.map((item) =>
      Notifications.cancelScheduledNotificationAsync(item.identifier),
    ),
  );
}

export async function scheduleFocusBlockCompletionNotification(options: {
  activityId: string;
  task?: string;
  secondsUntilCompletion: number;
}): Promise<void> {
  const granted = await ensureFocusNotificationAccess();
  if (!granted) {
    return;
  }

  await cancelFocusBlockNotification(options.activityId);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Focus block complete",
      body: options.task?.trim()
        ? `"${options.task.trim()}" is done. Wrap up or mark it complete.`
        : "Your focus block is done. Wrap up or mark it complete.",
      data: {
        scope: "first-run-focus-block",
        activityId: options.activityId,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.ceil(options.secondsUntilCompletion)),
      channelId:
        process.env.EXPO_OS === "android" ? FOCUS_BLOCK_CHANNEL_ID : undefined,
    },
  });
}
