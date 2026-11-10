import Link from 'next/link';
import { StateMessage } from './StateMessage';

export function NotFoundPage() {
  return (
    <div className="container page-section">
      <h1>Wrong aisle.</h1>
      <StateMessage title="Page not found">
        <p>Let’s get you back to the good stuff.</p>
        <Link href="/" className="button button--primary">
          Back to the shop
        </Link>
      </StateMessage>
    </div>
  );
}
