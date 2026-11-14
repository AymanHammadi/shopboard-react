import type { Product } from '../products/products.types';
import type { CheckoutRequest } from './checkout.types';

export class CheckoutConflict extends Error {}

export function priceOrder(
  lines: CheckoutRequest['lines'],
  products: readonly Product[],
) {
  const inventory = new Map(products.map((product) => [product.id, product]));
  let quantity = 0;
  let subtotalCents = 0;
  for (const line of lines) {
    const product = inventory.get(line.productId);
    if (product === undefined)
      throw new CheckoutConflict(
        'A product in your cart is no longer available. Please edit your cart.',
      );
    if (line.quantity > product.stock)
      throw new CheckoutConflict(
        `${product.title} has only ${String(product.stock)} available. Please edit your cart.`,
      );
    quantity += line.quantity;
    subtotalCents += product.priceCents * line.quantity;
  }
  if (Number.isSafeInteger(subtotalCents) === false)
    throw new Error('Order total exceeds supported precision.');
  return { quantity, subtotalCents };
}
