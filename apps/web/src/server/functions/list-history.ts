import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { getDb, schema } from '../db/client'

export type HistoryRow = {
  id: string
  sessionId: string
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  rpe: number | null
  loggedAt: number
}

export const listHistory = createServerFn({ method: 'GET' }).handler(async (): Promise<HistoryRow[]> => {
  const db = getDb()
  const rows = db
    .select({
      id: schema.sets.id,
      sessionId: schema.sets.sessionId,
      exerciseId: schema.sets.exerciseId,
      exerciseName: schema.exercises.name,
      weight: schema.sets.weight,
      reps: schema.sets.reps,
      rpe: schema.sets.rpe,
      loggedAt: schema.sets.loggedAt,
    })
    .from(schema.sets)
    .leftJoin(schema.exercises, eq(schema.exercises.id, schema.sets.exerciseId))
    .orderBy(desc(schema.sets.loggedAt))
    .all()
  return rows.map((r) => ({ ...r, exerciseName: r.exerciseName ?? r.exerciseId }))
})
