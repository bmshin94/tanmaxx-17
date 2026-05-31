import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { RouteError, RowsSkeleton } from '#/components/Skeleton'
import { getProgram } from '#/server/functions/get-program'
import { exercisesCollection } from '#/db/collections'
import { useCollectionArray } from '#/db/use-collection'
import type { Exercise } from '@tanmaxx/shared'

export const Route = createFileRoute('/programs/$id')({
  component: ProgramDetail,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
})

function ProgramDetail() {
  const { id } = Route.useParams()
  const program = useQuery({
    queryKey: ['program', id],
    queryFn: () => getProgram({ data: { id } }),
  })
  const exercises = useCollectionArray<Exercise>(exercisesCollection)
  const nameOf = (exId: string) => exercises.find((e) => e.id === exId)?.name ?? exId

  if (program.isLoading) return <RowsSkeleton rows={4} />
  const data = program.data
  if (!data) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-bold">Program not found</h1>
        <Link to="/programs" className="text-sm underline opacity-80 hover:opacity-100">
          ← back to programs
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-5">
      <div className="flex items-baseline justify-between">
        <div>
          <Link to="/programs" className="text-xs uppercase tracking-wider opacity-60 hover:opacity-100">
            ← programs
          </Link>
          <h1 className="text-2xl font-bold">{data.name}</h1>
        </div>
        <span className="font-mono text-xs opacity-50">{data.id}</span>
      </div>

      <ul className="space-y-3">
        {data.workouts.map((w) => (
          <li key={w.id} className="rounded border border-white/15 bg-black/30 p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">{w.name}</h2>
              <span className="font-mono text-xs opacity-50">{w.id}</span>
            </div>
            <ul className="divide-y divide-white/5">
              {w.targets.map((t, i) => (
                <li key={`${w.id}-${i}`} className="flex items-center justify-between py-2 text-sm">
                  <span className="truncate pr-3 opacity-90">{nameOf(t.exerciseId)}</span>
                  <span className="font-mono shrink-0">
                    {t.sets} × {t.reps}{' '}
                    <span className="opacity-50">@ {t.intensityPct}%</span>
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  )
}
