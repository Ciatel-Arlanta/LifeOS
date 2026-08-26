import { getDb } from '@/db/client';
import {
  expenseCategories,
  identities,
  memberships,
  providers,
  subscriptions,
} from '@/db/schema';
import { eq } from 'drizzle-orm';

import type { Subscription, SubscriptionDraft } from './types';

async function hydrateLabels(rows: (typeof subscriptions.$inferSelect)[]): Promise<Subscription[]> {
  const db = getDb();
  const [categoryRows, membershipRows, identityRows, providerRows] = await Promise.all([
    db.select().from(expenseCategories),
    db.select().from(memberships),
    db.select().from(identities),
    db.select().from(providers),
  ]);

  return rows
    .map((row) => {
      const membership = membershipRows.find((item) => item.id === row.membershipId);
      const service = membership
        ? providerRows.find((item) => item.id === membership.providerId)
        : undefined;
      const identity = membership
        ? identityRows.find((item) => item.id === membership.identityId)
        : undefined;
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
        membershipId: row.membershipId,
        membershipLabel:
          membership && service && identity ? `${service.name} · ${identity.identifier}` : null,
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
      membershipId: draft.membershipId,
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
      membershipId: draft.membershipId,
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
