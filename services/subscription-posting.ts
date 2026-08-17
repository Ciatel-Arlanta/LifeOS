import { AppError } from '@/lib/errors';

/** Creates expense rows for due subscriptions. Implemented when persistence is wired. */
export async function postDueSubscriptionExpenses(): Promise<number> {
  throw new AppError(
    'Automatic subscription posting is not implemented yet.',
    'subscriptions.posting_not_implemented'
  );
}
