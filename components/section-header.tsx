import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <HStack className="mb-3 items-end justify-between">
      <Text bold>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction}>
          <Text size="xs" className="text-muted-foreground">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </HStack>
  );
}
