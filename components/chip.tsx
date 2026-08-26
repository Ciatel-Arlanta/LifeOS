import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: Boolean(selected) }}
      className={`rounded-full border px-4 py-2.5 ${
        selected ? 'border-primary bg-primary' : 'border-border bg-card'
      }`}>
      <Text size="sm" bold className={selected ? 'text-primary-foreground' : 'text-foreground'}>
        {label}
      </Text>
    </Pressable>
  );
}
