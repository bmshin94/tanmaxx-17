import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { toJSONSchema } from 'zod'
import { SERVER_FN_METADATA } from '../src/server/functions/_metadata.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
const SKILL_PATH = resolve(ROOT, '../packages/skill/skills/gainsmax-core/SKILL.md')

const META_VERSION = '0.1.0'

function renderFn(meta: (typeof SERVER_FN_METADATA)[keyof typeof SERVER_FN_METADATA]): string {
  const schema = toJSONSchema(meta.inputSchema, { target: 'draft-07' })
  const examples = meta.examples
    .map(
      (ex) =>
        `- ${ex.description}\n  \`\`\`json\n${JSON.stringify(ex.input, null, 2)}\n  \`\`\``,
    )
    .join('\n')
  return [
    `### \`${meta.name}\``,
    '',
    meta.description,
    '',
    `- **Method:** \`${meta.method}\``,
    `- **URL:** \`${meta.url}\``,
    '',
    `**Input schema (JSON Schema draft-07):**`,
    '```json',
    JSON.stringify(schema, null, 2),
    '```',
    '',
    `**Examples:**`,
    examples,
  ].join('\n')
}

const FRONTMATTER = `---
name: gainsmax-core
description: >
  Programmatically drive the GainsMax lifting tracker. Use this skill when an
  agent needs to log sets (logSet), inspect personal records (queryPRs), or
  request a Maxx-tuned training program (generateProgram) from a running
  GainsMax instance. All entrypoints are TanStack Start server functions that
  validate input with Zod and accept the same shapes used inside the app.
type: core
library: gainsmax
library_version: '${META_VERSION}'
---
`

const BODY = `
# GainsMax — Agent API

GainsMax exposes three agent-callable server functions. They live in a TanStack Start app and are reachable from any client that can POST JSON to the running server.

| Function | Purpose |
|---|---|
${Object.values(SERVER_FN_METADATA).map((m) => `| \`${m.name}\` | ${m.description.split('.')[0]}. |`).join('\n')}

The Maxx slider (lower–upper, range 0–110) is the intensity authority. Read it from localStorage key \`gainsmax.maxx\` (\`{ lower: number; upper: number }\`) before calling \`generateProgram\`.

## Entrypoints

${Object.values(SERVER_FN_METADATA).map(renderFn).join('\n\n---\n\n')}

## When to compose

- A user says "log three by five at 225": call \`logSet\` with \`{ sessionId, exerciseId, weight: 225, reps: 5 }\`.
- A user asks "what are my PRs?": call \`queryPRs\` (no input).
- A user asks "build me a 4-week strength program": call \`generateProgram\` with the user's Maxx range injected into the prompt context.

This file is auto-generated from \`apps/web/src/server/functions/_metadata.ts\` via \`pnpm gen:skill\`. Do not edit by hand.
`

const out = FRONTMATTER + BODY

mkdirSync(dirname(SKILL_PATH), { recursive: true })
writeFileSync(SKILL_PATH, out)
console.log(`Wrote ${SKILL_PATH}`)
