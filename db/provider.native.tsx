import { BootError, BootLoading } from '@/components/boot';
import { hydrateApp } from '@/features/app/hydrate';
import { toUserMessage } from '@/lib/errors';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import migrations from '../drizzle/migrations';
import { getDb } from './client';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [attempt, setAttempt] = useState(0);
  const opened = useMemo(() => {
    try {
      return { db: getDb(), error: null };
    } catch (error) {
      return { db: null, error };
    }
    // Re-run on retry so a failed open can recover.
  }, [attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  if (opened.error || !opened.db) {
    return (
      <BootError
        title="Database could not start"
        message={toUserMessage(opened.error)}
        onRetry={retry}
      />
    );
  }

  return (
    <MigratingDatabase key={attempt} db={opened.db} onRetry={retry}>
      {children}
    </MigratingDatabase>
  );
}

function MigratingDatabase({
  children,
  db,
  onRetry,
}: {
  children: ReactNode;
  db: NonNullable<ReturnType<typeof getDb>>;
  onRetry: () => void;
}) {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <BootError title="Database could not start" message={toUserMessage(error)} onRetry={onRetry} />
    );
  }

  if (!success) {
    return <BootLoading />;
  }

  return <Hydrated>{children}</Hydrated>;
}

function Hydrated({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState<string | null>(null);

  const run = useCallback(() => {
    let active = true;
    setState('loading');
    setMessage(null);
    hydrateApp()
      .then(() => {
        if (active) setState('ready');
      })
      .catch((error) => {
        if (active) {
          setMessage(toUserMessage(error));
          setState('error');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => run(), [run]);

  if (state === 'error') {
    return (
      <BootError
        title="LifeOS could not load your data"
        message={message ?? 'Something went wrong.'}
        onRetry={run}
      />
    );
  }

  if (state === 'loading') {
    return <BootLoading />;
  }

  return children;
}
