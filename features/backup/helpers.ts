import { TRANSACTION_MODE_LABEL } from '@/features/expenses/types';
import { BACKUP_APP, BACKUP_VERSION, type Backup } from './types';

function isArrayOf(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Validates that an imported object is a readable LifeOS backup file. Throws a user-facing
 * error message when it is not.
 */
export function parseBackup(text: string): Backup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (!raw || typeof raw !== 'object') throw new Error('That file is not a LifeOS backup.');

  const candidate = raw as Partial<Backup>;
  if (candidate.app !== BACKUP_APP) throw new Error('That file is not a LifeOS backup.');
  if (candidate.version !== BACKUP_VERSION) {
    throw new Error(`Backup version ${String(candidate.version)} is not supported.`);
  }

  const lists = [
    'providers',
    'identities',
    'memberships',
    'categories',
    'subscriptions',
    'expenses',
  ] as const;
  for (const key of lists) {
    if (!isArrayOf(candidate[key])) throw new Error(`Backup is missing "${key}".`);
  }

  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: typeof candidate.exportedAt === 'string' ? candidate.exportedAt : '',
    providers: candidate.providers!,
    identities: candidate.identities!,
    memberships: candidate.memberships!,
    categories: candidate.categories!,
    subscriptions: candidate.subscriptions!,
    expenses: candidate.expenses!,
  };
}

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Expenses as a spreadsheet-friendly sheet. Amounts are rupees, not paise. */
export function expensesToCsv(backup: Backup): string {
  const categoryName = new Map(backup.categories.map((item) => [item.id, item.name]));
  const subscriptionName = new Map(backup.subscriptions.map((item) => [item.id, item.name]));
  const rows = [...backup.expenses].sort((a, b) =>
    a.occurredAt === b.occurredAt ? a.id - b.id : a.occurredAt.localeCompare(b.occurredAt)
  );

  return [
    ['date', 'amount_inr', 'category', 'payment_mode', 'subscription'].join(','),
    ...rows.map((expense) =>
      [
        expense.occurredAt,
        (expense.amountMinor / 100).toFixed(2),
        categoryName.get(expense.categoryId ?? -1) ?? 'Uncategorized',
        TRANSACTION_MODE_LABEL[expense.transactionMode],
        expense.subscriptionId == null
          ? ''
          : (subscriptionName.get(expense.subscriptionId) ?? ''),
      ]
        .map(csvCell)
        .join(',')
    ),
  ].join('\n');
}

export type BackupCounts = {
  expenses: number;
  subscriptions: number;
  categories: number;
  identities: number;
  memberships: number;
  providers: number;
};

export function countBackup(backup: Backup): BackupCounts {
  return {
    expenses: backup.expenses.length,
    subscriptions: backup.subscriptions.length,
    categories: backup.categories.length,
    identities: backup.identities.length,
    memberships: backup.memberships.length,
    providers: backup.providers.length,
  };
}

export function describeCounts(counts: BackupCounts): string {
  const parts: string[] = [];
  const add = (count: number, singular: string, plural: string) => {
    if (count > 0) parts.push(`${count} ${count === 1 ? singular : plural}`);
  };
  add(counts.expenses, 'expense', 'expenses');
  add(counts.subscriptions, 'subscription', 'subscriptions');
  add(counts.categories, 'category', 'categories');
  add(counts.identities, 'identity', 'identities');
  add(counts.memberships, 'membership', 'memberships');
  return parts.length ? parts.join(', ') : 'an empty backup';
}

export function backupFileName(kind: 'json' | 'csv', date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return kind === 'json' ? `lifeos-backup-${stamp}.json` : `lifeos-expenses-${stamp}.csv`;
}
