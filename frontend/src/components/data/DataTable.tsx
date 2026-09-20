import type { ReactNode } from 'react'
import { cn } from '@/lib/format'

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
}: {
  columns: Array<{ key: string; header: string; render: (row: T) => ReactNode; hideOnMobile?: boolean }>
  rows: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
}) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-hairline">
              {columns.map((col) => (
                <th key={col.key} className="px-3 py-3 font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-hairline/80 hover:bg-surface-2/80',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-3 align-top text-ink">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <button
            key={rowKey(row)}
            type="button"
            onClick={() => onRowClick?.(row)}
            className="min-h-11 border border-hairline bg-surface p-4 text-left"
          >
            {columns
              .filter((col) => !col.hideOnMobile)
              .map((col) => (
                <div key={col.key} className="mb-2 last:mb-0">
                  <p className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">{col.header}</p>
                  <div className="mt-1 text-sm text-strong">{col.render(row)}</div>
                </div>
              ))}
          </button>
        ))}
      </div>
    </>
  )
}
