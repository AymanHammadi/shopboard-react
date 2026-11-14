import type { Metadata } from 'next';
import { ProductPage } from '../../../modules/products/pages/ProductPage';
import { parseProductId } from '../../../modules/products/products.logic';
import { loadProduct } from '../../../modules/products/products.server';

interface Props {
  params: Promise<{ productId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseProductId((await params).productId);
  if (id === null) return { title: 'Product not found' };
  try {
    const product = await loadProduct(id);
    return { title: product?.title ?? 'Product not found' };
  } catch {
    return { title: 'Product' };
  }
}

export default async function Page({ params }: Props) {
  const { productId } = await params;
  return <ProductPage productId={productId} />;
}
