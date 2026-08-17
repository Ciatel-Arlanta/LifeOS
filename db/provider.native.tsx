import { Text } from '@/components/ui/text';
import { hydrateExpenses } from '@/features/expenses/store';
import { toUserMessage } from '@/lib/errors';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { type ReactNode, useEffect, useMemo } from 'react';
import { View } from 'react-native';

import migrations from '../drizzle/migrations';
import { getDb } from './client';

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const opened = useMemo(() => {
    try {
      return { db: getDb(), error: null };
    } catch (error) {
      return { db: null, error };
    }
  }, []);

  if (opened.error || !opened.db) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="font-sans-semibold text-lg">Database could not start</Text>
        <Text className="mt-2 text-center text-muted-foreground">
          {toUserMessage(opened.error)}
        </Text>
      </View>
    );
  }

  return <MigratingDatabase db={opened.db}>{children}</MigratingDatabase>;
}

function MigratingDatabase({
  children,
  db,
}: {
  children: ReactNode;
  db: NonNullable<ReturnType<typeof getDb>>;
}) {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="font-sans-semibold text-lg">Database could not start</Text>
        <Text className="mt-2 text-center text-muted-foreground">{toUserMessage(error)}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Preparing LifeOS…</Text>
      </View>
    );
  }

  return <Hydrated>{children}</Hydrated>;
}

function Hydrated({ children }: { children: ReactNode }) {
  useEffect(() => {
    void hydrateExpenses();
  }, []);
  return children;
}
