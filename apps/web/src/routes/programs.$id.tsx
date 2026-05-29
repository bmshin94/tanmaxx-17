import { createFileRoute } from '@tanstack/react-router'
import { RouteError } from '../components/Skeleton'

export const Route = createFileRoute('/programs/$id')({
  component: ProgramDetail,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
})

function ProgramDetail() {
  const { id } = Route.useParams()
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-bold">Program {id}</h1>
      <p className="text-sm opacity-70">Builder / detail view. Phase 4.</p>
    </section>
  )
}
