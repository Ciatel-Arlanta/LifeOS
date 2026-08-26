import type { autopayMethods, billingPeriods } from '@/db/schema';

export type BillingPeriod = (typeof billingPeriods)[number];
export type AutopayMethod = (typeof autopayMethods)[number];

export type Subscription = {
  id: number;
  name: string;
  costMinor: number;
  billingPeriod: BillingPeriod;
  renewalDate: string;
  autopayEnabled: boolean;
  autopayMethod: AutopayMethod | null;
  categoryId: number | null;
  categoryName: string;
  membershipId: number | null;
  membershipLabel: string | null;
  inactiveAtMs: number | null;
};

export type SubscriptionDraft = {
  name: string;
  costMinor: number;
  billingPeriod: BillingPeriod;
  renewalDate: string;
  autopayEnabled: boolean;
  autopayMethod: AutopayMethod | null;
  categoryId: number | null;
  membershipId: number | null;
};

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

export const BILLING_PERIODS: BillingPeriod[] = ['weekly', 'monthly', 'yearly'];
export const AUTOPAY_METHODS: AutopayMethod[] = ['gpay', 'card', 'other'];
