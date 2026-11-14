import { ApiError, postJson } from '../../shared/api/client';
import {
  checkoutErrorSchema,
  checkoutRequestSchema,
  orderReceiptSchema,
} from './checkout.types';
import type { CheckoutRequest } from './checkout.types';

export async function placeOrder(request: CheckoutRequest) {
  try {
    return orderReceiptSchema.parse(
      await postJson('/api/checkout', checkoutRequestSchema.parse(request)),
    );
  } catch (error) {
    if (error instanceof ApiError) {
      const parsed = checkoutErrorSchema.safeParse(error.body);
      if (parsed.success) throw new Error(parsed.data.message);
    }
    throw new Error('Your order could not be confirmed. Please try again.');
  }
}
