import { Chip } from '@/components/chip';
import { DateInput, TimeInput } from '@/components/date-input';
import { NotFound } from '@/components/not-found';
import { Screen } from '@/components/screen';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useReminderActions, useReminderData } from '@/features/reminders/store';
import { tapLight, tapSuccess } from '@/lib/haptics';
import { isValidHm, isValidIsoDate, toIsoDate, todayIso } from '@/utils/date';
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
  const [errors, setErrors] = useState<{ date?: string; time?: string }>({});
  const [saving, setSaving] = useState(false);

  if (!task) {
    return <NotFound title="Task not found" />;
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
    if (saving) return;
    const next: typeof errors = {};
    if (!isValidIsoDate(date)) next.date = 'Pick a valid date.';
    if (!isValidHm(time)) next.time = 'Pick a valid time.';
    if (next.date || next.time) {
      setErrors(next);
      tapLight();
      return;
    }
    const fireAt = new Date(`${date}T${time}:00`);
    if (fireAt.getTime() <= Date.now()) {
      setErrors({ date: 'Reminders must be set in the future.' });
      tapLight();
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await addReminder(task!.id, fireAt);
      tapSuccess();
      router.back();
    } finally {
      setSaving(false);
    }
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
        <FormControl isInvalid={Boolean(errors.date)}>
          <FormControlLabel>
            <FormControlLabelText>Date</FormControlLabelText>
          </FormControlLabel>
          <DateInput value={date} onChange={setDate} label="Reminder date" isInvalid={Boolean(errors.date)} />
          {errors.date ? (
            <FormControlError>
              <FormControlErrorText>{errors.date}</FormControlErrorText>
            </FormControlError>
          ) : null}
        </FormControl>
        <FormControl isInvalid={Boolean(errors.time)}>
          <FormControlLabel>
            <FormControlLabelText>Time</FormControlLabelText>
          </FormControlLabel>
          <TimeInput value={time} onChange={setTime} label="Reminder time" isInvalid={Boolean(errors.time)} />
          {errors.time ? (
            <FormControlError>
              <FormControlErrorText>{errors.time}</FormControlErrorText>
            </FormControlError>
          ) : null}
        </FormControl>
        <Button onPress={() => void save()} isDisabled={saving}>
          {saving ? <ButtonSpinner /> : null}
          <ButtonText>Save reminder</ButtonText>
        </Button>
      </VStack>
    </Screen>
  );
}
