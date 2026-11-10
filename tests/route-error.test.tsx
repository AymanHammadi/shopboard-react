import { expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorPage from '../src/app/error';

it('offers route retry through Next.js and a full reload', async () => {
  const retry = vi.fn();
  render(<ErrorPage retry={retry} />);
  expect(screen.getByRole('alert')).toHaveTextContent(
    'This page couldn’t load',
  );
  await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(retry).toHaveBeenCalledOnce();
  expect(screen.getByRole('button', { name: 'Reload page' })).toBeVisible();
});
