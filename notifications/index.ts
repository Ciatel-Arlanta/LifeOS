import { AppError } from '@/lib/errors';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
  const settings = await Notifications.getPermissionsAsync();
  return settings.status;
}

export async function requestNotificationPermission(): Promise<Notifications.PermissionStatus> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return existing.status;
  const next = await Notifications.requestPermissionsAsync();
  return next.status;
}

export async function scheduleLocalReminder(_input: {
  title: string;
  body: string;
  fireAt: Date;
}): Promise<string> {
  throw new AppError('Reminder scheduling is not wired yet.', 'notifications.not_implemented');
}

export async function cancelLocalReminder(_notificationId: string): Promise<void> {
  throw new AppError('Reminder cancellation is not wired yet.', 'notifications.not_implemented');
}

export function supportsNotifications(): boolean {
  return Platform.OS !== 'web';
}
