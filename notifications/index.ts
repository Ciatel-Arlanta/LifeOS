import { PermissionStatus } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch {
  // Notifications are unavailable in some environments (web preview).
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

const REMINDER_CHANNEL_ID = 'lifeos-reminders-v2';

async function ensureReminderChannel(): Promise<string | undefined> {
  if (Platform.OS !== 'android') return undefined;
  const existing = await Notifications.getNotificationChannelAsync(REMINDER_CHANNEL_ID);
  if (!existing) {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
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
}): Promise<string | null> {
  if (Platform.OS === 'web') return `web-${input.fireAt.getTime()}`;
  if (input.fireAt.getTime() <= Date.now()) return null;
  await requestNotificationPermission();
  const channelId = await ensureReminderChannel();
  return Notifications.scheduleNotificationAsync({
    content: { title: input.title, body: input.body },
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
