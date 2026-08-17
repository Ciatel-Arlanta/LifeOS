import { useCallback, useSyncExternalStore } from 'react';

import * as repository from './repository';
import type { Expense, ExpenseCategory, ExpenseDraft } from './types';
import { isInMonth } from '@/utils/date';

type Snapshot = {
  ready: boolean;
  expenses: Expense[];
  categories: ExpenseCategory[];
};

let snapshot: Snapshot = { ready: false, expenses: [], categories: [] };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

export async function hydrateExpenses() {
  const [expenses, categories] = await Promise.all([
    repository.listExpenses(),
    repository.listCategories(),
  ]);
  snapshot = { ready: true, expenses, categories };
  emit();
}

export function getExpenseSnapshot() {
  return snapshot;
}

export function useExpenseData() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useExpenseActions() {
  const addCategory = useCallback(async (name: string) => {
    await repository.createCategory(name);
    await hydrateExpenses();
  }, []);

  const removeCategory = useCallback(async (id: number) => {
    await repository.deleteCategory(id);
    await hydrateExpenses();
  }, []);

  const addExpense = useCallback(async (draft: ExpenseDraft) => {
    await repository.createExpense(draft);
    await hydrateExpenses();
  }, []);

  const editExpense = useCallback(async (id: number, draft: ExpenseDraft) => {
    await repository.updateExpense(id, draft);
    await hydrateExpenses();
  }, []);

  const removeExpense = useCallback(async (id: number) => {
    await repository.deleteExpense(id);
    await hydrateExpenses();
  }, []);

  return { addCategory, removeCategory, addExpense, editExpense, removeExpense };
}

export function expensesForMonth(expenses: Expense[], year: number, monthIndex: number) {
  return expenses.filter((expense) => isInMonth(expense.occurredAt, year, monthIndex));
}

export function monthTotal(expenses: Expense[], year: number, monthIndex: number) {
  return expensesForMonth(expenses, year, monthIndex).reduce(
    (sum, expense) => sum + expense.amountMinor,
    0
  );
}

export type CategoryShare = {
  categoryId: number;
  name: string;
  amountMinor: number;
  percent: number;
  tapeClass: string;
};

export function categoryBreakdown(
  expenses: Expense[],
  year: number,
  monthIndex: number
): CategoryShare[] {
  const rows = expensesForMonth(expenses, year, monthIndex);
  const total = rows.reduce((sum, expense) => sum + expense.amountMinor, 0);
  const map = new Map<number, CategoryShare>();

  for (const expense of rows) {
    const key = expense.categoryId ?? 0;
    const existing = map.get(key);
    if (existing) {
      existing.amountMinor += expense.amountMinor;
    } else {
      map.set(key, {
        categoryId: key,
        name: expense.categoryName,
        amountMinor: expense.amountMinor,
        percent: 0,
        tapeClass: ['bg-tape-1', 'bg-tape-2', 'bg-tape-3', 'bg-tape-4', 'bg-tape-5'][
          Math.abs(key) % 5
        ],
      });
    }
  }

  return [...map.values()]
    .map((row) => ({
      ...row,
      percent: total === 0 ? 0 : Math.round((row.amountMinor / total) * 100),
    }))
    .sort((a, b) => b.amountMinor - a.amountMinor);
}
