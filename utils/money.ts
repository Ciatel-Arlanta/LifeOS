export const CURRENCY = 'INR' as const;

/** Amounts are stored as integer paise. 180000 → ₹1,800. */
export function formatInr(minor: number, options?: { compact?: boolean }): string {
  const rupees = minor / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: options?.compact && Number.isInteger(rupees) ? 0 : 2,
    minimumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
  }).format(rupees);
}

export function rupeesToMinor(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Sentence comparing this month to last. Returns null when last month had no spend. */
export function describeMonthDelta(
  currentMinor: number,
  previousMinor: number,
  previousLabel: string
): string | null {
  if (previousMinor <= 0) return null;
  const diff = currentMinor - previousMinor;
  if (diff === 0) return `Same as ${previousLabel}`;
  const amount = formatInr(Math.abs(diff), { compact: true });
  return diff > 0 ? `${amount} more than ${previousLabel}` : `${amount} less than ${previousLabel}`;
}

export function parseRupeeInput(value: string): number | null {
  const cleaned = value.replace(/[₹,\s]/g, '');
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return rupeesToMinor(parsed);
}
