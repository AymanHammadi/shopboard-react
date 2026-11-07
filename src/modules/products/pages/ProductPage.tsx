import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { AsyncBoundary } from '../../../shared/components/AsyncBoundary';
import { parseProductId } from '../products.logic';
import { ProductContent } from '../components/ProductContent';
import { MissingProduct } from '../components/MissingProduct';

export function ProductPage() {
  const { productId } = useParams();
  const id = parseProductId(productId);

  return (
    <div className="container page-section">
      <Link to="/" className="back-link">
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
            <div className="detail-loading" role="status">
              <span>Loading product…</span>
              <div className="skeleton-media" aria-hidden="true" />
            </div>
          }
        >
          <ProductContent id={id} />
        </AsyncBoundary>
      )}
    </div>
  );
}
