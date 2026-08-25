import { Chip } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { FormControl, FormControlHelper, FormControlHelperText, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useExpenseActions, useExpenseData } from '@/features/expenses/store';
import { tapLight } from '@/lib/haptics';
import { TRANSACTION_MODE_LABEL, TRANSACTION_MODES, type TransactionMode } from '@/features/expenses/types';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryId == null && categories[0]) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const parsed = useMemo(() => parseRupeeInput(amount), [amount]);

  async function save() {
    if (parsed == null || parsed <= 0) {
      setError('Enter an amount.');
      return;
    }
    if (categories.length > 0 && categoryId == null) {
      setError('Pick a category.');
      return;
    }
    await addExpense({
      amountMinor: parsed,
      categoryId,
      transactionMode: mode,
      occurredAt: date,
    });
    tapLight();
    router.back();
  }

  return (
    <Screen>
      <VStack space="lg">
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText>Amount</FormControlLabelText>
          </FormControlLabel>
          <Input className="h-16">
            <InputField
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0"
              className="font-display text-3xl"
            />
          </Input>
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
          <Input>
            <InputField
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
              className="font-mono"
            />
          </Input>
          <FormControlHelper>
            <FormControlHelperText>Use YYYY-MM-DD</FormControlHelperText>
          </FormControlHelper>
        </FormControl>

        {error ? (
          <Text size="sm" className="text-destructive">
            {error}
          </Text>
        ) : null}

        <Button onPress={save}>
          <ButtonText>Save expense</ButtonText>
        </Button>
      </VStack>
    </Screen>
  );
}
