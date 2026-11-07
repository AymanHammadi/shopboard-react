import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StateMessage } from '../../../shared/components/StateMessage';
import { usePageTitle } from '../../../shared/usePageTitle';
import { useCart } from '../../cart/cart.state';
import { cartTotals } from '../../cart/cart.logic';
import { CheckoutForm } from '../components/CheckoutForm';
import { CheckoutSummary } from '../components/CheckoutSummary';
import { OrderConfirmation } from '../components/OrderConfirmation';
import type { CheckoutValues, OrderReceipt } from '../checkout.types';

export function CheckoutPage() {
  const { value: cart, actions } = useCart();
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);
  usePageTitle(receipt === null ? 'Checkout' : 'Order confirmed');

  function complete(values: CheckoutValues) {
    if (cart.length === 0 || receipt !== null) return;
    setReceipt({ fullName: values.fullName, ...cartTotals(cart) });
    actions.clear();
  }

  return (
    <div className="container page-section">
      {receipt !== null ? (
        <OrderConfirmation receipt={receipt} />
      ) : cart.length === 0 ? (
        <>
          <h1 className="checkout-heading">Checkout</h1>
          <StateMessage title="Your cart is empty">
            <p>Add something to your cart before checking out.</p>
            <Link to="/" className="button button--primary">
              Explore products
            </Link>
          </StateMessage>
        </>
      ) : (
        <>
          <p className="eyebrow">One last step</p>
          <h1 className="checkout-heading">Checkout</h1>
          <div className="cart-layout">
            <CheckoutForm onComplete={complete} />
            <CheckoutSummary />
          </div>
        </>
      )}
    </div>
  );
}
