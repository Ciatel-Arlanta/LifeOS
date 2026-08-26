import { Amount } from '@/components/amount';
import { Chip } from '@/components/chip';
import { DateInput } from '@/components/date-input';
import { NotFound } from '@/components/not-found';
import { Screen } from '@/components/screen';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useExpenseActions, useExpenseData } from '@/features/expenses/store';
import { tapLight, tapSuccess, tapWarning } from '@/lib/haptics';
import { TRANSACTION_MODE_LABEL, TRANSACTION_MODES, type TransactionMode } from '@/features/expenses/types';
import { formatLongDate, isValidIsoDate } from '@/utils/date';
import { formatInr, parseRupeeInput } from '@/utils/money';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { expenses, categories } = useExpenseData();
  const { editExpense, removeExpense } = useExpenseActions();
  const expense = expenses.find((item) => item.id === Number(id));
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [mode, setMode] = useState<TransactionMode>('gpay');
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!expense) {
    return <NotFound title="Expense not found" />;
  }

  function startEdit() {
    if (!expense) return;
    setAmount(String(expense.amountMinor / 100));
    setCategoryId(expense.categoryId);
    setMode(expense.transactionMode);
    setDate(expense.occurredAt);
    setError(null);
    setEditing(true);
  }

  async function save() {
    if (saving) return;
    const parsed = parseRupeeInput(amount);
    if (parsed == null || parsed <= 0) {
      setError('Enter an amount.');
      tapLight();
      return;
    }
    if (!isValidIsoDate(date)) {
      setError('Pick a valid date.');
      tapLight();
      return;
    }
    setSaving(true);
    try {
      await editExpense(expense!.id, {
        amountMinor: parsed,
        categoryId,
        transactionMode: mode,
        occurredAt: date,
      });
      tapSuccess();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    tapWarning();
    await removeExpense(expense!.id);
    setConfirm(false);
    router.back();
  }

  return (
    <Screen>
      {editing ? (
        <VStack space="lg">
          <Input className={error ? 'border-destructive' : ''}>
            <InputField
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              accessibilityLabel="Amount in rupees"
              className="font-display text-3xl"
            />
          </Input>
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
          <DateInput value={date} onChange={setDate} label="Expense date" />
          {error ? (
            <Text size="sm" className="text-destructive">
              {error}
            </Text>
          ) : null}
          <Button onPress={() => void save()} isDisabled={saving}>
            <ButtonText>{saving ? 'Saving…' : 'Save changes'}</ButtonText>
          </Button>
          <Button variant="outline" onPress={() => setEditing(false)}>
            <ButtonText>Cancel</ButtonText>
          </Button>
        </VStack>
      ) : (
        <VStack space="lg">
          <Box>
            <Text size="xs" className="font-mono uppercase tracking-widest text-muted-foreground">
              {expense.categoryName}
            </Text>
            <Amount minor={expense.amountMinor} size="xl" className="mt-2" />
          </Box>
          <Card className="p-4">
            <VStack space="lg">
              <Detail label="Paid with" value={TRANSACTION_MODE_LABEL[expense.transactionMode]} />
              <Detail label="Date" value={formatLongDate(expense.occurredAt)} />
              <Detail label="Amount" value={formatInr(expense.amountMinor)} />
              {expense.subscriptionId ? <Detail label="From" value="Posted by a subscription" /> : null}
            </VStack>
          </Card>
          <Button onPress={startEdit}>
            <ButtonText>Edit</ButtonText>
          </Button>
          <Button variant="destructive" onPress={() => setConfirm(true)}>
            <ButtonText>Delete</ButtonText>
          </Button>
        </VStack>
      )}

      <AlertDialog isOpen={confirm} onClose={() => setConfirm(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="lg">Delete this expense?</Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text size="sm" className="text-muted-foreground">
              This cannot be undone.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button variant="outline" onPress={() => setConfirm(false)}>
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button variant="destructive" onPress={onDelete}>
              <ButtonText>Delete</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Screen>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text size="xs" className="font-mono text-muted-foreground">
        {label}
      </Text>
      <Text bold className="mt-1">
        {value}
      </Text>
    </Box>
  );
}
