import type { Metadata } from 'next';
import { CatalogPage } from '../modules/products/pages/CatalogPage';

export const metadata: Metadata = {
  title: { absolute: 'Everyday, upgraded. | ShopBoard' },
};

export default function Page() {
  return <CatalogPage />;
}
