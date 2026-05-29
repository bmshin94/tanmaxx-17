import { z } from 'zod'

export const sessionSchema = z.object({
  id: z.string(),
  programId: z.string().nullable(),
  workoutId: z.string().nullable(),
  startedAt: z.number().int(),
  endedAt: z.number().int().nullable(),
})

export type Session = z.infer<typeof sessionSchema>
