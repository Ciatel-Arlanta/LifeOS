import { createWebPersist } from '@/lib/web-persist';
import { formatDateTime } from '@/utils/date';

import type { Reminder, ReminderTask } from './types';

type Persist = {
  tasks: Omit<ReminderTask, 'reminders' | 'dueLabel'>[];
  reminders: Omit<Reminder, 'fireAtIso' | 'fireAtLabel'>[];
  nextTaskId: number;
  nextReminderId: number;
};

const store = createWebPersist<Persist>('lifeos.reminder-data', () => ({
  tasks: [],
  reminders: [],
  nextTaskId: 1,
  nextReminderId: 1,
}));

function assemble(): ReminderTask[] {
  const data = store.read();
  return data.tasks.map((task) => ({
    ...task,
    dueLabel: task.dueAtMs
      ? new Date(task.dueAtMs).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      : null,
    reminders: data.reminders
      .filter((item) => item.taskRefId === task.id)
      .map((item) => ({
        ...item,
        fireAtIso: new Date(item.fireAtMs).toISOString(),
        fireAtLabel: formatDateTime(new Date(item.fireAtMs).toISOString()),
      }))
      .sort((a, b) => a.fireAtMs - b.fireAtMs),
  }));
}

export async function listTasks(): Promise<ReminderTask[]> {
  return assemble();
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
  const data = store.read();
  const seen = new Set(incoming.map((item) => item.ticktickTaskId));
  const now = Date.now();

  data.tasks = data.tasks.map((task) =>
    seen.has(task.ticktickTaskId) ? task : { ...task, isOpen: false }
  );

  for (const item of incoming) {
    const existing = data.tasks.find((task) => task.ticktickTaskId === item.ticktickTaskId);
    if (existing) {
      existing.listId = item.listId;
      existing.listName = item.listName;
      existing.title = item.title;
      existing.dueAtMs = item.dueAtMs;
      existing.isOpen = true;
    } else {
      data.tasks.push({
        id: data.nextTaskId,
        ticktickTaskId: item.ticktickTaskId,
        listId: item.listId,
        listName: item.listName,
        title: item.title,
        dueAtMs: item.dueAtMs,
        isOpen: true,
      });
      data.nextTaskId += 1;
    }
  }
  void now;
  store.write(data);
}

export async function createReminder(taskRefId: number, fireAtMs: number): Promise<Reminder> {
  const data = store.read();
  const row = {
    id: data.nextReminderId,
    taskRefId,
    fireAtMs,
    enabled: true,
    expoNotificationId: null as string | null,
  };
  data.reminders.push(row);
  data.nextReminderId += 1;
  store.write(data);
  return {
    ...row,
    fireAtIso: new Date(fireAtMs).toISOString(),
    fireAtLabel: formatDateTime(new Date(fireAtMs).toISOString()),
  };
}

export async function setReminderNotification(id: number, expoNotificationId: string | null) {
  const data = store.read();
  data.reminders = data.reminders.map((item) =>
    item.id === id ? { ...item, expoNotificationId } : item
  );
  store.write(data);
}

export async function deleteReminder(id: number): Promise<Reminder | undefined> {
  const data = store.read();
  const found = data.reminders.find((item) => item.id === id);
  data.reminders = data.reminders.filter((item) => item.id !== id);
  store.write(data);
  return found
    ? {
        ...found,
        fireAtIso: new Date(found.fireAtMs).toISOString(),
        fireAtLabel: formatDateTime(new Date(found.fireAtMs).toISOString()),
      }
    : undefined;
}
