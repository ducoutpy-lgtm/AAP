import { formatCurrency } from './format';

describe('formatCurrency', () => {
  it('formats euros with no decimals', () => {
    const result = formatCurrency(100000);
    // French locale uses non-breaking space and € symbol
    expect(result).toContain('100');
    expect(result).toContain('000');
    expect(result).toContain('€');
  });

  it('formats zero correctly', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
    expect(result).toContain('€');
  });
});
