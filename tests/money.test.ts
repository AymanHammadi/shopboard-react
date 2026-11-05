import { expect, it } from 'vitest';
import { formatMoney, toCents } from '../src/shared/money';

it('converts API dollars to integer cents and formats USD', () => {
  expect(toCents(9.99)).toBe(999);
  expect(toCents(0.29)).toBe(29);
  expect(formatMoney(28995)).toBe('$289.95');
  expect(formatMoney(0)).toBe('$0.00');
});
