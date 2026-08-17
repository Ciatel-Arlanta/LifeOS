import { hydrateAccounts } from '@/features/accounts/store';
import { hydrateExpenses } from '@/features/expenses/store';
import { hydrateReminders, syncTickTickTasks } from '@/features/reminders/store';
import { hydrateSubscriptions } from '@/features/subscriptions/store';
import { hasTickTickToken } from '@/integrations/ticktick/client';
import { postDueSubscriptionExpenses } from '@/services/subscription-posting';
import { useUiStore } from '@/store/ui';

export async function hydrateApp() {
  await hydrateAccounts();
  await hydrateExpenses();
  await hydrateSubscriptions();
  const posted = await postDueSubscriptionExpenses();
  if (posted > 0) {
    await hydrateExpenses();
    await hydrateSubscriptions();
  }
  const connected = await hasTickTickToken();
  useUiStore.getState().setTicktickStatus(connected ? 'connected' : 'disconnected');
  if (connected) await syncTickTickTasks();
  else await hydrateReminders();
}
