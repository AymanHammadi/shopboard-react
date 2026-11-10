import Link from 'next/link';
import { StateMessage } from '../../../shared/components/StateMessage';

export function MissingProduct() {
  return (
    <StateMessage title="Product not found">
      <title>Product not found | ShopBoard</title>
      <p>This product is no longer on the shelf.</p>
      <Link href="/" className="button button--primary">
        Explore products
      </Link>
    </StateMessage>
  );
}
