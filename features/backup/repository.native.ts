import { getDb } from '@/db/client';
import {
  expenseCategories,
  expenses,
  identities,
  memberships,
  providers,
  subscriptions,
} from '@/db/schema';
import { todayIso } from '@/utils/date';

import { BACKUP_APP, BACKUP_VERSION, type Backup } from './types';

export async function collectBackup(): Promise<Backup> {
  const db = getDb();
  const [providerRows, identityRows, membershipRows, categoryRows, subscriptionRows, expenseRows] =
    await Promise.all([
      db.select().from(providers),
      db.select().from(identities),
      db.select().from(memberships),
      db.select().from(expenseCategories),
      db.select().from(subscriptions),
      db.select().from(expenses),
    ]);

  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    providers: providerRows.map((row) => ({ id: row.id, name: row.name })),
    identities: identityRows.map((row) => ({
      id: row.id,
      providerId: row.providerId,
      identifier: row.identifier,
      type: row.type,
      purpose: row.purpose ?? '',
      createdDate: row.createdDate ?? todayIso(),
    })),
    memberships: membershipRows.map((row) => ({
      id: row.id,
      providerId: row.providerId,
      identityId: row.identityId,
      note: row.note ?? '',
      createdDate: row.createdDate ?? todayIso(),
    })),
    categories: categoryRows.map((row) => ({ id: row.id, name: row.name })),
    subscriptions: subscriptionRows.map((row) => ({
      id: row.id,
      name: row.name,
      costMinor: row.costMinor,
      billingPeriod: row.billingPeriod,
      renewalDate: row.renewalDate,
      autopayEnabled: row.autopayEnabled,
      autopayMethod: row.autopayMethod,
      categoryId: row.categoryId,
      membershipId: row.membershipId,
      inactiveAtMs: row.inactiveAt ? row.inactiveAt.getTime() : null,
    })),
    expenses: expenseRows.map((row) => ({
      id: row.id,
      amountMinor: row.amountMinor,
      categoryId: row.categoryId,
      transactionMode: row.transactionMode,
      occurredAt: row.occurredAt,
      subscriptionId: row.subscriptionId,
    })),
  };
}

/**
 * Replaces every backed-up table with the file's contents, keeping the original ids so
 * the links between rows survive. TickTick task refs and reminder schedules are left
 * alone — they are not part of a backup.
 * Uses a transaction so any insertion failure rolls back the deletes safely.
 */
export async function restoreBackup(backup: Backup): Promise<void> {
  const db = getDb();
  const now = new Date();

  await db.transaction(async (tx) => {
    // Children first: foreign keys are off, but this keeps the order honest.
    await tx.delete(expenses);
    await tx.delete(subscriptions);
    await tx.delete(expenseCategories);
    await tx.delete(memberships);
    await tx.delete(identities);
    await tx.delete(providers);

    if (backup.providers.length) {
      await tx
        .insert(providers)
        .values(backup.providers.map((row) => ({ id: row.id, name: row.name, createdAt: now })));
    }
    if (backup.identities.length) {
      await tx.insert(identities).values(
        backup.identities.map((row) => ({
          id: row.id,
          providerId: row.providerId,
          identifier: row.identifier,
          type: row.type,
          purpose: row.purpose,
          createdDate: row.createdDate,
          createdAt: now,
          updatedAt: now,
        }))
      );
    }
    if (backup.memberships.length) {
      await tx.insert(memberships).values(
        backup.memberships.map((row) => ({
          id: row.id,
          providerId: row.providerId,
          identityId: row.identityId,
          note: row.note,
          createdDate: row.createdDate,
          createdAt: now,
          updatedAt: now,
        }))
      );
    }
    if (backup.categories.length) {
      await tx
        .insert(expenseCategories)
        .values(backup.categories.map((row) => ({ id: row.id, name: row.name, createdAt: now })));
    }
    if (backup.subscriptions.length) {
      await tx.insert(subscriptions).values(
        backup.subscriptions.map((row) => ({
          id: row.id,
          name: row.name,
          costMinor: row.costMinor,
          billingPeriod: row.billingPeriod,
          renewalDate: row.renewalDate,
          autopayEnabled: row.autopayEnabled,
          autopayMethod: row.autopayMethod,
          categoryId: row.categoryId,
          membershipId: row.membershipId,
          inactiveAt: row.inactiveAtMs == null ? null : new Date(row.inactiveAtMs),
          createdAt: now,
          updatedAt: now,
        }))
      );
    }
    if (backup.expenses.length) {
      await tx.insert(expenses).values(
        backup.expenses.map((row) => ({
          id: row.id,
          amountMinor: row.amountMinor,
          categoryId: row.categoryId,
          transactionMode: row.transactionMode,
          occurredAt: row.occurredAt,
          subscriptionId: row.subscriptionId,
          createdAt: now,
          updatedAt: now,
        }))
      );
    }
  });
}
