import { Amount } from '@/components/amount';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { CategoryShare } from '@/features/expenses/store';

export function MonthTape({
  monthLabel,
  totalMinor,
  shares,
  deltaLine,
  subLabel = 'Spent so far',
}: {
  monthLabel?: string;
  totalMinor: number;
  shares: CategoryShare[];
  deltaLine?: string | null;
  subLabel?: string;
}) {
  return (
    <Box className="rounded-xl bg-card px-5 py-5">
      <VStack space="xs">
        {monthLabel ? (
          <Text size="xs" className="font-mono uppercase tracking-widest text-muted-foreground">
            {monthLabel}
          </Text>
        ) : null}
        <Amount minor={totalMinor} size="xl" />
        <Text size="sm" className="text-muted-foreground">
          {deltaLine ? `${subLabel} · ${deltaLine}` : subLabel}
        </Text>
      </VStack>

      <HStack className="mt-5 h-3 overflow-hidden rounded-full bg-secondary">
        {shares.map((share) => (
          <Box
            key={share.categoryId}
            className={`h-full ${share.tapeClass}`}
            style={{ flexGrow: Math.max(share.percent, 2), flexBasis: 0 }}
          />
        ))}
      </HStack>

      <VStack space="md" className="mt-5">
        {shares.map((share) => (
          <HStack key={share.categoryId} className="items-center" space="md">
            <Box className={`h-2.5 w-2.5 rounded-full ${share.tapeClass}`} />
            <Text bold className="flex-1">
              {share.name}
            </Text>
            <Text size="xs" className="font-mono text-muted-foreground">
              {share.percent}%
            </Text>
            <Amount minor={share.amountMinor} size="sm" />
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
