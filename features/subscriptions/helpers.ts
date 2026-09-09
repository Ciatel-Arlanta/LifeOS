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

/**
 * When to warn about a renewal: `leadDays` before `renewalDate`, at 09:00 local.
 * Returns null when the notice window has already passed, or when notices are off.
 */
export function renewalNoticeAt(
  renewalDate: string,
  leadDays: number,
  now = new Date()
): Date | null {
  if (leadDays <= 0) return null;
  const at = new Date(`${renewalDate}T00:00:00`);
  if (Number.isNaN(at.getTime())) return null;
  at.setDate(at.getDate() - leadDays);
  at.setHours(9, 0, 0, 0);
  return at.getTime() > now.getTime() ? at : null;
}
