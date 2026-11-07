import { useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { CartContext, createCartState } from '../cart.state';

interface Props {
  children: ReactNode;
}

export function CartProvider({ children }: Props) {
  const [cart] = useState(createCartState);
  const snapshot = useSyncExternalStore(cart.subscribe, cart.getSnapshot);

  return (
    <CartContext value={{ ...snapshot, actions: cart.actions }}>
      {children}
    </CartContext>
  );
}
