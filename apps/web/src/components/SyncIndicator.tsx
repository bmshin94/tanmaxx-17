import { useStore } from '@tanstack/react-store'
import { syncStore } from '../state/sync-store'

export function SyncIndicator() {
  const inFlight = useStore(syncStore, (s) => s.inFlight)
  const isSyncing = inFlight > 0

  return (
    <div
      className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${
        isSyncing
          ? 'border border-amber-400/60 bg-amber-400/15 text-amber-200'
          : 'border border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
      }`}
      aria-live="polite"
    >
      {isSyncing ? `syncing · ${inFlight}` : 'synced'}
    </div>
  )
}
