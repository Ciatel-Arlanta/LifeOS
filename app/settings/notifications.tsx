import { Chip } from '@/components/chip';
import { Screen } from '@/components/screen';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { hydrateSubscriptions } from '@/features/subscriptions/store';
import { tapLight } from '@/lib/haptics';
import {
  getNotificationPermission,
  openNotificationSettings,
  requestNotificationPermission,
  supportsNotifications,
} from '@/notifications';
import { RENEWAL_LEAD_CHOICES, useUiStore } from '@/store/ui';
import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';

function leadLabel(days: number): string {
  if (days === 0) return 'Off';
  return days === 1 ? '1 day' : `${days} days`;
}

export default function NotificationSettingsScreen() {
  const leadDays = useUiStore((state) => state.renewalLeadDays);
  const setRenewalLeadDays = useUiStore((state) => state.setRenewalLeadDays);
  const [permissionGranted, setPermissionGranted] = useState(true);

  useEffect(() => {
    if (supportsNotifications()) {
      void getNotificationPermission().then((status) => {
        setPermissionGranted(status === 'granted');
      });
    }
  }, []);

  async function choose(days: number) {
    if (days === leadDays) return;
    tapLight();
    setRenewalLeadDays(days);
    if (days > 0 && supportsNotifications()) {
      const status = await requestNotificationPermission();
      setPermissionGranted(status === 'granted');
    }
    // Rescheduling happens on hydrate, so re-run it with the new lead time.
    void hydrateSubscriptions();
  }

  return (
    <Screen>
      <VStack space="lg">
        <Card className="p-4">
          <Text bold>Renewal reminders</Text>
          <Text size="sm" className="mt-1 text-muted-foreground">
            A heads-up at 9am before an active subscription renews, so a trial or a
            forgotten plan can still be cancelled.
          </Text>
          <HStack space="sm" className="mt-4 flex-wrap">
            {RENEWAL_LEAD_CHOICES.map((days) => (
              <Chip
                key={days}
                label={leadLabel(days)}
                selected={leadDays === days}
                onPress={() => void choose(days)}
              />
            ))}
          </HStack>
        </Card>

        {supportsNotifications() && !permissionGranted && leadDays > 0 ? (
          <Card className="p-4">
            <Text bold size="sm">
              Notifications are disabled
            </Text>
            <Text size="xs" className="mt-1 text-muted-foreground">
              Android has blocked notifications for LifeOS. To receive renewal heads-up notices,
              enable notifications in system settings.
            </Text>
            <Pressable onPress={() => void openNotificationSettings()} className="mt-3">
              <Text size="sm" bold className="text-foreground underline">
                Open notification settings
              </Text>
            </Pressable>
          </Card>
        ) : null}

        {supportsNotifications() ? null : (
          <Text size="sm" className="text-muted-foreground">
            Notifications only fire on the Android build, not in the web preview.
          </Text>
        )}

        <Text size="xs" className="font-mono text-muted-foreground">
          Paused subscriptions never notify.
        </Text>
      </VStack>
    </Screen>
  );
}
