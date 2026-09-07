import { Chip } from '@/components/chip';
import { DateInput } from '@/components/date-input';
import { Screen } from '@/components/screen';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { membershipLabel } from '@/features/accounts/helpers';
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
import { tapLight, tapSuccess } from '@/lib/haptics';
import { isValidIsoDate } from '@/utils/date';
import { parseRupeeInput } from '@/utils/money';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

type SubscriptionErrors = {
  name?: string;
  cost?: string;
  renewal?: string;
  category?: string;
};

function validateSubscriptionForm(
  name: string,
  cost: string,
  renewal: string,
  categoryId: number | null,
  hasCategories: boolean
): { errors: SubscriptionErrors; costMinor: number | null } {
  const errors: SubscriptionErrors = {};
  if (!name.trim()) errors.name = 'Add a name.';
  const costMinor = parseRupeeInput(cost);
  if (!costMinor || costMinor <= 0) errors.cost = 'Enter a cost.';
  if (!isValidIsoDate(renewal.trim())) errors.renewal = 'Pick a valid renewal date.';
  if (categoryId == null) {
    errors.category = hasCategories ? 'Pick a category.' : 'Create a category in Settings first.';
  }
  return { errors, costMinor };
}

export default function NewSubscriptionScreen() {
  const { categories } = useExpenseData();
  const { memberships } = useAccountData();
  const { addSubscription } = useSubscriptionActions();
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [period, setPeriod] = useState<BillingPeriod>('monthly');
  const [renewal, setRenewal] = useState('');
  const [autopay, setAutopay] = useState(true);
  const [method, setMethod] = useState<AutopayMethod>('gpay');
  const [categoryId, setCategoryId] = useState<number | null>(categories[0]?.id ?? null);
  const [membershipId, setMembershipId] = useState<number | null>(null);
  const [errors, setErrors] = useState<SubscriptionErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (categoryId == null && categories[0]) setCategoryId(categories[0].id);
  }, [categories, categoryId]);

  async function save() {
    if (saving) return;
    const { errors: next, costMinor } = validateSubscriptionForm(
      name,
      cost,
      renewal,
      categoryId,
      categories.length > 0
    );
    if (Object.keys(next).length > 0) {
      setErrors(next);
      tapLight();
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await addSubscription({
        name,
        costMinor: costMinor!,
        billingPeriod: period,
        renewalDate: renewal.trim(),
        autopayEnabled: autopay,
        autopayMethod: autopay ? method : null,
        categoryId: categoryId!,
        membershipId,
      });
      tapSuccess();
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <VStack space="lg">
        <FormControl isInvalid={Boolean(errors.name)}>
          <FormControlLabel>
            <FormControlLabelText>Name</FormControlLabelText>
          </FormControlLabel>
          <Input>
            <InputField value={name} onChangeText={setName} placeholder="Claude Pro, rent, gym…" />
          </Input>
          {errors.name ? (
            <FormControlError>
              <FormControlErrorText>{errors.name}</FormControlErrorText>
            </FormControlError>
          ) : null}
        </FormControl>

        <FormControl isInvalid={Boolean(errors.cost)}>
          <FormControlLabel>
            <FormControlLabelText>Cost</FormControlLabelText>
          </FormControlLabel>
          <Input>
            <InputField
              value={cost}
              onChangeText={setCost}
              keyboardType="decimal-pad"
              placeholder="0"
              accessibilityLabel="Cost in rupees"
            />
          </Input>
          {errors.cost ? (
            <FormControlError>
              <FormControlErrorText>{errors.cost}</FormControlErrorText>
            </FormControlError>
          ) : null}
        </FormControl>

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

        <FormControl isInvalid={Boolean(errors.renewal)}>
          <FormControlLabel>
            <FormControlLabelText>Next renewal date</FormControlLabelText>
          </FormControlLabel>
          <DateInput value={renewal} onChange={setRenewal} label="Next renewal date" />
          {errors.renewal ? (
            <FormControlError>
              <FormControlErrorText>{errors.renewal}</FormControlErrorText>
            </FormControlError>
          ) : null}
        </FormControl>

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

        <FormControl isInvalid={Boolean(errors.category)}>
          <VStack space="sm">
            <FormControlLabel>
              <FormControlLabelText>Expense category</FormControlLabelText>
            </FormControlLabel>
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
            {errors.category ? (
              <FormControlError>
                <FormControlErrorText>{errors.category}</FormControlErrorText>
              </FormControlError>
            ) : null}
          </VStack>
        </FormControl>

        <VStack space="sm">
          <Text size="sm" bold>
            Linked login
          </Text>
          <Text size="sm" className="text-muted-foreground">
            Which service account pays this. Optional — rent and gym can stay unlinked.
          </Text>
          <HStack space="sm" className="flex-wrap">
            <Chip
              label="None"
              selected={membershipId == null}
              onPress={() => setMembershipId(null)}
            />
            {memberships.map((membership) => (
              <Chip
                key={membership.id}
                label={membershipLabel(membership)}
                selected={membershipId === membership.id}
                onPress={() => setMembershipId(membership.id)}
              />
            ))}
          </HStack>
        </VStack>

        <Button onPress={() => void save()} isDisabled={saving}>
          {saving ? <ButtonSpinner /> : null}
          <ButtonText>Save subscription</ButtonText>
        </Button>
      </VStack>
    </Screen>
  );
}
