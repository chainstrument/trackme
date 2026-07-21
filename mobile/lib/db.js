import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'trackme.db';

let dbPromise = null;

function getDatabase() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return dbPromise;
}

async function initDatabase() {
  const db = await getDatabase();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      calories INTEGER,
      macros TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS planned_meals (
      id TEXT PRIMARY KEY NOT NULL,
      meal_id TEXT NOT NULL REFERENCES meals(id),
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      eaten INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      duration INTEGER NOT NULL,
      intensity TEXT,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alert_rules (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      trigger_type TEXT NOT NULL DEFAULT 'fixed',
      schedule TEXT,
      interval_minutes INTEGER,
      notification_id TEXT,
      message TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alert_history (
      id TEXT PRIMARY KEY NOT NULL,
      rule_id TEXT NOT NULL REFERENCES alert_rules(id),
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  await ensureColumn(db, 'alert_rules', 'trigger_type', "TEXT NOT NULL DEFAULT 'fixed'");
  await ensureColumn(db, 'alert_rules', 'interval_minutes', 'INTEGER');
  await ensureColumn(db, 'alert_rules', 'notification_id', 'TEXT');
  return db;
}

async function ensureColumn(db, table, column, definition) {
  const columns = await db.getAllAsync(`PRAGMA table_info(${table})`);
  const exists = columns.some((col) => col.name === column);
  if (!exists) {
    await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

export { getDatabase, initDatabase };
