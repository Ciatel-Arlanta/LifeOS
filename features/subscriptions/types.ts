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
  categoryName: string;
  accountLabel: string | null;
  serviceName: string | null;
};
