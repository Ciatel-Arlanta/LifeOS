export function formatMinor(minor: number): string {
  const sign = minor < 0 ? '-' : '';
  const abs = Math.abs(minor);
  const rupees = abs / 100;
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
  }).format(rupees);
  return `${sign}\u20B9${formatted}`;
}
