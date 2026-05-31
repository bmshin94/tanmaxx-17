import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { RouteError, RowsSkeleton } from '#/components/Skeleton'
import { listPrograms } from '#/server/functions/list-programs'

export const Route = createFileRoute('/programs')({
  component: Programs,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
})

function Programs() {
  const programs = useQuery({ queryKey: ['programs'], queryFn: () => listPrograms() })
  const rows = programs.data ?? []

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Programs</h1>
        <p className="text-sm opacity-70">
          {rows.length} program{rows.length === 1 ? '' : 's'} · read-only for the video
        </p>
      </div>

      {programs.isLoading ? (
        <RowsSkeleton rows={3} />
      ) : rows.length === 0 ? (
        <div className="rounded border border-white/15 bg-black/30 p-6 text-sm opacity-70">
          No programs yet. Ask the agent to <em>"build me a 4-week strength program"</em>.
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {rows.map((p) => {
            const targets = p.workouts.flatMap((w) => w.targets)
            const totalSets = targets.reduce((s, t) => s + t.sets, 0)
            const avgIntensity = targets.length
              ? Math.round(targets.reduce((s, t) => s + t.intensityPct, 0) / targets.length)
              : 0
            return (
              <li key={p.id}>
                <Link
                  to="/programs/$id"
                  params={{ id: p.id }}
                  className="block rounded border border-white/15 bg-black/30 p-4 hover:border-white/40"
                >
                  <div className="flex items-baseline justify-between">
                    <div className="text-lg font-semibold">{p.name}</div>
                    <span className="font-mono text-xs opacity-50">{p.id}</span>
                  </div>
                  <div className="mt-1 text-xs opacity-60">
                    {p.workouts.length} workout{p.workouts.length === 1 ? '' : 's'} · {totalSets} sets · avg {avgIntensity}% intensity
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.workouts.map((w) => (
                      <span
                        key={w.id}
                        className="rounded border border-white/15 bg-black/40 px-2 py-0.5 text-[11px] font-mono"
                      >
                        {w.name}
                      </span>
                    ))}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
