import { z } from 'zod'

export const setSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  exerciseId: z.string(),
  weight: z.number().nonnegative(),
  reps: z.number().int().nonnegative(),
  rpe: z.number().min(1).max(10).nullable(),
  loggedAt: z.number().int(),
})

export const setDraftSchema = setSchema.omit({ id: true, loggedAt: true })

export type Set = z.infer<typeof setSchema>
export type SetDraft = z.infer<typeof setDraftSchema>
