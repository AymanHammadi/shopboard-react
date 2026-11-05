import { categoryNames } from './products.data';
import type { Category, Product, ProductFilters } from './products.types';

export function selectProducts(
  products: readonly Product[],
  filters: ProductFilters,
): readonly Product[] {
  const search = filters.search.trim().toLocaleLowerCase('en-US');
  const matching = products.filter((product) => {
    const categoryMatches =
      filters.category === 'all' || product.category === filters.category;
    const text = `${product.title} ${product.description} ${categoryNames[product.category]}`;
    return categoryMatches && text.toLocaleLowerCase('en-US').includes(search);
  });

  switch (filters.sort) {
    case 'price-asc':
      return matching.toSorted((a, b) => a.priceCents - b.priceCents);
    case 'price-desc':
      return matching.toSorted((a, b) => b.priceCents - a.priceCents);
    case 'rating':
      return matching.toSorted((a, b) => b.rating - a.rating);
    case 'name':
      return matching.toSorted((a, b) => a.title.localeCompare(b.title, 'en'));
    case 'default':
      return matching;
  }
}

export function availableCategories(
  products: readonly Product[],
): readonly Category[] {
  return [...new Set(products.map((product) => product.category))].toSorted(
    (a, b) => categoryNames[a].localeCompare(categoryNames[b], 'en'),
  );
}

export function parseProductId(value: string | undefined): number | null {
  if (value === undefined || /^\d+$/.test(value) === false) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
