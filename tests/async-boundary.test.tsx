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
});
