import { Button, ButtonText } from '@/components/ui/button';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

/**
 * Empty or not-found state.
 * - default: white card block
 * - inline: sits inside an existing Card without extra chrome
 * - actionLabel/onAction: renders one follow-up button (e.g. "Go back")
 */
export function EmptyState({
  title,
  body,
  inline = false,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  inline?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Box className={inline ? 'py-3.5' : 'rounded-xl bg-card px-4 py-6'}>
      <VStack space="xs">
        <Text bold>{title}</Text>
        <Text size="sm" className="text-muted-foreground">
          {body}
        </Text>
        {actionLabel && onAction ? (
          <Button size="sm" variant="outline" className="mt-3 self-start" onPress={onAction}>
            <ButtonText>{actionLabel}</ButtonText>
          </Button>
        ) : null}
      </VStack>
    </Box>
  );
}
