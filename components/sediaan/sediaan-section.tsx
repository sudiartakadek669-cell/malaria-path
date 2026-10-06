'use client'

import { useMemo, useState } from 'react'
import { Activity, Droplets, Microscope, ScanLine, ShieldAlert, ShieldCheck, TestTube } from 'lucide-react'
import { Badge, GlassCard, Modal, SectionTitle, StatCard } from '../kit'
import { DataTable, type Column } from '../data-table'
import { SediaanForm } from './sediaan-form'
import { useCollection } from '@/lib/store'
import { STORAGE_KEYS, normalizeSediaan, plasmodiumLabel, type Migran, type Sediaan } from '@/lib/types'
import { formatTanggal } from '@/lib/format'

export const JenisBadge = ({ jenis }: { jenis: Sediaan['jenisPemeriksaan'] }) => (
  <Badge tone={jenis === 'RDT' ? 'blue' : 'purple'}>{jenis}</Badge>
)
export const HasilBadge = ({ hasil }: { hasil: Sediaan['hasil'] }) => (
  <Badge tone={hasil === 'Positif' ? 'red' : 'emerald'}>{hasil}</Badge>
)

export const sediaanColumns: Column<Sediaan>[] = [
  {
    label: 'Nama / Umur / JK',
    value: (r) => `${r.nama} / ${r.umur} th / ${r.jk}`,
    render: (r) => (
      <div className="flex flex-col">
        <span className="font-semibold">{r.nama}</span>
        <span className="text-xs text-muted-foreground">{`${r.umur} th · ${r.jk}`}</span>
      </div>
    ),
  },
  { label: 'NIK', value: (r) => r.nik, hideInTable: true },
  { label: 'Tgl Pemeriksaan', value: (r) => formatTanggal(r.tglPemeriksaan), hideInTable: true, mobile: true },
  {
    label: 'Jenis Pemeriksaan',
    mobile: true,
    value: (r) => r.jenisPemeriksaan,
    render: (r) => <JenisBadge jenis={r.jenisPemeriksaan} />,
  },
  {
    label: 'Hasil',
    mobile: true,
    value: (r) => r.hasil,
    render: (r) => <HasilBadge hasil={r.hasil} />,
  },
  {
    label: 'Plasmodium',
    mobile: true,
    value: (r) => plasmodiumLabel(r),
    render: (r) => (plasmodiumLabel(r) === '-' ? '-' : <Badge tone="amber">{plasmodiumLabel(r)}</Badge>),
  },
  { label: 'Petugas', value: (r) => r.petugas || '-', hideInTable: true },
]

export function SediaanSection() {
  const { items: migran } = useCollection<Migran>(STORAGE_KEYS.migran)
  const { items: raw, add, update, remove } = useCollection<Sediaan>(STORAGE_KEYS.sediaan)
  const items = useMemo(() => raw.map(normalizeSediaan), [raw])
  const [editing, setEditing] = useState<Sediaan | null>(null)

  const positif = items.filter((s) => s.hasil === 'Positif').length
  const rdt = items.filter((s) => s.jenisPemeriksaan === 'RDT').length

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Total Pemeriksaan" value={items.length} icon={<Activity />} />
        <StatCard label="RDT" value={rdt} icon={<ScanLine />} />
        <StatCard label="Mikroskopis" value={items.length - rdt} icon={<Microscope />} tone="amber" />
        <StatCard label="Positif" value={positif} icon={<ShieldAlert />} tone="red" />
        <StatCard label="Negatif" value={items.length - positif} icon={<ShieldCheck />} tone="emerald" />
      </div>

      <GlassCard>
        <SectionTitle
          icon={<TestTube className="size-5" />}
          title="Form Pengambilan Sediaan Darah"
          description="Pilih migran, data identitas terisi otomatis. Tanda * wajib diisi."
        />
        <SediaanForm migran={migran} onSubmit={add} />
      </GlassCard>

      <DataTable
        title="Data Pemeriksaan Sediaan Darah"
        icon={<Droplets className="size-5" />}
        rows={items}
        columns={sediaanColumns}
        fileBase="sediaan-darah"
        rowTitle={(r) => r.nama}
        onEdit={setEditing}
        onDelete={(r) => remove(r.id)}
      />

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Pemeriksaan Sediaan Darah" description={editing?.nama} size="lg">
        {editing && (
          <SediaanForm
            migran={migran}
            initial={editing}
            submitLabel="Simpan Perubahan"
            onCancel={() => setEditing(null)}
            onSubmit={(data) => {
              update(editing.id, data)
              setEditing(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}
