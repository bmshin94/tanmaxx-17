import { z } from 'zod'

export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  muscles: z.array(z.string()),
  equipment: z.string(),
  grip: z.string().nullable(),
  defaultRepRange: z.tuple([z.number().int().positive(), z.number().int().positive()]),
})

export type Exercise = z.infer<typeof exerciseSchema>
