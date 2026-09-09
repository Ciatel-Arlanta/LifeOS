import { renewalNoticeAt } from '@/features/subscriptions/helpers';
import type { Subscription } from '@/features/subscriptions/types';
import { formatRelativeDay, formatShortDate } from '@/utils/date';
import { formatInr } from '@/utils/money';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { getNotificationPermission } from './index';

const RENEWAL_CHANNEL_ID = 'lifeos-renewals-v1';
const RENEWAL_KIND = 'subscription-renewal';

async function ensureRenewalChannel(): Promise<string | undefined> {
  if (Platform.OS !== 'android') return undefined;
  const existing = await Notifications.getNotificationChannelAsync(RENEWAL_CHANNEL_ID);
  if (!existing) {
    await Notifications.setNotificationChannelAsync(RENEWAL_CHANNEL_ID, {
      name: 'Subscription renewals',
      importance: Notifications.AndroidImportance.DEFAULT,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
    });
  }
  return RENEWAL_CHANNEL_ID;
}

function isRenewalNotification(request: Notifications.NotificationRequest): boolean {
  const data = request.content.data;
  return Boolean(data && typeof data === 'object' && (data as { kind?: unknown }).kind === RENEWAL_KIND);
}

async function cancelExisting(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => isRenewalNotification(item))
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
  );
}

/**
 * Rebuilds the advance-notice notifications for every active subscription.
 *
 * Notification ids are not persisted — the whole set is cancelled and re-scheduled on
 * every hydrate, which keeps them correct after edits, pauses, deletes and auto-posts
 * without adding a column to `subscriptions`.
 */
export async function syncRenewalNotifications(
  items: Subscription[],
  leadDays: number,
  now = new Date()
): Promise<number> {
  if (Platform.OS === 'web') return 0;
  // Never prompt from a background hydrate — the Reminders tab owns asking.
  if ((await getNotificationPermission()) !== 'granted') return 0;

  await cancelExisting();
  if (leadDays <= 0) return 0;

  const channelId = await ensureRenewalChannel();
  let scheduled = 0;

  for (const item of items) {
    if (item.inactiveAtMs != null) continue;
    const fireAt = renewalNoticeAt(item.renewalDate, leadDays, now);
    if (!fireAt) continue;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${item.name} renews ${formatRelativeDay(item.renewalDate, fireAt).toLowerCase()}`,
        body: `${formatInr(item.costMinor, { compact: true })} on ${formatShortDate(item.renewalDate)}. Cancel or review it before it auto-debits.`,
        data: { kind: RENEWAL_KIND, subscriptionId: item.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
        channelId,
      },
    });
    scheduled += 1;
  }

  return scheduled;
}
