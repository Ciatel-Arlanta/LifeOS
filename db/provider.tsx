import { hydrateApp } from '@/features/app/hydrate';
import { type ReactNode, useEffect } from 'react';

/** Web preview persists in localStorage. Native uses provider.native.tsx. */
export function DatabaseProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void hydrateApp();
  }, []);
  return children;
}
