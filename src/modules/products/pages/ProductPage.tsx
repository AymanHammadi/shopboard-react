import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { QueryHydration } from '../../../shared/components/QueryHydration';
import { loadProduct } from '../products.server';
import { parseProductId } from '../products.logic';
import { ProductContent } from '../components/ProductContent';
import { MissingProduct } from '../components/MissingProduct';

interface Props {
  productId: string;
}

const productLoading = (
  <>
    <title>Product | ShopBoard</title>
    <div className="detail-loading" role="status">
      <span>Loading product…</span>
      <div className="skeleton-media" aria-hidden="true" />
    </div>
  </>
);

export function ProductPage({ productId }: Props) {
  const id = parseProductId(productId);

  return (
    <div className="container page-section">
      <Link href="/" className="back-link">
        <ArrowLeft size={17} aria-hidden="true" />
        Back to the shop
      </Link>
      {id === null ? (
        <MissingProduct />
      ) : (
        <Suspense key={id} fallback={productLoading}>
          <QueryHydration
            queryKey={['product', id]}
            load={(signal) => loadProduct(id, signal)}
            title="Product couldn’t load"
            fallback={productLoading}
          >
            <ProductContent id={id} />
          </QueryHydration>
        </Suspense>
      )}
    </div>
  );
}
