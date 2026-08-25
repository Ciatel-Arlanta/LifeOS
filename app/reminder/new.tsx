import { Chip } from '@/components/chip';
import { Screen } from '@/components/screen';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useReminderActions, useReminderData } from '@/features/reminders/store';
import { tapLight } from '@/lib/haptics';
import { toIsoDate, todayIso } from '@/utils/date';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

const REMINDER_PRESETS = [
  { label: '1 hour before', minutes: 60 },
  { label: '1 day before', minutes: 60 * 24 },
];

export default function NewReminderScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { tasks } = useReminderData();
  const { addReminder } = useReminderActions();
  const task = tasks.find((item) => item.id === Number(taskId));
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState('09:00');
  const [error, setError] = useState<string | null>(null);

  if (!task) {
    return (
      <Screen>
        <Text bold>Task not found</Text>
      </Screen>
    );
  }

  function applyPreset(minutes: number) {
    if (!task?.dueAtMs) return;
    const fireAt = new Date(task.dueAtMs - minutes * 60_000);
    setDate(toIsoDate(fireAt));
    setTime(
      `${String(fireAt.getHours()).padStart(2, '0')}:${String(fireAt.getMinutes()).padStart(2, '0')}`
    );
  }

  function isPresetSelected(minutes: number) {
    if (!task?.dueAtMs) return false;
    const fireAt = new Date(task.dueAtMs - minutes * 60_000);
    const hhmm = `${String(fireAt.getHours()).padStart(2, '0')}:${String(fireAt.getMinutes()).padStart(2, '0')}`;
    return toIsoDate(fireAt) === date && hhmm === time;
  }

  async function save() {
    const fireAt = new Date(`${date}T${time}:00`);
    if (Number.isNaN(fireAt.getTime())) {
      setError('Use YYYY-MM-DD and HH:MM.');
      return;
    }
    await addReminder(task!.id, fireAt);
    tapLight();
    router.back();
  }

  return (
    <Screen>
      <VStack space="lg">
        <Text size="sm" className="text-muted-foreground">
          Extra reminder for {task.title}
        </Text>
        {task.dueAtMs ? (
          <HStack space="sm" className="flex-wrap">
            {REMINDER_PRESETS.map((preset) => (
              <Chip
                key={preset.minutes}
                label={preset.label}
                selected={isPresetSelected(preset.minutes)}
                onPress={() => applyPreset(preset.minutes)}
              />
            ))}
          </HStack>
        ) : null}
        <VStack space="sm">
          <Text size="sm" bold>
            Date
          </Text>
          <Input>
            <InputField value={date} onChangeText={setDate} className="font-mono" placeholder="YYYY-MM-DD" />
          </Input>
        </VStack>
        <VStack space="sm">
          <Text size="sm" bold>
            Time
          </Text>
          <Input>
            <InputField value={time} onChangeText={setTime} className="font-mono" placeholder="HH:MM" />
          </Input>
        </VStack>
        {error ? (
          <Text size="sm" className="text-destructive">
            {error}
          </Text>
        ) : null}
        <Button onPress={save}>
          <ButtonText>Save reminder</ButtonText>
        </Button>
      </VStack>
    </Screen>
  );
}
