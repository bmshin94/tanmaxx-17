import { tool } from 'ai'
import { z } from 'zod'
import { logSet } from '../functions/log-set'
import { listPRs } from '../functions/list-prs'
import { runGenerateProgram } from '../workflows/generate-program'

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
        const { program, steps } = await runGenerateProgram({
          weeks,
          focus,
          lower: opts.lower,
          upper: opts.upper,
        })
        return { program, workflow: { id: 'generate-program', steps } }
      },
    }),
  }
}
