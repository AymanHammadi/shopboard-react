import { ProductCard } from './ProductCard';
import type { Product } from '../products.types';

interface Props {
  products: readonly Product[];
}

export function ProductGrid({ products }: Props) {
  const eagerIds = new Set(products.slice(0, 4).map((product) => product.id));
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          loading={eagerIds.has(product.id) ? 'eager' : 'lazy'}
        />
      ))}
    </div>
  );
}
