import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, requestErrorMessage } from '../../../shared/api/client';
import { Button } from '../../../shared/components/Button';
import { StateMessage } from '../../../shared/components/StateMessage';
import { usePageTitle } from '../../../shared/usePageTitle';
import { parseProductId } from '../products.logic';
import { useProduct } from '../products.state';
import { ProductDetailsView } from '../components/ProductDetailsView';

export function ProductPage() {
  const { productId } = useParams();
  const id = parseProductId(productId);
  const product = useProduct(id);
  usePageTitle(product.data?.title ?? 'Product');
  const missing =
    id === null ||
    (product.error instanceof ApiError && product.error.status === 404);

  return (
    <div className="container page-section">
      <Link to="/" className="back-link">
        <ArrowLeft size={17} aria-hidden="true" />
        Back to the shop
      </Link>
      {missing ? (
        <StateMessage title="Product not found">
          <p>This product is no longer on the shelf.</p>
          <Link to="/" className="button button--primary">
            Explore products
          </Link>
        </StateMessage>
      ) : product.isPending ? (
        <div className="detail-loading" role="status">
          <span>Loading product…</span>
          <div className="skeleton-media" aria-hidden="true" />
        </div>
      ) : product.isError ? (
        <StateMessage title="Product couldn’t load" role="alert">
          <p>{requestErrorMessage(product.error)}</p>
          <Button
            onClick={() => {
              void product.refetch();
            }}
          >
            Try again
          </Button>
        </StateMessage>
      ) : (
        <ProductDetailsView key={product.data.id} product={product.data} />
      )}
    </div>
  );
}
