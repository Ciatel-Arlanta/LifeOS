import { categoryBreakdown, monthTotal } from '@/features/expenses/store';
import { monthlyCommitmentMinor, upcomingSubscriptions } from '@/features/subscriptions/store';
import { upcomingReminders } from '@/features/reminders/store';
import { formatMonthLabel } from '@/utils/date';

type ExpenseRepo = typeof import('@/features/expenses/repository');
type SubRepo = typeof import('@/features/subscriptions/repository');
type ReminderRepo = typeof import('@/features/reminders/repository');

async function loadExpenses() {
  try {
    const repo: ExpenseRepo = await import('@/features/expenses/repository');
    return await repo.listExpenses();
  } catch {
    return [];
  }
}

async function loadSubscriptions() {
  try {
    const repo: SubRepo = await import('@/features/subscriptions/repository');
    return await repo.listSubscriptions();
  } catch {
    return [];
  }
}

async function loadReminderTasks() {
  try {
    const repo: ReminderRepo = await import('@/features/reminders/repository');
    return await repo.listTasks();
  } catch {
    return [];
  }
}

export type WidgetData = {
  now: Date;
  year: number;
  month: number;
  monthLabel: string;
  spend: {
    totalMinor: number;
    shares: ReturnType<typeof categoryBreakdown>;
    monthLabel: string;
  };
  renewals: {
    items: ReturnType<typeof upcomingSubscriptions>;
    commitmentMinor: number;
  };
  reminders: {
    items: ReturnType<typeof upcomingReminders>;
  };
};

export async function loadWidgetData(now = new Date()): Promise<WidgetData> {
  const [expenses, subscriptions, tasks] = await Promise.all([
    loadExpenses(),
    loadSubscriptions(),
    loadReminderTasks(),
  ]);

  const year = now.getFullYear();
  const month = now.getMonth();
  const totalMinor = monthTotal(expenses, year, month);
  const shares = categoryBreakdown(expenses, year, month);
  const renewalsItems = upcomingSubscriptions(subscriptions, 3, now);
  const commitmentMinor = monthlyCommitmentMinor(subscriptions);
  const reminderItems = upcomingReminders(tasks, 3);

  return {
    now,
    year,
    month,
    monthLabel: formatMonthLabel(year, month).toUpperCase(),
    spend: { totalMinor, shares, monthLabel: formatMonthLabel(year, month).toUpperCase() },
    renewals: { items: renewalsItems, commitmentMinor },
    reminders: { items: reminderItems },
  };
}
