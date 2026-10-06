'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { Eye, FileDown, FileSpreadsheet, FileText, Pencil, Search, Trash2, Inbox, TriangleAlert } from 'lucide-react'
import { Button, DetailGrid, GlassCard, IconAction, Modal, SectionTitle, inputClass } from './kit'
import { exportExcel, exportRecordPDF, exportTablePDF, type Cell, type PdfSection } from '@/lib/export'
import type { BaseRecord } from '@/lib/types'
import { cn } from '@/lib/utils'

export interface Column<T> {
  label: string
  value: (row: T) => Cell
  render?: (row: T) => ReactNode
  className?: string
  hideInTable?: boolean
  mobile?: boolean
}

interface DataTableProps<T extends BaseRecord> {
  title: string
  description?: string
  icon?: ReactNode
  rows: T[]
  columns: Column<T>[]
  fileBase: string
  rowTitle: (row: T) => string
  onEdit: (row: T) => void
  onDelete: (row: T) => void
  renderDetail?: (row: T) => ReactNode
  rowPdfSections?: (row: T) => PdfSection[]
}

export function DataTable<T extends BaseRecord>({
  title,
  description,
  icon,
  rows,
  columns,
  fileBase,
  rowTitle,
  onEdit,
  onDelete,
  renderDetail,
  rowPdfSections,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('')
  const [viewing, setViewing] = useState<T | null>(null)
  const [deleting, setDeleting] = useState<T | null>(null)
  const [busy, setBusy] = useState(false)

  const tableColumns = columns.filter((c) => !c.hideInTable)
  const flagged = columns.filter((c) => c.mobile)
  const mobileColumns = flagged.length ? flagged : tableColumns.slice(1, 5)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) =>
      columns.some((c) => String(c.value(row)).toLowerCase().includes(q)),
    )
  }, [rows, columns, query])

  const head = columns.map((c) => c.label)
  const toBody = (list: T[]) => list.map((row) => columns.map((c) => c.value(row)))

  const run = async (task: () => Promise<void>) => {
    setBusy(true)
    try {
      await task()
    } finally {
      setBusy(false)
    }
  }

  const downloadRow = (row: T) =>
    run(() =>
      exportRecordPDF(
        `${title} - ${rowTitle(row)}`,
        columns.map((c) => ({ label: c.label, value: c.value(row) })),
        `${fileBase}-${rowTitle(row).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        rowPdfSections?.(row) ?? [],
      ),
    )

  const actions = (row: T) => (
    <div className="flex items-center justify-end gap-0.5">
      <IconAction label={`Lihat detail ${rowTitle(row)}`} onClick={() => setViewing(row)}>
        <Eye />
      </IconAction>
      <IconAction label={`Edit ${rowTitle(row)}`} tone="amber" onClick={() => onEdit(row)}>
        <Pencil />
      </IconAction>
      <IconAction label={`Unduh PDF ${rowTitle(row)}`} tone="emerald" onClick={() => downloadRow(row)} disabled={busy}>
        <FileDown />
      </IconAction>
      <IconAction label={`Hapus ${rowTitle(row)}`} tone="red" onClick={() => setDeleting(row)}>
        <Trash2 />
      </IconAction>
    </div>
  )

  return (
    <GlassCard>
      <SectionTitle
        icon={icon}
        title={title}
        description={description ?? `${rows.length} data tersimpan`}
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => run(() => exportTablePDF(title, head, toBody(filtered), fileBase))}
            >
              <FileText />
              PDF Tabel
            </Button>
            <Button
              variant="success"
              disabled={busy}
              onClick={() => run(() => exportExcel(fileBase, [{ name: title, head, body: toBody(filtered) }]))}
            >
              <FileSpreadsheet />
              Excel
            </Button>
          </div>
        }
      />

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-sky-500" aria-hidden="true" />
        <label htmlFor={`search-${fileBase}`} className="sr-only">
          Cari data
        </label>
        <input
          id={`search-${fileBase}`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari data..."
          className={cn(inputClass, 'pl-10')}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 py-10 text-center">
          <Inbox className="size-8 text-sky-400" aria-hidden="true" />
          <p className="text-sm font-medium text-sky-900/70">
            {rows.length === 0 ? 'Belum ada data. Silakan isi form di atas.' : 'Data tidak ditemukan.'}
          </p>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-2 md:hidden">
            {filtered.map((row, i) => (
              <li key={row.id} className="rounded-2xl border border-sky-100 bg-white/80 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-sky-600">#{i + 1}</p>
                    <p className="truncate font-semibold text-foreground">{rowTitle(row)}</p>
                  </div>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {mobileColumns.map((c) => (
                    <div key={c.label} className="min-w-0">
                      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{c.label}</dt>
                      <dd className="truncate text-sm font-medium">{c.render ? c.render(row) : c.value(row)}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-2 border-t border-sky-50 pt-2">{actions(row)}</div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto rounded-xl border border-sky-100 md:block">
            <table className="w-full min-w-max text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-sky-500 to-sky-600 text-left text-white">
                  <th scope="col" className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">
                    No
                  </th>
                  {tableColumns.map((c) => (
                    <th key={c.label} scope="col" className={cn('px-3 py-2.5 text-xs font-semibold uppercase tracking-wide', c.className)}>
                      {c.label}
                    </th>
                  ))}
                  <th scope="col" className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50 bg-white/70">
                {filtered.map((row, i) => (
                  <tr key={row.id} className="transition hover:bg-sky-50/70">
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{i + 1}</td>
                    {tableColumns.map((c) => (
                      <td key={c.label} className={cn('px-3 py-2.5', c.className)}>
                        {c.render ? c.render(row) : c.value(row)}
                      </td>
                    ))}
                    <td className="px-2 py-1.5">{actions(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing ? rowTitle(viewing) : ''}
        description={`Detail ${title}`}
        size={renderDetail ? 'lg' : 'md'}
      >
        {viewing && (
          <div className="flex flex-col gap-4">
            <DetailGrid
              items={columns.map((c) => ({ label: c.label, value: c.render ? c.render(viewing) : c.value(viewing) }))}
            />
            {renderDetail?.(viewing)}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  const row = viewing
                  setViewing(null)
                  onEdit(row)
                }}
              >
                <Pencil />
                Edit
              </Button>
              <Button onClick={() => downloadRow(viewing)} disabled={busy}>
                <FileDown />
                Unduh PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Hapus Data" size="sm">
        {deleting && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-xl bg-red-50 p-3.5 text-sm text-red-800">
              <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <p>
                Yakin ingin menghapus data <strong>{rowTitle(deleting)}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setDeleting(null)}>
                Batal
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  onDelete(deleting)
                  setDeleting(null)
                }}
              >
                <Trash2 />
                Hapus
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </GlassCard>
  )
}
