import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductImage } from '../../../shared/components/ProductImage';
import { formatMoney } from '../../../shared/money';
import { AddToCart } from '../../cart/components/AddToCart';
import { categoryNames } from '../products.data';
import type { Product } from '../products.types';

interface Props {
  product: Product;
  loading?: 'eager' | 'lazy';
}

export function ProductCard({ product, loading = 'lazy' }: Props) {
  return (
    <article className="product-card">
      <Link
        to={`/products/${String(product.id)}`}
        className="product-image-link"
        aria-label={`View ${product.title}`}
        tabIndex={-1}
      >
        <ProductImage
          src={product.thumbnail}
          alt={product.title}
          loading={loading}
        />
      </Link>
      <div className="product-card-body">
        <div className="product-meta">
          <span>{categoryNames[product.category]}</span>
          <span className="rating">
            <Star size={14} aria-hidden="true" />
            {product.rating.toFixed(1)}
            <span className="sr-only"> out of 5 stars</span>
          </span>
        </div>
        <h3>
          <Link to={`/products/${String(product.id)}`}>{product.title}</Link>
        </h3>
        <p className="product-price">{formatMoney(product.priceCents)}</p>
        <AddToCart product={product} />
      </div>
    </article>
  );
}
