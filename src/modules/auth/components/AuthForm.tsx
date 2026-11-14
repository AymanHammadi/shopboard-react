import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { useHydrated } from '../../../shared/hydration';
import { createProfile } from '../auth.logic';
import { loginSchema, signupSchema } from '../auth.types';
import { useAuth } from '../auth.state';
import type { AuthFields } from '../auth.types';

interface Props {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: Props) {
  const hydrated = useHydrated();
  const { actions } = useAuth();
  const router = useRouter();
  const submitting = useRef(false);
  const form = useForm<AuthFields>({
    resolver: zodResolver(mode === 'signup' ? signupSchema : loginSchema),
    mode: 'onTouched',
    defaultValues: { name: '', email: '', password: '' },
  });
  const { errors, isSubmitting, isSubmitSuccessful } = form.formState;

  function submit(fields: AuthFields) {
    actions.signIn(createProfile(fields, mode));
    form.resetField('password');
    router.replace('/');
  }

  return (
    <form
      className="auth-form"
      noValidate
      onSubmit={(event) => {
        if (submitting.current || isSubmitSuccessful) {
          event.preventDefault();
          return;
        }
        submitting.current = true;
        void form
          .handleSubmit(submit)(event)
          .finally(() => {
            submitting.current = false;
          });
      }}
    >
      {mode === 'signup' ? (
        <TextField
          id="name"
          {...form.register('name')}
          label="Full name"
          autoComplete="name"
          required
          error={errors.name?.message}
        />
      ) : null}
      <TextField
        id="email"
        {...form.register('email')}
        label="Email address"
        type="email"
        autoComplete="email"
        required
        error={errors.email?.message}
      />
      <TextField
        id="password"
        {...form.register('password')}
        label="Password"
        type="password"
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        minLength={8}
        required
        error={errors.password?.message}
      />
      <Button
        type="submit"
        variant="primary"
        disabled={hydrated === false || isSubmitting || isSubmitSuccessful}
      >
        {mode === 'signup' ? 'Create account' : 'Log in'}
        <ArrowRight size={18} aria-hidden="true" />
      </Button>
    </form>
  );
}
