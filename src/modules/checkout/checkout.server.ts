import 'server-only';

import { loadProducts } from '../products/products.server';
import { CheckoutConflict, priceOrder } from './checkout.logic';
import { checkoutRequestSchema, orderReceiptSchema } from './checkout.types';

export async function handleCheckout(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: 'The order must be valid JSON.' },
      { status: 400 },
    );
  }
  const parsed = checkoutRequestSchema.safeParse(body);
  if (parsed.success === false) {
    return Response.json(
      {
        message:
          'Check your contact details, shipping address, and cart quantities.',
      },
      { status: 400 },
    );
  }
  try {
    const products = await loadProducts(request.signal);
    const totals = priceOrder(parsed.data.lines, products);
    const receipt = orderReceiptSchema.parse({
      orderId: crypto.randomUUID(),
      fullName: parsed.data.fullName,
      ...totals,
    });
    return Response.json(receipt, {
      status: 201,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof CheckoutConflict
            ? error.message
            : 'Your order could not be confirmed. Please try again.',
      },
      { status: error instanceof CheckoutConflict ? 409 : 502 },
    );
  }
}
