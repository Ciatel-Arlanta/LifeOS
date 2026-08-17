import { Screen } from '@/components/screen';
import { Card } from '@/components/ui/card';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { reminderGroups } from '@/features/reminders/mock';
import { useUiStore } from '@/store/ui';
import { router } from 'expo-router';

export default function RemindersScreen() {
  const status = useUiStore((state) => state.ticktickStatus);
  const groups = reminderGroups();

  return (
    <Screen>
      <Card className="mb-6 p-4">
        <Text bold>TickTick owns the tasks</Text>
        <Text size="sm" className="mt-1 text-muted-foreground">
          LifeOS only adds extra reminders. Tasks stay incomplete here.
        </Text>
        <Text size="xs" className="mt-3 font-mono uppercase tracking-widest text-muted-foreground">
          {status === 'connected' ? 'Connected' : 'Showing sample lists'}
        </Text>
      </Card>

      {groups.map((group) => (
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
      ))}
    </Screen>
  );
}
