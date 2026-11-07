import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { ProductImage } from '../../../shared/components/ProductImage';
import { QuantityControl } from '../../../shared/components/QuantityControl';
import { Button } from '../../../shared/components/Button';
import { formatMoney } from '../../../shared/money';
import { categoryNames } from '../../products/products.data';
import { useCart } from '../cart.state';
import type { CartItem } from '../cart.types';

interface Props {
  item: CartItem;
  onRemove: (productId: number) => void;
}

export function CartRow({ item, onRemove }: Props) {
  const { actions } = useCart();
  const { product, quantity } = item;
  return (
    <li className="cart-row">
      <ProductImage src={product.thumbnail} alt={product.title} />
      <div className="cart-row-copy">
        <span className="muted small">{categoryNames[product.category]}</span>
        <h2>
          <Link to={`/products/${String(product.id)}`}>{product.title}</Link>
        </h2>
        <p>
          {formatMoney(product.priceCents)}{' '}
          <span className="muted small">each</span>
        </p>
        <div className="cart-row-actions">
          <QuantityControl
            name={product.title}
            value={quantity}
            max={product.stock}
            onChange={(next) => actions.changeQuantity(product.id, next)}
          />
          <Button
            variant="ghost"
            className="remove-button"
            aria-label={`Remove ${product.title}`}
            onClick={() => onRemove(product.id)}
          >
            <Trash2 size={16} aria-hidden="true" />
            Remove
          </Button>
        </div>
      </div>
      <p className="line-total" aria-label={`Line total for ${product.title}`}>
        {formatMoney(product.priceCents * quantity)}
      </p>
    </li>
  );
}
