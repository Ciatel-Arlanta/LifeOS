import type { Expense, ExpenseCategory, ExpenseDraft } from './types';

const KEY = 'lifeos.expense-data';

type Persist = {
  categories: ExpenseCategory[];
  expenses: Expense[];
  nextCategoryId: number;
  nextExpenseId: number;
};

function empty(): Persist {
  return { categories: [], expenses: [], nextCategoryId: 1, nextExpenseId: 1 };
}

function read(): Persist {
  if (typeof localStorage === 'undefined') return empty();
  const raw = localStorage.getItem(KEY);
  if (!raw) return empty();
  try {
    return JSON.parse(raw) as Persist;
  } catch {
    return empty();
  }
}

function write(data: Persist) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

function withNames(data: Persist): Expense[] {
  return [...data.expenses]
    .map((expense) => ({
      ...expense,
      categoryName: data.categories.find((item) => item.id === expense.categoryId)?.name ?? 'Uncategorized',
    }))
    .sort((a, b) => (a.occurredAt === b.occurredAt ? b.id - a.id : b.occurredAt.localeCompare(a.occurredAt)));
}

export async function listCategories(): Promise<ExpenseCategory[]> {
  return read().categories;
}

export async function listExpenses(): Promise<Expense[]> {
  return withNames(read());
}

export async function createCategory(name: string): Promise<ExpenseCategory> {
  const data = read();
  const category = { id: data.nextCategoryId, name: name.trim() };
  data.categories.push(category);
  data.nextCategoryId += 1;
  write(data);
  return category;
}

export async function deleteCategory(id: number): Promise<void> {
  const data = read();
  data.categories = data.categories.filter((item) => item.id !== id);
  data.expenses = data.expenses.map((expense) =>
    expense.categoryId === id ? { ...expense, categoryId: null, categoryName: 'Uncategorized' } : expense
  );
  write(data);
}

export async function createExpense(draft: ExpenseDraft): Promise<Expense> {
  const data = read();
  const expense: Expense = {
    id: data.nextExpenseId,
    amountMinor: draft.amountMinor,
    categoryId: draft.categoryId,
    categoryName: data.categories.find((item) => item.id === draft.categoryId)?.name ?? 'Uncategorized',
    transactionMode: draft.transactionMode,
    occurredAt: draft.occurredAt,
    subscriptionId: null,
  };
  data.expenses.push(expense);
  data.nextExpenseId += 1;
  write(data);
  return expense;
}

export async function updateExpense(id: number, draft: ExpenseDraft): Promise<void> {
  const data = read();
  data.expenses = data.expenses.map((expense) =>
    expense.id === id
      ? {
          ...expense,
          amountMinor: draft.amountMinor,
          categoryId: draft.categoryId,
          categoryName:
            data.categories.find((item) => item.id === draft.categoryId)?.name ?? 'Uncategorized',
          transactionMode: draft.transactionMode,
          occurredAt: draft.occurredAt,
        }
      : expense
  );
  write(data);
}

export async function deleteExpense(id: number): Promise<void> {
  const data = read();
  data.expenses = data.expenses.filter((expense) => expense.id !== id);
  write(data);
}
