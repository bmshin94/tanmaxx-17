import { useEffect, useRef, useState } from 'react'
import { useMatches } from '@tanstack/react-router'
import { getRouteLibraries } from '../lib/route-libraries'
import { LIBRARIES } from '../lib/lib-registry'
import { LibraryPill } from './LibraryPill'

const AUTO_OPEN_MS = 4_000
const FLASH_MS = 600

export function RouteLibsBadge() {
  const [open, setOpen] = useState(false)
  const [flashing, setFlashing] = useState(false)
  const matches = useMatches()
  const leaf = matches[matches.length - 1]
  const routeId = leaf?.routeId
  const entry = getRouteLibraries(routeId)
  const title = entry.title.toLowerCase()

  // Auto-flash the badge whenever the route changes.
  const prevRouteRef = useRef<string | undefined>(routeId)
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (prevRouteRef.current === routeId) return
    prevRouteRef.current = routeId
    setFlashing(true)
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
    flashTimerRef.current = setTimeout(() => setFlashing(false), FLASH_MS)
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
    }
  }, [routeId])

  // One-shot: auto-open the panel on first mount, auto-close after 4s.
  // Cancelled if the user interacts with the badge during that window.
  const autoOpenedRef = useRef(false)
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (autoOpenedRef.current) return
    autoOpenedRef.current = true
    setOpen(true)
    autoCloseTimerRef.current = setTimeout(() => {
      setOpen(false)
      autoCloseTimerRef.current = null
    }, AUTO_OPEN_MS)
    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current)
    }
  }, [])

  const cancelAutoClose = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current)
      autoCloseTimerRef.current = null
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          cancelAutoClose()
          setOpen((v) => !v)
        }}
        className={`fixed bottom-3 left-3 z-40 flex items-center gap-2 rounded-full border border-white/20 bg-black/85 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur transition-all duration-300 hover:bg-black ${
          flashing ? 'scale-110 ring-2 ring-cyan-400/60' : 'scale-100 ring-0 ring-transparent'
        }`}
        aria-expanded={open}
        aria-controls="route-libs-panel"
      >
        <span
          aria-hidden
          className="inline-block size-2 rounded-full"
          style={{ background: '#22d3ee', boxShadow: '0 0 6px #22d3ee' }}
        />
        <span className="opacity-90">{title}</span>
        <span className="opacity-40">·</span>
        <span>
          {entry.libs.length} <span className="opacity-60">libs</span>
        </span>
      </button>

      {open ? (
        <div
          id="route-libs-panel"
          role="dialog"
          aria-label="TanStack libraries on this route"
          className="fixed bottom-16 left-3 z-40 w-[min(420px,calc(100vw-1.5rem))] rounded-lg border border-white/15 bg-black/90 p-3 shadow-2xl backdrop-blur"
        >
          <div className="mb-2 flex items-baseline justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider opacity-60">On this route</div>
              <div className="text-sm font-bold">{entry.title}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                cancelAutoClose()
                setOpen(false)
              }}
              className="rounded p-1 text-xs opacity-60 hover:opacity-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          {entry.blurb ? <p className="mb-3 text-xs opacity-70">{entry.blurb}</p> : null}
          <ul className="space-y-2">
            {entry.libs.map((u, i) => {
              const lib = LIBRARIES[u.lib]
              return (
                <li key={`${u.lib}-${i}`} className="flex items-start gap-2">
                  <div className="shrink-0 pt-0.5">
                    <LibraryPill libId={u.lib} size="sm" />
                  </div>
                  <div className="text-xs leading-snug">
                    <span className="opacity-90">{u.doing}</span>
                    <span className="ml-1 opacity-50">— {lib.tagline}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </>
  )
}
