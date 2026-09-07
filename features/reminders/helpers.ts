import type { ReminderTask } from './types';

export function upcomingReminders(tasks: ReminderTask[], limit = 3) {
  return tasks
    .filter((task) => task.isOpen && task.reminders.some((item) => item.enabled))
    .map((task) => ({
      task,
      next: [...task.reminders]
        .filter((item) => item.enabled)
        .sort((a, b) => a.fireAtMs - b.fireAtMs)[0],
    }))
    .filter((item) => item.next)
    .sort((a, b) => a.next.fireAtMs - b.next.fireAtMs)
    .slice(0, limit);
}
