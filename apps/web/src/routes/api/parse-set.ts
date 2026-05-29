import { createFileRoute } from '@tanstack/react-router'
import { generateObject } from 'ai'
import { z } from 'zod'
import { anthropic, MODEL_FAST } from '../../server/ai/anthropic'

const parsedSchema = z.object({
  weight: z.number().nonnegative().describe('weight in pounds'),
  reps: z.number().int().nonnegative().describe('number of repetitions'),
  rpe: z.number().min(1).max(10).nullable().describe('RPE if mentioned, else null'),
})

export const Route = createFileRoute('/api/parse-set')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { utterance } = (await request.json()) as { utterance: string }
        if (!utterance || typeof utterance !== 'string') {
          return Response.json({ error: 'utterance required' }, { status: 400 })
        }
        const result = await generateObject({
          model: anthropic()(MODEL_FAST),
          schema: parsedSchema,
          prompt: `Parse this gym log into structured data. Numbers may be written as words ("three by five at two twenty-five") or digits ("3x5 @ 225"). Extract weight (lb), reps, and rpe if mentioned.\n\nUtterance: ${utterance}`,
        })
        return Response.json(result.object)
      },
    },
  },
})
