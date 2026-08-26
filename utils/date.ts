const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDayHeading(isoDate: string, now = new Date()): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (isSameDay(date, now)) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatShortDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatLongDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatMonthLabel(year: number, monthIndex: number): string {
  return `${MONTHS[monthIndex]} ${year}`;
}

export function formatWeekdayDate(now = new Date()): string {
  return now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function daysUntil(isoDate: string, now = new Date()): number {
  const target = startOfDay(new Date(`${isoDate}T00:00:00`));
  const today = startOfDay(now);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function formatRelativeDay(isoDate: string, now = new Date()): string {
  const delta = daysUntil(isoDate, now);
  if (delta === 0) return 'Today';
  if (delta === 1) return 'Tomorrow';
  if (delta === -1) return 'Yesterday';
  if (delta > 1 && delta < 8) return `In ${delta} days`;
  if (delta < 0 && delta > -8) return `${Math.abs(delta)} days ago`;
  return formatShortDate(isoDate);
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function isInMonth(isoDate: string, year: number, monthIndex: number): boolean {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.getFullYear() === year && date.getMonth() === monthIndex;
}

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function parseIsoDate(iso: string, fallback = new Date()): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return fallback;
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

export function isValidIsoDate(iso: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) && !Number.isNaN(new Date(`${iso}T00:00:00`).getTime());
}

export function isValidHm(hm: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(hm)) return false;
  const [hours, minutes] = hm.split(':').map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export function todayIso(now = new Date()): string {
  return toIsoDate(now);
}

export function addBillingPeriod(
  isoDate: string,
  period: 'weekly' | 'monthly' | 'yearly'
): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (period === 'weekly') date.setDate(date.getDate() + 7);
  if (period === 'monthly') date.setMonth(date.getMonth() + 1);
  if (period === 'yearly') date.setFullYear(date.getFullYear() + 1);
  return toIsoDate(date);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}
