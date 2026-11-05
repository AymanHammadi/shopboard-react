import { useRef } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/components/Button';
import { StateMessage } from '../../../shared/components/StateMessage';
import { usePageTitle } from '../../../shared/usePageTitle';
import { cartActions, useCart } from '../cart.state';
import { cartTotals } from '../cart.logic';
import { CartRow } from '../components/CartRow';
import { CartSummary } from '../components/CartSummary';

export function CartPage() {
  usePageTitle('Your cart');
  const { value: cart } = useCart();
  const totals = cartTotals(cart);
  const heading = useRef<HTMLHeadingElement>(null);

  function remove(productId: number) {
    cartActions.remove(productId);
    heading.current?.focus();
  }

  return (
    <div className="container page-section">
      <p className="eyebrow">The keepers</p>
      <div className="cart-heading">
        <h1 ref={heading} tabIndex={-1}>
          Your cart<span className="heading-count">{totals.quantity}</span>
        </h1>
        <Button
          variant="danger"
          disabled={cart.length === 0}
          onClick={() => {
            if (window.confirm('Remove all items from your cart?')) {
              cartActions.clear();
              heading.current?.focus();
            }
          }}
        >
          Clear cart
        </Button>
      </div>
      {cart.length === 0 ? (
        <StateMessage title="Your cart is empty">
          <ShoppingBag size={36} aria-hidden="true" />
          <p>There’s a good find with your name on it.</p>
          <Link className="button button--primary" to="/">
            Explore products
          </Link>
        </StateMessage>
      ) : (
        <div className="cart-layout">
          <ul className="cart-items">
            {cart.map((item) => (
              <CartRow key={item.product.id} item={item} onRemove={remove} />
            ))}
          </ul>
          <CartSummary
            quantity={totals.quantity}
            subtotalCents={totals.subtotalCents}
          />
        </div>
      )}
    </div>
  );
}
