import Storage from 'expo-sqlite/kv-store';

/** Native counterpart of `preferences.ts`. Backed by expo-sqlite's key/value store. */
export function getPreference(key: string): string | null {
  try {
    return Storage.getItemSync(key);
  } catch {
    return null;
  }
}

export function setPreference(key: string, value: string): void {
  try {
    Storage.setItemSync(key, value);
  } catch {
    // Preference is not critical; losing it falls back to the default.
  }
}
