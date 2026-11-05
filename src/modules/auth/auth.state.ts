import { useSyncExternalStore } from 'react';
import { createStoredState } from '../../shared/storage';
import { profileSchema } from './auth.types';
import type { Profile } from './auth.types';

const profile = createStoredState<Profile | null>(
  'shopboard:profile:v1',
  profileSchema.nullable(),
  null,
);

export function useAuth() {
  return useSyncExternalStore(profile.subscribe, profile.getSnapshot);
}

export const authActions = {
  signIn(value: Profile) {
    profile.update(() => value);
  },
  signOut() {
    profile.update(() => null);
  },
};
