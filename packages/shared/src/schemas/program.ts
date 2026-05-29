import { z } from 'zod'

export const exerciseTargetSchema = z.object({
  exerciseId: z.string(),
  sets: z.number().int().positive(),
  reps: z.number().int().positive(),
  intensityPct: z.number().min(0).max(110),
})

export const workoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  targets: z.array(exerciseTargetSchema),
})

export const programSchema = z.object({
  id: z.string(),
  name: z.string(),
  workouts: z.array(workoutSchema),
})

export type ExerciseTarget = z.infer<typeof exerciseTargetSchema>
export type Workout = z.infer<typeof workoutSchema>
export type Program = z.infer<typeof programSchema>
