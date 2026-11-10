import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AsyncBoundary } from '../../../shared/components/AsyncBoundary';
import { parseProductId } from '../products.logic';
import { ProductContent } from '../components/ProductContent';
import { MissingProduct } from '../components/MissingProduct';

interface Props {
  productId: string;
}

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
        <AsyncBoundary
          key={id}
          title="Product couldn’t load"
          fallback={
            <>
              <title>Product | ShopBoard</title>
              <div className="detail-loading" role="status">
                <span>Loading product…</span>
                <div className="skeleton-media" aria-hidden="true" />
              </div>
            </>
          }
        >
          <ProductContent id={id} />
        </AsyncBoundary>
      )}
    </div>
  );
}
