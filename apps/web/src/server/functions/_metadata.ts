import { z } from 'zod'
import { setDraftSchema } from '@gainsmax/shared'

/**
 * Single source of truth for the agent-callable surface of GainsMax.
 *
 * This metadata drives:
 *   - The Vercel AI SDK tool wrappers (apps/web/src/server/ai/tools.ts)
 *   - The Agent Skill rendered to packages/skill/skills/gainsmax-core/SKILL.md
 *
 * If you add a server function intended for agents, register it here.
 */

export type ServerFnMeta = {
  name: string
  description: string
  method: 'GET' | 'POST'
  url: string
  inputSchema: z.ZodTypeAny
  examples: ReadonlyArray<{ description: string; input: unknown }>
}

export const SERVER_FN_METADATA = {
  logSet: {
    name: 'logSet',
    description:
      'Persist a completed set into the current session. Returns the canonical row with a server-assigned id.',
    method: 'POST',
    url: '/api/serverFn/log-set',
    inputSchema: setDraftSchema,
    examples: [
      {
        description: '225 lb back squat, 5 reps, RPE 8',
        input: { sessionId: 'seed-1', exerciseId: 'Barbell_Squat__standard', weight: 225, reps: 5, rpe: 8 },
      },
    ],
  },

  queryPRs: {
    name: 'queryPRs',
    description:
      'Fetch the top weight (PR proxy) per exercise across all logged sessions. No input.',
    method: 'GET',
    url: '/api/serverFn/list-prs',
    inputSchema: z.object({}),
    examples: [{ description: 'List all PRs', input: {} }],
  },

  generateProgram: {
    name: 'generateProgram',
    description:
      'Generate a multi-week strength program tailored to recent training history and the user’s current Maxx intensity range.',
    method: 'POST',
    url: '/api/serverFn/generate-program',
    inputSchema: z.object({
      weeks: z.number().int().min(1).max(16),
      focus: z.string(),
    }),
    examples: [
      { description: '4-week strength block', input: { weeks: 4, focus: 'strength' } },
      { description: '6-week hypertrophy block', input: { weeks: 6, focus: 'hypertrophy' } },
    ],
  },
} satisfies Record<string, ServerFnMeta>

export type ServerFnName = keyof typeof SERVER_FN_METADATA
