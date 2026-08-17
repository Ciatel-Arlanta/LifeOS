import { accountLabel, findAccount, getAccountSnapshot } from '@/features/accounts/store';
import { getExpenseSnapshot } from '@/features/expenses/store';
import { daysUntil } from '@/utils/date';
import { useCallback, useSyncExternalStore } from 'react';

import * as repository from './repository';
import type { Subscription, SubscriptionDraft } from './types';

type Snapshot = {
  ready: boolean;
  subscriptions: Subscription[];
};

let snapshot: Snapshot = { ready: false, subscriptions: [] };
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

function decorate(item: Subscription): Subscription {
  const account = item.accountId ? findAccount(item.accountId) : undefined;
  const category = getExpenseSnapshot().categories.find((row) => row.id === item.categoryId);
  const service = getAccountSnapshot().services.find((row) => row.id === item.serviceId);
  return {
    ...item,
    categoryName: category?.name ?? item.categoryName ?? 'Uncategorized',
    accountLabel: account ? accountLabel(account) : null,
    serviceName: service?.name ?? item.serviceName,
  };
}

export async function hydrateSubscriptions() {
  const rows = await repository.listSubscriptions();
  snapshot = { ready: true, subscriptions: rows.map(decorate) };
  emit();
}

export function useSubscriptionData() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useSubscriptionActions() {
  const addSubscription = useCallback(async (draft: SubscriptionDraft) => {
    const created = await repository.createSubscription(draft);
    await hydrateSubscriptions();
    return created;
  }, []);

  const editSubscription = useCallback(async (id: number, draft: SubscriptionDraft) => {
    await repository.updateSubscription(id, draft);
    await hydrateSubscriptions();
  }, []);

  const removeSubscription = useCallback(async (id: number) => {
    await repository.deleteSubscription(id);
    await hydrateSubscriptions();
  }, []);

  return { addSubscription, editSubscription, removeSubscription };
}

export function upcomingSubscriptions(
  items: Subscription[],
  limit = 3,
  now = new Date()
): Subscription[] {
  return [...items]
    .filter((item) => daysUntil(item.renewalDate, now) >= 0)
    .sort((a, b) => a.renewalDate.localeCompare(b.renewalDate))
    .slice(0, limit);
}

export function monthlyCommitmentMinor(items: Subscription[]): number {
  return items.reduce((sum, item) => {
    if (item.billingPeriod === 'monthly') return sum + item.costMinor;
    if (item.billingPeriod === 'yearly') return sum + Math.round(item.costMinor / 12);
    if (item.billingPeriod === 'weekly') return sum + item.costMinor * 4;
    return sum;
  }, 0);
}

export { updateRenewalDate } from './repository';
