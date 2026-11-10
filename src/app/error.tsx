'use client';

import { Button } from '../shared/components/Button';
import { StateMessage } from '../shared/components/StateMessage';

interface Props {
  retry: () => void;
}

export default function ErrorPage({ retry }: Props) {
  return (
    <div className="container page-section">
      <StateMessage title="This page couldn’t load" role="alert">
        <p>
          Try again, reload the page, or use the navigation to keep shopping.
        </p>
        <Button onClick={retry}>Try again</Button>
        <Button onClick={() => window.location.reload()}>Reload page</Button>
      </StateMessage>
    </div>
  );
}
