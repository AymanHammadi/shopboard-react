import { ArrowDownRight } from 'lucide-react';

export function CatalogHero() {
  return (
    <section className="catalog-hero" aria-labelledby="catalog-heading">
      <div>
        <p className="eyebrow">The everyday edit</p>
        <h1 id="catalog-heading">
          Good finds.
          <br />
          Great everyday.
        </h1>
      </div>
      <div className="hero-aside">
        <p>
          From little essentials to your next big favorite. Find what fits your
          day.
        </p>
        <a href="#catalog" className="hero-link">
          Find your thing <ArrowDownRight size={20} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
