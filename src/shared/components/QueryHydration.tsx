import 'server-only';

import type { ReactNode } from 'react';
import { connection } from 'next/server';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import { requestErrorMessage } from '../api/client';
import { AsyncBoundary } from './AsyncBoundary';

interface Props {
  children: ReactNode;
  queryKey: QueryKey;
  load: (signal: AbortSignal) => Promise<unknown>;
  title: string;
  fallback: ReactNode;
}

export async function QueryHydration({
  children,
  queryKey,
  load,
  title,
  fallback,
}: Props) {
  await connection();
  const client = new QueryClient();
  let initialError: string | undefined;
  try {
    await client.fetchQuery({
      queryKey,
      queryFn: ({ signal }) => load(signal),
      staleTime: 5 * 60_000,
      retry: false,
    });
  } catch (error) {
    initialError = requestErrorMessage(error);
  }
  return (
    <AsyncBoundary
      title={title}
      fallback={fallback}
      initialError={initialError}
    >
      <HydrationBoundary state={dehydrate(client)}>
        {children}
      </HydrationBoundary>
    </AsyncBoundary>
  );
}
