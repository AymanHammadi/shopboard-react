import { createContext, use } from 'react';
import { createStoredState } from '../../shared/storage';
import {
  addItem,
  changeQuantity,
  removeItem,
  removePurchasedItems,
} from './cart.logic';
import { cartSchema } from './cart.types';
import type { Product } from '../products/products.types';
import type { Cart } from './cart.types';

export function createCartState() {
  const cart = createStoredState<Cart>('shopboard:cart:v1', cartSchema, []);
  return {
    ...cart,
    actions: {
      add: (product: Product, quantity = 1) => {
        cart.update((current) => addItem(current, product, quantity));
      },
      changeQuantity: (productId: number, quantity: number) => {
        cart.update((current) => changeQuantity(current, productId, quantity));
      },
      remove: (productId: number) => {
        cart.update((current) => removeItem(current, productId));
      },
      clear: () => {
        cart.update(() => []);
      },
      removePurchased: (purchased: Cart) => {
        cart.update((current) => removePurchasedItems(current, purchased));
      },
    },
  };
}

interface CartContextValue {
  readonly value: Cart;
  readonly issue: string | null;
  readonly actions: ReturnType<typeof createCartState>['actions'];
}

export const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const context = use(CartContext);
  if (context === null) throw new Error('useCart must be inside CartProvider.');
  return context;
}
