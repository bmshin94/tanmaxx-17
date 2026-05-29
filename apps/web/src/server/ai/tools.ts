import { tool, generateObject } from 'ai'
import { z } from 'zod'
import { logSet } from '../functions/log-set'
import { listPRs } from '../functions/list-prs'
import { listHistory } from '../functions/list-history'
import { programSchema } from '@gainsmax/shared'
import { anthropic, MODEL_SMART } from './anthropic'

export function buildAgentTools(opts: { sessionId: string; lower: number; upper: number }) {
  return {
    logSet: tool({
      description:
        'Log a set in the current session. Use this when the user describes a completed set.',
      inputSchema: z.object({
        exerciseId: z.string().describe('Exercise id from the catalog'),
        weight: z.number().nonnegative(),
        reps: z.number().int().nonnegative(),
        rpe: z.number().min(1).max(10).nullable().optional(),
      }),
      execute: async (input) => {
        const row = await logSet({
          data: {
            sessionId: opts.sessionId,
            exerciseId: input.exerciseId,
            weight: input.weight,
            reps: input.reps,
            rpe: input.rpe ?? null,
          },
        })
        return { ok: true, set: row }
      },
    }),

    queryPRs: tool({
      description:
        'Get personal records (top weight) per exercise across all logged sessions.',
      inputSchema: z.object({}),
      execute: async () => {
        const prs = await listPRs()
        return { prs }
      },
    }),

    generateProgram: tool({
      description:
        'Generate a multi-week strength program tailored to the user’s history and current Maxx intensity range.',
      inputSchema: z.object({
        weeks: z.number().int().min(1).max(16).default(4),
        focus: z.string().describe('e.g. "squat", "hypertrophy", "peaking"'),
      }),
      execute: async ({ weeks, focus }) => {
        const [prs, history] = await Promise.all([listPRs(), listHistory()])
        const result = await generateObject({
          model: anthropic()(MODEL_SMART),
          schema: programSchema,
          prompt: [
            `Design a ${weeks}-week ${focus} program.`,
            `Intensity range: ${opts.lower}% to ${opts.upper}% of 1RM (Maxx slider).`,
            `Recent PRs: ${JSON.stringify(prs.slice(0, 10))}`,
            `Sample history rows: ${JSON.stringify(history.slice(0, 10))}`,
            `Return a Program object with workouts[] and per-exercise targets.`,
          ].join('\n'),
        })
        return { program: result.object }
      },
    }),
  }
}
