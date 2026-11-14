'use client';

import { Suspense, useState } from 'react';
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
  initialError?: string | undefined;
}

export function AsyncBoundary({
  children,
  fallback,
  title,
  initialError,
}: Props) {
  const [retrying, setRetrying] = useState(false);
  if (initialError !== undefined && retrying === false) {
    return (
      <StateMessage title={title} role="alert">
        <p>{initialError}</p>
        <Button onClick={() => setRetrying(true)}>Try again</Button>
      </StateMessage>
    );
  }
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
