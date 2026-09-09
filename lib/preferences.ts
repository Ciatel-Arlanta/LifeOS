/**
 * Small synchronous key/value store for user preferences (theme, notification lead time).
 * Web preview: `localStorage`. Native uses `preferences.native.ts` (expo-sqlite kv-store).
 *
 * Reads must stay synchronous — the theme is resolved before the first render, and an
 * async read would paint the wrong scheme first.
 */
export function getPreference(key: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setPreference(key: string, value: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private-mode browsers reject writes. The preference just will not persist.
  }
}
