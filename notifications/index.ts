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

export async function scheduleLocalReminder(input: {
  title: string;
  body: string;
  fireAt: Date;
}): Promise<string | null> {
  if (Platform.OS === 'web') return `web-${input.fireAt.getTime()}`;
  if (input.fireAt.getTime() <= Date.now()) return null;
  await requestNotificationPermission();
  return Notifications.scheduleNotificationAsync({
    content: { title: input.title, body: input.body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: input.fireAt,
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
