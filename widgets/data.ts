import { categoryBreakdown, monthTotal } from '@/features/expenses/helpers';
import { monthlyCommitmentMinor, upcomingSubscriptions } from '@/features/subscriptions/helpers';
import { upcomingReminders } from '@/features/reminders/helpers';
import { formatMonthLabel } from '@/utils/date';

import { listExpenses } from '@/features/expenses/repository';
import { listSubscriptions } from '@/features/subscriptions/repository';
import { listTasks } from '@/features/reminders/repository';

async function safely<T>(loader: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await loader();
  } catch {
    return fallback;
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
    safely(listExpenses, []),
    safely(listSubscriptions, []),
    safely(listTasks, []),
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
