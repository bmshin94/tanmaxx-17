import { Store } from '@tanstack/store'

const STORAGE_KEY = 'gainsmax.maxx'
const DEFAULT_STATE = { lower: 40, upper: 60 }

export type MaxxState = { lower: number; upper: number }

function readInitial(): MaxxState {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as Partial<MaxxState>
    if (typeof parsed.lower === 'number' && typeof parsed.upper === 'number') {
      return { lower: parsed.lower, upper: parsed.upper }
    }
  } catch {
    // ignore
  }
  return DEFAULT_STATE
}

export const maxxStore = new Store<MaxxState>(DEFAULT_STATE)

let hydrated = false

/** Call once on the client to load persisted state and start writing back on changes. */
export function hydrateMaxxStore() {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  maxxStore.setState(() => readInitial())
  maxxStore.subscribe(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(maxxStore.state))
    } catch {
      // quota errors etc — silent
    }
  })
}

export function setMaxx(next: Partial<MaxxState>) {
  maxxStore.setState((s) => {
    const lower = Math.max(0, Math.min(110, next.lower ?? s.lower))
    const upper = Math.max(0, Math.min(110, next.upper ?? s.upper))
    return { lower: Math.min(lower, upper), upper: Math.max(lower, upper) }
  })
}
