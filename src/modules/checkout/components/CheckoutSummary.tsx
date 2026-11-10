import Link from 'next/link';
import { formatMoney } from '../../../shared/money';
import { useCart } from '../../cart/cart.state';
import { cartTotals } from '../../cart/cart.logic';

export function CheckoutSummary() {
  const { value: cart } = useCart();
  const { quantity, subtotalCents } = cartTotals(cart);

  return (
    <aside className="cart-summary" aria-labelledby="checkout-summary-heading">
      <h2 id="checkout-summary-heading">Your order</h2>
      <ul className="checkout-items">
        {cart.map(({ product, quantity: count }) => (
          <li key={product.id}>
            <span>
              {product.title} × {count}
            </span>
            <strong>{formatMoney(product.priceCents * count)}</strong>
          </li>
        ))}
      </ul>
      <div className="summary-line">
        <span>Items</span>
        <span>{quantity}</span>
      </div>
      <div className="summary-total" role="status">
        <span>Subtotal</span>
        <strong>{formatMoney(subtotalCents)}</strong>
      </div>
      <p className="small muted">USD. Shipping and taxes are not calculated.</p>
      <Link href="/cart">Edit cart</Link>
    </aside>
  );
}
