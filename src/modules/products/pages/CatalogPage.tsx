import { Suspense } from 'react';
import { QueryHydration } from '../../../shared/components/QueryHydration';
import { loadProducts } from '../products.server';
import { CatalogHero } from '../components/CatalogHero';
import { CatalogResults } from '../components/CatalogResults';
import { CatalogSkeleton } from '../components/CatalogSkeleton';

export function CatalogPage() {
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
        <Suspense fallback={<CatalogSkeleton />}>
          <QueryHydration
            queryKey={['products']}
            load={loadProducts}
            title="Products couldn’t load"
            fallback={<CatalogSkeleton />}
          >
            <CatalogResults />
          </QueryHydration>
        </Suspense>
      </section>
    </div>
  );
}
