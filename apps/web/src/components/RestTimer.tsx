import { useEffect, useState } from 'react'
import { useSelector } from '@tanstack/react-store'
import { sessionStore, startRestTimer } from '#/state/session-store'

export function RestTimer() {
  const timer = useSelector(sessionStore, (s) => s.restTimer)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!timer) return
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [timer])

  if (!timer) {
    return (
      <button
        type="button"
        onClick={() => startRestTimer(90_000)}
        className="rounded border border-white/15 px-3 py-1 text-xs opacity-70 hover:opacity-100"
      >
        rest 90s (R)
      </button>
    )
  }

  const elapsed = now - timer.startedAt
  const remainingMs = Math.max(0, timer.durationMs - elapsed)
  const seconds = Math.ceil(remainingMs / 1000)
  const done = remainingMs === 0

  return (
    <div
      className={`rounded border px-3 py-1 font-mono text-xs ${
        done ? 'border-emerald-400 text-emerald-400' : 'border-white/30'
      }`}
    >
      {done ? 'GO' : `${seconds}s`}
    </div>
  )
}
