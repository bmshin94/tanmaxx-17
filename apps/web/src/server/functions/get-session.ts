import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { Session, Set } from '@tanmaxx/shared'
import { getDb, schema } from '#/server/db/client'

export const getSession = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }): Promise<{ session: Session; sets: Set[] } | null> => {
    const db = getDb()
    const session = db.select().from(schema.sessions).where(eq(schema.sessions.id, data.id)).get()
    if (!session) return null
    const sets = db.select().from(schema.sets).where(eq(schema.sets.sessionId, data.id)).all()
    return { session, sets }
  })
