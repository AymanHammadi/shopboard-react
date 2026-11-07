import { createContext, use } from 'react';
import { createStoredState } from '../../shared/storage';
import { profileSchema } from './auth.types';
import type { Profile } from './auth.types';

export function createAuthState() {
  const profile = createStoredState<Profile | null>(
    'shopboard:profile:v1',
    profileSchema.nullable(),
    null,
  );
  return {
    ...profile,
    actions: {
      signIn: (value: Profile) => profile.update(() => value),
      signOut: () => profile.update(() => null),
    },
  };
}

interface AuthContextValue {
  readonly value: Profile | null;
  readonly issue: string | null;
  readonly actions: ReturnType<typeof createAuthState>['actions'];
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = use(AuthContext);
  if (context === null) throw new Error('useAuth must be inside AuthProvider.');
  return context;
}
