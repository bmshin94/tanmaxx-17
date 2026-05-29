import type { ColumnDef } from '@tanstack/react-table'
import type { HistoryRow } from '../server/functions/list-history'

export const historyColumns: ColumnDef<HistoryRow>[] = [
  {
    accessorKey: 'loggedAt',
    header: 'Date',
    cell: ({ getValue }) => {
      const ms = getValue<number>()
      return new Date(ms).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
  },
  { accessorKey: 'exerciseName', header: 'Exercise' },
  {
    accessorKey: 'weight',
    header: 'Weight',
    cell: ({ getValue }) => `${getValue<number>()} lb`,
  },
  { accessorKey: 'reps', header: 'Reps' },
  {
    accessorKey: 'rpe',
    header: 'RPE',
    cell: ({ getValue }) => getValue<number | null>() ?? '—',
  },
]
