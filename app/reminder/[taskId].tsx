import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { getReminderTask } from '@/features/reminders/mock';
import { useLocalSearchParams } from 'expo-router';

export default function ReminderTaskScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const task = getReminderTask(String(taskId));

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
              body="Add one later. TickTick still owns the task itself."
            />
          ) : (
            <Card className="px-4 py-0">
              {task.reminders.map((reminder, index) => (
                <VStack
                  key={reminder.id}
                  space="xs"
                  className={`py-3.5 ${
                    index < task.reminders.length - 1 ? 'border-b border-border' : ''
                  }`}>
                  <Text bold>{reminder.fireAtLabel}</Text>
                  <Text size="xs" className="font-mono text-muted-foreground">
                    {reminder.enabled ? 'Scheduled' : 'Paused'}
                  </Text>
                </VStack>
              ))}
            </Card>
          )}
        </VStack>

        <Button isDisabled>
          <ButtonText>Add reminder</ButtonText>
        </Button>
        <Text size="sm" className="text-muted-foreground">
          Scheduling is not wired yet.
        </Text>
      </VStack>
    </Screen>
  );
}
