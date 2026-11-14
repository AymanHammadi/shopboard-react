'use client';

import { useEffect } from 'react';
import { useProduct } from '../products.state';
import { MissingProduct } from './MissingProduct';
import { ProductDetailsView } from './ProductDetailsView';

interface Props {
  id: number;
}

export function ProductContent({ id }: Props) {
  const { data } = useProduct(id);
  const title = data?.title ?? 'Product not found';
  useEffect(() => {
    document.title = `${title} | ShopBoard`;
  }, [title]);
  return data === null ? (
    <MissingProduct />
  ) : (
    <ProductDetailsView key={data.id} product={data} />
  );
}
