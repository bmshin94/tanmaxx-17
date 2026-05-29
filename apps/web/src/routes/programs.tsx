import { createFileRoute } from '@tanstack/react-router'
import { RouteError } from '../components/Skeleton'

export const Route = createFileRoute('/programs')({
  component: Programs,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
})

function Programs() {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-bold">Programs</h1>
      <p className="text-sm opacity-70">Program list. Phase 2 schemas, Phase 4 builder.</p>
    </section>
  )
}
