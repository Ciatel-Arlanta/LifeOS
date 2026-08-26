import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const accountTypes = ['personal', 'college', 'work', 'other'] as const;
export const transactionModes = ['gpay', 'cash', 'card'] as const;
export const billingPeriods = ['weekly', 'monthly', 'yearly'] as const;
export const autopayMethods = ['gpay', 'card', 'other'] as const;

export const providers = sqliteTable('providers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const identities = sqliteTable('identities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  providerId: integer('provider_id')
    .notNull()
    .references(() => providers.id, { onDelete: 'cascade' }),
  identifier: text('identifier').notNull(),
  type: text('type', { enum: accountTypes }).notNull(),
  purpose: text('purpose'),
  createdDate: text('created_date'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const memberships = sqliteTable('memberships', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  providerId: integer('provider_id')
    .notNull()
    .references(() => providers.id, { onDelete: 'cascade' }),
  identityId: integer('identity_id')
    .notNull()
    .references(() => identities.id, { onDelete: 'cascade' }),
  note: text('note'),
  createdDate: text('created_date'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const expenseCategories = sqliteTable('expense_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  costMinor: integer('cost_minor').notNull(),
  billingPeriod: text('billing_period', { enum: billingPeriods }).notNull(),
  renewalDate: text('renewal_date').notNull(),
  autopayEnabled: integer('autopay_enabled', { mode: 'boolean' }).notNull().default(false),
  autopayMethod: text('autopay_method', { enum: autopayMethods }),
  categoryId: integer('category_id').references(() => expenseCategories.id, {
    onDelete: 'set null',
  }),
  membershipId: integer('membership_id').references(() => memberships.id, {
    onDelete: 'set null',
  }),
  inactiveAt: integer('inactive_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const expenses = sqliteTable('expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  amountMinor: integer('amount_minor').notNull(),
  categoryId: integer('category_id').references(() => expenseCategories.id, {
    onDelete: 'set null',
  }),
  transactionMode: text('transaction_mode', { enum: transactionModes }).notNull(),
  occurredAt: text('occurred_at').notNull(),
  subscriptionId: integer('subscription_id').references(() => subscriptions.id, {
    onDelete: 'set null',
  }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const ticktickTaskRefs = sqliteTable('ticktick_task_refs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ticktickTaskId: text('ticktick_task_id').notNull().unique(),
  ticktickProjectId: text('ticktick_project_id').notNull(),
  title: text('title').notNull(),
  dueAt: integer('due_at', { mode: 'timestamp_ms' }),
  projectName: text('project_name'),
  isOpen: integer('is_open', { mode: 'boolean' }).notNull().default(true),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp_ms' }).notNull(),
});

export const reminderConfigs = sqliteTable('reminder_configs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskRefId: integer('task_ref_id')
    .notNull()
    .references(() => ticktickTaskRefs.id, { onDelete: 'cascade' }),
  fireAt: integer('fire_at', { mode: 'timestamp_ms' }).notNull(),
  expoNotificationId: text('expo_notification_id'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});
