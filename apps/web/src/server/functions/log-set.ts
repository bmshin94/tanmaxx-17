import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { setDraftSchema, type Set } from '@gainsmax/shared'
import { getDb, schema } from '../db/client'

const inputSchema = setDraftSchema.extend({
  id: z.string().optional(),
  loggedAt: z.number().int().optional(),
})

export const logSet = createServerFn({ method: 'POST' })
  .inputValidator(inputSchema)
  .handler(async ({ data }): Promise<Set> => {
    const row: Set = {
      sessionId: data.sessionId,
      exerciseId: data.exerciseId,
      weight: data.weight,
      reps: data.reps,
      rpe: data.rpe,
      id: data.id ?? crypto.randomUUID(),
      loggedAt: data.loggedAt ?? Date.now(),
    }
    getDb().insert(schema.sets).values(row).run()
    return row
  })
