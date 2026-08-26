import { BootLoading } from '@/components/boot';
import { hydrateApp } from '@/features/app/hydrate';
import { type ReactNode, useEffect, useState } from 'react';

/**
 * Web preview persists in localStorage. Native uses provider.native.tsx.
 * Gates children until hydration finishes so lists don't flash empty.
 */
export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    hydrateApp()
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return <BootLoading />;
  return children;
}
