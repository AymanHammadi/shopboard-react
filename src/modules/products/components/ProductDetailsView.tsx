import { useState } from 'react';
import { Star, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { formatMoney } from '../../../shared/money';
import { QuantityControl } from '../../../shared/components/QuantityControl';
import { AddToCart } from '../../cart/components/AddToCart';
import { useCart } from '../../cart/cart.state';
import { categoryNames } from '../products.data';
import { ProductGallery } from './ProductGallery';
import type { ProductDetails } from '../products.types';

interface Props {
  product: ProductDetails;
}

export function ProductDetailsView({ product }: Props) {
  const [requested, setRequested] = useState(1);
  const { value: cart } = useCart();
  const inCart =
    cart.find((item) => item.product.id === product.id)?.quantity ?? 0;
  const remaining = Math.max(0, product.stock - inCart);
  const quantity = Math.min(requested, Math.max(1, remaining));

  return (
    <div className="product-detail">
      <ProductGallery images={product.images} title={product.title} />
      <div className="product-detail-copy">
        <Link
          href={`/?category=${product.category}`}
          className="eyebrow category-link"
        >
          {categoryNames[product.category]}
        </Link>
        {product.brand === undefined ? null : (
          <p className="product-brand">{product.brand}</p>
        )}
        <h1>{product.title}</h1>
        <p className="detail-rating">
          <Star size={18} aria-hidden="true" />
          {product.rating.toFixed(1)} <span className="muted">/ 5</span>
        </p>
        <p className="detail-price">{formatMoney(product.priceCents)}</p>
        <p className="product-description">{product.description}</p>
        <p
          className={
            product.stock === 0 ? 'stock-note stock-note--out' : 'stock-note'
          }
        >
          <span aria-hidden="true" />
          {product.stock === 0
            ? 'Out of stock'
            : product.stock < 10
              ? `Only ${String(product.stock)} left`
              : 'In stock'}
        </p>
        <div className="detail-purchase">
          <QuantityControl
            name={product.title}
            value={quantity}
            max={remaining}
            onChange={setRequested}
          />
          <AddToCart product={product} quantity={quantity} />
        </div>
        <dl className="product-policies">
          <div>
            <dt>
              <Truck size={19} aria-hidden="true" />
              Shipping
            </dt>
            <dd>{product.shippingInformation}</dd>
          </div>
          <div>
            <dt>
              <RotateCcw size={19} aria-hidden="true" />
              Returns
            </dt>
            <dd>{product.returnPolicy}</dd>
          </div>
          <div>
            <dt>
              <ShieldCheck size={19} aria-hidden="true" />
              Warranty
            </dt>
            <dd>{product.warrantyInformation}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
