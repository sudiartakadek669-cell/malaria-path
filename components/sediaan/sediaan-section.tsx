'use client'

import { useState } from 'react'
import { Droplets, TestTube } from 'lucide-react'
import { Badge, GlassCard, Modal, SectionTitle, StatCard } from '../kit'
import { DataTable, type Column } from '../data-table'
import { SediaanForm } from './sediaan-form'
import { useCollection } from '@/lib/store'
import { STORAGE_KEYS, type Migran, type Sediaan } from '@/lib/types'
import { formatTanggal } from '@/lib/format'
import { Activity, ShieldCheck, ShieldAlert } from 'lucide-react'

export const sediaanColumns: Column<Sediaan>[] = [
  { label: 'NIK', value: (r) => r.nik, className: 'font-mono text-xs' },
  { label: 'Nama', value: (r) => r.nama, className: 'font-semibold' },
  { label: 'Umur', value: (r) => `${r.umur} th` },
  { label: 'JK', value: (r) => r.jk },
  { label: 'Tgl Pengambilan', value: (r) => formatTanggal(r.tglPengambilan), mobile: true },
  { label: 'Jenis Sediaan', value: (r) => r.jenisSediaan, mobile: true },
  {
    label: 'Hasil',
    mobile: true,
    value: (r) => r.hasil,
    render: (r) => <Badge tone={r.hasil === 'Positif' ? 'red' : 'emerald'}>{r.hasil}</Badge>,
  },
  {
    label: 'Plasmodium',
    mobile: true,
    value: (r) => (r.hasil === 'Positif' ? r.plasmodium : '-'),
    render: (r) => (r.hasil === 'Positif' ? <Badge tone="amber">{`P. ${r.plasmodium}`}</Badge> : '-'),
  },
]

export function SediaanSection() {
  const { items: migran } = useCollection<Migran>(STORAGE_KEYS.migran)
  const { items, add, update, remove } = useCollection<Sediaan>(STORAGE_KEYS.sediaan)
  const [editing, setEditing] = useState<Sediaan | null>(null)

  const positif = items.filter((s) => s.hasil === 'Positif').length

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total Sediaan" value={items.length} icon={<Activity />} />
        <StatCard label="Positif" value={positif} icon={<ShieldAlert />} tone="red" />
        <StatCard label="Negatif" value={items.length - positif} icon={<ShieldCheck />} tone="emerald" />
      </div>

      <GlassCard>
        <SectionTitle
          icon={<TestTube className="size-5" />}
          title="Form Pengambilan Sediaan Darah"
          description="Pilih migran, data identitas akan terisi otomatis"
        />
        <SediaanForm migran={migran} onSubmit={add} />
      </GlassCard>

      <DataTable
        title="Data Pengambilan Sediaan Darah"
        icon={<Droplets className="size-5" />}
        rows={items}
        columns={sediaanColumns}
        fileBase="sediaan-darah"
        rowTitle={(r) => r.nama}
        onEdit={setEditing}
        onDelete={(r) => remove(r.id)}
      />

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Sediaan Darah" description={editing?.nama} size="lg">
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
