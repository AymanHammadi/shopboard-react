import type { Metadata } from 'next';
import { CartPage } from '../../modules/cart/pages/CartPage';

export const metadata: Metadata = { title: 'Your cart' };

export default function Page() {
  return <CartPage />;
}
