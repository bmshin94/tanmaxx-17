import { createServerFn } from '@tanstack/react-start'
import type { Program } from '@tanmaxx/shared'
import { getDb, schema } from '../db/client'

export const listPrograms = createServerFn({ method: 'GET' }).handler(async (): Promise<Program[]> => {
  const rows = getDb().select().from(schema.programs).all()
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    workouts: (r.workouts as Program['workouts']) ?? [],
  }))
})
