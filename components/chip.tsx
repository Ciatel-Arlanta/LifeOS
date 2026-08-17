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
      className={`rounded-full border px-3.5 py-2 ${
        selected ? 'border-primary bg-primary' : 'border-border bg-card'
      }`}>
      <Text size="sm" bold className={selected ? 'text-primary-foreground' : 'text-foreground'}>
        {label}
      </Text>
    </Pressable>
  );
}
