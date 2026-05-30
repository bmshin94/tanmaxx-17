import { createFileRoute } from '@tanstack/react-router'
import { chat } from '@tanstack/ai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { z } from 'zod'
import { MODEL_FAST } from '../../server/ai/anthropic'

// Anthropic's structured-output endpoint rejects JSON-Schema numeric
// constraints (minimum, maximum, multipleOf), so keep the schema shape-only
// and steer ranges via the prompt + a post-parse strict check below.
const aiParsedSchema = z.object({
  weight: z.number().describe('weight in pounds, non-negative'),
  reps: z.number().describe('integer number of repetitions, non-negative'),
  rpe: z.number().nullable().describe('RPE 1-10 if mentioned, else null'),
})

const parsedSchema = z.object({
  weight: z.number().nonnegative(),
  reps: z.number().int().nonnegative(),
  rpe: z.number().min(1).max(10).nullable(),
})

export const Route = createFileRoute('/api/parse-set')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { utterance } = (await request.json()) as { utterance: string }
        if (!utterance || typeof utterance !== 'string') {
          return Response.json({ error: 'utterance required' }, { status: 400 })
        }
        const prompt = [
          'Parse this gym log into structured data.',
          'Numbers may be written as words ("three by five at two twenty-five") or digits ("3x5 @ 225").',
          'Extract weight (lb), reps, and rpe if mentioned (null if not).',
          '',
          `Utterance: ${utterance}`,
        ].join('\n')

        const raw = await chat({
          adapter: anthropicText(MODEL_FAST),
          messages: [{ role: 'user', content: prompt }],
          outputSchema: aiParsedSchema,
        })
        const result = parsedSchema.parse({
          weight: Math.max(0, Math.round(raw.weight)),
          reps: Math.max(0, Math.round(raw.reps)),
          rpe: raw.rpe === null || raw.rpe === undefined
            ? null
            : Math.max(1, Math.min(10, raw.rpe)),
        })
        return Response.json(result)
      },
    },
  },
})
