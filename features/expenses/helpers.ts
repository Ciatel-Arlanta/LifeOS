import { isInMonth } from '@/utils/date';
import type { Expense } from './types';

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
