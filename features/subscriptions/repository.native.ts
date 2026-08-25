import { getDb } from '@/db/client';
import { accounts, expenseCategories, providers, services, subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

import type { Subscription, SubscriptionDraft } from './types';

async function hydrateLabels(rows: (typeof subscriptions.$inferSelect)[]): Promise<Subscription[]> {
  const db = getDb();
  const [categoryRows, accountRows, providerRows, serviceRows] = await Promise.all([
    db.select().from(expenseCategories),
    db.select().from(accounts),
    db.select().from(providers),
    db.select().from(services),
  ]);

  return rows
    .map((row) => {
      const account = accountRows.find((item) => item.id === row.accountId);
      const provider = account
        ? providerRows.find((item) => item.id === account.providerId)
        : undefined;
      const service = serviceRows.find((item) => item.id === row.serviceId);
      return {
        id: row.id,
        name: row.name,
        costMinor: row.costMinor,
        billingPeriod: row.billingPeriod,
        renewalDate: row.renewalDate,
        autopayEnabled: row.autopayEnabled,
        autopayMethod: row.autopayMethod,
        categoryId: row.categoryId,
        categoryName: categoryRows.find((item) => item.id === row.categoryId)?.name ?? 'Uncategorized',
        accountId: row.accountId,
        accountLabel: account ? `${provider?.name ?? 'Account'} · ${account.identifier}` : null,
        serviceId: row.serviceId,
        serviceName: service?.name ?? null,
        inactiveAtMs: row.inactiveAt ? row.inactiveAt.getTime() : null,
      };
    })
    .sort((a, b) => a.renewalDate.localeCompare(b.renewalDate));
}

export async function listSubscriptions(): Promise<Subscription[]> {
  const rows = await getDb().select().from(subscriptions);
  return hydrateLabels(rows);
}

export async function createSubscription(draft: SubscriptionDraft): Promise<Subscription> {
  const now = new Date();
  const [row] = await getDb()
    .insert(subscriptions)
    .values({
      name: draft.name.trim(),
      costMinor: draft.costMinor,
      billingPeriod: draft.billingPeriod,
      renewalDate: draft.renewalDate,
      autopayEnabled: draft.autopayEnabled,
      autopayMethod: draft.autopayMethod,
      categoryId: draft.categoryId,
      accountId: draft.accountId,
      serviceId: draft.serviceId,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return (await hydrateLabels([row]))[0];
}

export async function updateSubscription(id: number, draft: SubscriptionDraft): Promise<void> {
  await getDb()
    .update(subscriptions)
    .set({
      name: draft.name.trim(),
      costMinor: draft.costMinor,
      billingPeriod: draft.billingPeriod,
      renewalDate: draft.renewalDate,
      autopayEnabled: draft.autopayEnabled,
      autopayMethod: draft.autopayMethod,
      categoryId: draft.categoryId,
      accountId: draft.accountId,
      serviceId: draft.serviceId,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, id));
}

export async function updateRenewalDate(id: number, renewalDate: string): Promise<void> {
  await getDb()
    .update(subscriptions)
    .set({ renewalDate, updatedAt: new Date() })
    .where(eq(subscriptions.id, id));
}

export async function setSubscriptionInactive(id: number, inactive: boolean): Promise<void> {
  const now = new Date();
  await getDb()
    .update(subscriptions)
    .set(inactive ? { inactiveAt: now, updatedAt: now } : { inactiveAt: null, updatedAt: now })
    .where(eq(subscriptions.id, id));
}

export async function deleteSubscription(id: number): Promise<void> {
  await getDb().delete(subscriptions).where(eq(subscriptions.id, id));
}
