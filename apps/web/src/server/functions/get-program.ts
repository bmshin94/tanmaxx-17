import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { Program } from '@tanmaxx/shared'
import { getDb, schema } from '#/server/db/client'

export const getProgram = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }): Promise<Program | null> => {
    const row = getDb().select().from(schema.programs).where(eq(schema.programs.id, data.id)).get()
    if (!row) return null
    return {
      id: row.id,
      name: row.name,
      workouts: (row.workouts as Program['workouts']) ?? [],
    }
  })
