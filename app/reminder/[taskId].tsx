import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useReminderActions, useReminderData } from '@/features/reminders/store';
import { tapWarning } from '@/lib/haptics';
import { router, useLocalSearchParams } from 'expo-router';

export default function ReminderTaskScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { tasks } = useReminderData();
  const { removeReminder } = useReminderActions();
  const task = tasks.find((item) => item.id === Number(taskId));

  if (!task) {
    return (
      <Screen>
        <Text bold>Task not found</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <VStack space="lg">
        <VStack space="xs">
          <Text size="xs" className="font-mono uppercase tracking-widest text-muted-foreground">
            {task.listName}
          </Text>
          <Heading size="2xl" className="font-display">
            {task.title}
          </Heading>
          <Text size="sm" className="text-muted-foreground">
            {task.dueLabel ? `Due ${task.dueLabel}` : 'No due date in TickTick'}
          </Text>
          <Text size="sm" className="text-muted-foreground">
            This task stays in TickTick. LifeOS only owns the extra reminders below.
          </Text>
        </VStack>

        <VStack space="sm">
          <Text bold>LifeOS reminders</Text>
          {task.reminders.length === 0 ? (
            <EmptyState
              title="No extra reminders"
              body="Add a date and time. TickTick still owns the task itself."
            />
          ) : (
            <Card className="px-4 py-0">
              {task.reminders.map((reminder, index) => (
                <HStack
                  key={reminder.id}
                  className={`items-center justify-between py-3.5 ${
                    index < task.reminders.length - 1 ? 'border-b border-border' : ''
                  }`}>
                  <VStack space="xs">
                    <Text bold>{reminder.fireAtLabel}</Text>
                    <Text size="xs" className="font-mono text-muted-foreground">
                      {reminder.enabled ? 'Scheduled' : 'Paused'}
                    </Text>
                  </VStack>
                  <Pressable
                    onPress={() => {
                      tapWarning();
                      void removeReminder(reminder.id);
                    }}>
                    <Text size="sm" className="text-destructive">
                      Remove
                    </Text>
                  </Pressable>
                </HStack>
              ))}
            </Card>
          )}
        </VStack>

        <Button onPress={() => router.push(`/reminder/new?taskId=${task.id}`)}>
          <ButtonText>Add reminder</ButtonText>
        </Button>
      </VStack>
    </Screen>
  );
}
