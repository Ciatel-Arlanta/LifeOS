import { createWebPersist } from '@/lib/web-persist';

import type { Subscription, SubscriptionDraft } from './types';

type Persist = {
  items: Subscription[];
  nextId: number;
};

const store = createWebPersist<Persist>('lifeos.subscription-data', () => ({
  items: [],
  nextId: 1,
}));

export async function listSubscriptions(): Promise<Subscription[]> {
  return [...store.read().items].sort((a, b) => a.renewalDate.localeCompare(b.renewalDate));
}

export async function createSubscription(draft: SubscriptionDraft): Promise<Subscription> {
  const data = store.read();
  const item: Subscription = {
    id: data.nextId,
    ...draft,
    categoryName: '',
    accountLabel: null,
    serviceName: null,
  };
  data.items.push(item);
  data.nextId += 1;
  store.write(data);
  return item;
}

export async function updateSubscription(id: number, draft: SubscriptionDraft): Promise<void> {
  const data = store.read();
  data.items = data.items.map((item) => (item.id === id ? { ...item, ...draft } : item));
  store.write(data);
}

export async function updateRenewalDate(id: number, renewalDate: string): Promise<void> {
  const data = store.read();
  data.items = data.items.map((item) => (item.id === id ? { ...item, renewalDate } : item));
  store.write(data);
}

export async function deleteSubscription(id: number): Promise<void> {
  const data = store.read();
  data.items = data.items.filter((item) => item.id !== id);
  store.write(data);
}
