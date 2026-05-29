export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-white/10 ${className}`}
      aria-hidden="true"
    />
  )
}

export function RowsSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

export function RouteError({
  error,
  reset,
}: {
  error: Error
  reset?: () => void
}) {
  return (
    <div className="rounded border border-red-400/30 bg-red-500/10 p-4 text-sm">
      <div className="mb-1 text-xs uppercase tracking-wide opacity-60">Something broke</div>
      <pre className="overflow-auto whitespace-pre-wrap break-words text-red-200">
        {error.message}
      </pre>
      {reset && (
        <button
          type="button"
          onClick={reset}
          className="mt-2 rounded border border-white/20 px-2 py-1 text-xs hover:bg-white/10"
        >
          retry
        </button>
      )}
    </div>
  )
}
