import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { createStoredState } from '../src/shared/storage';

beforeEach(() => localStorage.clear());

describe('persisted state', () => {
  it('uses a stable empty server snapshot without exposing browser data', () => {
    localStorage.setItem('test', '[1,2]');
    const store = createStoredState('test', z.array(z.number()), []);
    expect(store.getServerSnapshot()).toBe(store.getServerSnapshot());
    expect(store.getServerSnapshot()).toEqual({ value: [], issue: null });
    expect(store.getSnapshot().value).toEqual([1, 2]);
  });
  it('does not access browser storage while rendering on the server', () => {
    const read = vi.spyOn(Storage.prototype, 'getItem');
    vi.stubGlobal('window', undefined);
    const store = createStoredState('test', z.number(), 0);
    expect(store.getSnapshot()).toBe(store.getServerSnapshot());
    expect(store.getSnapshot()).toEqual({ value: 0, issue: null });
    expect(read).not.toHaveBeenCalled();
  });
  it('restores a validated saved value', () => {
    localStorage.setItem('test', '[1,2]');
    expect(
      createStoredState('test', z.array(z.number()), []).getSnapshot(),
    ).toEqual({ value: [1, 2], issue: null });
  });
  it('keeps snapshots stable until an update and notifies subscribers', () => {
    const store = createStoredState('test', z.number(), 0);
    const before = store.getSnapshot();
    expect(store.getSnapshot()).toBe(before);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.update((value) => value + 1);
    expect(listener).toHaveBeenCalledOnce();
    expect(localStorage.getItem('test')).toBe('1');
    expect(store.getSnapshot()).not.toBe(before);
    unsubscribe();
    store.update((value) => value + 1);
    expect(listener).toHaveBeenCalledOnce();
  });
  it.each(['invalid json', '{"quantity":"bad"}'])(
    'reports corrupt data rather than crashing: %s',
    (raw) => {
      localStorage.setItem('test', raw);
      const store = createStoredState('test', z.array(z.number()), []);
      expect(store.getSnapshot().value).toEqual([]);
      expect(store.getSnapshot().issue).not.toBeNull();
    },
  );
  it('reports blocked reads and keeps the app usable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Blocked');
    });
    expect(
      createStoredState('test', z.number(), 0).getSnapshot().issue,
    ).toContain('unavailable');
  });
  it('keeps in-memory updates and reports failed writes', () => {
    const store = createStoredState('test', z.number(), 0);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    store.update(() => 3);
    expect(store.getSnapshot().value).toBe(3);
    expect(store.getSnapshot().issue).toContain('could not be saved');
  });
  it('updates subscribed stores when another tab changes storage', () => {
    const store = createStoredState('test', z.number(), 0);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    localStorage.setItem('test', '2');
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'test', newValue: '2' }),
    );
    expect(store.getSnapshot().value).toBe(2);
    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
  });
});
