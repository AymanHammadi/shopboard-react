import { useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { AuthContext, createAuthState } from '../auth.state';

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [auth] = useState(createAuthState);
  const snapshot = useSyncExternalStore(
    auth.subscribe,
    auth.getSnapshot,
    auth.getServerSnapshot,
  );
  return (
    <AuthContext value={{ ...snapshot, actions: auth.actions }}>
      {children}
    </AuthContext>
  );
}
