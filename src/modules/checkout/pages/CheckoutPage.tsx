'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StateMessage } from '../../../shared/components/StateMessage';
import { useCart } from '../../cart/cart.state';
import { cartTotals } from '../../cart/cart.logic';
import { CheckoutForm } from '../components/CheckoutForm';
import { CheckoutSummary } from '../components/CheckoutSummary';
import { OrderConfirmation } from '../components/OrderConfirmation';
import type { CheckoutValues, OrderReceipt } from '../checkout.types';

export function CheckoutPage() {
  const { value: cart, actions } = useCart();
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);

  function complete(values: CheckoutValues) {
    if (cart.length === 0 || receipt !== null) return;
    setReceipt({ fullName: values.fullName, ...cartTotals(cart) });
    actions.clear();
  }

  return (
    <div className="container page-section">
      <title>{`${receipt === null ? 'Checkout' : 'Order confirmed'} | ShopBoard`}</title>
      {receipt !== null ? (
        <OrderConfirmation receipt={receipt} />
      ) : cart.length === 0 ? (
        <>
          <h1 className="checkout-heading">Checkout</h1>
          <StateMessage title="Your cart is empty">
            <p>Add something to your cart before checking out.</p>
            <Link href="/" className="button button--primary">
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
