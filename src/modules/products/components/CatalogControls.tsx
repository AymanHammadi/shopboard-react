import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { categoryNames, sortNames } from '../products.data';
import { categorySchema, sortSchema } from '../products.types';
import type { Category, ProductFilters } from '../products.types';

interface Props {
  filters: ProductFilters;
  categories: readonly Category[];
  onChange: (changes: Partial<ProductFilters>) => void;
  onReset: () => void;
}

export function CatalogControls({
  filters,
  categories,
  onChange,
  onReset,
}: Props) {
  const changed =
    filters.search !== '' ||
    filters.category !== 'all' ||
    filters.sort !== 'default';
  return (
    <form
      className="catalog-controls"
      role="search"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="field search-field">
        <label htmlFor="product-search">Search products</label>
        <div className="input-wrap">
          <Search size={19} aria-hidden="true" />
          <input
            id="product-search"
            type="search"
            placeholder="What are you looking for?"
            autoComplete="off"
            spellCheck={false}
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={filters.category}
          onChange={(event) => {
            const parsed = categorySchema.safeParse(event.target.value);
            onChange({ category: parsed.success ? parsed.data : 'all' });
          }}
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {categoryNames[category]}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="sort">Sort by</label>
        <select
          id="sort"
          value={filters.sort}
          onChange={(event) => {
            const parsed = sortSchema.safeParse(event.target.value);
            if (parsed.success) onChange({ sort: parsed.data });
          }}
        >
          {sortSchema.options.map((sort) => (
            <option key={sort} value={sort}>
              {sortNames[sort]}
            </option>
          ))}
        </select>
      </div>
      <Button variant="ghost" disabled={changed === false} onClick={onReset}>
        <SlidersHorizontal size={17} aria-hidden="true" />
        Reset
      </Button>
    </form>
  );
}
