import { createServerFn } from '@tanstack/react-start'
import type { Exercise } from '@tanmaxx/shared'
import { getDb, schema } from '../db/client'

export const listExercises = createServerFn({ method: 'GET' }).handler(async (): Promise<Exercise[]> => {
  const rows = await getDb().select().from(schema.exercises).all()
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    muscles: row.muscles,
    equipment: row.equipment,
    grip: row.grip,
    defaultRepRange: [row.defaultRepMin, row.defaultRepMax] as [number, number],
  }))
})
