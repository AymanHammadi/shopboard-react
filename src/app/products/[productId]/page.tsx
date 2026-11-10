import type { Metadata } from 'next';
import { ProductPage } from '../../../modules/products/pages/ProductPage';

// Product state owns the title; streamed metadata must not overwrite it.
export const metadata: Metadata = { title: null };

interface Props {
  params: Promise<{ productId: string }>;
}

export default async function Page({ params }: Props) {
  const { productId } = await params;
  return <ProductPage productId={productId} />;
}
