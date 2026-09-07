import { useCallback, useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

import * as repository from './repository';
import type { Expense, ExpenseCategory, ExpenseDraft } from './types';

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
  if (Platform.OS === 'android') {
    void import('@/widgets/refresh').then((m) => m.refreshAllWidgets()).catch(() => {});
  }
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

export { expensesForMonth, monthTotal, categoryBreakdown, type CategoryShare } from './helpers';
