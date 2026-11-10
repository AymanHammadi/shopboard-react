import type { Metadata } from 'next';
import { CheckoutPage } from '../../modules/checkout/pages/CheckoutPage';

// Checkout state owns the title, including the local order confirmation.
export const metadata: Metadata = { title: null };

export default function Page() {
  return <CheckoutPage />;
}
