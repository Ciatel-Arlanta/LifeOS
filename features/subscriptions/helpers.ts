import { daysUntil } from '@/utils/date';
import type { Subscription } from './types';

export function activeSubscriptions(items: Subscription[]): Subscription[] {
  return items.filter((item) => item.inactiveAtMs == null);
}

export function pausedSubscriptions(items: Subscription[]): Subscription[] {
  return items.filter((item) => item.inactiveAtMs != null);
}

export function upcomingSubscriptions(
  items: Subscription[],
  limit = 3,
  now = new Date()
): Subscription[] {
  return [...activeSubscriptions(items)]
    .filter((item) => daysUntil(item.renewalDate, now) >= 0)
    .sort((a, b) => a.renewalDate.localeCompare(b.renewalDate))
    .slice(0, limit);
}

export function monthlyCommitmentMinor(items: Subscription[]): number {
  return activeSubscriptions(items).reduce((sum, item) => {
    if (item.billingPeriod === 'monthly') return sum + item.costMinor;
    if (item.billingPeriod === 'yearly') return sum + Math.round(item.costMinor / 12);
    if (item.billingPeriod === 'weekly') return sum + item.costMinor * 4;
    return sum;
  }, 0);
}
