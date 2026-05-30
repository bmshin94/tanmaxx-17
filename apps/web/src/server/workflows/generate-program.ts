import {
  createWorkflow,
  inMemoryRunStore,
  runWorkflow,
} from '@tanstack/workflow-core'
import { chat } from '@tanstack/ai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { z } from 'zod'
import { programSchema, type Program } from '@tanmaxx/shared'

// Loose mirror of programSchema without numeric constraints. Anthropic's
// structured-output endpoint rejects `minimum`/`maximum`/`multipleOf` keywords,
// so we shape-match the model output, then run the strict `programSchema`
// against the result inside the workflow's `validate` step.
const programAiSchema = z.object({
  id: z.string(),
  name: z.string(),
  workouts: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      targets: z.array(
        z.object({
          exerciseId: z.string(),
          sets: z.number(),
          reps: z.number(),
          intensityPct: z.number(),
        }),
      ),
    }),
  ),
})
import { MODEL_SMART } from '../ai/anthropic'
import { listPRs } from '../functions/list-prs'
import { listHistory } from '../functions/list-history'
import { getDb, schema } from '../db/client'

export type WorkflowStepReport = {
  stepId: string
  status: 'finished' | 'failed'
  durationMs?: number
  error?: string
}

export const generateProgramWorkflow = createWorkflow({
  id: 'generate-program',
  input: z.object({
    weeks: z.number().int().min(1).max(16),
    focus: z.string(),
    lower: z.number(),
    upper: z.number(),
  }),
}).handler(async (ctx) => {
  const history = await ctx.step('fetchHistory', async () => {
    const [prs, recent] = await Promise.all([listPRs(), listHistory()])
    return { prs: prs.slice(0, 10), recent: recent.slice(0, 10) }
  })

  const proposed = await ctx.step('proposeStructure', async () => {
    const prompt = [
      `Design a ${ctx.input.weeks}-week ${ctx.input.focus} program.`,
      `Intensity range: ${ctx.input.lower}% to ${ctx.input.upper}% of 1RM (Maxx slider).`,
      `Recent PRs: ${JSON.stringify(history.prs)}`,
      `Sample history: ${JSON.stringify(history.recent)}`,
      `Return a Program object with workouts[] and per-exercise targets.`,
    ].join('\n')

    return await chat({
      adapter: anthropicText(MODEL_SMART),
      messages: [{ role: 'user', content: prompt }],
      outputSchema: programAiSchema,
    })
  })

  const validated = await ctx.step('validate', async () => programSchema.parse(proposed))

  const persisted = await ctx.step('persist', async () => {
    const row: Program = {
      id: `gen-${crypto.randomUUID()}`,
      name: validated.name,
      workouts: validated.workouts,
    }
    getDb().insert(schema.programs).values(row).run()
    return row
  })

  return persisted
})

export async function runGenerateProgram(input: {
  weeks: number
  focus: string
  lower: number
  upper: number
}): Promise<{ program: Program; steps: WorkflowStepReport[] }> {
  const steps: WorkflowStepReport[] = []
  const startedAt = new Map<string, number>()
  let program: Program | undefined
  let runError: string | undefined

  for await (const event of runWorkflow({
    workflow: generateProgramWorkflow,
    input,
    runStore: inMemoryRunStore(),
  })) {
    switch (event.type) {
      case 'STEP_STARTED':
        startedAt.set(event.stepId, event.ts)
        break
      case 'STEP_FINISHED': {
        const start = startedAt.get(event.stepId)
        steps.push({
          stepId: event.stepId,
          status: 'finished',
          durationMs: start ? event.ts - start : undefined,
        })
        break
      }
      case 'STEP_FAILED': {
        const start = startedAt.get(event.stepId)
        steps.push({
          stepId: event.stepId,
          status: 'failed',
          durationMs: start ? event.ts - start : undefined,
          error: event.error.message,
        })
        break
      }
      case 'RUN_FINISHED':
        program = event.output as Program
        break
      case 'RUN_ERRORED':
        runError = event.error.message
        break
      default:
        break
    }
  }

  if (runError) throw new Error(runError)
  if (!program) throw new Error('generate-program workflow finished without output')

  return { program, steps }
}
