import { useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';

const subscribe = () => () => undefined;
const getSnapshot = () => true;
const getServerSnapshot = () => false;

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

export function BrowserData({ children, fallback }: Props) {
  const hydrated = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return hydrated ? children : fallback;
}
