import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { getDb, schema } from '#/server/db/client'

export type PR = {
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  rpe: number | null
  loggedAt: number
}

export const listPRs = createServerFn({ method: 'GET' }).handler(async (): Promise<PR[]> => {
  const db = getDb()
  const rows = db
    .select({
      id: schema.sets.id,
      exerciseId: schema.sets.exerciseId,
      exerciseName: schema.exercises.name,
      weight: schema.sets.weight,
      reps: schema.sets.reps,
      rpe: schema.sets.rpe,
      loggedAt: schema.sets.loggedAt,
    })
    .from(schema.sets)
    .leftJoin(schema.exercises, eq(schema.exercises.id, schema.sets.exerciseId))
    .orderBy(desc(schema.sets.weight))
    .all()

  // Top set per exercise by weight, then by reps.
  const best = new Map<string, PR>()
  for (const r of rows) {
    const cur = best.get(r.exerciseId)
    if (!cur || r.weight > cur.weight || (r.weight === cur.weight && r.reps > cur.reps)) {
      best.set(r.exerciseId, {
        exerciseId: r.exerciseId,
        exerciseName: r.exerciseName ?? r.exerciseId,
        weight: r.weight,
        reps: r.reps,
        rpe: r.rpe,
        loggedAt: r.loggedAt,
      })
    }
  }
  return Array.from(best.values()).sort((a, b) => b.weight - a.weight)
})
