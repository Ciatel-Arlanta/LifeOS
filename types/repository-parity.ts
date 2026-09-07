/**
 * Each feature ships two repositories: `repository.native.ts` (Drizzle/SQLite, the
 * shipped Android surface) and `repository.ts` (localStorage, `bun run web` preview).
 * Metro picks one by platform, so nothing forces them to agree — and they have drifted.
 *
 * These aliases make `bun run typecheck` fail when an export is added, removed, or
 * re-signed on one side only. Type-only: nothing here is emitted or bundled.
 */

type Parity<Web, Native> = [Web] extends [Native]
  ? [Native] extends [Web]
    ? true
    : 'web repository exports something the native repository does not'
  : 'web repository is missing an export, or a signature does not match native';

type Assert<T extends true> = T;

export type _Accounts = Assert<
  Parity<
    typeof import('@/features/accounts/repository'),
    typeof import('@/features/accounts/repository.native')
  >
>;

export type _Expenses = Assert<
  Parity<
    typeof import('@/features/expenses/repository'),
    typeof import('@/features/expenses/repository.native')
  >
>;

export type _Reminders = Assert<
  Parity<
    typeof import('@/features/reminders/repository'),
    typeof import('@/features/reminders/repository.native')
  >
>;

export type _Subscriptions = Assert<
  Parity<
    typeof import('@/features/subscriptions/repository'),
    typeof import('@/features/subscriptions/repository.native')
  >
>;
