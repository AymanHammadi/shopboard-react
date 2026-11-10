'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useAuth } from '../auth.state';
import { AuthForm } from '../components/AuthForm';

interface Props {
  mode: 'login' | 'signup';
}

export function AuthPage({ mode }: Props) {
  const { value: profile } = useAuth();
  if (profile !== null) redirect('/');

  return (
    <div className="container auth-layout">
      <div className="auth-intro">
        <p className="eyebrow">A good place to start</p>
        <h2>
          Your everyday.
          <br />A little better.
        </h2>
        <ArrowUpRight size={72} strokeWidth={1.5} aria-hidden="true" />
      </div>
      <div className="auth-panel">
        <p className="eyebrow">Make yourself at home</p>
        <h1>
          {mode === 'signup' ? 'Join the good side.' : 'Good to see you.'}
        </h1>
        <AuthForm key={mode} mode={mode} />
        <p className="auth-switch">
          {mode === 'signup' ? 'Already have an account?' : 'New around here?'}{' '}
          <Link href={mode === 'signup' ? '/login' : '/signup'}>
            {mode === 'signup' ? 'Log in' : 'Create an account'}
          </Link>
        </p>
      </div>
    </div>
  );
}
