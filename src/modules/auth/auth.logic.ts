import type { AuthFields, Profile } from './auth.types';

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
