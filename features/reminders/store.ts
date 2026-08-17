import { ticktickClient, hasTickTickToken } from '@/integrations/ticktick/client';
import { cancelLocalReminder, scheduleLocalReminder } from '@/notifications';
import { useUiStore } from '@/store/ui';
import { useCallback, useSyncExternalStore } from 'react';

import * as repository from './repository';
import type { ReminderListGroup, ReminderTask } from './types';

type Snapshot = {
  ready: boolean;
  tasks: ReminderTask[];
  error: string | null;
};

let snapshot: Snapshot = { ready: false, tasks: [], error: null };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

export function reminderGroups(tasks: ReminderTask[]): ReminderListGroup[] {
  const open = tasks.filter((task) => task.isOpen);
  const order: string[] = [];
  const map = new Map<string, ReminderListGroup>();
  for (const task of open) {
    const existing = map.get(task.listId);
    if (existing) existing.tasks.push(task);
    else {
      order.push(task.listId);
      map.set(task.listId, { listId: task.listId, listName: task.listName, tasks: [task] });
    }
  }
  return order.map((id) => map.get(id)!);
}

export async function hydrateReminders() {
  const tasks = await repository.listTasks();
  snapshot = { ...snapshot, ready: true, tasks };
  emit();
}

export async function syncTickTickTasks() {
  const connected = await hasTickTickToken();
  useUiStore.getState().setTicktickStatus(connected ? 'connecting' : 'disconnected');
  if (!connected) {
    await hydrateReminders();
    return;
  }
  try {
    const open = await ticktickClient.listOpenTasks();
    await repository.upsertOpenTasks(
      open.map((task) => ({
        ticktickTaskId: task.id,
        listId: task.listId,
        listName: task.listName,
        title: task.title,
        dueAtMs: task.dueAt ? new Date(task.dueAt).getTime() : null,
      }))
    );
    useUiStore.getState().setTicktickStatus('connected');
    snapshot = { ...snapshot, error: null };
  } catch (error) {
    useUiStore.getState().setTicktickStatus('disconnected');
    snapshot = {
      ...snapshot,
      error: error instanceof Error ? error.message : 'TickTick sync failed.',
    };
  }
  await hydrateReminders();
}

export function useReminderData() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    ...data,
    groups: reminderGroups(data.tasks),
    openTasks: data.tasks.filter((task) => task.isOpen),
  };
}

export function useReminderActions() {
  const addReminder = useCallback(async (taskRefId: number, fireAt: Date) => {
    const task = snapshot.tasks.find((item) => item.id === taskRefId);
    const created = await repository.createReminder(taskRefId, fireAt.getTime());
    const notificationId = await scheduleLocalReminder({
      title: task?.title ?? 'LifeOS reminder',
      body: 'A TickTick task needs your attention.',
      fireAt,
    });
    if (notificationId) await repository.setReminderNotification(created.id, notificationId);
    await hydrateReminders();
  }, []);

  const removeReminder = useCallback(async (id: number) => {
    const removed = await repository.deleteReminder(id);
    if (removed?.expoNotificationId) await cancelLocalReminder(removed.expoNotificationId);
    await hydrateReminders();
  }, []);

  return { addReminder, removeReminder };
}

export function upcomingReminders(tasks: ReminderTask[], limit = 3) {
  return tasks
    .filter((task) => task.isOpen && task.reminders.some((item) => item.enabled))
    .map((task) => ({
      task,
      next: [...task.reminders].filter((item) => item.enabled).sort((a, b) => a.fireAtMs - b.fireAtMs)[0],
    }))
    .filter((item) => item.next)
    .sort((a, b) => a.next.fireAtMs - b.next.fireAtMs)
    .slice(0, limit);
}
