import { createServerFn } from '@tanstack/react-start'
import { desc } from 'drizzle-orm'
import type { Session } from '@gainsmax/shared'
import { getDb, schema } from '../db/client'

export const listSessions = createServerFn({ method: 'GET' }).handler(async (): Promise<Session[]> => {
  return getDb().select().from(schema.sessions).orderBy(desc(schema.sessions.startedAt)).all()
})
