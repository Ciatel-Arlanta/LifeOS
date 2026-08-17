import type { ReminderListGroup, ReminderTask } from './types';

export const MOCK_REMINDER_TASKS: ReminderTask[] = [
  {
    id: 'tt-pay-electricity',
    listId: 'inbox',
    listName: 'Inbox',
    title: 'Pay electricity bill',
    dueLabel: 'Aug 20',
    reminders: [
      { id: 1, fireAtLabel: 'Aug 19, 9:00 AM', fireAtIso: '2026-08-19T09:00:00', enabled: true },
      { id: 2, fireAtLabel: 'Aug 20, 8:00 AM', fireAtIso: '2026-08-20T08:00:00', enabled: true },
    ],
  },
  {
    id: 'tt-dentist',
    listId: 'inbox',
    listName: 'Inbox',
    title: 'Call dentist',
    dueLabel: 'Aug 18',
    reminders: [
      { id: 3, fireAtLabel: 'Aug 18, 10:30 AM', fireAtIso: '2026-08-18T10:30:00', enabled: true },
    ],
  },
  {
    id: 'tt-assignment',
    listId: 'college',
    listName: 'College',
    title: 'Submit design assignment',
    dueLabel: 'Aug 21',
    reminders: [
      { id: 4, fireAtLabel: 'Aug 20, 7:00 PM', fireAtIso: '2026-08-20T19:00:00', enabled: true },
    ],
  },
  {
    id: 'tt-lab-report',
    listId: 'college',
    listName: 'College',
    title: 'Print lab report',
    dueLabel: null,
    reminders: [],
  },
  {
    id: 'tt-passport',
    listId: 'personal',
    listName: 'Personal',
    title: 'Renew passport',
    dueLabel: 'Sep 2',
    reminders: [
      { id: 5, fireAtLabel: 'Aug 25, 6:00 PM', fireAtIso: '2026-08-25T18:00:00', enabled: true },
      { id: 6, fireAtLabel: 'Sep 1, 9:00 AM', fireAtIso: '2026-09-01T09:00:00', enabled: false },
    ],
  },
];

export function reminderGroups(source = MOCK_REMINDER_TASKS): ReminderListGroup[] {
  const order: string[] = [];
  const map = new Map<string, ReminderListGroup>();

  for (const task of source) {
    const existing = map.get(task.listId);
    if (existing) {
      existing.tasks.push(task);
    } else {
      order.push(task.listId);
      map.set(task.listId, { listId: task.listId, listName: task.listName, tasks: [task] });
    }
  }

  return order.map((id) => map.get(id)!);
}

export function getReminderTask(id: string): ReminderTask | undefined {
  return MOCK_REMINDER_TASKS.find((task) => task.id === id);
}

export function upcomingReminders(limit = 3) {
  return MOCK_REMINDER_TASKS.filter((task) => task.reminders.some((item) => item.enabled))
    .map((task) => ({
      task,
      next: task.reminders.find((item) => item.enabled)!,
    }))
    .slice(0, limit);
}
