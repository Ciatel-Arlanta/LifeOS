import { Chip } from '@/components/chip';
import { Screen } from '@/components/screen';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { accountLabel } from '@/features/accounts/helpers';
import { useAccountData } from '@/features/accounts/store';
import { useExpenseData } from '@/features/expenses/store';
import { useSubscriptionActions } from '@/features/subscriptions/store';
import {
  AUTOPAY_METHOD_LABEL,
  AUTOPAY_METHODS,
  BILLING_PERIOD_LABEL,
  BILLING_PERIODS,
  type AutopayMethod,
  type BillingPeriod,
} from '@/features/subscriptions/types';
import { ensureSubscriptionAccountService } from '@/services/subscription-posting';
import { parseRupeeInput } from '@/utils/money';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

export default function NewSubscriptionScreen() {
  const { categories } = useExpenseData();
  const { accounts, services } = useAccountData();
  const { addSubscription } = useSubscriptionActions();
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [period, setPeriod] = useState<BillingPeriod>('monthly');
  const [renewal, setRenewal] = useState('');
  const [autopay, setAutopay] = useState(true);
  const [method, setMethod] = useState<AutopayMethod>('gpay');
  const [categoryId, setCategoryId] = useState<number | null>(categories[0]?.id ?? null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryId == null && categories[0]) setCategoryId(categories[0].id);
  }, [categories, categoryId]);

  async function save() {
    const parsed = parseRupeeInput(cost);
    if (!name.trim()) {
      setError('Add a name.');
      return;
    }
    if (parsed == null || parsed <= 0) {
      setError('Enter a cost.');
      return;
    }
    if (!renewal.trim()) {
      setError('Add the next renewal date.');
      return;
    }
    const linkedServiceId = await ensureSubscriptionAccountService(accountId, serviceId);
    await addSubscription({
      name,
      costMinor: parsed,
      billingPeriod: period,
      renewalDate: renewal.trim(),
      autopayEnabled: autopay,
      autopayMethod: autopay ? method : null,
      categoryId,
      accountId,
      serviceId: linkedServiceId ?? null,
    });
    router.back();
  }

  return (
    <Screen>
      <VStack space="lg">
        <VStack space="sm">
          <Text size="sm" bold>
            Name
          </Text>
          <Input>
            <InputField value={name} onChangeText={setName} placeholder="Claude Pro, rent, gym…" />
          </Input>
        </VStack>

        <VStack space="sm">
          <Text size="sm" bold>
            Cost
          </Text>
          <Input>
            <InputField
              value={cost}
              onChangeText={setCost}
              keyboardType="decimal-pad"
              placeholder="0"
            />
          </Input>
        </VStack>

        <VStack space="sm">
          <Text size="sm" bold>
            Billing period
          </Text>
          <HStack space="sm" className="flex-wrap">
            {BILLING_PERIODS.map((value) => (
              <Chip
                key={value}
                label={BILLING_PERIOD_LABEL[value]}
                selected={period === value}
                onPress={() => setPeriod(value)}
              />
            ))}
          </HStack>
        </VStack>

        <VStack space="sm">
          <Text size="sm" bold>
            Next renewal date
          </Text>
          <Input>
            <InputField
              value={renewal}
              onChangeText={setRenewal}
              placeholder="YYYY-MM-DD"
              className="font-mono"
            />
          </Input>
        </VStack>

        <VStack space="sm">
          <Text size="sm" bold>
            Autopay
          </Text>
          <HStack space="sm">
            <Chip label="On" selected={autopay} onPress={() => setAutopay(true)} />
            <Chip label="Off" selected={!autopay} onPress={() => setAutopay(false)} />
          </HStack>
          {autopay ? (
            <HStack space="sm" className="flex-wrap">
              {AUTOPAY_METHODS.map((value) => (
                <Chip
                  key={value}
                  label={AUTOPAY_METHOD_LABEL[value]}
                  selected={method === value}
                  onPress={() => setMethod(value)}
                />
              ))}
            </HStack>
          ) : null}
        </VStack>

        <VStack space="sm">
          <Text size="sm" bold>
            Expense category
          </Text>
          <Text size="sm" className="text-muted-foreground">
            Used when a renewal posts a transaction.
          </Text>
          <HStack space="sm" className="flex-wrap">
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                selected={categoryId === category.id}
                onPress={() => setCategoryId(category.id)}
              />
            ))}
          </HStack>
        </VStack>

        <VStack space="sm">
          <Text size="sm" bold>
            Account
          </Text>
          <HStack space="sm" className="flex-wrap">
            <Chip label="None" selected={accountId == null} onPress={() => setAccountId(null)} />
            {accounts.map((account) => (
              <Chip
                key={account.id}
                label={accountLabel(account)}
                selected={accountId === account.id}
                onPress={() => setAccountId(account.id)}
              />
            ))}
          </HStack>
        </VStack>

        <VStack space="sm">
          <Text size="sm" bold>
            Service
          </Text>
          <HStack space="sm" className="flex-wrap">
            <Chip label="None" selected={serviceId == null} onPress={() => setServiceId(null)} />
            {services.map((service) => (
              <Chip
                key={service.id}
                label={service.name}
                selected={serviceId === service.id}
                onPress={() => setServiceId(service.id)}
              />
            ))}
          </HStack>
        </VStack>

        {error ? (
          <Text size="sm" className="text-destructive">
            {error}
          </Text>
        ) : null}

        <Button onPress={save}>
          <ButtonText>Save subscription</ButtonText>
        </Button>
      </VStack>
    </Screen>
  );
}
