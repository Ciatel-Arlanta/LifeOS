import { Chip } from '@/components/chip';
import { DateInput } from '@/components/date-input';
import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { Box } from '@/components/ui/box';
import {
  Button,
  ButtonSpinner,
  ButtonText,
} from '@/components/ui/button';
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
import { useExpenseActions, useExpenseData } from '@/features/expenses/store';
import { TRANSACTION_MODE_LABEL, TRANSACTION_MODES, type TransactionMode } from '@/features/expenses/types';
import { tapLight, tapSuccess } from '@/lib/haptics';
import { parseRupeeInput } from '@/utils/money';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export default function NewExpenseScreen() {
  const { categories } = useExpenseData();
  const { addExpense } = useExpenseActions();
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(categories[0]?.id ?? null);
  const [mode, setMode] = useState<TransactionMode>('gpay');
  const [date, setDate] = useState(todayIso);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (categoryId == null && categories[0]) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const parsed = useMemo(() => parseRupeeInput(amount), [amount]);

  async function save() {
    if (saving) return;
    setAmountError(null);
    setCategoryError(null);
    if (parsed == null || parsed <= 0) {
      setAmountError('Enter an amount.');
      tapLight();
      return;
    }
    if (categories.length > 0 && categoryId == null) {
      setCategoryError('Pick a category.');
      tapLight();
      return;
    }
    setSaving(true);
    try {
      await addExpense({
        amountMinor: parsed,
        categoryId,
        transactionMode: mode,
        occurredAt: date,
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
        <FormControl isInvalid={Boolean(amountError)}>
          <FormControlLabel>
            <FormControlLabelText>Amount</FormControlLabelText>
          </FormControlLabel>
          <Input className="h-16">
            <InputField
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0"
              accessibilityLabel="Amount in rupees"
              className="font-display text-3xl"
            />
          </Input>
          {amountError ? (
            <FormControlError>
              <FormControlErrorText>{amountError}</FormControlErrorText>
            </FormControlError>
          ) : null}
        </FormControl>

        <Box>
          <Text size="sm" bold className="mb-2">
            Category
          </Text>
          {categories.length === 0 ? (
            <EmptyState
              title="No categories yet"
              body="Add one in Settings before you can categorize spend."
            />
          ) : (
            <>
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
              {categoryError ? (
                <Text size="sm" className="mt-2 text-destructive">
                  {categoryError}
                </Text>
              ) : null}
            </>
          )}
        </Box>

        <Box>
          <Text size="sm" bold className="mb-2">
            Paid with
          </Text>
          <HStack space="sm" className="flex-wrap">
            {TRANSACTION_MODES.map((value) => (
              <Chip
                key={value}
                label={TRANSACTION_MODE_LABEL[value]}
                selected={mode === value}
                onPress={() => setMode(value)}
              />
            ))}
          </HStack>
        </Box>

        <FormControl>
          <FormControlLabel>
            <FormControlLabelText>Date</FormControlLabelText>
          </FormControlLabel>
          <DateInput value={date} onChange={setDate} label="Expense date" />
        </FormControl>

        <Button onPress={() => void save()} isDisabled={saving}>
          {saving ? <ButtonSpinner /> : null}
          <ButtonText>Save expense</ButtonText>
        </Button>
      </VStack>
    </Screen>
  );
}
