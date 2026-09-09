import type { AccountType } from '@/features/accounts/types';
import type { TransactionMode } from '@/features/expenses/types';
import type { AutopayMethod, BillingPeriod } from '@/features/subscriptions/types';

export const BACKUP_APP = 'lifeos' as const;
export const BACKUP_VERSION = 1 as const;

/**
 * A backup is the stored rows, not the display shapes: ids are kept so the links
 * between subscriptions, memberships, identities and categories survive a restore.
 *
 * TickTick task refs and reminder schedules are deliberately left out — the refs
 * re-sync from TickTick and the reminders hold OS notification ids that mean nothing
 * on another install.
 */
export type BackupProvider = { id: number; name: string };

export type BackupIdentity = {
  id: number;
  providerId: number;
  identifier: string;
  type: AccountType;
  purpose: string;
  createdDate: string;
};

export type BackupMembership = {
  id: number;
  providerId: number;
  identityId: number;
  note: string;
  createdDate: string;
};

export type BackupCategory = { id: number; name: string };

export type BackupSubscription = {
  id: number;
  name: string;
  costMinor: number;
  billingPeriod: BillingPeriod;
  renewalDate: string;
  autopayEnabled: boolean;
  autopayMethod: AutopayMethod | null;
  categoryId: number;
  membershipId: number | null;
  inactiveAtMs: number | null;
};

export type BackupExpense = {
  id: number;
  amountMinor: number;
  categoryId: number | null;
  transactionMode: TransactionMode;
  occurredAt: string;
  subscriptionId: number | null;
};

export type Backup = {
  app: typeof BACKUP_APP;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  providers: BackupProvider[];
  identities: BackupIdentity[];
  memberships: BackupMembership[];
  categories: BackupCategory[];
  subscriptions: BackupSubscription[];
  expenses: BackupExpense[];
};

export type BackupCounts = {
  expenses: number;
  subscriptions: number;
  categories: number;
  identities: number;
  memberships: number;
  providers: number;
};
