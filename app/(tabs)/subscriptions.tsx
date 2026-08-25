import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Fab, FabIcon, FabLabel } from '@/components/ui/fab';
import { AddIcon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  monthlyCommitmentMinor,
  pausedSubscriptions,
  useSubscriptionData,
} from '@/features/subscriptions/store';
import { AUTOPAY_METHOD_LABEL, BILLING_PERIOD_LABEL } from '@/features/subscriptions/types';
import { activeSubscriptions } from '@/features/subscriptions/store';
import { formatRelativeDay } from '@/utils/date';
import { router } from 'expo-router';

export default function SubscriptionsScreen() {
  const now = new Date();
  const { subscriptions } = useSubscriptionData();
  const items = activeSubscriptions([...subscriptions]).sort((a, b) =>
    a.renewalDate.localeCompare(b.renewalDate)
  );
  const paused = pausedSubscriptions([...subscriptions]);

  return (
    <Box className="flex-1 bg-background">
      <Screen contentContainerClassName="px-5 pb-24 pt-2">
        <Card className="mb-6 p-4">
          <Text size="xs" className="font-mono uppercase tracking-widest text-muted-foreground">
            This month’s commitments
          </Text>
          <Amount minor={monthlyCommitmentMinor(items)} size="lg" className="mt-1" />
          <Text size="sm" className="mt-1 text-muted-foreground">
            Recurring costs, including rent and plans
          </Text>
        </Card>

        {items.length === 0 ? (
          <EmptyState
            title="No subscriptions yet"
            body="Add rent, plans, or anything that renews. Due cycles post as expenses."
          />
        ) : (
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
                      {item.accountLabel ? ` · ${item.accountLabel}` : ''}
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
        )}
        {paused.length > 0 ? (
          <Box className="mb-6">
            <Text size="xs" className="mb-2 font-mono uppercase tracking-widest text-muted-foreground">
              Paused · {paused.length}
            </Text>
            <Card className="px-4 py-0">
              {paused.map((item, index) => (
                <Pressable
                  key={item.id}
                  onPress={() => router.push(`/subscription/${item.id}`)}
                  className={`py-3.5 ${index < paused.length - 1 ? 'border-b border-border' : ''}`}>
                  <Box className="flex-row items-center justify-between">
                    <Text className="flex-1 pr-3 text-muted-foreground">{item.name}</Text>
                    <Amount minor={item.costMinor} size="sm" />
                  </Box>
                </Pressable>
              ))}
            </Card>
          </Box>
        ) : null}
      </Screen>
      <Fab size="md" placement="bottom right" onPress={() => router.push('/subscription/new')}>
        <FabIcon as={AddIcon} />
        <FabLabel>Add</FabLabel>
      </Fab>
    </Box>
  );
}
