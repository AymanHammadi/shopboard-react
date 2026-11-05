const placeholders = [
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
];

export function CatalogSkeleton() {
  return (
    <div role="status" aria-label="Loading products">
      <span className="sr-only">Loading products…</span>
      <div className="product-grid" aria-hidden="true">
        {placeholders.map((id) => (
          <div key={id} className="product-card skeleton-card">
            <div className="skeleton-media" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
            <div className="skeleton-button" />
          </div>
        ))}
      </div>
    </div>
  );
}
