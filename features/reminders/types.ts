export type Reminder = {
  id: number;
  taskRefId: number;
  fireAtMs: number;
  fireAtIso: string;
  fireAtLabel: string;
  enabled: boolean;
  expoNotificationId: string | null;
};

export type ReminderTask = {
  id: number;
  ticktickTaskId: string;
  listId: string;
  listName: string;
  title: string;
  dueAtMs: number | null;
  dueLabel: string | null;
  isOpen: boolean;
  reminders: Reminder[];
};

export type ReminderListGroup = {
  listId: string;
  listName: string;
  tasks: ReminderTask[];
};
