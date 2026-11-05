import { Plus } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { cartActions, useCart } from '../cart.state';
import type { Product } from '../../products/products.types';

interface Props {
  product: Product;
  quantity?: number;
}

export function AddToCart({ product, quantity = 1 }: Props) {
  const { value: cart } = useCart();
  const count =
    cart.find((item) => item.product.id === product.id)?.quantity ?? 0;
  const unavailable = product.stock === 0 || count >= product.stock;
  const label =
    product.stock === 0
      ? 'Out of stock'
      : count >= product.stock
        ? 'Stock limit reached'
        : 'Add to cart';

  return (
    <div className="add-to-cart">
      <Button
        variant="primary"
        disabled={unavailable}
        onClick={() => cartActions.add(product, quantity)}
        aria-label={`${label}: ${product.title}`}
      >
        {unavailable ? null : <Plus size={18} aria-hidden="true" />}
        {label}
      </Button>
      <span className="cart-feedback" role="status">
        {count > 0 ? `${String(count)} in your cart` : ''}
      </span>
    </div>
  );
}
