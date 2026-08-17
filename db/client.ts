import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

import * as schema from './schema';

export const DATABASE_NAME = 'lifeos.db';

export type AppDatabase = ExpoSQLiteDatabase<typeof schema>;

let sqlite: SQLiteDatabase | null = null;
let db: AppDatabase | null = null;
let initError: Error | null = null;

export function getSqlite(): SQLiteDatabase {
  if (sqlite) return sqlite;
  if (initError) throw initError;
  try {
    sqlite = openDatabaseSync(DATABASE_NAME);
    return sqlite;
  } catch (error) {
    initError = error instanceof Error ? error : new Error('Could not open SQLite.');
    throw initError;
  }
}

export function getDb(): AppDatabase {
  if (db) return db;
  db = drizzle(getSqlite(), { schema });
  return db;
}

export function getDatabaseInitError(): Error | null {
  return initError;
}
