import { createFileRoute } from '@tanstack/react-router'
import { RouteError } from '../components/Skeleton'

export const Route = createFileRoute('/')({
  component: Dashboard,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
})

function Dashboard() {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-sm opacity-70">PR widgets, recent sessions, and The Maxx slider land here.</p>
    </section>
  )
}
