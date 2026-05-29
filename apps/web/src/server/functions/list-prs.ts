import { createServerFn } from '@tanstack/react-start'
import { sql } from 'drizzle-orm'
import { getDb, schema } from '../db/client'

export type PR = {
  exerciseId: string
  weight: number
  reps: number
  loggedAt: number
}

export const listPRs = createServerFn({ method: 'GET' }).handler(async (): Promise<PR[]> => {
  const db = getDb()
  // Top weight per exercise. e1RM estimation deferred to Phase 8 polish.
  const rows = db
    .select({
      exerciseId: schema.sets.exerciseId,
      weight: sql<number>`max(${schema.sets.weight})`.as('weight'),
      reps: schema.sets.reps,
      loggedAt: schema.sets.loggedAt,
    })
    .from(schema.sets)
    .groupBy(schema.sets.exerciseId)
    .all()
  return rows
})
