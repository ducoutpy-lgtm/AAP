import { formatCurrency, formatDate, formatRelativeDate } from './format';

describe('formatCurrency', () => {
  it('formats euros with no decimals', () => {
    const result = formatCurrency(100000);
    expect(result).toContain('100');
    expect(result).toContain('000');
    expect(result).toContain('€');
  });

  it('formats zero correctly', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
    expect(result).toContain('€');
  });

  it('formats small amounts', () => {
    const result = formatCurrency(50);
    expect(result).toContain('50');
    expect(result).toContain('€');
  });

  it('formats negative amounts', () => {
    const result = formatCurrency(-1000);
    expect(result).toContain('1');
    expect(result).toContain('000');
  });
});

describe('formatDate', () => {
  it('formats a date in French locale (dd MMMM yyyy)', () => {
    const date = new Date(2025, 0, 15); // January 15, 2025
    const result = formatDate(date);
    expect(result).toBe('15 janvier 2025');
  });

  it('formats a date in December', () => {
    const date = new Date(2025, 11, 31); // December 31, 2025
    const result = formatDate(date);
    expect(result).toBe('31 décembre 2025');
  });

  it('formats a date with single-digit day', () => {
    const date = new Date(2025, 2, 5); // March 5, 2025
    const result = formatDate(date);
    expect(result).toBe('05 mars 2025');
  });
});

describe('formatRelativeDate', () => {
  it('returns a string containing "il y a" for past dates', () => {
    const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    const result = formatRelativeDate(pastDate);
    expect(result).toContain('il y a');
  });

  it('returns a string containing "dans" for future dates', () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const result = formatRelativeDate(futureDate);
    expect(result).toContain('dans');
  });
});
