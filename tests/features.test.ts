import { describe, expect, it } from 'bun:test';
import {
  identityLabel,
  lookupService,
  membershipLabel,
  membershipsForIdentity,
} from '../features/accounts/helpers';
import type { Identity, Membership } from '../features/accounts/types';
import { categoryBreakdown, monthTotal } from '../features/expenses/helpers';
import type { Expense } from '../features/expenses/types';
import {
  activeSubscriptions,
  monthlyCommitmentMinor,
  pausedSubscriptions,
  upcomingSubscriptions,
} from '../features/subscriptions/helpers';
import type { Subscription } from '../features/subscriptions/types';
import { upcomingReminders } from '../features/reminders/helpers';
import type { ReminderTask } from '../features/reminders/types';

describe('Expenses Calculations', () => {
  const sampleExpenses: Expense[] = [
    {
      id: 1,
      amountMinor: 20000,
      categoryId: 1,
      categoryName: 'Food',
      transactionMode: 'gpay',
      occurredAt: '2026-09-01',
      subscriptionId: null,
    },
    {
      id: 2,
      amountMinor: 30000,
      categoryId: 2,
      categoryName: 'Transport',
      transactionMode: 'card',
      occurredAt: '2026-09-02',
      subscriptionId: null,
    },
    {
      id: 3,
      amountMinor: 50000,
      categoryId: 1,
      categoryName: 'Food',
      transactionMode: 'cash',
      occurredAt: '2026-09-03',
      subscriptionId: null,
    },
    {
      id: 4,
      amountMinor: 10000,
      categoryId: 1,
      categoryName: 'Food',
      transactionMode: 'gpay',
      occurredAt: '2026-08-15',
      subscriptionId: null,
    },
  ];

  it('calculates total for the specified month accurately', () => {
    expect(monthTotal(sampleExpenses, 2026, 8)).toBe(100000); // 20000 + 30000 + 50000
    expect(monthTotal(sampleExpenses, 2026, 7)).toBe(10000); // Aug
    expect(monthTotal(sampleExpenses, 2026, 0)).toBe(0); // Empty month
  });

  it('calculates category breakdown with percentages and sorting', () => {
    const breakdown = categoryBreakdown(sampleExpenses, 2026, 8);
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0].name).toBe('Food');
    expect(breakdown[0].amountMinor).toBe(70000);
    expect(breakdown[0].percent).toBe(70);
    expect(breakdown[1].name).toBe('Transport');
    expect(breakdown[1].amountMinor).toBe(30000);
    expect(breakdown[1].percent).toBe(30);
  });
});

describe('Subscription Calculations & Filtering', () => {
  const sampleSubs: Subscription[] = [
    {
      id: 1,
      name: 'Netflix',
      costMinor: 64900,
      billingPeriod: 'monthly',
      renewalDate: '2026-09-10',
      autopayEnabled: true,
      autopayMethod: 'card',
      categoryId: 1,
      categoryName: 'Entertainment',
      membershipId: null,
      membershipLabel: null,
      inactiveAtMs: null,
    },
    {
      id: 2,
      name: 'Gym',
      costMinor: 200000,
      billingPeriod: 'monthly',
      renewalDate: '2026-09-05',
      autopayEnabled: true,
      autopayMethod: 'gpay',
      categoryId: 2,
      categoryName: 'Health',
      membershipId: null,
      membershipLabel: null,
      inactiveAtMs: null,
    },
    {
      id: 3,
      name: 'Domain',
      costMinor: 120000,
      billingPeriod: 'yearly',
      renewalDate: '2026-12-01',
      autopayEnabled: false,
      autopayMethod: null,
      categoryId: 3,
      categoryName: 'Tech',
      membershipId: null,
      membershipLabel: null,
      inactiveAtMs: Date.now(), // PAUSED
    },
  ];

  it('filters active vs paused subscriptions', () => {
    expect(activeSubscriptions(sampleSubs)).toHaveLength(2);
    expect(pausedSubscriptions(sampleSubs)).toHaveLength(1);
    expect(pausedSubscriptions(sampleSubs)[0].name).toBe('Domain');
  });

  it('calculates monthly commitment excluding paused subscriptions', () => {
    // 64900 (Netflix) + 200000 (Gym) = 264900
    expect(monthlyCommitmentMinor(sampleSubs)).toBe(264900);
  });

  it('sorts and limits upcoming subscriptions by renewal date', () => {
    const upcoming = upcomingSubscriptions(sampleSubs, 2, new Date(2026, 8, 1));
    expect(upcoming).toHaveLength(2);
    expect(upcoming[0].name).toBe('Gym'); // Sep 5
    expect(upcoming[1].name).toBe('Netflix'); // Sep 10
  });
});

