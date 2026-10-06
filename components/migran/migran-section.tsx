'use client'

import { useState } from 'react'
import { ClipboardList, UserPlus } from 'lucide-react'
import { Badge, GlassCard, Modal, SectionTitle } from '../kit'
import { DataTable, type Column } from '../data-table'
import { MigranForm } from './migran-form'
import { useCollection } from '@/lib/store'
import { STORAGE_KEYS, type Migran } from '@/lib/types'
import { formatTanggal } from '@/lib/format'

export const migranColumns: Column<Migran>[] = [
  { label: 'NIK', value: (r) => r.nik, className: 'font-mono text-xs', mobile: true },
  { label: 'Nama', value: (r) => r.nama, className: 'font-semibold' },
  { label: 'Umur', value: (r) => `${r.umur} th`, mobile: true },
  { label: 'JK', value: (r) => r.jk, mobile: true },
  {
    label: 'Asal Endemis',
    mobile: true,
    value: (r) => r.asal,
    render: (r) => <Badge tone="amber">{r.asal}</Badge>,
  },
  { label: 'Tgl Datang', value: (r) => formatTanggal(r.tglDatang) },
  { label: 'Alamat Banjar', value: (r) => r.alamatBanjar },
  { label: 'No. HP', value: (r) => r.hp },
]

export function MigranSection() {
  const { items, add, update, remove } = useCollection<Migran>(STORAGE_KEYS.migran)
  const [editing, setEditing] = useState<Migran | null>(null)

  return (
    <div className="flex flex-col gap-5">
      <GlassCard>
        <SectionTitle
          icon={<UserPlus className="size-5" />}
          title="Form Survei Migran"
          description="Pendataan migran yang datang dari daerah endemis malaria"
        />
        <MigranForm onSubmit={add} existingNiks={items.map((m) => m.nik)} />
      </GlassCard>

      <DataTable
        title="Data Survei Migran"
        icon={<ClipboardList className="size-5" />}
        rows={items}
        columns={migranColumns}
        fileBase="survei-migran"
        rowTitle={(r) => r.nama}
        onEdit={setEditing}
        onDelete={(r) => remove(r.id)}
      />

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Data Migran" description={editing?.nama} size="lg">
        {editing && (
          <MigranForm
            initial={editing}
            submitLabel="Simpan Perubahan"
            existingNiks={items.map((m) => m.nik)}
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
