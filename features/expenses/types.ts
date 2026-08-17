import type { transactionModes } from '@/db/schema';

export type TransactionMode = (typeof transactionModes)[number];

export type ExpenseCategory = {
  id: number;
  name: string;
};

export type Expense = {
  id: number;
  amountMinor: number;
  categoryId: number | null;
  categoryName: string;
  transactionMode: TransactionMode;
  occurredAt: string;
  subscriptionId: number | null;
};

export type ExpenseDraft = {
  amountMinor: number;
  categoryId: number | null;
  transactionMode: TransactionMode;
  occurredAt: string;
  subscriptionId?: number | null;
};

export const TRANSACTION_MODE_LABEL: Record<TransactionMode, string> = {
  gpay: 'GPay',
  cash: 'Cash',
  card: 'Card',
};

export const TRANSACTION_MODES: TransactionMode[] = ['gpay', 'cash', 'card'];

export const TAPE_CLASSES = [
  'bg-tape-1',
  'bg-tape-2',
  'bg-tape-3',
  'bg-tape-4',
  'bg-tape-5',
] as const;

export function tapeClassForId(id: number): string {
  return TAPE_CLASSES[Math.abs(id) % TAPE_CLASSES.length];
}
