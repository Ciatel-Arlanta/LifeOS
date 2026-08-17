import { getDb } from '@/db/client';
import { reminderConfigs, ticktickTaskRefs } from '@/db/schema';
import { formatDateTime } from '@/utils/date';
import { eq } from 'drizzle-orm';

import type { Reminder, ReminderTask } from './types';

function mapReminder(row: typeof reminderConfigs.$inferSelect): Reminder {
  return {
    id: row.id,
    taskRefId: row.taskRefId,
    fireAtMs: row.fireAt.getTime(),
    fireAtIso: row.fireAt.toISOString(),
    fireAtLabel: formatDateTime(row.fireAt.toISOString()),
    enabled: row.enabled,
    expoNotificationId: row.expoNotificationId,
  };
}

export async function listTasks(): Promise<ReminderTask[]> {
  const db = getDb();
  const [taskRows, reminderRows] = await Promise.all([
    db.select().from(ticktickTaskRefs),
    db.select().from(reminderConfigs),
  ]);

  return taskRows.map((task) => ({
    id: task.id,
    ticktickTaskId: task.ticktickTaskId,
    listId: task.ticktickProjectId,
    listName: task.projectName ?? 'Inbox',
    title: task.title,
    dueAtMs: task.dueAt ? task.dueAt.getTime() : null,
    dueLabel: task.dueAt
      ? task.dueAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      : null,
    isOpen: task.isOpen,
    reminders: reminderRows
      .filter((item) => item.taskRefId === task.id)
      .map(mapReminder)
      .sort((a, b) => a.fireAtMs - b.fireAtMs),
  }));
}

export async function upsertOpenTasks(
  incoming: {
    ticktickTaskId: string;
    listId: string;
    listName: string;
    title: string;
    dueAtMs: number | null;
  }[]
): Promise<void> {
  const db = getDb();
  const existing = await db.select().from(ticktickTaskRefs);
  const seen = new Set(incoming.map((item) => item.ticktickTaskId));
  const now = new Date();

  for (const row of existing) {
    if (!seen.has(row.ticktickTaskId) && row.isOpen) {
      await db
        .update(ticktickTaskRefs)
        .set({ isOpen: false, lastSyncedAt: now })
        .where(eq(ticktickTaskRefs.id, row.id));
    }
  }

  for (const item of incoming) {
    const found = existing.find((row) => row.ticktickTaskId === item.ticktickTaskId);
    if (found) {
      await db
        .update(ticktickTaskRefs)
        .set({
          ticktickProjectId: item.listId,
          projectName: item.listName,
          title: item.title,
          dueAt: item.dueAtMs ? new Date(item.dueAtMs) : null,
          isOpen: true,
          lastSyncedAt: now,
        })
        .where(eq(ticktickTaskRefs.id, found.id));
    } else {
      await db.insert(ticktickTaskRefs).values({
        ticktickTaskId: item.ticktickTaskId,
        ticktickProjectId: item.listId,
        projectName: item.listName,
        title: item.title,
        dueAt: item.dueAtMs ? new Date(item.dueAtMs) : null,
        isOpen: true,
        lastSyncedAt: now,
      });
    }
  }
}

export async function createReminder(taskRefId: number, fireAtMs: number): Promise<Reminder> {
  const now = new Date();
  const [row] = await getDb()
    .insert(reminderConfigs)
    .values({
      taskRefId,
      fireAt: new Date(fireAtMs),
      expoNotificationId: null,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return mapReminder(row);
}

export async function setReminderNotification(id: number, expoNotificationId: string | null) {
  await getDb()
    .update(reminderConfigs)
    .set({ expoNotificationId, updatedAt: new Date() })
    .where(eq(reminderConfigs.id, id));
}

export async function deleteReminder(id: number): Promise<Reminder | undefined> {
  const db = getDb();
  const [row] = await db.select().from(reminderConfigs).where(eq(reminderConfigs.id, id));
  if (!row) return undefined;
  await db.delete(reminderConfigs).where(eq(reminderConfigs.id, id));
  return mapReminder(row);
}
