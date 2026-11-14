import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../src/modules/auth/components/AuthProvider';
import { AuthForm } from '../src/modules/auth/components/AuthForm';

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
beforeEach(() => localStorage.clear());

describe('simulated auth forms', () => {
  it.each(['login', 'signup'])(
    'validates %s on blur, corrects errors, and focuses the first invalid field',
    async (mode) => {
      render(<AuthForm mode={mode === 'signup' ? 'signup' : 'login'} />, {
        wrapper: AuthProvider,
      });
      const user = userEvent.setup();
      const email = screen.getByLabelText('Email address');
      expect(
        screen.queryByText('Enter a valid email address.'),
      ).not.toBeInTheDocument();
      await user.type(email, 'bad');
      expect(
        screen.queryByText('Enter a valid email address.'),
      ).not.toBeInTheDocument();
      await user.tab();
      expect(email).toHaveAccessibleDescription('Enter a valid email address.');
      await user.clear(email);
      await user.type(email, 'alex@example.com');
      expect(
        screen.queryByText('Enter a valid email address.'),
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole('button'));
      expect(
        screen.getByLabelText(mode === 'signup' ? 'Full name' : 'Password'),
      ).toHaveFocus();
    },
  );

  it.each(['login', 'signup'])(
    'keeps %s simulated and submits once without transmitting a password',
    async (mode) => {
      const fetcher = vi.fn<typeof fetch>();
      vi.stubGlobal('fetch', fetcher);
      const view = render(
        <AuthForm mode={mode === 'signup' ? 'signup' : 'login'} />,
        { wrapper: AuthProvider },
      );
      if (mode === 'signup')
        fireEvent.change(screen.getByLabelText('Full name'), {
          target: { value: ' Alex Doe ' },
        });
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: ' Alex@Example.com ' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'not-stored-password' },
      });
      const form = view.container.querySelector('form');
      if (form === null) throw new Error('Missing auth form');
      fireEvent.submit(form);
      fireEvent.submit(form);
      await waitFor(() => expect(replace).toHaveBeenCalledOnce());
      expect(localStorage.getItem('shopboard:profile:v1')).toBe(
        JSON.stringify({
          name: mode === 'signup' ? 'Alex Doe' : 'alex',
          email: 'alex@example.com',
        }),
      );
      expect(screen.getByLabelText('Password')).toHaveValue('');
      expect(fetcher).not.toHaveBeenCalled();
    },
  );
});
