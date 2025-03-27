import { formatCurrency } from '../../app/utils/formatters';

describe('formatCurrency', () => {
  const normalize = (str: string) => str.trim().replace(/\s+/g, ' ');

  it('formats EUR correctly with positive numbers', () => {
    expect(normalize(formatCurrency(1234.56, 'EUR'))).toBe(
      normalize('1234,56 EUR'),
    );
    expect(normalize(formatCurrency(0.99, 'EUR'))).toBe(normalize('0,99 EUR'));
    expect(normalize(formatCurrency(1000000, 'EUR'))).toBe(
      normalize('1000000 EUR'),
    );
  });

  it('formats EUR correctly with negative numbers', () => {
    expect(normalize(formatCurrency(-1234.56, 'EUR'))).toBe(
      normalize('-1234,56 EUR'),
    );
    expect(normalize(formatCurrency(-0.99, 'EUR'))).toBe(
      normalize('-0,99 EUR'),
    );
  });

  it('formats EUR correctly with zero', () => {
    expect(normalize(formatCurrency(0, 'EUR'))).toBe(normalize('0 EUR'));
  });

  it('formats EUR correctly with decimal places', () => {
    expect(normalize(formatCurrency(1234.5678, 'EUR'))).toBe(
      normalize('1234,57 EUR'),
    ); // Should round to 2 decimal places
    expect(normalize(formatCurrency(1234.5, 'EUR'))).toBe(
      normalize('1234,5 EUR'),
    ); // Doesn't enforce 2 decimal places
  });

  it('formats other currencies correctly', () => {
    expect(normalize(formatCurrency(1234.56, 'USD'))).toBe(
      normalize('1234,56 USD'),
    );
    expect(normalize(formatCurrency(1234.56, 'GBP'))).toBe(
      normalize('1234,56 GBP'),
    );
  });

  it('formats BTC correctly', () => {
    expect(normalize(formatCurrency(1.23456789, 'BTC'))).toBe(
      normalize('1,23456789 BTC'),
    );
  });
});
