import {
  SNOOZE_LEAD_MINUTES,
  addNotificationResponseListener,
  getLastNotificationResponse,
  supportsNotifications,
} from '@/notifications';
import { snoozeReminder } from '@/features/reminders/store';
import { useEffect } from 'react';

function extractReminderId(response: { notification: { request: { content: { data?: unknown } } } }) {
  const data = response.notification.request.content.data;
  const raw = data && typeof data === 'object' ? (data as { reminderId?: unknown }).reminderId : null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

export function SnoozeResponseHandler() {
  useEffect(() => {
    if (!supportsNotifications()) return;

    async function handle(response: Parameters<Parameters<typeof addNotificationResponseListener>[0]>[0]) {
      const minutes = SNOOZE_LEAD_MINUTES[response.actionIdentifier];
      if (!minutes) return;
      const reminderId = extractReminderId(response);
      if (reminderId == null) return;
      await snoozeReminder(reminderId, minutes);
    }

    void getLastNotificationResponse().then((response) => {
      if (response) void handle(response);
    });

    const subscription = addNotificationResponseListener((response) => {
      void handle(response);
    });
    return () => subscription.remove();
  }, []);

  return null;
}
