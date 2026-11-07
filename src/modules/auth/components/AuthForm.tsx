import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { createProfile, validateAuth } from '../auth.logic';
import { useAuth } from '../auth.state';
import type { AuthFields } from '../auth.types';

interface Props {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: Props) {
  const { actions } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState<AuthFields>({
    name: '',
    email: '',
    password: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<ReadonlySet<keyof AuthFields>>(
    new Set(),
  );
  const errors = validateAuth(fields, mode);

  function touch(field: keyof AuthFields) {
    setTouched((current) => new Set([...current, field]));
  }
  function change(field: keyof AuthFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
  }
  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      const firstInvalid =
        errors.name !== undefined
          ? 'name'
          : errors.email !== undefined
            ? 'email'
            : 'password';
      event.currentTarget
        .querySelector<HTMLInputElement>(`#${firstInvalid}`)
        ?.focus();
      return;
    }
    actions.signIn(createProfile(fields, mode));
    setFields({ name: '', email: '', password: '' });
    void navigate('/', { replace: true });
  }

  return (
    <form className="auth-form" noValidate onSubmit={submit}>
      {mode === 'signup' ? (
        <TextField
          id="name"
          name="name"
          label="Full name"
          autoComplete="name"
          required
          value={fields.name}
          onChange={(event) => change('name', event.target.value)}
          onBlur={() => touch('name')}
          error={submitted || touched.has('name') ? errors.name : undefined}
        />
      ) : null}
      <TextField
        id="email"
        name="email"
        label="Email address"
        type="email"
        autoComplete="email"
        required
        value={fields.email}
        onChange={(event) => change('email', event.target.value)}
        onBlur={() => touch('email')}
        error={submitted || touched.has('email') ? errors.email : undefined}
      />
      <TextField
        id="password"
        name="password"
        label="Password"
        type="password"
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        minLength={8}
        required
        value={fields.password}
        onChange={(event) => change('password', event.target.value)}
        onBlur={() => touch('password')}
        error={
          submitted || touched.has('password') ? errors.password : undefined
        }
      />
      <Button type="submit" variant="primary">
        {mode === 'signup' ? 'Create account' : 'Log in'}
        <ArrowRight size={18} aria-hidden="true" />
      </Button>
    </form>
  );
}
