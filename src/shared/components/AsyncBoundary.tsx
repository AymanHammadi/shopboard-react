import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { requestErrorMessage } from '../api/client';
import { Button } from './Button';
import { StateMessage } from './StateMessage';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
  title: string;
}

export function AsyncBoundary({ children, fallback, title }: Props) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <StateMessage title={title} role="alert">
              <p>{requestErrorMessage(error)}</p>
              <Button onClick={resetErrorBoundary}>Try again</Button>
            </StateMessage>
          )}
        >
          <Suspense fallback={fallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
