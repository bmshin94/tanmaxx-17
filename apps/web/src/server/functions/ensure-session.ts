import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import type { Session } from '@tanmaxx/shared'
import { getDb, schema } from '#/server/db/client'

export const ensureSession = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }): Promise<Session> => {
    const db = getDb()
    const existing = db.select().from(schema.sessions).where(eq(schema.sessions.id, data.id)).get()
    if (existing) return existing
    const row: Session = {
      id: data.id,
      programId: null,
      workoutId: null,
      startedAt: Date.now(),
      endedAt: null,
    }
    db.insert(schema.sessions).values(row).run()
    return row
  })
