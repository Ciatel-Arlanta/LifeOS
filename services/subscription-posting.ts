import { getExpenseSnapshot } from '@/features/expenses/store';
import * as expenseRepo from '@/features/expenses/repository';
import * as subscriptionRepo from '@/features/subscriptions/repository';
import { addBillingPeriod, todayIso } from '@/utils/date';

function modeFromAutopay(method: 'gpay' | 'card' | 'other' | null): 'gpay' | 'cash' | 'card' {
  if (method === 'gpay') return 'gpay';
  return 'card';
}

export async function postDueSubscriptionExpenses(now = new Date()): Promise<number> {
  const today = todayIso(now);
  const items = await subscriptionRepo.listSubscriptions();
  const postedKeys = new Set(
    getExpenseSnapshot().expenses.map((expense) => `${expense.subscriptionId}:${expense.occurredAt}`)
  );
  let posted = 0;

  for (const item of items) {
    if (item.inactiveAtMs != null) continue;
    let cursor = item.renewalDate;
    let guard = 0;
    while (cursor <= today && guard < 36) {
      const key = `${item.id}:${cursor}`;
      if (!postedKeys.has(key)) {
        await expenseRepo.createExpense({
          amountMinor: item.costMinor,
          categoryId: item.categoryId,
          transactionMode: modeFromAutopay(item.autopayMethod),
          occurredAt: cursor,
          subscriptionId: item.id,
        });
        postedKeys.add(key);
        posted += 1;
      }
      cursor = addBillingPeriod(cursor, item.billingPeriod);
      guard += 1;
    }
    if (cursor !== item.renewalDate) {
      await subscriptionRepo.updateRenewalDate(item.id, cursor);
    }
  }

  return posted;
}
