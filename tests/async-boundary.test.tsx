import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  QueryClient,
  QueryClientProvider,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { AsyncBoundary } from '../src/shared/components/AsyncBoundary';

function Results() {
  const { data } = useSuspenseQuery({
    queryKey: ['boundary-test'],
    queryFn: () => Promise.resolve('Products ready'),
  });
  return <p>{data}</p>;
}

describe('async boundaries', () => {
  it('renders a server failure locally and waits for an explicit browser retry', async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <p>Navigation stays available</p>
        <AsyncBoundary
          title="Products couldn’t load"
          fallback={<p>Loading products</p>}
          initialError="Check your connection."
        >
          <Results />
        </AsyncBoundary>
      </QueryClientProvider>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Check your connection.',
    );
    expect(screen.queryByText('Products ready')).not.toBeInTheDocument();
    expect(screen.getByText('Navigation stays available')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Products ready')).toBeVisible();
  });
  it('contains a render failure and can retry without unmounting siblings', async () => {
    let broken = true;
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    function BrokenContent() {
      if (broken) throw new Error('Render failed');
      return <Results />;
    }
    render(
      <QueryClientProvider client={new QueryClient()}>
        <p>Navigation stays available</p>
        <AsyncBoundary
          title="Products couldn’t load"
          fallback={<p>Loading products</p>}
        >
          <BrokenContent />
        </AsyncBoundary>
      </QueryClientProvider>,
    );
    expect(screen.getByText('Navigation stays available')).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Products couldn’t load',
    );
    broken = false;
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Products ready')).toBeVisible();
  });
  it('does not restore the initial server error after a browser retry also fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let broken = true;
    function RetriedContent() {
      if (broken) throw new Error('Browser request failed');
      return <p>Products recovered</p>;
    }
    render(
      <QueryClientProvider client={new QueryClient()}>
        <AsyncBoundary
          title="Products couldn’t load"
          fallback={<p>Loading</p>}
          initialError="Server unavailable"
        >
          <RetriedContent />
        </AsyncBoundary>
      </QueryClientProvider>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByRole('alert')).not.toHaveTextContent(
      'Server unavailable',
    );
    broken = false;
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('Products recovered')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
