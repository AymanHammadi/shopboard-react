import { useSearchParams } from 'react-router-dom';
import { Button } from '../../../shared/components/Button';
import { StateMessage } from '../../../shared/components/StateMessage';
import { CatalogControls } from './CatalogControls';
import { ProductGrid } from './ProductGrid';
import { Pagination } from './Pagination';
import { availableCategories, selectProducts } from '../products.logic';
import { pageSize } from '../products.data';
import { categorySchema, sortSchema } from '../products.types';
import { useProducts } from '../products.state';
import type { ProductFilters } from '../products.types';

export function CatalogResults() {
  const [params, setParams] = useSearchParams();
  const products = useProducts();
  const category = categorySchema.safeParse(params.get('category'));
  const sort = sortSchema.safeParse(params.get('sort'));
  const filters: ProductFilters = {
    search: params.get('search') ?? '',
    category: category.success ? category.data : 'all',
    sort: sort.success ? sort.data : 'default',
  };
  const catalog = products.data;
  const matching = selectProducts(catalog, filters);
  const pages = Math.max(1, Math.ceil(matching.length / pageSize));
  const requestedPage = Number(params.get('page') ?? 1);
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, pages)
      : 1;

  function changeFilters(changes: Partial<ProductFilters>) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        for (const [key, value] of Object.entries(changes)) {
          if (value === '' || value === 'all' || value === 'default')
            next.delete(key);
          else next.set(key, value);
        }
        next.delete('page');
        return next;
      },
      { replace: true },
    );
  }

  return (
    <>
      <CatalogControls
        filters={filters}
        categories={availableCategories(catalog)}
        onChange={changeFilters}
        onReset={() => setParams({})}
      />
      {catalog.length === 0 ? (
        <StateMessage title="No products available">
          <p>Our shelves are empty right now. Check back soon.</p>
          <Button
            onClick={() => {
              void products.refetch();
            }}
          >
            Try again
          </Button>
        </StateMessage>
      ) : matching.length === 0 ? (
        <StateMessage title="No products match.">
          <p>Try a different search or category.</p>
          <Button onClick={() => setParams({})}>Reset filters</Button>
        </StateMessage>
      ) : (
        <>
          <p className="results-count" role="status">
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, matching.length)} of {matching.length}{' '}
            products
          </p>
          <ProductGrid
            products={matching.slice((page - 1) * pageSize, page * pageSize)}
          />
          <Pagination
            page={page}
            pages={pages}
            onChange={(nextPage) => {
              setParams((current) => {
                const next = new URLSearchParams(current);
                next.set('page', String(nextPage));
                return next;
              });
              document
                .getElementById('products-heading')
                ?.scrollIntoView({ block: 'start' });
            }}
          />
        </>
      )}
    </>
  );
}
