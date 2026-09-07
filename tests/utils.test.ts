import { describe, expect, it } from 'bun:test';
import {
  addBillingPeriod,
  formatDayHeading,
  formatMonthLabel,
  formatRelativeDay,
  formatTime,
  isValidHm,
  isValidIsoDate,
  parseIsoDate,
  toIsoDate,
} from '../utils/date';
import { describeMonthDelta, formatInr, parseRupeeInput, rupeesToMinor } from '../utils/money';

describe('Money Utilities', () => {
  describe('parseRupeeInput', () => {
    it('parses whole rupee values to paise', () => {
      expect(parseRupeeInput('100')).toBe(10000);
      expect(parseRupeeInput('1')).toBe(100);
      expect(parseRupeeInput('0')).toBe(0);
    });

    it('parses decimal values accurately', () => {
      expect(parseRupeeInput('99.50')).toBe(9950);
      expect(parseRupeeInput('99.5')).toBe(9950);
      expect(parseRupeeInput('0.05')).toBe(5);
      expect(parseRupeeInput('1234.99')).toBe(123499);
    });

    it('handles rupee symbol, commas and surrounding whitespace', () => {
      expect(parseRupeeInput(' ₹ 1,000 ')).toBe(100000);
      expect(parseRupeeInput(' 12,34,567 ')).toBe(123456700);
    });

    it('returns null for invalid inputs', () => {
      expect(parseRupeeInput('')).toBeNull();
      expect(parseRupeeInput('   ')).toBeNull();
      expect(parseRupeeInput('abc')).toBeNull();
      expect(parseRupeeInput('-50')).toBeNull();
      expect(parseRupeeInput('12.34.56')).toBeNull();
    });
  });

  describe('formatInr', () => {
    it('formats minor units (paise) to rupee string', () => {
      expect(formatInr(10000)).toBe('₹100');
      expect(formatInr(10050)).toBe('₹100.50');
      expect(formatInr(0)).toBe('₹0');
      expect(formatInr(50)).toBe('₹0.50');
      expect(formatInr(10000000)).toBe('₹1,00,000');
    });
  });

  describe('describeMonthDelta', () => {
    it('returns null when previous month had no spend', () => {
      expect(describeMonthDelta(50000, 0, 'July')).toBeNull();
      expect(describeMonthDelta(50000, -100, 'July')).toBeNull();
    });

    it('handles spend increase', () => {
      expect(describeMonthDelta(15000, 10000, 'July')).toBe('₹50 more than July');
    });

    it('handles spend decrease', () => {
      expect(describeMonthDelta(5000, 10000, 'July')).toBe('₹50 less than July');
    });

    it('handles equal spend', () => {
      expect(describeMonthDelta(10000, 10000, 'July')).toBe('Same as July');
    });
  });
});

describe('Date Utilities', () => {
  describe('toIsoDate', () => {
    it('formats Date to YYYY-MM-DD correctly', () => {
      const d = new Date(2026, 8, 3);
      expect(toIsoDate(d)).toBe('2026-09-03');
    });
  });

  describe('parseIsoDate', () => {
    it('parses valid ISO date strings', () => {
      const parsed = parseIsoDate('2026-09-03');
      expect(parsed.getFullYear()).toBe(2026);
      expect(parsed.getMonth()).toBe(8);
      expect(parsed.getDate()).toBe(3);
    });

    it('returns fallback for invalid date strings', () => {
      const fallback = new Date(2020, 0, 1);
      expect(parseIsoDate('invalid-date', fallback)).toBe(fallback);
    });
  });

  describe('isValidIsoDate', () => {
    it('validates proper ISO format and dates', () => {
      expect(isValidIsoDate('2026-09-03')).toBe(true);
      expect(isValidIsoDate('2026-02-28')).toBe(true);
      expect(isValidIsoDate('2024-02-29')).toBe(true);
    });

    it('rejects invalid strings', () => {
      expect(isValidIsoDate('')).toBe(false);
      expect(isValidIsoDate('2026-9-3')).toBe(false);
      expect(isValidIsoDate('03-09-2026')).toBe(false);
      expect(isValidIsoDate('not-a-date')).toBe(false);
    });
  });

  describe('formatTime and isValidHm', () => {
    it('formats time to 24h HH:MM', () => {
      const d = new Date(2026, 0, 1, 9, 5);
      expect(formatTime(d)).toBe('09:05');
      const d2 = new Date(2026, 0, 1, 23, 59);
      expect(formatTime(d2)).toBe('23:59');
    });

    it('validates 24h HH:MM format', () => {
      expect(isValidHm('00:00')).toBe(true);
      expect(isValidHm('09:05')).toBe(true);
      expect(isValidHm('23:59')).toBe(true);
      expect(isValidHm('24:00')).toBe(false);
      expect(isValidHm('12:60')).toBe(false);
      expect(isValidHm('9:5')).toBe(false);
      expect(isValidHm('invalid')).toBe(false);
    });
  });

  describe('addBillingPeriod', () => {
    it('adds weekly periods correctly', () => {
      expect(addBillingPeriod('2026-09-01', 'weekly')).toBe('2026-09-08');
      expect(addBillingPeriod('2026-09-28', 'weekly')).toBe('2026-10-05');
    });

    it('adds monthly periods correctly', () => {
      expect(addBillingPeriod('2026-01-15', 'monthly')).toBe('2026-02-15');
      expect(addBillingPeriod('2026-12-15', 'monthly')).toBe('2027-01-15');
    });

    it('adds yearly periods correctly', () => {
      expect(addBillingPeriod('2026-09-03', 'yearly')).toBe('2027-09-03');
    });
  });

  describe('formatRelativeDay', () => {
    it('calculates Today, Tomorrow, and day counts', () => {
      const base = new Date(2026, 8, 3);
      expect(formatRelativeDay('2026-09-03', base)).toBe('Today');
      expect(formatRelativeDay('2026-09-04', base)).toBe('Tomorrow');
      expect(formatRelativeDay('2026-09-10', base)).toBe('In 7 days');
      expect(formatRelativeDay('2026-09-02', base)).toBe('Yesterday');
      expect(formatRelativeDay('2026-08-30', base)).toBe('4 days ago');
    });
  });
});
