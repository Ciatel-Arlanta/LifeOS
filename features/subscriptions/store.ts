import { getExpenseSnapshot } from '@/features/expenses/store';
import { syncRenewalNotifications } from '@/notifications/renewals';
import { useUiStore } from '@/store/ui';
import { useCallback, useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

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
  const category = getExpenseSnapshot().categories.find((row) => row.id === item.categoryId);
  return {
    ...item,
    categoryName: category?.name ?? item.categoryName ?? 'Uncategorized',
  };
}

export async function hydrateSubscriptions() {
  const rows = await repository.listSubscriptions();
  snapshot = { ready: true, subscriptions: rows.map(decorate) };
  emit();
  void syncRenewalNotifications(
    snapshot.subscriptions,
    useUiStore.getState().renewalLeadDays
  ).catch(() => {});
  if (Platform.OS === 'android') {
    void import('@/widgets/refresh').then((m) => m.refreshAllWidgets()).catch(() => {});
  }
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

  const setSubscriptionInactive = useCallback(async (id: number, inactive: boolean) => {
    await repository.setSubscriptionInactive(id, inactive);
    await hydrateSubscriptions();
  }, []);

  return { addSubscription, editSubscription, removeSubscription, setSubscriptionInactive };
}

export {
  renewalNoticeAt,
  activeSubscriptions,
  pausedSubscriptions,
  upcomingSubscriptions,
  monthlyCommitmentMinor,
} from './helpers';

export { updateRenewalDate } from './repository';
