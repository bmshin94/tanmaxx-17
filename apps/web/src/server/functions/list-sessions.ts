import { createServerFn } from '@tanstack/react-start'
import { desc } from 'drizzle-orm'
import type { Session } from '@tanmaxx/shared'
import { getDb, schema } from '#/server/db/client'

export const listSessions = createServerFn({ method: 'GET' }).handler(async (): Promise<Session[]> => {
  return getDb().select().from(schema.sessions).orderBy(desc(schema.sessions.startedAt)).all()
})
