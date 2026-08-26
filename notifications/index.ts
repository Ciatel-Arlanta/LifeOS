import { PermissionStatus } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

const REMINDER_CHANNEL_ID = 'lifeos-reminders-v3';
const REMINDER_CHANNEL_SOUND = 'lifeos_reminder.wav';
const SNOOZE_CATEGORY_ID = 'reminder-snooze';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  void Notifications.setNotificationCategoryAsync(SNOOZE_CATEGORY_ID, [
    { identifier: 'SNOOZE_1H', buttonTitle: 'Snooze 1h', options: { opensAppToForeground: false } },
    { identifier: 'SNOOZE_1D', buttonTitle: 'Snooze 1d', options: { opensAppToForeground: false } },
  ]).catch(() => {
    // Not available on web / unsupported Android versions.
  });
} catch {
  // Notifications are unavailable in some environments (web preview).
}

export const SNOOZE_LEAD_MINUTES: Record<string, number> = {
  SNOOZE_1H: 60,
  SNOOZE_1D: 60 * 24,
};

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

export function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  return Notifications.getLastNotificationResponseAsync() ?? Promise.resolve(null);
}

export async function getNotificationPermission(): Promise<Notifications.PermissionStatus> {
  if (Platform.OS === 'web') return PermissionStatus.UNDETERMINED;
  const settings = await Notifications.getPermissionsAsync();
  return settings.status;
}

export async function requestNotificationPermission(): Promise<Notifications.PermissionStatus> {
  if (Platform.OS === 'web') return PermissionStatus.DENIED;
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return existing.status;
  const next = await Notifications.requestPermissionsAsync();
  return next.status;
}

async function ensureReminderChannel(): Promise<string | undefined> {
  if (Platform.OS !== 'android') return undefined;
  const existing = await Notifications.getNotificationChannelAsync(REMINDER_CHANNEL_ID);
  if (!existing) {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: REMINDER_CHANNEL_SOUND,
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
  return REMINDER_CHANNEL_ID;
}

export async function scheduleLocalReminder(input: {
  title: string;
  body: string;
  fireAt: Date;
  reminderId?: number;
}): Promise<string | null> {
  if (Platform.OS === 'web') return `web-${input.fireAt.getTime()}`;
  if (input.fireAt.getTime() <= Date.now()) return null;
  await requestNotificationPermission();
  const channelId = await ensureReminderChannel();
  return Notifications.scheduleNotificationAsync({
    content: {
      title: input.title,
      body: input.body,
      categoryIdentifier: SNOOZE_CATEGORY_ID,
      data: input.reminderId != null ? { reminderId: input.reminderId } : undefined,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: input.fireAt,
      channelId,
    },
  });
}

export async function cancelLocalReminder(notificationId: string | null): Promise<void> {
  if (!notificationId || Platform.OS === 'web' || notificationId.startsWith('web-')) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export function supportsNotifications(): boolean {
  return Platform.OS !== 'web';
}

export async function openNotificationSettings(): Promise<void> {
  if (Platform.OS === 'web') return;
  Linking.openSettings();
}
