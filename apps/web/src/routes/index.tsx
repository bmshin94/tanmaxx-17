import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from '@tanstack/react-store'
import { RouteError, RowsSkeleton } from '#/components/Skeleton'
import { listPRs } from '#/server/functions/list-prs'
import { listSessions } from '#/server/functions/list-sessions'
import { listHistory } from '#/server/functions/list-history'
import { tierFor } from '#/components/Maxx/maxx-tiers'
import { maxxStore } from '#/state/maxx-store'

export const Route = createFileRoute('/')({
  component: Dashboard,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
})

function Dashboard() {
  const maxx = useSelector(maxxStore, (s) => s)
  const tier = tierFor(maxx.upper)

  const prs = useQuery({ queryKey: ['prs'], queryFn: () => listPRs() })
  const sessions = useQuery({ queryKey: ['sessions'], queryFn: () => listSessions() })
  const recent = useQuery({ queryKey: ['recent-history'], queryFn: () => listHistory() })

  const topPRs = (prs.data ?? []).slice(0, 5)
  const recentSessions = (sessions.data ?? []).slice(0, 5)
  const recentSets = (recent.data ?? []).slice(0, 8)
  const totalSets = (recent.data ?? []).length
  const totalVolume = (recent.data ?? []).reduce((sum, r) => sum + r.weight * r.reps, 0)
  const liveSession = recentSessions.find((s) => s.endedAt == null) ?? recentSessions[0]

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm opacity-70">
          {recentSessions.length} session{recentSessions.length === 1 ? '' : 's'} · {totalSets} sets logged · {Math.round(totalVolume).toLocaleString()} lb total volume
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="The Maxx" value={`${Math.round(maxx.upper)}`} sub={`${tier.id.toUpperCase()} · ${tier.vibe}`} accent />
        <StatCard label="Total volume" value={`${Math.round(totalVolume).toLocaleString()}`} sub="lb · all-time" />
        <StatCard label="Logged sets" value={`${totalSets}`} sub={`across ${recentSessions.length} sessions`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel
          title="Top PRs"
          action={
            <Link to="/history" className="text-xs opacity-60 hover:opacity-100">
              history →
            </Link>
          }
        >
          {prs.isLoading ? (
            <RowsSkeleton rows={5} />
          ) : topPRs.length === 0 ? (
            <Empty>No PRs yet — log a set to see them here.</Empty>
          ) : (
            <ul className="divide-y divide-white/5">
              {topPRs.map((pr) => (
                <li key={pr.exerciseId} className="flex items-center justify-between py-2 text-sm">
                  <span className="truncate pr-3 opacity-90" data-pr-widget>
                    {pr.exerciseName}
                  </span>
                  <span className="font-mono shrink-0">
                    {pr.weight} × {pr.reps}
                    {pr.rpe !== null ? ` @ ${pr.rpe}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent sessions"
          action={
            liveSession ? (
              <Link
                to="/session/$id"
                params={{ id: liveSession.id }}
                className="rounded bg-white px-2 py-1 text-[11px] font-bold text-black"
              >
                jump in →
              </Link>
            ) : null
          }
        >
          {sessions.isLoading ? (
            <RowsSkeleton rows={3} />
          ) : recentSessions.length === 0 ? (
            <Empty>No sessions yet.</Empty>
          ) : (
            <ul className="divide-y divide-white/5">
              {recentSessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                  <Link
                    to="/session/$id"
                    params={{ id: s.id }}
                    className="truncate pr-3 opacity-90 hover:underline"
                  >
                    {s.workoutId ?? s.id}
                  </Link>
                  <span className="shrink-0 font-mono text-xs opacity-60">
                    {formatRelative(s.startedAt)}
                    {s.endedAt == null ? ' · live' : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Recent sets">
        {recent.isLoading ? (
          <RowsSkeleton rows={5} />
        ) : recentSets.length === 0 ? (
          <Empty>Nothing logged yet — open a session.</Empty>
        ) : (
          <ul className="divide-y divide-white/5">
            {recentSets.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                <span className="truncate pr-3 opacity-90">{r.exerciseName}</span>
                <span className="shrink-0 font-mono">
                  {r.weight} × {r.reps}
                  {r.rpe !== null ? ` @ ${r.rpe}` : ''}
                  <span className="ml-2 opacity-40">{formatRelative(r.loggedAt)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </section>
  )
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub: string
  accent?: boolean
}) {
  return (
    <div
      className="rounded border border-white/15 bg-black/30 p-4"
      style={accent ? { borderColor: 'var(--maxx-accent, #fff)' } : undefined}
    >
      <div className="text-xs uppercase tracking-wider opacity-60">{label}</div>
      <div className="mt-1 text-3xl font-black tabular-nums">{value}</div>
      <div className="text-xs opacity-60">{sub}</div>
    </div>
  )
}

function Panel({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded border border-white/15 bg-black/30 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider opacity-80">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="py-2 text-sm opacity-50">{children}</div>
}

function formatRelative(ms: number): string {
  const delta = Date.now() - ms
  const day = 86_400_000
  if (delta < 60_000) return 'just now'
  if (delta < 3_600_000) return `${Math.round(delta / 60_000)}m ago`
  if (delta < day) return `${Math.round(delta / 3_600_000)}h ago`
  return `${Math.round(delta / day)}d ago`
}
