import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const DB_PATH = process.env.DB_PATH ?? '/data/micasabo.db';

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDb(): void {
  const db = getDb();
  const schema = readFileSync(join(process.cwd(), '..', 'schema.sql'), 'utf8');
  // Only run schema if tables don't exist yet
  const tableExists = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    .get();
  if (!tableExists) {
    db.exec(schema);
    console.log('Database schema initialised.');
  }
}
