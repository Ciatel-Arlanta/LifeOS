import { getDb } from '@/db/client';
import { expenseCategories, expenses } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

import type { Expense, ExpenseCategory, ExpenseDraft } from './types';

function mapExpense(
  row: typeof expenses.$inferSelect,
  categories: ExpenseCategory[]
): Expense {
  return {
    id: row.id,
    amountMinor: row.amountMinor,
    categoryId: row.categoryId,
    categoryName: categories.find((item) => item.id === row.categoryId)?.name ?? 'Uncategorized',
    transactionMode: row.transactionMode,
    occurredAt: row.occurredAt,
    subscriptionId: row.subscriptionId,
  };
}

export async function listCategories(): Promise<ExpenseCategory[]> {
  const rows = await getDb().select().from(expenseCategories).orderBy(expenseCategories.name);
  return rows.map((row) => ({ id: row.id, name: row.name }));
}

export async function listExpenses(): Promise<Expense[]> {
  const categories = await listCategories();
  const rows = await getDb().select().from(expenses).orderBy(desc(expenses.occurredAt), desc(expenses.id));
  return rows.map((row) => mapExpense(row, categories));
}

export async function createCategory(name: string): Promise<ExpenseCategory> {
  const now = new Date();
  const [row] = await getDb()
    .insert(expenseCategories)
    .values({ name: name.trim(), createdAt: now })
    .returning();
  return { id: row.id, name: row.name };
}

export async function deleteCategory(id: number): Promise<void> {
  await getDb().delete(expenseCategories).where(eq(expenseCategories.id, id));
}

export async function createExpense(draft: ExpenseDraft): Promise<Expense> {
  const now = new Date();
  const [row] = await getDb()
    .insert(expenses)
    .values({
      amountMinor: draft.amountMinor,
      categoryId: draft.categoryId,
      transactionMode: draft.transactionMode,
      occurredAt: draft.occurredAt,
      subscriptionId: null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  const categories = await listCategories();
  return mapExpense(row, categories);
}

export async function updateExpense(id: number, draft: ExpenseDraft): Promise<void> {
  await getDb()
    .update(expenses)
    .set({
      amountMinor: draft.amountMinor,
      categoryId: draft.categoryId,
      transactionMode: draft.transactionMode,
      occurredAt: draft.occurredAt,
      updatedAt: new Date(),
    })
    .where(eq(expenses.id, id));
}

export async function deleteExpense(id: number): Promise<void> {
  await getDb().delete(expenses).where(eq(expenses.id, id));
}
