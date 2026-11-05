import { z } from 'zod';
import type { AuthErrors, AuthFields, Profile } from './auth.types';

export function validateAuth(
  fields: AuthFields,
  mode: 'login' | 'signup',
): AuthErrors {
  const errors: { name?: string; email?: string; password?: string } = {};
  if (mode === 'signup' && fields.name.trim().length < 2)
    errors.name = 'Enter your full name (at least 2 characters).';
  if (z.email().safeParse(fields.email.trim()).success === false)
    errors.email = 'Enter a valid email address.';
  if (fields.password.length < 8)
    errors.password = 'Use at least 8 characters.';
  return errors;
}

export function createProfile(
  fields: AuthFields,
  mode: 'login' | 'signup',
): Profile {
  const email = fields.email.trim().toLowerCase();
  return {
    name:
      mode === 'signup' ? fields.name.trim() : (email.split('@')[0] ?? email),
    email,
  };
}
