import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { parseIsoDate, toIsoDate } from '@/utils/date';
import { Platform } from 'react-native';

const FIELD_CLASSES =
  'w-full flex-row items-center justify-between rounded-md border px-3 py-2 min-h-9';

function fieldBorder(invalid?: boolean) {
  return invalid ? 'border-destructive' : 'border-border bg-card';
}

/** Guarded require: Metro drops this module from non-Android bundles. */
function androidPicker(): typeof import('@react-native-community/datetimepicker') | null {
  if (Platform.OS !== 'android') return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('@react-native-community/datetimepicker');
}

async function pickDate(value: string, onChange: (iso: string) => void) {
  const picker = androidPicker();
  if (!picker) return;
  picker.DateTimePickerAndroid.open({
    value: parseIsoDate(value),
    mode: 'date',
    is24Hour: true,
    onChange: (_event, date) => {
      if (date) onChange(toIsoDate(date));
    },
  });
}

async function pickTime(value: string, onChange: (hm: string) => void) {
  const picker = androidPicker();
  if (!picker) return;
  const [hours, minutes] = value.split(':').map(Number);
  const seed = new Date();
  if (Number.isFinite(hours) && Number.isFinite(minutes)) seed.setHours(hours, minutes, 0, 0);
  picker.DateTimePickerAndroid.open({
    value: seed,
    mode: 'time',
    is24Hour: true,
    onChange: (_event, date) => {
      if (date)
        onChange(
          `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
        );
    },
  });
}

/** Date picker on Android, YYYY-MM-DD text entry elsewhere. Value stays ISO. */
export function DateInput({
  value,
  onChange,
  label,
  isInvalid,
}: {
  value: string;
  onChange: (iso: string) => void;
  label: string;
  isInvalid?: boolean;
}) {
  if (Platform.OS === 'android') {
    return (
      <Pressable
        onPress={() => void pickDate(value, onChange)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Opens the date picker"
        accessibilityValue={{ text: value }}
        className={`${FIELD_CLASSES} ${fieldBorder(isInvalid)}`}>
        <Text className={`font-mono ${isInvalid ? 'text-destructive' : 'text-foreground'}`}>
          {value}
        </Text>
      </Pressable>
    );
  }
  return (
    <Input className={fieldBorder(isInvalid)}>
      <InputField
        value={value}
        onChangeText={onChange}
        placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation"
        maxLength={10}
        autoCapitalize="none"
        accessibilityLabel={label}
        className="font-mono"
      />
    </Input>
  );
}

/** Time picker on Android, HH:MM text entry elsewhere. Value stays 24h HH:MM. */
export function TimeInput({
  value,
  onChange,
  label,
  isInvalid,
}: {
  value: string;
  onChange: (hm: string) => void;
  label: string;
  isInvalid?: boolean;
}) {
  if (Platform.OS === 'android') {
    return (
      <Pressable
        onPress={() => void pickTime(value, onChange)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Opens the time picker"
        accessibilityValue={{ text: value }}
        className={`${FIELD_CLASSES} ${fieldBorder(isInvalid)}`}>
        <Text className={`font-mono ${isInvalid ? 'text-destructive' : 'text-foreground'}`}>
          {value}
        </Text>
      </Pressable>
    );
  }
  return (
    <Input className={fieldBorder(isInvalid)}>
      <InputField
        value={value}
        onChangeText={onChange}
        placeholder="HH:MM"
        keyboardType="numbers-and-punctuation"
        maxLength={5}
        autoCapitalize="none"
        accessibilityLabel={label}
        className="font-mono"
      />
    </Input>
  );
}
