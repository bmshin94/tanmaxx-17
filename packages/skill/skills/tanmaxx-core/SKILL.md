---
name: tanmaxx-core
description: >
  Programmatically drive the TanMaxx lifting tracker. Use this skill when an
  agent needs to log sets (logSet), inspect personal records (queryPRs), or
  request a Maxx-tuned training program (generateProgram) from a running
  TanMaxx instance. All entrypoints are TanStack Start server functions that
  validate input with Zod and accept the same shapes used inside the app.
type: core
library: tanmaxx
library_version: "0.1.0"
---

# TanMaxx — Agent API

TanMaxx exposes three agent-callable server functions. They live in a TanStack Start app and are reachable from any client that can POST JSON to the running server.

| Function          | Purpose                                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `logSet`          | Persist a completed set into the current session.                                                                       |
| `queryPRs`        | Fetch the top weight (PR proxy) per exercise across all logged sessions.                                                |
| `generateProgram` | Generate a multi-week strength program tailored to recent training history and the user’s current Maxx intensity range. |

The Maxx slider (lower–upper, range 0–110) is the intensity authority. Read it from localStorage key `tanmaxx.maxx` (`{ lower: number; upper: number }`) before calling `generateProgram`.

## Entrypoints

### `logSet`

Persist a completed set into the current session. Returns the canonical row with a server-assigned id.

- **Method:** `POST`
- **URL:** `/api/serverFn/log-set`

**Input schema (JSON Schema draft-07):**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "sessionId": {
      "type": "string"
    },
    "exerciseId": {
      "type": "string"
    },
    "weight": {
      "type": "number",
      "minimum": 0
    },
    "reps": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "rpe": {
      "anyOf": [
        {
          "type": "number",
          "minimum": 1,
          "maximum": 10
        },
        {
          "type": "null"
        }
      ]
    }
  },
  "required": ["sessionId", "exerciseId", "weight", "reps", "rpe"],
  "additionalProperties": false
}
```

**Examples:**

- 225 lb back squat, 5 reps, RPE 8
  ```json
  {
    "sessionId": "seed-1",
    "exerciseId": "Barbell_Squat__standard",
    "weight": 225,
    "reps": 5,
    "rpe": 8
  }
  ```

---

### `queryPRs`

Fetch the top weight (PR proxy) per exercise across all logged sessions. No input.

- **Method:** `GET`
- **URL:** `/api/serverFn/list-prs`

**Input schema (JSON Schema draft-07):**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {},
  "additionalProperties": false
}
```

**Examples:**

- List all PRs
  ```json
  {}
  ```

---

### `generateProgram`

Generate a multi-week strength program tailored to recent training history and the user’s current Maxx intensity range.

- **Method:** `POST`
- **URL:** `/api/serverFn/generate-program`

**Input schema (JSON Schema draft-07):**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "weeks": {
      "type": "integer",
      "minimum": 1,
      "maximum": 16
    },
    "focus": {
      "type": "string"
    }
  },
  "required": ["weeks", "focus"],
  "additionalProperties": false
}
```

**Examples:**

- 4-week strength block
  ```json
  {
    "weeks": 4,
    "focus": "strength"
  }
  ```
- 6-week hypertrophy block
  ```json
  {
    "weeks": 6,
    "focus": "hypertrophy"
  }
  ```

## When to compose

- A user says "log three by five at 225": call `logSet` with `{ sessionId, exerciseId, weight: 225, reps: 5 }`.
- A user asks "what are my PRs?": call `queryPRs` (no input).
- A user asks "build me a 4-week strength program": call `generateProgram` with the user's Maxx range injected into the prompt context.

This file is auto-generated from `apps/web/src/server/functions/_metadata.ts` via `pnpm gen:skill`. Do not edit by hand.
