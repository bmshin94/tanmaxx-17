import { Store } from '@tanstack/store'
import type { SetDraft } from '@gainsmax/shared'

export type RestTimer = {
  startedAt: number
  durationMs: number
} | null

export type SessionState = {
  currentExerciseIdx: number
  draftSet: SetDraft | null
  restTimer: RestTimer
}

export const sessionStore = new Store<SessionState>({
  currentExerciseIdx: 0,
  draftSet: null,
  restTimer: null,
})

export function adjustWeight(delta: number) {
  sessionStore.setState((s) => {
    if (!s.draftSet) return s
    return { ...s, draftSet: { ...s.draftSet, weight: Math.max(0, s.draftSet.weight + delta) } }
  })
}

export function adjustReps(delta: number) {
  sessionStore.setState((s) => {
    if (!s.draftSet) return s
    return { ...s, draftSet: { ...s.draftSet, reps: Math.max(0, s.draftSet.reps + delta) } }
  })
}

export function startRestTimer(durationMs: number) {
  sessionStore.setState((s) => ({ ...s, restTimer: { startedAt: Date.now(), durationMs } }))
}
