import type { z } from 'zod';

interface Snapshot<T> {
  readonly value: T;
  readonly issue: string | null;
}

export function createStoredState<T>(
  key: string,
  schema: z.ZodType<T>,
  initialValue: T,
) {
  function read(): Snapshot<T> {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return { value: initialValue, issue: null };
      const parsed: unknown = JSON.parse(raw);
      const result = schema.safeParse(parsed);
      if (result.success) return { value: result.data, issue: null };
      return {
        value: initialValue,
        issue: 'Saved data could not be restored. Start again to replace it.',
      };
    } catch {
      return {
        value: initialValue,
        issue:
          'Browser storage is unavailable or unreadable. Changes may not survive a refresh.',
      };
    }
  }

  let snapshot = read();
  const listeners = new Set<() => void>();

  function publish(next: Snapshot<T>) {
    snapshot = next;
    listeners.forEach((listener) => listener());
  }

  function onStorage(event: StorageEvent) {
    if (event.key === key || event.key === null) publish(read());
  }

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      if (listeners.size === 0) window.addEventListener('storage', onStorage);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0)
          window.removeEventListener('storage', onStorage);
      };
    },
    update(updater: (current: T) => T) {
      const value = updater(snapshot.value);
      let issue: string | null = null;
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        issue =
          'Your changes are available in this tab, but could not be saved. They may be lost after a refresh.';
      }
      publish({ value, issue });
    },
  };
}
