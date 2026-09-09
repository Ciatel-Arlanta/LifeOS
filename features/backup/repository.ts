import * as accountsRepo from '@/features/accounts/repository';
import * as expensesRepo from '@/features/expenses/repository';
import * as subscriptionsRepo from '@/features/subscriptions/repository';
import { createWebPersist } from '@/lib/web-persist';

import { BACKUP_APP, BACKUP_VERSION, type Backup } from './types';

/**
 * Web counterpart of `repository.native.ts`. Reads go through the web repositories;
 * a restore rewrites their `localStorage` blobs wholesale, so the shapes below must
 * stay in step with each feature's own web repository.
 */
const expenseStore = createWebPersist<{
  categories: { id: number; name: string }[];
  expenses: unknown[];
  nextCategoryId: number;
  nextExpenseId: number;
}>('lifeos.expense-data', () => ({
  categories: [],
  expenses: [],
  nextCategoryId: 1,
  nextExpenseId: 1,
}));

const subscriptionStore = createWebPersist<{ items: unknown[]; nextId: number }>(
  'lifeos.subscription-data',
  () => ({ items: [], nextId: 1 })
);

const identityStore = createWebPersist<{
  providers: unknown[];
  identities: unknown[];
  memberships: unknown[];
  nextProviderId: number;
  nextIdentityId: number;
  nextMembershipId: number;
}>('lifeos.identity-data', () => ({
  providers: [],
  identities: [],
  memberships: [],
  nextProviderId: 1,
  nextIdentityId: 1,
  nextMembershipId: 1,
}));

function nextId(rows: { id: number }[]): number {
  return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

export async function collectBackup(): Promise<Backup> {
  const [providers, identities, memberships, categories, subscriptions, expenses] =
    await Promise.all([
      accountsRepo.listProviders(),
      accountsRepo.listIdentities(),
      accountsRepo.listMemberships(),
      expensesRepo.listCategories(),
      subscriptionsRepo.listSubscriptions(),
      expensesRepo.listExpenses(),
    ]);

  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    providers: providers.map((row) => ({ id: row.id, name: row.name })),
    identities: identities.map((row) => ({
      id: row.id,
      providerId: row.providerId,
      identifier: row.identifier,
      type: row.type,
      purpose: row.purpose,
      createdDate: row.createdDate,
    })),
    memberships: memberships.map((row) => ({
      id: row.id,
      providerId: row.providerId,
      identityId: row.identityId,
      note: row.note,
      createdDate: row.createdDate,
    })),
    categories: categories.map((row) => ({ id: row.id, name: row.name })),
    subscriptions: subscriptions.map((row) => ({
      id: row.id,
      name: row.name,
      costMinor: row.costMinor,
      billingPeriod: row.billingPeriod,
      renewalDate: row.renewalDate,
      autopayEnabled: row.autopayEnabled,
      autopayMethod: row.autopayMethod,
      categoryId: row.categoryId,
      membershipId: row.membershipId,
      inactiveAtMs: row.inactiveAtMs,
    })),
    expenses: expenses.map((row) => ({
      id: row.id,
      amountMinor: row.amountMinor,
      categoryId: row.categoryId,
      transactionMode: row.transactionMode,
      occurredAt: row.occurredAt,
      subscriptionId: row.subscriptionId,
    })),
  };
}

export async function restoreBackup(backup: Backup): Promise<void> {
  const categoryName = new Map(backup.categories.map((row) => [row.id, row.name]));

  identityStore.write({
    providers: backup.providers,
    identities: backup.identities,
    memberships: backup.memberships,
    nextProviderId: nextId(backup.providers),
    nextIdentityId: nextId(backup.identities),
    nextMembershipId: nextId(backup.memberships),
  });

  expenseStore.write({
    categories: backup.categories,
    expenses: backup.expenses.map((row) => ({
      ...row,
      categoryName: categoryName.get(row.categoryId ?? -1) ?? 'Uncategorized',
    })),
    nextCategoryId: nextId(backup.categories),
    nextExpenseId: nextId(backup.expenses),
  });

  subscriptionStore.write({
    items: backup.subscriptions.map((row) => ({
      ...row,
      categoryName: categoryName.get(row.categoryId) ?? 'Uncategorized',
      membershipLabel: null,
    })),
    nextId: nextId(backup.subscriptions),
  });
}
