import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDb, schema } from '../db/client.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))

type RawExercise = {
  id: string
  name: string
  force: string | null
  level: string
  mechanic: string | null
  equipment: string | null
  primaryMuscles: string[]
  secondaryMuscles: string[]
  category: string
}

const GRIPS = ['standard', 'wide', 'close', 'reverse', 'neutral', 'mixed'] as const

const REP_RANGES: Record<string, [number, number]> = {
  strength: [3, 8],
  powerlifting: [1, 5],
  strongman: [3, 8],
  'olympic weightlifting': [1, 3],
  plyometrics: [5, 15],
  stretching: [10, 20],
  cardio: [10, 30],
}

const DAY = 24 * 60 * 60 * 1000

function repRangeFor(category: string): [number, number] {
  return REP_RANGES[category] ?? [8, 12]
}

function variantsFor(base: RawExercise): Array<{ id: string; grip: string }> {
  return GRIPS.map((grip) => ({ id: `${base.id}__${grip}`, grip }))
}

function findExerciseId(rows: ReadonlyArray<{ id: string; name: string }>, query: string): string {
  const q = query.toLowerCase()
  const hit = rows.find((r) => r.name.toLowerCase().includes(q) && r.id.endsWith('__standard'))
  return hit?.id ?? rows[0].id
}

function seedExercises() {
  const jsonPath = resolve(__dirname, 'free-exercise-db.json')
  const raw = JSON.parse(readFileSync(jsonPath, 'utf-8')) as RawExercise[]

  const rows = raw.flatMap((base) => {
    const [repMin, repMax] = repRangeFor(base.category)
    const muscles = [...base.primaryMuscles, ...base.secondaryMuscles]
    return variantsFor(base).map((v) => ({
      id: v.id,
      name: v.grip ? `${base.name} (${v.grip} grip)` : base.name,
      muscles,
      equipment: base.equipment ?? 'none',
      grip: v.grip,
      defaultRepMin: repMin,
      defaultRepMax: repMax,
    }))
  })

  const db = getDb()
  db.delete(schema.exercises).run()

  const batchSize = 200
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize)
    db.insert(schema.exercises).values(chunk).run()
  }
  return rows
}

function seedDemoData(rows: ReadonlyArray<{ id: string; name: string }>) {
  const db = getDb()

  // Wipe demo-tagged rows so the seed is idempotent.
  db.delete(schema.programs).run()
  db.delete(schema.sessions).run()
  db.delete(schema.sets).run()

  const squat = findExerciseId(rows, 'barbell squat')
  const bench = findExerciseId(rows, 'barbell bench press')
  const dead = findExerciseId(rows, 'deadlift')
  const row = findExerciseId(rows, 'bent over')
  const press = findExerciseId(rows, 'overhead press')

  db.insert(schema.programs)
    .values({
      id: 'linear-ish',
      name: 'Linear-ish',
      workouts: [
        {
          id: 'day-a',
          name: 'Day A — Squat / Bench',
          targets: [
            { exerciseId: squat, sets: 5, reps: 5, intensityPct: 80 },
            { exerciseId: bench, sets: 5, reps: 5, intensityPct: 75 },
            { exerciseId: row, sets: 3, reps: 8, intensityPct: 65 },
          ],
        },
        {
          id: 'day-b',
          name: 'Day B — Deadlift / Press',
          targets: [
            { exerciseId: dead, sets: 3, reps: 5, intensityPct: 85 },
            { exerciseId: press, sets: 5, reps: 5, intensityPct: 70 },
          ],
        },
      ],
    })
    .run()

  const now = Date.now()
  const sessionRows = [
    {
      id: 'demo-1',
      programId: 'linear-ish',
      workoutId: 'day-a',
      startedAt: now - 4 * DAY,
      endedAt: now - 4 * DAY + 60 * 60 * 1000,
    },
    {
      id: 'demo-2',
      programId: 'linear-ish',
      workoutId: 'day-b',
      startedAt: now - 2 * DAY,
      endedAt: now - 2 * DAY + 55 * 60 * 1000,
    },
    {
      id: 'seed-1',
      programId: 'linear-ish',
      workoutId: 'day-a',
      startedAt: now,
      endedAt: null,
    },
  ]
  db.insert(schema.sessions).values(sessionRows).run()

  const setRows = [
    // demo-1: Day A
    { id: 's1-1', sessionId: 'demo-1', exerciseId: squat, weight: 225, reps: 5, rpe: 7, loggedAt: now - 4 * DAY + 5 * 60_000 },
    { id: 's1-2', sessionId: 'demo-1', exerciseId: squat, weight: 235, reps: 5, rpe: 8, loggedAt: now - 4 * DAY + 10 * 60_000 },
    { id: 's1-3', sessionId: 'demo-1', exerciseId: squat, weight: 245, reps: 5, rpe: 9, loggedAt: now - 4 * DAY + 15 * 60_000 },
    { id: 's1-4', sessionId: 'demo-1', exerciseId: bench, weight: 175, reps: 5, rpe: 7.5, loggedAt: now - 4 * DAY + 25 * 60_000 },
    { id: 's1-5', sessionId: 'demo-1', exerciseId: bench, weight: 185, reps: 5, rpe: 8.5, loggedAt: now - 4 * DAY + 30 * 60_000 },
    { id: 's1-6', sessionId: 'demo-1', exerciseId: row, weight: 135, reps: 8, rpe: null, loggedAt: now - 4 * DAY + 40 * 60_000 },
    // demo-2: Day B
    { id: 's2-1', sessionId: 'demo-2', exerciseId: dead, weight: 315, reps: 5, rpe: 8, loggedAt: now - 2 * DAY + 5 * 60_000 },
    { id: 's2-2', sessionId: 'demo-2', exerciseId: dead, weight: 335, reps: 5, rpe: 9, loggedAt: now - 2 * DAY + 12 * 60_000 },
    { id: 's2-3', sessionId: 'demo-2', exerciseId: dead, weight: 355, reps: 3, rpe: 9.5, loggedAt: now - 2 * DAY + 18 * 60_000 },
    { id: 's2-4', sessionId: 'demo-2', exerciseId: press, weight: 115, reps: 5, rpe: 7, loggedAt: now - 2 * DAY + 30 * 60_000 },
    { id: 's2-5', sessionId: 'demo-2', exerciseId: press, weight: 125, reps: 5, rpe: 8, loggedAt: now - 2 * DAY + 35 * 60_000 },
    { id: 's2-6', sessionId: 'demo-2', exerciseId: press, weight: 130, reps: 4, rpe: 9, loggedAt: now - 2 * DAY + 40 * 60_000 },
  ]
  db.insert(schema.sets).values(setRows).run()
}

function main() {
  const exercises = seedExercises()
  seedDemoData(exercises)
  console.log(
    `Seeded ${exercises.length} exercises + 1 program (Linear-ish) + 2 prior sessions + 1 live session (seed-1).`,
  )
}

main()
