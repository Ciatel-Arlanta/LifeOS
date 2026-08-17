import { Chip } from '@/components/chip';
import { Screen } from '@/components/screen';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useExpenseData } from '@/features/expenses/store';
import { AUTOPAY_METHOD_LABEL, BILLING_PERIOD_LABEL } from '@/features/subscriptions/mock';
import type { AutopayMethod, BillingPeriod } from '@/features/subscriptions/types';
import { router } from 'expo-router';
import { useState } from 'react';

const PERIODS: BillingPeriod[] = ['weekly', 'monthly', 'yearly'];
const METHODS: AutopayMethod[] = ['gpay', 'card', 'other'];

export default function NewSubscriptionScreen() {
  const { categories } = useExpenseData();
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [period, setPeriod] = useState<BillingPeriod>('monthly');
  const [renewal, setRenewal] = useState('');
  const [autopay, setAutopay] = useState(true);
  const [method, setMethod] = useState<AutopayMethod>('gpay');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  return (
    <Screen>
      <VStack space="lg">
        <VStack space="sm">
          <Text size="sm" bold>
            Name
          </Text>
          <Input>
            <InputField
              value={name}
              onChangeText={setName}
              placeholder="Claude Pro, rent, gym…"
            />
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
            {PERIODS.map((value) => (
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
              {METHODS.map((value) => (
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

        <Text size="sm" className="text-muted-foreground">
          Saving is not wired yet. This screen is the entry layout.
        </Text>
        <Button onPress={() => router.back()}>
          <ButtonText>Save subscription</ButtonText>
        </Button>
      </VStack>
    </Screen>
  );
}
