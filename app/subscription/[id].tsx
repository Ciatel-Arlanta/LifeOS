import { Amount } from '@/components/amount';
import { Chip } from '@/components/chip';
import { Screen } from '@/components/screen';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { accountLabel } from '@/features/accounts/helpers';
import { useAccountData } from '@/features/accounts/store';
import { useSubscriptionActions, useSubscriptionData } from '@/features/subscriptions/store';
import { AUTOPAY_METHOD_LABEL, BILLING_PERIOD_LABEL } from '@/features/subscriptions/types';
import { ensureSubscriptionAccountService } from '@/services/subscription-posting';
import { formatLongDate } from '@/utils/date';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { subscriptions } = useSubscriptionData();
  const { accounts } = useAccountData();
  const { editSubscription, removeSubscription, setSubscriptionInactive } = useSubscriptionActions();
  const item = subscriptions.find((row) => row.id === Number(id));
  const [linking, setLinking] = useState(false);
  const paused = item?.inactiveAtMs != null;

  if (!item) {
    return (
      <Screen>
        <Text bold>Subscription not found</Text>
      </Screen>
    );
  }

  async function linkAccount(accountId: number | null) {
    if (!item) return;
    const serviceId = await ensureSubscriptionAccountService(accountId, item.serviceId, item.serviceName);
    await editSubscription(item.id, {
      name: item.name,
      costMinor: item.costMinor,
      billingPeriod: item.billingPeriod,
      renewalDate: item.renewalDate,
      autopayEnabled: item.autopayEnabled,
      autopayMethod: item.autopayMethod,
      categoryId: item.categoryId,
      accountId,
      serviceId: serviceId ?? item.serviceId,
    });
    setLinking(false);
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
          {paused ? (
            <Text size="xs" className="font-mono uppercase tracking-widest text-muted-foreground">
              Paused · no expenses posted
            </Text>
          ) : null}
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
          {paused
            ? 'Paused subscriptions stay in your history but no expenses are posted.'
            : 'When this renews, LifeOS adds a transaction automatically.'}
        </Text>

        <Button
          variant="outline"
          onPress={() => void setSubscriptionInactive(item.id, !paused)}>
          <ButtonText>{paused ? 'Resume subscription' : 'Pause subscription'}</ButtonText>
        </Button>

        {linking ? (
          <VStack space="sm">
            <Text size="sm" bold>
              Link account
            </Text>
            <HStack space="sm" className="flex-wrap">
              <Chip label="None" selected={item.accountId == null} onPress={() => linkAccount(null)} />
              {accounts.map((account) => (
                <Chip
                  key={account.id}
                  label={accountLabel(account)}
                  selected={item.accountId === account.id}
                  onPress={() => linkAccount(account.id)}
                />
              ))}
            </HStack>
          </VStack>
        ) : (
          <Button variant="outline" onPress={() => setLinking(true)}>
            <ButtonText>{item.accountId ? 'Change account' : 'Link account'}</ButtonText>
          </Button>
        )}

        <Button
          variant="destructive"
          onPress={async () => {
            await removeSubscription(item.id);
            router.back();
          }}>
          <ButtonText>Delete subscription</ButtonText>
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
