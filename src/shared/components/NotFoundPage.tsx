import { Link } from 'react-router-dom';
import { usePageTitle } from '../usePageTitle';
import { StateMessage } from './StateMessage';

export function NotFoundPage() {
  usePageTitle('Page not found');
  return (
    <div className="container page-section">
      <h1>Wrong aisle.</h1>
      <StateMessage title="Page not found">
        <p>Let’s get you back to the good stuff.</p>
        <Link to="/" className="button button--primary">
          Back to the shop
        </Link>
      </StateMessage>
    </div>
  );
}
