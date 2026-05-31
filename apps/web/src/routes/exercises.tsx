import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useDebouncedValue } from '@tanstack/react-pacer'
import { exercisesCollection } from '#/db/collections'
import { useCollectionArray } from '#/db/use-collection'
import { RouteError, RowsSkeleton } from '#/components/Skeleton'

export const Route = createFileRoute('/exercises')({
  component: Exercises,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
})

function Exercises() {
  const exercises = useCollectionArray(exercisesCollection)
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebouncedValue(query, { wait: 250 })

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    if (!q) return exercises
    return exercises.filter(
      (e) => e.name.toLowerCase().includes(q) || e.equipment.toLowerCase().includes(q),
    )
  }, [exercises, debouncedQuery])

  const parentRef = useRef<HTMLDivElement>(null)
  const virt = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 8,
  })

  const isLoading = exercises.length === 0

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <span className="text-xs opacity-60 font-mono">
          {filtered.length.toLocaleString()} / {exercises.length.toLocaleString()}
        </span>
      </div>
      <input
        type="text"
        placeholder="Search by name or equipment…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/40"
      />
      {isLoading ? (
        <RowsSkeleton rows={10} />
      ) : (
        <div
          ref={parentRef}
          className="relative h-[70vh] overflow-auto rounded border border-white/10 bg-black/20"
        >
          <div style={{ height: virt.getTotalSize(), position: 'relative' }}>
            {virt.getVirtualItems().map((vi) => {
              const ex = filtered[vi.index]
              return (
                <div
                  key={vi.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: vi.size,
                    transform: `translateY(${vi.start}px)`,
                  }}
                  className="flex items-center gap-3 border-b border-white/5 px-3"
                >
                  <div className="flex-1 truncate text-sm">{ex.name}</div>
                  <div className="text-xs opacity-60 font-mono">{ex.equipment}</div>
                  <div className="text-xs opacity-40 font-mono w-20 text-right">
                    {ex.defaultRepRange[0]}-{ex.defaultRepRange[1]}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
