import type { Metadata } from 'next';
import { NotFoundPage } from '../shared/components/NotFoundPage';

export const metadata: Metadata = { title: 'Page not found | ShopBoard' };

export default function NotFound() {
  return <NotFoundPage />;
}
