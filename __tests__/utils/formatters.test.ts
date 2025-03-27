import { formatCurrency } from '../../app/utils/formatters';

describe('formatCurrency', () => {
  const normalize = (str: string) => str.trim().replace(/\s+/g, ' ');

  it('formats EUR correctly with positive numbers', () => {
    expect(normalize(formatCurrency(1234.56, 'EUR'))).toBe(
      normalize('1.234,56 €'),
    );
    expect(normalize(formatCurrency(0.99, 'EUR'))).toBe(normalize('0,99 €'));
    expect(normalize(formatCurrency(1000000, 'EUR'))).toBe(
      normalize('1.000.000,00 €'),
    );
  });

  it('formats EUR correctly with negative numbers', () => {
    expect(normalize(formatCurrency(-1234.56, 'EUR'))).toBe(
      normalize('-1.234,56 €'),
    );
    expect(normalize(formatCurrency(-0.99, 'EUR'))).toBe(normalize('-0,99 €'));
  });

  it('formats EUR correctly with zero', () => {
    expect(normalize(formatCurrency(0, 'EUR'))).toBe(normalize('0,00 €'));
  });

  it('formats EUR correctly with decimal places', () => {
    expect(normalize(formatCurrency(1234.5678, 'EUR'))).toBe(
      normalize('1.234,57 €'),
    ); // Should round to 2 decimal places
    expect(normalize(formatCurrency(1234.5, 'EUR'))).toBe(
      normalize('1.234,50 €'),
    ); // Should show 2 decimal places
  });

  it('formats other currencies correctly', () => {
    expect(normalize(formatCurrency(1234.56, 'USD'))).toBe(
      normalize('1.234,56 $'),
    );
    expect(normalize(formatCurrency(1234.56, 'GBP'))).toBe(
      normalize('1.234,56 £'),
    );
  });
});
