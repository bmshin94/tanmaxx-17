import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const exercises = sqliteTable('exercises', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  muscles: text('muscles', { mode: 'json' }).$type<string[]>().notNull(),
  equipment: text('equipment').notNull(),
  grip: text('grip'),
  defaultRepMin: integer('default_rep_min').notNull(),
  defaultRepMax: integer('default_rep_max').notNull(),
})

export const programs = sqliteTable('programs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  workouts: text('workouts', { mode: 'json' }).$type<unknown[]>().notNull(),
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  programId: text('program_id'),
  workoutId: text('workout_id'),
  startedAt: integer('started_at').notNull(),
  endedAt: integer('ended_at'),
})

export const sets = sqliteTable('sets', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  exerciseId: text('exercise_id').notNull(),
  weight: real('weight').notNull(),
  reps: integer('reps').notNull(),
  rpe: real('rpe'),
  loggedAt: integer('logged_at').notNull(),
})
