import { daysUntil } from '@/utils/date';

import type { AutopayMethod, BillingPeriod, Subscription } from './types';

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 1,
    name: 'Claude Pro',
    costMinor: 180000,
    billingPeriod: 'monthly',
    renewalDate: '2026-08-27',
    autopayEnabled: true,
    autopayMethod: 'card',
    categoryName: 'Bills',
    accountLabel: 'Anthropic · personal',
    serviceName: 'Claude',
  },
  {
    id: 2,
    name: 'Cursor',
    costMinor: 200000,
    billingPeriod: 'monthly',
    renewalDate: '2026-08-20',
    autopayEnabled: true,
    autopayMethod: 'card',
    categoryName: 'Bills',
    accountLabel: 'Google · college@gmail.com',
    serviceName: 'Cursor',
  },
  {
    id: 3,
    name: 'Netflix',
    costMinor: 64900,
    billingPeriod: 'monthly',
    renewalDate: '2026-08-22',
    autopayEnabled: true,
    autopayMethod: 'gpay',
    categoryName: 'Bills',
    accountLabel: 'Google · personal@gmail.com',
    serviceName: 'Netflix',
  },
  {
    id: 4,
    name: 'Rent',
    costMinor: 1800000,
    billingPeriod: 'monthly',
    renewalDate: '2026-09-01',
    autopayEnabled: false,
    autopayMethod: null,
    categoryName: 'Bills',
    accountLabel: null,
    serviceName: null,
  },
  {
    id: 5,
    name: 'Spotify',
    costMinor: 11900,
    billingPeriod: 'monthly',
    renewalDate: '2026-08-25',
    autopayEnabled: true,
    autopayMethod: 'gpay',
    categoryName: 'Bills',
    accountLabel: 'Google · personal@gmail.com',
    serviceName: 'Spotify',
  },
  {
    id: 6,
    name: 'Jio Fiber',
    costMinor: 99900,
    billingPeriod: 'monthly',
    renewalDate: '2026-09-10',
    autopayEnabled: true,
    autopayMethod: 'gpay',
    categoryName: 'Bills',
    accountLabel: null,
    serviceName: null,
  },
];

export const BILLING_PERIOD_LABEL: Record<BillingPeriod, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export const AUTOPAY_METHOD_LABEL: Record<AutopayMethod, string> = {
  gpay: 'GPay',
  card: 'Card',
  other: 'Other',
};

export function upcomingSubscriptions(limit = 3, now = new Date()): Subscription[] {
  return [...MOCK_SUBSCRIPTIONS]
    .filter((item) => daysUntil(item.renewalDate, now) >= 0)
    .sort((a, b) => a.renewalDate.localeCompare(b.renewalDate))
    .slice(0, limit);
}

export function monthlyCommitmentMinor(): number {
  return MOCK_SUBSCRIPTIONS.reduce((sum, item) => {
    if (item.billingPeriod === 'monthly') return sum + item.costMinor;
    if (item.billingPeriod === 'yearly') return sum + Math.round(item.costMinor / 12);
    if (item.billingPeriod === 'weekly') return sum + item.costMinor * 4;
    return sum;
  }, 0);
}

export function getSubscription(id: number): Subscription | undefined {
  return MOCK_SUBSCRIPTIONS.find((item) => item.id === id);
}
