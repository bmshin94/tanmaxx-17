import { createCollection } from '@tanstack/db'
import type { Exercise, Session, Set } from '@tanmaxx/shared'
import { listExercises } from '#/server/functions/list-exercises'
import { listSessions } from '#/server/functions/list-sessions'
import { logSet } from '#/server/functions/log-set'
import { beginSync, endSync } from '#/state/sync-store'

function makeFetchSync<T extends { id: string }>(load: () => Promise<T[]>) {
  return (params: {
    begin: () => void
    write: (msg: { type: 'insert'; value: T }) => void
    commit: () => void
    markReady: () => void
  }) => {
    load().then((rows) => {
      params.begin()
      for (const value of rows) params.write({ type: 'insert', value })
      params.commit()
      params.markReady()
    })
  }
}

export const exercisesCollection = createCollection<Exercise>({
  id: 'exercises',
  getKey: (item) => item.id,
  sync: { sync: makeFetchSync(listExercises) },
})

export const sessionsCollection = createCollection<Session>({
  id: 'sessions',
  getKey: (item) => item.id,
  sync: { sync: makeFetchSync(listSessions) },
})

export const setsCollection = createCollection<Set>({
  id: 'sets',
  getKey: (item) => item.id,
  sync: {
    sync: ({ markReady }) => {
      // Sets are loaded per-session in Phase 3 via getSession.
      markReady()
    },
  },
  onInsert: async ({ transaction }) => {
    beginSync()
    try {
      for (const mutation of transaction.mutations) {
        const m = mutation.modified
        // Pass the client-generated id and timestamp so the persisted row matches
        // the optimistic one — avoids ghost duplicates when the query refetches.
        await logSet({
          data: {
            id: m.id,
            loggedAt: m.loggedAt,
            sessionId: m.sessionId,
            exerciseId: m.exerciseId,
            weight: m.weight,
            reps: m.reps,
            rpe: m.rpe,
          },
        })
      }
    } finally {
      endSync()
    }
  },
})
