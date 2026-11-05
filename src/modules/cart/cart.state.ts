import { useSyncExternalStore } from 'react';
import { createStoredState } from '../../shared/storage';
import { addItem, changeQuantity, removeItem } from './cart.logic';
import { cartSchema } from './cart.types';
import type { Product } from '../products/products.types';
import type { Cart } from './cart.types';

const cart = createStoredState<Cart>('shopboard:cart:v1', cartSchema, []);

export function useCart() {
  return useSyncExternalStore(cart.subscribe, cart.getSnapshot);
}

export const cartActions = {
  add(product: Product, quantity = 1) {
    cart.update((current) => addItem(current, product, quantity));
  },
  changeQuantity(productId: number, quantity: number) {
    cart.update((current) => changeQuantity(current, productId, quantity));
  },
  remove(productId: number) {
    cart.update((current) => removeItem(current, productId));
  },
  clear() {
    cart.update(() => []);
  },
};
