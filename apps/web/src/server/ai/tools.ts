import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'
import { logSet } from '../functions/log-set'
import { listPRs } from '../functions/list-prs'
import { runGenerateProgram } from '../workflows/generate-program'

export const logSetToolDef = toolDefinition({
  name: 'logSet',
  description: 'Log a set in the current session. Use when the user describes a completed set.',
  inputSchema: z.object({
    exerciseId: z.string().describe('Exercise id from the catalog'),
    weight: z.number().nonnegative(),
    reps: z.number().int().nonnegative(),
    rpe: z.number().min(1).max(10).nullable().optional(),
  }),
  outputSchema: z.object({
    ok: z.boolean(),
    set: z.object({
      id: z.string(),
      sessionId: z.string(),
      exerciseId: z.string(),
      weight: z.number(),
      reps: z.number(),
      rpe: z.number().nullable(),
      loggedAt: z.number(),
    }),
  }),
})

export const queryPRsToolDef = toolDefinition({
  name: 'queryPRs',
  description: 'Get personal records (top weight) per exercise across all logged sessions.',
  inputSchema: z.object({}),
  outputSchema: z.object({
    prs: z.array(
      z.object({
        exerciseId: z.string(),
        exerciseName: z.string(),
        weight: z.number(),
        reps: z.number(),
        rpe: z.number().nullable(),
        loggedAt: z.number(),
      }),
    ),
  }),
})

export const generateProgramToolDef = toolDefinition({
  name: 'generateProgram',
  description:
    'Generate a multi-week strength program tailored to the user’s history and current Maxx intensity range.',
  inputSchema: z.object({
    weeks: z.number().int().min(1).max(16).default(4),
    focus: z.string().describe('e.g. "squat", "hypertrophy", "peaking"'),
  }),
})

export function buildServerTools(opts: { sessionId: string; lower: number; upper: number }) {
  const logSetServer = logSetToolDef.server(async (args) => {
    const row = await logSet({
      data: {
        sessionId: opts.sessionId,
        exerciseId: args.exerciseId,
        weight: args.weight,
        reps: args.reps,
        rpe: args.rpe ?? null,
      },
    })
    return { ok: true, set: row }
  })

  const queryPRsServer = queryPRsToolDef.server(async () => {
    const prs = await listPRs()
    return { prs }
  })

  const generateProgramServer = generateProgramToolDef.server(async ({ weeks, focus }) => {
    const { program, steps } = await runGenerateProgram({
      weeks: weeks ?? 4,
      focus,
      lower: opts.lower,
      upper: opts.upper,
    })
    return { program, workflow: { id: 'generate-program', steps } }
  })

  return [logSetServer, queryPRsServer, generateProgramServer]
}
