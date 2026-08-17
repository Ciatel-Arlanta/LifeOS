export function createWebPersist<T>(key: string, empty: () => T) {
  return {
    read(): T {
      if (typeof localStorage === 'undefined') return empty();
      const raw = localStorage.getItem(key);
      if (!raw) return empty();
      try {
        return JSON.parse(raw) as T;
      } catch {
        return empty();
      }
    },
    write(data: T) {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(key, JSON.stringify(data));
    },
  };
}
