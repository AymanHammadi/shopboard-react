import { Link } from 'react-router-dom';
import { StateMessage } from '../../../shared/components/StateMessage';
import { usePageTitle } from '../../../shared/usePageTitle';

export function MissingProduct() {
  usePageTitle('Product not found');
  return (
    <StateMessage title="Product not found">
      <p>This product is no longer on the shelf.</p>
      <Link to="/" className="button button--primary">
        Explore products
      </Link>
    </StateMessage>
  );
}
