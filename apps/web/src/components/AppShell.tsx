import { Link, useMatches } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { MaxxSlider } from './Maxx/MaxxSlider'
import { getRouteLibraries } from '../lib/route-libraries'

const NAV = [
  { to: '/', label: 'Dashboard' },
  { to: '/exercises', label: 'Exercises' },
  { to: '/programs', label: 'Programs' },
  { to: '/history', label: 'History' },
  { to: '/agent', label: 'Agent' },
] as const

export function AppShell({ children }: { children: ReactNode }) {
  const matches = useMatches()
  const leaf = matches[matches.length - 1]
  const libCount = getRouteLibraries(leaf?.routeId).libs.length

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-black tracking-tight">
            TanMaxx
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="opacity-70 hover:opacity-100 [&.active]:opacity-100 [&.active]:underline"
                activeOptions={{ exact: item.to === '/' }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-xs">
            <MaxxSlider />
            <div data-maxx-counter className="rounded border border-white/20 px-2 py-1 font-mono">
              MAXX {libCount}/17
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  )
}
