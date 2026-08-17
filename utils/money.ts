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

export function parseRupeeInput(value: string): number | null {
  const cleaned = value.replace(/[₹,\s]/g, '');
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return rupeesToMinor(parsed);
}
