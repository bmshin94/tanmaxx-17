import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { listHistory } from '#/server/functions/list-history'
import { historyColumns } from '#/lib/table-columns'
import { RouteError, RowsSkeleton } from '#/components/Skeleton'

export const Route = createFileRoute('/history')({
  component: History,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
})

function History() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => listHistory(),
  })

  const [sorting, setSorting] = useState<SortingState>([{ id: 'loggedAt', desc: true }])

  const table = useReactTable({
    data,
    columns: historyColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">History</h1>
        <span className="text-xs opacity-60 font-mono">{data.length.toLocaleString()} sets</span>
      </div>
      {isLoading ? (
        <RowsSkeleton rows={8} />
      ) : data.length === 0 ? (
        <div className="text-sm opacity-60">No sets logged yet. Open a session and log one.</div>
      ) : (
        <div className="overflow-auto rounded border border-white/10 bg-black/20">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="cursor-pointer px-3 py-2 text-left font-semibold"
                      onClick={h.column.getToggleSortingHandler()}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{ asc: ' ↑', desc: ' ↓' }[h.column.getIsSorted() as 'asc' | 'desc'] ?? ''}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-white/5">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
