import { usePageTitle } from '../../../shared/usePageTitle';
import { useProduct } from '../products.state';
import { MissingProduct } from './MissingProduct';
import { ProductDetailsView } from './ProductDetailsView';

interface Props {
  id: number;
}

export function ProductContent({ id }: Props) {
  const { data } = useProduct(id);
  usePageTitle(data?.title ?? 'Product not found');
  return data === null ? (
    <MissingProduct />
  ) : (
    <ProductDetailsView key={data.id} product={data} />
  );
}
