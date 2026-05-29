import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { useStore } from '@tanstack/react-store'
import { exercisesCollection, setsCollection } from '../db/collections'
import { useCollectionArray } from '../db/use-collection'
import { sessionStore } from '../state/session-store'
import { ensureSession } from '../server/functions/ensure-session'
import { getSession } from '../server/functions/get-session'
import { useAppHotkeys } from '../hooks/use-app-hotkeys'
import { HotkeyOverlay } from '../components/HotkeyOverlay'
import { RestTimer } from '../components/RestTimer'
import { NLSetInput } from '../components/NLSetInput'
import { RouteError } from '../components/Skeleton'
import { SyncIndicator } from '../components/SyncIndicator'

export const Route = createFileRoute('/session/$id')({
  component: Session,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
})

function Session() {
  const { id: sessionId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const exercises = useCollectionArray(exercisesCollection)
  const currentExerciseIdx = useStore(sessionStore, (s) => s.currentExerciseIdx)
  const [overlayOpen, setOverlayOpen] = useState(false)

  // Ensure session row exists, then load sets.
  useQuery({
    queryKey: ['ensure-session', sessionId],
    queryFn: () => ensureSession({ data: { id: sessionId } }),
  })

  const sessionQuery = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSession({ data: { id: sessionId } }),
    refetchInterval: 2000,
  })

  const currentExercise = exercises[currentExerciseIdx % Math.max(1, exercises.length)]

  const form = useForm({
    defaultValues: { weight: 135, reps: 5, rpe: null as number | null },
    onSubmit: async ({ value }) => {
      if (!currentExercise) return
      setsCollection.insert({
        id: crypto.randomUUID(),
        sessionId,
        exerciseId: currentExercise.id,
        weight: value.weight,
        reps: value.reps,
        rpe: value.rpe,
        loggedAt: Date.now(),
      })
      // Re-fetch from server (the server fn is the source of truth).
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['session', sessionId] }), 80)
    },
  })

  useAppHotkeys({
    'log-set': () => form.handleSubmit(),
    'weight-up': () => form.setFieldValue('weight', (v) => Math.max(0, (v ?? 0) + 5)),
    'weight-down': () => form.setFieldValue('weight', (v) => Math.max(0, (v ?? 0) - 5)),
    'reps-up': () => form.setFieldValue('reps', (v) => Math.max(0, (v ?? 0) + 1)),
    'reps-down': () => form.setFieldValue('reps', (v) => Math.max(0, (v ?? 0) - 1)),
    'rest': () => sessionStore.setState((s) => ({ ...s, restTimer: { startedAt: Date.now(), durationMs: 90_000 } })),
    'skip': () => sessionStore.setState((s) => ({ ...s, currentExerciseIdx: s.currentExerciseIdx + 1 })),
    'prev-exercise': () => sessionStore.setState((s) => ({ ...s, currentExerciseIdx: Math.max(0, s.currentExerciseIdx - 1) })),
    'next-exercise': () => sessionStore.setState((s) => ({ ...s, currentExerciseIdx: s.currentExerciseIdx + 1 })),
    'nav-dashboard': () => navigate({ to: '/' }),
    'nav-history': () => navigate({ to: '/history' }),
    'nav-session': () => {},
    'toggle-overlay': () => setOverlayOpen((o) => !o),
  })

  // Reset rest timer back to null when it elapses (so the UI flips back).
  useEffect(() => {
    const id = setInterval(() => {
      const t = sessionStore.state.restTimer
      if (t && Date.now() - t.startedAt > t.durationMs + 4000) {
        sessionStore.setState((s) => ({ ...s, restTimer: null }))
      }
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const setsForSession = sessionQuery.data?.sets ?? []

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Session</h1>
        <div className="flex items-center gap-2">
          <SyncIndicator />
          <span className="font-mono text-xs opacity-50">{sessionId}</span>
        </div>
      </div>

      {currentExercise ? (
        <div className="rounded border border-white/15 bg-black/30 p-4">
          <div className="text-xs uppercase tracking-wide opacity-50">
            Exercise {currentExerciseIdx + 1}
          </div>
          <div className="text-lg font-semibold">{currentExercise.name}</div>
          <div className="text-xs opacity-60">
            {currentExercise.equipment} · target {currentExercise.defaultRepRange[0]}–
            {currentExercise.defaultRepRange[1]}
          </div>
        </div>
      ) : (
        <div className="text-sm opacity-60">Loading exercises…</div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2"
      >
        <form.Field name="weight">
          {(field) => (
            <label className="flex flex-col text-xs opacity-70">
              Weight
              <input
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                className="mt-1 rounded border border-white/15 bg-black/30 px-2 py-1 text-sm text-white outline-none focus:border-white/40"
              />
            </label>
          )}
        </form.Field>
        <form.Field name="reps">
          {(field) => (
            <label className="flex flex-col text-xs opacity-70">
              Reps
              <input
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                className="mt-1 rounded border border-white/15 bg-black/30 px-2 py-1 text-sm text-white outline-none focus:border-white/40"
              />
            </label>
          )}
        </form.Field>
        <form.Field name="rpe">
          {(field) => (
            <label className="flex flex-col text-xs opacity-70">
              RPE
              <input
                type="number"
                step="0.5"
                min="1"
                max="10"
                value={field.state.value ?? ''}
                onChange={(e) =>
                  field.handleChange(e.target.value === '' ? null : Number(e.target.value))
                }
                className="mt-1 rounded border border-white/15 bg-black/30 px-2 py-1 text-sm text-white outline-none focus:border-white/40"
              />
            </label>
          )}
        </form.Field>
        <button
          type="submit"
          data-log-button
          className="self-end rounded bg-white px-4 py-1 text-sm font-bold text-black hover:bg-white/90"
        >
          Log set (␣)
        </button>
      </form>

      <div className="flex items-center justify-between text-xs opacity-70">
        <span>
          [ / ] cycle exercises · arrows tune weight/reps · ? for help
        </span>
        <RestTimer />
      </div>

      <NLSetInput
        onParsed={(p) => {
          if (!currentExercise) return
          setsCollection.insert({
            id: crypto.randomUUID(),
            sessionId,
            exerciseId: currentExercise.id,
            weight: p.weight,
            reps: p.reps,
            rpe: p.rpe,
            loggedAt: Date.now(),
          })
          setTimeout(
            () => queryClient.invalidateQueries({ queryKey: ['session', sessionId] }),
            80,
          )
        }}
      />

      <div>
        <div className="mb-2 text-xs uppercase tracking-wide opacity-50">
          Logged this session ({setsForSession.length})
        </div>
        {setsForSession.length === 0 ? (
          <div className="text-sm opacity-50">No sets yet — hit space to log one.</div>
        ) : (
          <ul className="divide-y divide-white/5 rounded border border-white/10">
            {setsForSession
              .slice()
              .reverse()
              .map((s) => (
                <li key={s.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="opacity-70">{exerciseNameOf(exercises, s.exerciseId)}</span>
                  <span className="font-mono">
                    {s.weight} × {s.reps}
                    {s.rpe !== null ? ` @ ${s.rpe}` : ''}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>

      <HotkeyOverlay open={overlayOpen} onClose={() => setOverlayOpen(false)} />
    </section>
  )
}

function exerciseNameOf(
  exercises: ReadonlyArray<{ id: string; name: string }>,
  id: string,
): string {
  return exercises.find((e) => e.id === id)?.name ?? id
}
