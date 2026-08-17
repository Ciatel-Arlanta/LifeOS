import { Amount } from '@/components/amount';
import { Screen } from '@/components/screen';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  AUTOPAY_METHOD_LABEL,
  BILLING_PERIOD_LABEL,
  getSubscription,
} from '@/features/subscriptions/mock';
import { formatLongDate } from '@/utils/date';
import { router, useLocalSearchParams } from 'expo-router';

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = getSubscription(Number(id));

  if (!item) {
    return (
      <Screen>
        <Text bold>Subscription not found</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <VStack space="lg">
        <VStack space="xs">
          <Text size="xs" className="font-mono uppercase tracking-widest text-muted-foreground">
            {BILLING_PERIOD_LABEL[item.billingPeriod]}
          </Text>
          <Heading size="3xl" className="font-display">
            {item.name}
          </Heading>
          <Amount minor={item.costMinor} size="lg" />
        </VStack>

        <Card className="p-4">
          <VStack space="lg">
            <Detail label="Next renewal" value={formatLongDate(item.renewalDate)} />
            <Detail
              label="Autopay"
              value={
                item.autopayEnabled
                  ? item.autopayMethod
                    ? AUTOPAY_METHOD_LABEL[item.autopayMethod]
                    : 'On'
                  : 'Off'
              }
            />
            <Detail label="Expense category" value={item.categoryName} />
            <Detail label="Account" value={item.accountLabel ?? 'Not linked'} />
            <Detail label="Service" value={item.serviceName ?? 'Not linked'} />
          </VStack>
        </Card>

        <Text size="sm" className="text-muted-foreground">
          When this renews, LifeOS will add a transaction automatically.
        </Text>
        <Button variant="outline" onPress={() => router.back()}>
          <ButtonText>Close</ButtonText>
        </Button>
      </VStack>
    </Screen>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <VStack space="xs">
      <Text size="xs" className="font-mono text-muted-foreground">
        {label}
      </Text>
      <Text bold>{value}</Text>
    </VStack>
  );
}
