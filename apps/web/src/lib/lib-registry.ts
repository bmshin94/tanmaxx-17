export type LibStatus = 'rc' | 'beta' | 'alpha' | 'new' | 'stable'

export type Library = {
  id: string
  name: string
  color: string
  textOnColor: 'black' | 'white'
  status?: LibStatus
  tagline: string
}

export const LIBRARIES: Record<string, Library> = {
  start: {
    id: 'start',
    name: 'START',
    color: '#22d3ee',
    textOnColor: 'black',
    status: 'rc',
    tagline: 'Full-stack framework: SSR, server fns, API routes',
  },
  router: {
    id: 'router',
    name: 'ROUTER',
    color: '#34d399',
    textOnColor: 'black',
    tagline: 'Type-safe file-based routing',
  },
  query: {
    id: 'query',
    name: 'QUERY',
    color: '#f87171',
    textOnColor: 'black',
    tagline: 'Async state + server-state caching',
  },
  table: {
    id: 'table',
    name: 'TABLE',
    color: '#3b82f6',
    textOnColor: 'white',
    tagline: 'Headless tables & datagrids',
  },
  form: {
    id: 'form',
    name: 'FORM',
    color: '#f59e0b',
    textOnColor: 'black',
    status: 'new',
    tagline: 'Headless, type-safe forms',
  },
  db: {
    id: 'db',
    name: 'DB',
    color: '#fb923c',
    textOnColor: 'black',
    status: 'beta',
    tagline: 'Reactive client-first store w/ collections',
  },
  ai: {
    id: 'ai',
    name: 'AI',
    color: '#ec4899',
    textOnColor: 'black',
    status: 'alpha',
    tagline: 'Type-safe AI SDK with per-provider adapters',
  },
  intent: {
    id: 'intent',
    name: 'INTENT',
    color: '#22d3ee',
    textOnColor: 'black',
    status: 'alpha',
    tagline: 'Ship Agent Skills with your npm packages',
  },
  virtual: {
    id: 'virtual',
    name: 'VIRTUAL',
    color: '#a855f7',
    textOnColor: 'white',
    tagline: 'Virtualize huge lists at 60FPS',
  },
  pacer: {
    id: 'pacer',
    name: 'PACER',
    color: '#a3e635',
    textOnColor: 'black',
    status: 'beta',
    tagline: 'Debounce, throttle, rate-limit, batch',
  },
  hotkeys: {
    id: 'hotkeys',
    name: 'HOTKEYS',
    color: '#f43f5e',
    textOnColor: 'black',
    status: 'alpha',
    tagline: 'Type-safe keyboard shortcuts & sequences',
  },
  store: {
    id: 'store',
    name: 'STORE',
    color: '#b97a56',
    textOnColor: 'white',
    status: 'alpha',
    tagline: 'Framework-agnostic reactive store',
  },
  devtools: {
    id: 'devtools',
    name: 'DEVTOOLS',
    color: '#f1f5f9',
    textOnColor: 'black',
    status: 'alpha',
    tagline: 'Unified devtools panel for the stack',
  },
  config: {
    id: 'config',
    name: 'CONFIG',
    color: '#f1f5f9',
    textOnColor: 'black',
    tagline: 'Lint/build/publish tooling presets',
  },
  cli: {
    id: 'cli',
    name: 'CLI',
    color: '#818cf8',
    textOnColor: 'black',
    status: 'alpha',
    tagline: 'CLI, MCP server, and AI toolkit',
  },
  ranger: {
    id: 'ranger',
    name: 'RANGER',
    color: '#f1f5f9',
    textOnColor: 'black',
    tagline: 'Headless multi-range slider primitives',
  },
  workflow: {
    id: 'workflow',
    name: 'WORKFLOW',
    color: '#14b8a6',
    textOnColor: 'black',
    status: 'alpha',
    tagline: 'Durable, type-safe step orchestration',
  },
}

export type LibId = keyof typeof LIBRARIES
