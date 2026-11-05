import { describe, expect, it } from 'vitest';
import {
  availableCategories,
  parseProductId,
  selectProducts,
} from '../src/modules/products/products.logic';
import { categorySchema } from '../src/modules/products/products.types';
import type { ProductSort } from '../src/modules/products/products.types';
import { products } from './fixtures';

describe('product rules', () => {
  it('combines trimmed, case-insensitive search with a category', () => {
    expect(
      selectProducts(products, {
        search: '  EVERYDAY ',
        category: 'beauty',
        sort: 'default',
      }).map((item) => item.id),
    ).toEqual([1]);
  });
  it('returns no matches rather than all products', () => {
    expect(
      selectProducts(products, {
        search: 'missing',
        category: 'all',
        sort: 'default',
      }),
    ).toEqual([]);
  });
  it('sorts ascending without mutating the original order', () => {
    const original = products.map((item) => item.id);
    expect(
      selectProducts(products, {
        search: '',
        category: 'all',
        sort: 'price-asc',
      }).map((item) => item.id),
    ).toEqual([3, 1, 2]);
    expect(products.map((item) => item.id)).toEqual(original);
    expect(
      selectProducts(products, {
        search: '',
        category: 'all',
        sort: 'default',
      }).map((item) => item.id),
    ).toEqual(original);
  });
  it.each<{ sort: ProductSort; expected: number[] }>([
    { sort: 'price-desc', expected: [2, 1, 3] },
    { sort: 'rating', expected: [2, 1, 3] },
    { sort: 'name', expected: [1, 3, 2] },
  ])('sorts by $sort', ({ sort, expected }) => {
    expect(
      selectProducts(products, { search: '', category: 'all', sort }).map(
        (item) => item.id,
      ),
    ).toEqual(expected);
  });
  it('deduplicates and alphabetizes actual categories', () => {
    expect(availableCategories([...products, ...products])).toEqual([
      'beauty',
      'fragrances',
      'furniture',
    ]);
  });
  it('rejects categories outside the union', () => {
    expect(categorySchema.safeParse('Bags').success).toBe(false);
    expect(categorySchema.safeParse('womens-bags').success).toBe(true);
  });
  it.each([undefined, 'abc', '-1', '0', '1.5', '1e2', '9007199254740992'])(
    'rejects invalid product ID %s',
    (id) => {
      expect(parseProductId(id)).toBeNull();
    },
  );
  it('accepts a positive integer product ID', () => {
    expect(parseProductId('42')).toBe(42);
  });
});
