import { useSearchParams } from 'react-router-dom';
import { usePageTitle } from '../../../shared/usePageTitle';
import { Button } from '../../../shared/components/Button';
import { StateMessage } from '../../../shared/components/StateMessage';
import { requestErrorMessage } from '../../../shared/api/client';
import { CatalogHero } from '../components/CatalogHero';
import { CatalogControls } from '../components/CatalogControls';
import { CatalogSkeleton } from '../components/CatalogSkeleton';
import { ProductGrid } from '../components/ProductGrid';
import { Pagination } from '../components/Pagination';
import { availableCategories, selectProducts } from '../products.logic';
import { pageSize } from '../products.data';
import { categorySchema, sortSchema } from '../products.types';
import { useProducts } from '../products.state';
import type { ProductFilters } from '../products.types';

export function CatalogPage() {
  usePageTitle('Everyday, upgraded.');
  const [params, setParams] = useSearchParams();
  const products = useProducts();
  const category = categorySchema.safeParse(params.get('category'));
  const sort = sortSchema.safeParse(params.get('sort'));
  const filters: ProductFilters = {
    search: params.get('search') ?? '',
    category: category.success ? category.data : 'all',
    sort: sort.success ? sort.data : 'default',
  };
  const catalog = products.data ?? [];
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
    <div className="container">
      <CatalogHero />
      <section
        id="catalog"
        className="catalog-section"
        aria-labelledby="products-heading"
      >
        <div className="section-heading">
          <h2 id="products-heading">The good stuff</h2>
          <span className="eyebrow">Explore the collection</span>
        </div>
        <CatalogControls
          filters={filters}
          categories={availableCategories(catalog)}
          onChange={changeFilters}
          onReset={() => setParams({})}
        />
        {products.isPending ? (
          <CatalogSkeleton />
        ) : products.isError ? (
          <StateMessage title="Products couldn’t load" role="alert">
            <p>{requestErrorMessage(products.error)}</p>
            <Button
              onClick={() => {
                void products.refetch();
              }}
            >
              Try again
            </Button>
          </StateMessage>
        ) : catalog.length === 0 ? (
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
      </section>
    </div>
  );
}
