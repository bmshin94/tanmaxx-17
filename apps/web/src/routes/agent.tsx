import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RouteError, RowsSkeleton } from '../components/Skeleton'

const AgentChat = lazy(() => import('../components/AgentChat'))

export const Route = createFileRoute('/agent')({
  component: Agent,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
})

function Agent() {
  return (
    <Suspense
      fallback={
        <section className="space-y-3">
          <h1 className="text-2xl font-bold">Agent</h1>
          <RowsSkeleton rows={4} />
        </section>
      }
    >
      <AgentChat />
    </Suspense>
  )
}
