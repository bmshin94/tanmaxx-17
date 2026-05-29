import { Store } from '@tanstack/store'

export const syncStore = new Store<{ inFlight: number }>({ inFlight: 0 })

export function beginSync() {
  syncStore.setState((s) => ({ inFlight: s.inFlight + 1 }))
}

export function endSync() {
  syncStore.setState((s) => ({ inFlight: Math.max(0, s.inFlight - 1) }))
}
