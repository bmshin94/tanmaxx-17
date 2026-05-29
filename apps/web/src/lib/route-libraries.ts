import type { LibId } from './lib-registry'

export type RouteLibraryUsage = {
  lib: LibId
  doing: string
}

export type RouteLibrariesEntry = {
  title: string
  blurb?: string
  libs: RouteLibraryUsage[]
}

const ALWAYS_ON: RouteLibraryUsage[] = [
  { lib: 'start', doing: 'App shell, SSR, server functions, API routes' },
  { lib: 'router', doing: 'File-based routing, type-safe navigation' },
  { lib: 'query', doing: 'Shared cache + SSR-query integration' },
  { lib: 'store', doing: 'Persists The Maxx (0–110) to localStorage' },
  { lib: 'ranger', doing: 'Two-handle Maxx slider in the header' },
  { lib: 'devtools', doing: 'Stacked panels in the bottom-right' },
]

export const ROUTE_LIBRARIES: Record<string, RouteLibrariesEntry> = {
  '/': {
    title: 'Dashboard',
    blurb: 'Reads PRs and recent sessions through query-backed server functions.',
    libs: [
      ...ALWAYS_ON,
      { lib: 'query', doing: 'Loads PRs + recent sessions via server fns' },
    ],
  },
  '/exercises': {
    title: 'Exercises',
    blurb: '5,238 rows virtualized; search runs through Pacer.',
    libs: [
      ...ALWAYS_ON,
      { lib: 'virtual', doing: 'Virtualizes 5,238 catalog rows at 60FPS' },
      { lib: 'pacer', doing: 'Debounces the search input (250ms)' },
      { lib: 'db', doing: 'exercisesCollection reactive client store' },
    ],
  },
  '/programs': {
    title: 'Programs',
    blurb: 'Read-only list of programs from SQLite.',
    libs: [
      ...ALWAYS_ON,
      { lib: 'query', doing: 'Fetches programs from the server' },
    ],
  },
  '/programs/$id': {
    title: 'Program detail',
    blurb: 'Workouts and targets for a single program.',
    libs: [
      ...ALWAYS_ON,
      { lib: 'query', doing: 'Fetches the program by id' },
    ],
  },
  '/session/$id': {
    title: 'Session — live logging',
    blurb: 'Keyboard-first set logger with optimistic DB writes and an NL parser.',
    libs: [
      ...ALWAYS_ON,
      { lib: 'form', doing: 'Numeric weight / reps / RPE form' },
      { lib: 'hotkeys', doing: 'space / ↑↓ / ←→ / r / s / [ ] / gg gh gs / ?' },
      { lib: 'db', doing: 'setsCollection optimistic insert + sync indicator' },
      { lib: 'store', doing: 'Session state: current exercise, rest timer' },
      { lib: 'ai', doing: 'NL set parser via generateObject' },
    ],
  },
  '/history': {
    title: 'History',
    blurb: 'Joined sets/sessions/exercises through a sortable react-table.',
    libs: [
      ...ALWAYS_ON,
      { lib: 'table', doing: 'Sortable joined history table' },
      { lib: 'query', doing: 'Fetches the joined history rows' },
    ],
  },
  '/agent': {
    title: 'Agent',
    blurb: 'Streaming chat with tool calls (logSet / queryPRs / generateProgram).',
    libs: [
      ...ALWAYS_ON,
      { lib: 'ai', doing: 'Streaming useChat + Anthropic tools' },
      { lib: 'workflow', doing: 'generateProgram runs as a 4-step durable workflow' },
      { lib: 'intent', doing: 'Skill ships in packages/skill (gen:skill)' },
    ],
  },
}

export function getRouteLibraries(routeId: string | undefined): RouteLibrariesEntry {
  if (routeId && ROUTE_LIBRARIES[routeId]) return ROUTE_LIBRARIES[routeId]
  return { title: 'GainsMax', libs: ALWAYS_ON }
}
