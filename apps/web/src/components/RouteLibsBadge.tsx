import { useState } from 'react'
import { useMatches } from '@tanstack/react-router'
import { getRouteLibraries } from '../lib/route-libraries'
import { LIBRARIES } from '../lib/lib-registry'
import { LibraryPill } from './LibraryPill'

export function RouteLibsBadge() {
  const [open, setOpen] = useState(false)
  const matches = useMatches()
  const leaf = matches[matches.length - 1]
  const routeId = leaf?.routeId
  const entry = getRouteLibraries(routeId)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-3 left-3 z-40 flex items-center gap-2 rounded-full border border-white/20 bg-black/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur hover:bg-black"
        aria-expanded={open}
        aria-controls="route-libs-panel"
      >
        <span
          aria-hidden
          className="inline-block size-2 rounded-full"
          style={{ background: '#22d3ee', boxShadow: '0 0 6px #22d3ee' }}
        />
        TanStack · {entry.libs.length}
      </button>

      {open ? (
        <div
          id="route-libs-panel"
          role="dialog"
          aria-label="TanStack libraries on this route"
          className="fixed bottom-14 left-3 z-40 w-[min(420px,calc(100vw-1.5rem))] rounded-lg border border-white/15 bg-black/90 p-3 shadow-2xl backdrop-blur"
        >
          <div className="mb-2 flex items-baseline justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider opacity-60">On this route</div>
              <div className="text-sm font-bold">{entry.title}</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-xs opacity-60 hover:opacity-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          {entry.blurb ? (
            <p className="mb-3 text-xs opacity-70">{entry.blurb}</p>
          ) : null}
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
