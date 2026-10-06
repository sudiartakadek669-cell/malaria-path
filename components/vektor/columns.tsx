import type { Column } from '../data-table'
import { Badge } from '../kit'
import type { Jentik, Lingkungan, ParameterAir } from '@/lib/types'
import { formatAngka, formatTanggal, kepadatanLagoon, kepadatanTitik, totalLagoon, totalTitik } from '@/lib/format'
import type { PdfSection } from '@/lib/export'

const titikColumn = (i: number): Column<Jentik> => ({
  label: `Titik ${i + 1}`,
  value: (r) => `${totalTitik(r.titik[i] ?? [])} (${formatAngka(kepadatanTitik(r.titik[i] ?? []), 2)})`,
  render: (r) => (
    <span className="tabular-nums">
      <span className="font-semibold">{totalTitik(r.titik[i] ?? [])}</span>
      <span className="text-xs text-muted-foreground">{` / ${formatAngka(kepadatanTitik(r.titik[i] ?? []), 2)}`}</span>
    </span>
  ),
})

export const jentikColumns: Column<Jentik>[] = [
  { label: 'Nama Lagoon', value: (r) => r.namaLagoon, className: 'font-semibold' },
  { label: 'Tanggal', value: (r) => formatTanggal(r.tanggal), mobile: true },
  { label: 'Lokasi', value: (r) => r.lokasi || '-', hideInTable: true, mobile: true },
  { label: 'Petugas', value: (r) => r.petugas || '-', hideInTable: true },
  titikColumn(0),
  titikColumn(1),
  titikColumn(2),
  titikColumn(3),
  {
    label: 'Total Lagoon',
    mobile: true,
    value: (r) => totalLagoon(r.titik),
    render: (r) => <span className="font-bold tabular-nums text-sky-700">{totalLagoon(r.titik)}</span>,
  },
  {
    label: 'Kepadatan Lagoon',
    mobile: true,
    value: (r) => `${formatAngka(kepadatanLagoon(r.titik), 3)} jentik/ciduk`,
    render: (r) => {
      const k = kepadatanLagoon(r.titik)
      return <Badge tone={k >= 1 ? 'red' : k > 0 ? 'amber' : 'emerald'}>{`${formatAngka(k, 3)} /ciduk`}</Badge>
    },
  },
]

export const jentikPdfSections = (r: Jentik): PdfSection[] => [
  {
    title: 'Rincian Cidukan per Titik (SOP 4 Titik x 10 Cidukan)',
    head: ['Titik', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'Total', 'Kepadatan'],
    body: r.titik.map((t, i) => [`Titik ${i + 1}`, ...t, totalTitik(t), formatAngka(kepadatanTitik(t), 2)]),
  },
]

export const parameterColumns: Column<ParameterAir>[] = [
  { label: 'Nama Lagoon', value: (r) => r.namaLagoon, className: 'font-semibold' },
  { label: 'Tanggal', value: (r) => formatTanggal(r.tanggal) },
  { label: 'pH', value: (r) => formatAngka(r.ph, 2) },
  { label: 'Suhu (°C)', value: (r) => formatAngka(r.suhu, 1) },
  { label: 'Salinitas (ppt)', value: (r) => formatAngka(r.salinitas, 1) },
  { label: 'Kekeruhan (NTU)', value: (r) => formatAngka(r.kekeruhan, 1) },
  { label: 'DO (mg/L)', value: (r) => formatAngka(r.oksigen, 1) },
  { label: 'Kedalaman (cm)', value: (r) => formatAngka(r.kedalaman, 0) },
]

export const lingkunganColumns: Column<Lingkungan>[] = [
  { label: 'Nama Lagoon', value: (r) => r.namaLagoon, className: 'font-semibold' },
  { label: 'Tanggal', value: (r) => formatTanggal(r.tanggal) },
  { label: 'Vegetasi', value: (r) => r.vegetasi },
  {
    label: 'Sampah',
    value: (r) => r.sampah,
    render: (r) => <Badge tone={r.sampah === 'Bersih' ? 'emerald' : 'amber'}>{r.sampah}</Badge>,
  },
  { label: 'Akses', value: (r) => r.akses },
  {
    label: 'Genangan',
    value: (r) => r.genangan,
    render: (r) => <Badge tone={r.genangan === 'Ada' ? 'red' : 'emerald'}>{r.genangan}</Badge>,
  },
]
