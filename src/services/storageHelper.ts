/**
 * Universal safe storage helper that works seamlessly in Browser, SSR, and Node environments.
 */
const inMemoryStore = new Map<string, string>();

export const safeLocalStorage = {
  getItem(key: string): string | null {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        return window.localStorage.getItem(key);
      } catch {
        // Private mode or storage quota error
      }
    }
    return inMemoryStore.get(key) || null;
  },

  setItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // Storage disabled or quota exceeded
      }
    }
    inMemoryStore.set(key, value);
  },

  removeItem(key: string): void {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Ignored
      }
    }
    inMemoryStore.delete(key);
  },

  clear(): void {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        window.localStorage.clear();
      } catch {
        // Ignored
      }
    }
    inMemoryStore.clear();
  },
};
