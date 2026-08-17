import { hydrateExpenses } from '@/features/expenses/store';
import { type ReactNode, useEffect } from 'react';

/** Web preview persists expenses in localStorage. Native uses provider.native.tsx. */
export function DatabaseProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void hydrateExpenses();
  }, []);
  return children;
}
