import { Database } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';

const sql = await Bun.file('drizzle/0006_long_wildside.sql').text();
const statements = sql.split('--> statement-breakpoint');

/** Pre-0006 shape: category_id was nullable. */
function legacyDb(): Database {
  const db = new Database(':memory:');
  db.run(`CREATE TABLE memberships (id integer PRIMARY KEY AUTOINCREMENT NOT NULL)`);
  db.run(
    `CREATE TABLE expense_categories (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      name text NOT NULL,
      created_at integer NOT NULL
    )`
  );
  db.run(
    `CREATE TABLE subscriptions (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      name text NOT NULL,
      cost_minor integer NOT NULL,
      billing_period text NOT NULL,
      renewal_date text NOT NULL,
      autopay_enabled integer DEFAULT false NOT NULL,
      autopay_method text,
      category_id integer,
      membership_id integer,
      inactive_at integer,
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    )`
  );
  return db;
}

function addSubscription(db: Database, categoryId: number | null) {
  db.run(
    `INSERT INTO subscriptions
      (name, cost_minor, billing_period, renewal_date, category_id, created_at, updated_at)
     VALUES ('Claude', 200000, 'monthly', '2026-10-01', ?, 0, 0)`,
    [categoryId]
  );
}

function migrate(db: Database) {
  for (const statement of statements) db.run(statement);
}

function categoryNames(db: Database): string[] {
  return db
    .query<{ name: string }, []>('SELECT name FROM expense_categories ORDER BY id')
    .all()
    .map((row) => row.name);
}

describe('migration 0006 — subscriptions.category_id NOT NULL', () => {
  it('leaves categories empty on a fresh install', () => {
    const db = legacyDb();
    migrate(db);
    expect(categoryNames(db)).toEqual([]);
  });

  it('does not seed when there is nothing to back-fill', () => {
    const db = legacyDb();
    addSubscription(db, null);
    db.run(`INSERT INTO expense_categories (name, created_at) VALUES ('Food', 0)`);
    migrate(db);
    expect(categoryNames(db)).toEqual(['Food']);
  });

  it('back-fills a null category from the lowest existing category', () => {
    const db = legacyDb();
    db.run(`INSERT INTO expense_categories (name, created_at) VALUES ('Food', 0), ('Rent', 0)`);
    addSubscription(db, null);
    migrate(db);
    const [row] = db
      .query<{ category_id: number }, []>('SELECT category_id FROM subscriptions')
      .all();
    expect(row.category_id).toBe(1);
    expect(categoryNames(db)).toEqual(['Food', 'Rent']);
  });

  it('seeds General only when a null category has nothing to point at', () => {
    const db = legacyDb();
    addSubscription(db, null);
    migrate(db);
    expect(categoryNames(db)).toEqual(['General']);
    const [row] = db
      .query<{ category_id: number }, []>('SELECT category_id FROM subscriptions')
      .all();
    expect(row.category_id).toBe(1);
  });

  it('preserves an existing category link', () => {
    const db = legacyDb();
    db.run(`INSERT INTO expense_categories (name, created_at) VALUES ('Food', 0), ('Rent', 0)`);
    addSubscription(db, 2);
    migrate(db);
    const [row] = db
      .query<{ category_id: number }, []>('SELECT category_id FROM subscriptions')
      .all();
    expect(row.category_id).toBe(2);
  });
});
