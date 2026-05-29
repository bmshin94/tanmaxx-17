import { useEffect, useState } from 'react'
import type { Collection } from '@tanstack/db'
import { exercisesCollection, sessionsCollection, setsCollection } from '../../db/collections'

type CollectionLike = Collection<any, any, any, any, any>

const REGISTRY: ReadonlyArray<{ id: string; label: string; collection: CollectionLike }> = [
  { id: 'exercises', label: 'exercises', collection: exercisesCollection as CollectionLike },
  { id: 'sessions', label: 'sessions', collection: sessionsCollection as CollectionLike },
  { id: 'sets', label: 'sets', collection: setsCollection as CollectionLike },
]

type Snapshot = {
  status: string
  size: number
  subscriberCount: number
  sampleKeys: string[]
}

function snapshotOf(c: CollectionLike): Snapshot {
  let sampleKeys: string[] = []
  try {
    const entries = Array.from(c.state.keys()) as Array<string | number>
    sampleKeys = entries.slice(0, 8).map(String)
  } catch {
    sampleKeys = []
  }
  return {
    status: String(c.status ?? 'unknown'),
    size: Number(c.size ?? 0),
    subscriberCount: Number(c.subscriberCount ?? 0),
    sampleKeys,
  }
}

function useCollectionSnapshot(c: CollectionLike): Snapshot {
  const [snap, setSnap] = useState<Snapshot>(() => snapshotOf(c))
  useEffect(() => {
    const tick = () => setSnap(snapshotOf(c))
    const sub = c.subscribeChanges(tick)
    void c.preload()
    const poll = setInterval(tick, 500)
    return () => {
      sub.unsubscribe()
      clearInterval(poll)
    }
  }, [c])
  return snap
}

export function CollectionsDevtoolsPanel() {
  const [selectedId, setSelectedId] = useState<string>(REGISTRY[0].id)
  const selected = REGISTRY.find((r) => r.id === selectedId) ?? REGISTRY[0]

  return (
    <div className="flex h-full min-h-[200px] flex-col gap-3 p-3 text-xs text-white">
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <div className="text-[10px] uppercase tracking-widest opacity-50">
          TanStack DB · Collections
        </div>
        <div className="ml-auto font-mono opacity-50">{REGISTRY.length} registered</div>
      </div>

      <div className="grid gap-3 md:grid-cols-[180px_1fr]">
        <ul className="space-y-1">
          {REGISTRY.map((r) => (
            <CollectionRow
              key={r.id}
              row={r}
              active={r.id === selectedId}
              onSelect={() => setSelectedId(r.id)}
            />
          ))}
        </ul>
        <CollectionDetail key={selected.id} row={selected} />
      </div>
    </div>
  )
}

function CollectionRow({
  row,
  active,
  onSelect,
}: {
  row: { id: string; label: string; collection: CollectionLike }
  active: boolean
  onSelect: () => void
}) {
  const snap = useCollectionSnapshot(row.collection)
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-center justify-between rounded border px-2 py-1.5 text-left text-xs transition-colors ${
          active
            ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100'
            : 'border-white/10 bg-black/40 hover:bg-black/60'
        }`}
      >
        <span className="font-semibold">{row.label}</span>
        <span className="flex items-center gap-1.5 font-mono">
          <StatusDot status={snap.status} />
          <span className="tabular-nums opacity-80">{snap.size}</span>
        </span>
      </button>
    </li>
  )
}

function CollectionDetail({
  row,
}: {
  row: { id: string; label: string; collection: CollectionLike }
}) {
  const snap = useCollectionSnapshot(row.collection)
  return (
    <div className="rounded border border-white/10 bg-black/30 p-3 font-mono">
      <div className="mb-2 grid grid-cols-3 gap-2 text-[11px]">
        <KV k="status" v={snap.status} />
        <KV k="size" v={String(snap.size)} />
        <KV k="subs" v={String(snap.subscriberCount)} />
      </div>
      <div className="text-[10px] uppercase tracking-widest opacity-50">first keys</div>
      {snap.sampleKeys.length === 0 ? (
        <div className="mt-1 opacity-50">— empty —</div>
      ) : (
        <ul className="mt-1 space-y-0.5 text-[11px] leading-snug">
          {snap.sampleKeys.map((k) => (
            <li key={k} className="truncate opacity-80">
              {k}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col rounded border border-white/10 bg-black/40 px-2 py-1">
      <span className="text-[9px] uppercase tracking-widest opacity-50">{k}</span>
      <span className="text-[11px] tabular-nums">{v}</span>
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'ready'
      ? '#34d399'
      : status === 'loading' || status === 'initial'
        ? '#fbbf24'
        : status === 'error'
          ? '#f87171'
          : '#64748b'
  return (
    <span
      aria-hidden
      className="inline-block size-2 rounded-full"
      style={{ background: color, boxShadow: `0 0 4px ${color}` }}
    />
  )
}
