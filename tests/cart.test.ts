import { describe, expect, it } from 'vitest';
import {
  addItem,
  cartTotals,
  changeQuantity,
  removeItem,
} from '../src/modules/cart/cart.logic';
import { cartSchema } from '../src/modules/cart/cart.types';
import { chair, mascara, perfume } from './fixtures';

describe('cart rules', () => {
  it('adds and merges a product using new array and item references', () => {
    const original = addItem([], mascara);
    const next = addItem(original, mascara);
    expect(original).toEqual([{ product: mascara, quantity: 1 }]);
    expect(next).toEqual([{ product: mascara, quantity: 2 }]);
    expect(next).not.toBe(original);
    expect(next[0]).not.toBe(original[0]);
  });
  it('updates a quantity immutably', () => {
    const original = addItem([], mascara);
    const next = changeQuantity(original, mascara.id, 3);
    expect(original[0]?.quantity).toBe(1);
    expect(next[0]?.quantity).toBe(3);
  });
  it('caps additions and quantity changes at stock', () => {
    expect(addItem([], mascara, 100)[0]?.quantity).toBe(4);
    expect(changeQuantity(addItem([], mascara), 1, 100)[0]?.quantity).toBe(4);
  });
  it('does not add sold-out products', () => {
    expect(addItem([], perfume)).toEqual([]);
  });
  it.each([0, -1, 1.5, NaN, Infinity])(
    'ignores invalid quantity %s',
    (quantity) => {
      const cart = addItem([], mascara);
      expect(addItem(cart, chair, quantity)).toBe(cart);
      expect(changeQuantity(cart, 1, quantity)).toBe(cart);
    },
  );
  it('removes by product ID without changing other rows', () => {
    const cart = addItem(addItem([], mascara), chair);
    expect(removeItem(cart, 1)).toEqual([{ product: chair, quantity: 1 }]);
    expect(cart).toHaveLength(2);
  });
  it('totals quantities and integer cents', () => {
    const cart = addItem(addItem([], mascara, 3), chair, 2);
    expect(cartTotals(cart)).toEqual({ quantity: 5, subtotalCents: 28995 });
    expect(cartTotals([])).toEqual({ quantity: 0, subtotalCents: 0 });
  });
  it('validates restored carts, stock bounds and duplicate IDs', () => {
    const item = { product: mascara, quantity: 1 };
    expect(cartSchema.safeParse([item]).success).toBe(true);
    expect(cartSchema.safeParse([item, item]).success).toBe(false);
    expect(cartSchema.safeParse([{ ...item, quantity: 5 }]).success).toBe(
      false,
    );
    expect(cartSchema.safeParse([{ ...item, quantity: -1 }]).success).toBe(
      false,
    );
  });
});
