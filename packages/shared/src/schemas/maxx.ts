import { z } from 'zod'

export const userMaxxSchema = z.object({
  min: z.number().min(0).max(110),
  max: z.number().min(0).max(110),
})

export type UserMaxx = z.infer<typeof userMaxxSchema>
