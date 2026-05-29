import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import * as schema from './schema.ts'

const DB_PATH = resolve(process.cwd(), '.data/gainsmax.db')

let _db: ReturnType<typeof drizzle> | undefined

export function getDb() {
  if (!_db) {
    mkdirSync(dirname(DB_PATH), { recursive: true })
    const sqlite = new Database(DB_PATH)
    sqlite.pragma('journal_mode = WAL')
    _db = drizzle(sqlite, { schema })
  }
  return _db
}

export { schema }
