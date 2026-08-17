import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Box className="rounded-xl bg-card px-4 py-6">
      <VStack space="xs">
        <Text bold>{title}</Text>
        <Text size="sm" className="text-muted-foreground">
          {body}
        </Text>
      </VStack>
    </Box>
  );
}
