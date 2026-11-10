'use client';

import { useProduct } from '../products.state';
import { MissingProduct } from './MissingProduct';
import { ProductDetailsView } from './ProductDetailsView';

interface Props {
  id: number;
}

export function ProductContent({ id }: Props) {
  const { data } = useProduct(id);
  return data === null ? (
    <MissingProduct />
  ) : (
    <>
      <title>{`${data.title} | ShopBoard`}</title>
      <ProductDetailsView key={data.id} product={data} />
    </>
  );
}
