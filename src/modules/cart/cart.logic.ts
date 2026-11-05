import type { Product } from '../products/products.types';
import type { Cart } from './cart.types';

export function addItem(cart: Cart, product: Product, quantity = 1): Cart {
  if (
    Number.isSafeInteger(quantity) === false ||
    quantity < 1 ||
    product.stock < 1
  )
    return cart;
  const existing = cart.find((item) => item.product.id === product.id);
  if (existing === undefined) {
    return [...cart, { product, quantity: Math.min(quantity, product.stock) }];
  }
  return cart.map((item) =>
    item.product.id === product.id
      ? { product, quantity: Math.min(item.quantity + quantity, product.stock) }
      : item,
  );
}

export function changeQuantity(
  cart: Cart,
  productId: number,
  quantity: number,
): Cart {
  if (Number.isSafeInteger(quantity) === false || quantity < 1) return cart;
  return cart.map((item) =>
    item.product.id === productId
      ? { ...item, quantity: Math.min(quantity, item.product.stock) }
      : item,
  );
}

export function removeItem(cart: Cart, productId: number): Cart {
  return cart.filter((item) => item.product.id !== productId);
}

export function cartTotals(cart: Cart) {
  return cart.reduce(
    (totals, item) => ({
      quantity: totals.quantity + item.quantity,
      subtotalCents:
        totals.subtotalCents + item.product.priceCents * item.quantity,
    }),
    { quantity: 0, subtotalCents: 0 },
  );
}
