import { describe, expect, it } from 'bun:test';
import {
  backupFileName,
  countBackup,
  describeCounts,
  expensesToCsv,
  parseBackup,
} from '../features/backup/helpers';
import { BACKUP_APP, BACKUP_VERSION, type Backup } from '../features/backup/types';
import { renewalNoticeAt } from '../features/subscriptions/helpers';

function backup(overrides: Partial<Backup> = {}): Backup {
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: '2026-09-08T00:00:00.000Z',
    providers: [{ id: 1, name: 'Google' }],
    identities: [
      {
        id: 1,
        providerId: 1,
        identifier: 'me@gmail.com',
        type: 'personal',
        purpose: '',
        createdDate: '2026-01-01',
      },
    ],
    memberships: [{ id: 1, providerId: 1, identityId: 1, note: '', createdDate: '2026-01-01' }],
    categories: [
      { id: 1, name: 'Food' },
      { id: 2, name: 'Streaming, Music' },
    ],
    subscriptions: [
      {
        id: 7,
        name: 'Netflix',
        costMinor: 49900,
        billingPeriod: 'monthly',
        renewalDate: '2026-09-10',
        autopayEnabled: true,
        autopayMethod: 'card',
        categoryId: 2,
        membershipId: 1,
        inactiveAtMs: null,
      },
    ],
    expenses: [
      {
        id: 1,
        amountMinor: 12050,
        categoryId: 1,
        transactionMode: 'gpay',
        occurredAt: '2026-09-02',
        subscriptionId: null,
      },
      {
        id: 2,
        amountMinor: 49900,
        categoryId: 2,
        transactionMode: 'card',
        occurredAt: '2026-09-10',
        subscriptionId: 7,
      },
    ],
    ...overrides,
  };
}

describe('parseBackup', () => {
  it('round-trips an exported backup', () => {
    const original = backup();
    expect(parseBackup(JSON.stringify(original))).toEqual(original);
  });

  it('rejects files that are not JSON', () => {
    expect(() => parseBackup('not json')).toThrow('valid JSON');
  });

  it('rejects JSON from another app', () => {
    expect(() => parseBackup('{"app":"something-else"}')).toThrow('not a LifeOS backup');
  });

  it('rejects an unsupported version', () => {
    expect(() => parseBackup(JSON.stringify({ ...backup(), version: 99 }))).toThrow('not supported');
  });

  it('rejects a backup missing a table', () => {
    const { expenses, ...rest } = backup();
    expect(() => parseBackup(JSON.stringify(rest))).toThrow('missing "expenses"');
  });
});

describe('counts', () => {
  it('counts every table', () => {
    expect(countBackup(backup())).toEqual({
      expenses: 2,
      subscriptions: 1,
      categories: 2,
      identities: 1,
      memberships: 1,
      providers: 1,
    });
  });

  it('pluralises irregular nouns', () => {
    expect(describeCounts(countBackup(backup()))).toBe(
      '2 expenses, 1 subscription, 2 categories, 1 identity, 1 membership'
    );
  });
});

describe('expensesToCsv', () => {
  const csv = expensesToCsv(backup()).split('\n');

  it('writes a header and one row per expense, oldest first', () => {
    expect(csv).toHaveLength(3);
    expect(csv[0]).toBe('date,amount_inr,category,payment_mode,subscription');
    expect(csv[1]).toBe('2026-09-02,120.50,Food,GPay,');
  });

  it('quotes cells containing a comma', () => {
    expect(csv[2]).toBe('2026-09-10,499.00,"Streaming, Music",Card,Netflix');
  });

  it('falls back to Uncategorized when the category is gone', () => {
    const orphan = backup({ categories: [] });
    expect(expensesToCsv(orphan).split('\n')[1]).toContain('Uncategorized');
  });
});

describe('backupFileName', () => {
  it('stamps the date and extension', () => {
    const now = new Date('2026-09-08T12:00:00');
    expect(backupFileName('json', now)).toBe('lifeos-backup-2026-09-08.json');
    expect(backupFileName('csv', now)).toBe('lifeos-expenses-2026-09-08.csv');
  });
});

describe('renewalNoticeAt', () => {
  const now = new Date('2026-09-01T08:00:00');

  it('fires at 09:00 the given number of days before renewal', () => {
    const at = renewalNoticeAt('2026-09-10', 2, now)!;
    expect(at.getFullYear()).toBe(2026);
    expect(at.getMonth()).toBe(8);
    expect(at.getDate()).toBe(8);
    expect(at.getHours()).toBe(9);
    expect(at.getMinutes()).toBe(0);
  });

  it('returns null when notices are off', () => {
    expect(renewalNoticeAt('2026-09-10', 0, now)).toBeNull();
  });

  it('returns null when the notice window already passed', () => {
    expect(renewalNoticeAt('2026-09-02', 2, now)).toBeNull();
  });

  it('returns null for an unparseable renewal date', () => {
    expect(renewalNoticeAt('not-a-date', 2, now)).toBeNull();
  });
});
