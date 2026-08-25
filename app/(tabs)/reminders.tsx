import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { syncTickTickTasks, useReminderData } from '@/features/reminders/store';
import {
  getNotificationPermission,
  openNotificationSettings,
  requestNotificationPermission,
  supportsNotifications,
} from '@/notifications';
import { useUiStore } from '@/store/ui';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

export default function RemindersScreen() {
  const status = useUiStore((state) => state.ticktickStatus);
  const { groups, error } = useReminderData();
  const [permission, setPermission] = useState<'granted' | 'denied' | 'undetermined' | null>(null);

  useEffect(() => {
    let active = true;
    if (!supportsNotifications()) return;
    void getNotificationPermission().then((next) => {
      if (active) setPermission(next);
    });
    return () => {
      active = false;
    };
  }, []);

  const handlePermissionAction = async () => {
    const next =
      permission === 'undetermined'
        ? await requestNotificationPermission()
        : await (openNotificationSettings(), getNotificationPermission());
    setPermission(next);
  };

  return (
    <Screen>
      {supportsNotifications() && permission && permission !== 'granted' ? (
        <Card className="mb-6 p-4">
          <Text bold>Reminders are muted</Text>
          <Text size="sm" className="mt-1 text-muted-foreground">
            LifeOS can't show reminder notifications without permission.
          </Text>
          <Button variant="outline" className="mt-4" onPress={() => void handlePermissionAction()}>
            <ButtonText>
              {permission === 'undetermined' ? 'Allow notifications' : 'Open settings'}
            </ButtonText>
          </Button>
        </Card>
      ) : null}

      <Card className="mb-6 p-4">
        <Text bold>TickTick owns the tasks</Text>
        <Text size="sm" className="mt-1 text-muted-foreground">
          LifeOS only adds extra reminders. Tasks stay incomplete here.
        </Text>
        <Text size="xs" className="mt-3 font-mono uppercase tracking-widest text-muted-foreground">
          {status}
        </Text>
        {error ? (
          <Text size="sm" className="mt-2 text-destructive">
            {error}
          </Text>
        ) : null}
        {status !== 'disconnected' ? (
          <Button variant="outline" className="mt-4" onPress={() => void syncTickTickTasks()}>
            <ButtonText>Refresh lists</ButtonText>
          </Button>
        ) : (
          <Button variant="outline" className="mt-4" onPress={() => router.push('/settings/ticktick')}>
            <ButtonText>Connect TickTick</ButtonText>
          </Button>
        )}
      </Card>

      {groups.length === 0 ? (
        <EmptyState
          title="No open tasks"
          body="Connect TickTick in Settings to pull incomplete tasks, grouped by list."
        />
      ) : (
        groups.map((group) => (
          <VStack key={group.listId} space="sm" className="mb-6">
            <Text bold>{group.listName}</Text>
            <Card className="px-4 py-0">
              {group.tasks.map((task, index) => (
                <Pressable
                  key={task.id}
                  onPress={() => router.push(`/reminder/${task.id}`)}
                  className={`py-3.5 ${index < group.tasks.length - 1 ? 'border-b border-border' : ''}`}>
                  <Text bold>{task.title}</Text>
                  <Text size="xs" className="mt-1 font-mono text-muted-foreground">
                    {task.dueLabel ? `Due ${task.dueLabel}` : 'No due date'}
                    {' · '}
                    {task.reminders.length === 0
                      ? 'No reminders'
                      : `${task.reminders.length} reminder${task.reminders.length === 1 ? '' : 's'}`}
                  </Text>
                </Pressable>
              ))}
            </Card>
          </VStack>
        ))
      )}
    </Screen>
  );
}
