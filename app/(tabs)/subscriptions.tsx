import { Amount } from '@/components/amount';
import { Screen } from '@/components/screen';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Fab, FabIcon, FabLabel } from '@/components/ui/fab';
import { AddIcon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  AUTOPAY_METHOD_LABEL,
  BILLING_PERIOD_LABEL,
  MOCK_SUBSCRIPTIONS,
  monthlyCommitmentMinor,
} from '@/features/subscriptions/mock';
import { formatRelativeDay } from '@/utils/date';
import { router } from 'expo-router';

export default function SubscriptionsScreen() {
  const now = new Date();
  const items = [...MOCK_SUBSCRIPTIONS].sort((a, b) => a.renewalDate.localeCompare(b.renewalDate));

  return (
    <Box className="flex-1 bg-background">
      <Screen contentContainerClassName="px-5 pb-24 pt-2">
        <Card className="mb-6 p-4">
          <Text size="xs" className="font-mono uppercase tracking-widest text-muted-foreground">
            This month’s commitments
          </Text>
          <Amount minor={monthlyCommitmentMinor()} size="lg" className="mt-1" />
          <Text size="sm" className="mt-1 text-muted-foreground">
            Recurring costs, including rent and plans
          </Text>
        </Card>

        <Card className="px-4 py-0">
          {items.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => router.push(`/subscription/${item.id}`)}
              className={`py-3.5 ${index < items.length - 1 ? 'border-b border-border' : ''}`}>
              <Box className="flex-row items-start justify-between">
                <VStack space="xs" className="flex-1 pr-3">
                  <Text bold>{item.name}</Text>
                  <Text size="xs" className="font-mono text-muted-foreground">
                    {BILLING_PERIOD_LABEL[item.billingPeriod]}
                    {item.autopayEnabled
                      ? ` · Autopay ${item.autopayMethod ? AUTOPAY_METHOD_LABEL[item.autopayMethod] : ''}`
                      : ' · Manual'}
                  </Text>
                  <Text size="sm" className="text-muted-foreground">
                    {formatRelativeDay(item.renewalDate, now)}
                  </Text>
                </VStack>
                <Amount minor={item.costMinor} size="sm" />
              </Box>
            </Pressable>
          ))}
        </Card>
      </Screen>
      <Fab size="md" placement="bottom right" onPress={() => router.push('/subscription/new')}>
        <FabIcon as={AddIcon} />
        <FabLabel>Add</FabLabel>
      </Fab>
    </Box>
  );
}
