export type Reminder = {
  id: number;
  fireAtLabel: string;
  fireAtIso: string;
  enabled: boolean;
};

export type ReminderTask = {
  id: string;
  listId: string;
  listName: string;
  title: string;
  dueLabel: string | null;
  reminders: Reminder[];
};

export type ReminderListGroup = {
  listId: string;
  listName: string;
  tasks: ReminderTask[];
};