describe('Accounts & Memberships Helpers', () => {
  const identities: Identity[] = [
    {
      id: 1,
      providerId: 10,
      providerName: 'Google',
      identifier: 'achintya@gmail.com',
      type: 'personal',
      purpose: '',
      createdDate: '2026-01-01',
    },
    {
      id: 2,
      providerId: 10,
      providerName: 'Google',
      identifier: 'work@gmail.com',
      type: 'work',
      purpose: '',
      createdDate: '2026-01-01',
    },
  ];

  const memberships: Membership[] = [
    {
      id: 101,
      providerId: 20,
      providerName: 'Claude',
      identityId: 1,
      identityIdentifier: 'achintya@gmail.com',
      note: 'Main account',
      createdDate: '2026-01-01',
    },
  ];

  it('formats identity and membership labels', () => {
    expect(identityLabel(identities[0])).toBe('Google · achintya@gmail.com');
    expect(membershipLabel(memberships[0])).toBe('Claude · achintya@gmail.com');
  });

  it('finds memberships for a given identity', () => {
    expect(membershipsForIdentity(memberships, 1)).toHaveLength(1);
    expect(membershipsForIdentity(memberships, 2)).toHaveLength(0);
  });

  it('looks up a service and segregates used vs notUsed identities', () => {
    const result = lookupService('claude', memberships, identities);
    expect(result).not.toBeNull();
    expect(result!.serviceName).toBe('Claude');
    expect(result!.used).toHaveLength(1);
    expect(result!.used[0].identityId).toBe(1);
    expect(result!.notUsed).toHaveLength(1);
    expect(result!.notUsed[0].id).toBe(2);
  });

  it('returns null for empty or non-matching query', () => {
    expect(lookupService('', memberships, identities)).toBeNull();
    expect(lookupService('NonExistentService', memberships, identities)).toBeNull();
  });
});

describe('Reminders Calculations', () => {
  const sampleTasks: ReminderTask[] = [
    {
      id: 1,
      ticktickTaskId: 'tt-1',
      title: 'Submit tax return',
      listId: 'l1',
      listName: 'Finances',
      dueAtMs: Date.now() + 86400000,
      dueLabel: null,
      isOpen: true,
      reminders: [
        {
          id: 10,
          taskRefId: 1,
          fireAtMs: Date.now() + 3600000,
          fireAtIso: '2026-09-03T12:00:00.000Z',
          fireAtLabel: '12:00 PM',
          enabled: true,
          expoNotificationId: null,
        },
      ],
    },
    {
      id: 2,
      ticktickTaskId: 'tt-2',
      title: 'Closed task',
      listId: 'l2',
      listName: 'Work',
      dueAtMs: null,
      dueLabel: null,
      isOpen: false,
      reminders: [
        {
          id: 20,
          taskRefId: 2,
          fireAtMs: Date.now() + 10000,
          fireAtIso: '2026-09-03T11:30:00.000Z',
          fireAtLabel: '11:30 AM',
          enabled: true,
          expoNotificationId: null,
        },
      ],
    },
  ];

  it('returns upcoming reminders only for open tasks', () => {
    const upcoming = upcomingReminders(sampleTasks, 5);
    expect(upcoming).toHaveLength(1);
    expect(upcoming[0].task.title).toBe('Submit tax return');
    expect(upcoming[0].next.id).toBe(10);
  });
});
