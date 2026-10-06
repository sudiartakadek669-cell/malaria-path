'use client'

import { useMemo, useState } from 'react'
import { Bug, Droplet, FlaskConical, Leaf, TreePalm, Waves } from 'lucide-react'
import { GlassCard, Modal, SectionTitle } from '../kit'
import { DataTable } from '../data-table'
import { JentikDetail, JentikForm } from './jentik-form'
import { ParameterForm } from './parameter-form'
import { LingkunganForm } from './lingkungan-form'
import { jentikColumns, jentikPdfSections, lingkunganColumns, parameterColumns } from './columns'
import { useCollection } from '@/lib/store'
import { STORAGE_KEYS, type Jentik, type Lingkungan, type ParameterAir } from '@/lib/types'
import { formatTanggal } from '@/lib/format'
import { cn } from '@/lib/utils'

const SUB = [
  { id: 'jentik', label: 'Pemantauan Jentik', icon: Bug },
  { id: 'parameter', label: 'Parameter Air', icon: FlaskConical },
  { id: 'lingkungan', label: 'Kondisi Lingkungan', icon: Leaf },
] as const

type SubId = (typeof SUB)[number]['id']

export function VektorSection() {
  const [sub, setSub] = useState<SubId>('jentik')
  const jentik = useCollection<Jentik>(STORAGE_KEYS.jentik)
  const parameter = useCollection<ParameterAir>(STORAGE_KEYS.parameter)
  const lingkungan = useCollection<Lingkungan>(STORAGE_KEYS.lingkungan)

  const [editJentik, setEditJentik] = useState<Jentik | null>(null)
  const [editParameter, setEditParameter] = useState<ParameterAir | null>(null)
  const [editLingkungan, setEditLingkungan] = useState<Lingkungan | null>(null)

  const suggestions = useMemo(
    () =>
      Array.from(
        new Set([...jentik.items, ...parameter.items, ...lingkungan.items].map((r) => r.namaLagoon)),
      ).sort(),
    [jentik.items, parameter.items, lingkungan.items],
  )

  return (
    <div className="flex flex-col gap-5">
      <GlassCard className="overflow-hidden">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-md shadow-sky-500/25">
              <Waves className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold md:text-lg">Pengendalian Vektor Lagoon</h2>
              <p className="text-sm text-muted-foreground">Survei khusus habitat lagoon dengan SOP 4 Titik</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-sky-100 px-3 py-1.5 text-sky-700">1 Lagoon = 4 Titik</span>
            <span className="rounded-full bg-sky-100 px-3 py-1.5 text-sky-700">1 Titik = 10x Cidukan</span>
            <span className="rounded-full bg-sky-600 px-3 py-1.5 text-white">Total 40 Cidukan</span>
          </div>
        </div>

        <div role="tablist" aria-label="Sub kegiatan" className="mt-5 grid grid-cols-3 gap-1 rounded-2xl bg-sky-50 p-1">
          {SUB.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={sub === id}
              aria-controls={`panel-${id}`}
              onClick={() => setSub(id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-xs font-semibold transition sm:flex-row sm:gap-2 sm:text-sm',
                sub === id ? 'bg-white text-sky-700 shadow-md shadow-sky-500/10' : 'text-sky-900/60 hover:text-sky-700',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </GlassCard>

      {sub === 'jentik' && (
        <div id="panel-jentik" role="tabpanel" className="flex flex-col gap-5">
          <GlassCard>
            <SectionTitle
              icon={<Bug className="size-5" />}
              title="Pemantauan Jentik"
              description="Isi jumlah jentik tiap cidukan (C1-C10) di 4 titik. Perhitungan otomatis real-time."
            />
            <JentikForm onSubmit={jentik.add} suggestions={suggestions} />
          </GlassCard>
          <DataTable
            title="Data Pemantauan Jentik Lagoon"
            icon={<Droplet className="size-5" />}
            rows={jentik.items}
            columns={jentikColumns}
            fileBase="pemantauan-jentik-lagoon"
            rowTitle={(r) => `${r.namaLagoon} (${formatTanggal(r.tanggal)})`}
            onEdit={setEditJentik}
            onDelete={(r) => jentik.remove(r.id)}
            renderDetail={(r) => <JentikDetail titik={r.titik} />}
            rowPdfSections={jentikPdfSections}
          />
        </div>
      )}

      {sub === 'parameter' && (
        <div id="panel-parameter" role="tabpanel" className="flex flex-col gap-5">
          <GlassCard>
            <SectionTitle icon={<FlaskConical className="size-5" />} title="Parameter Air Lagoon" description="Pengukuran kualitas fisik & kimia air" />
            <ParameterForm onSubmit={parameter.add} suggestions={suggestions} />
          </GlassCard>
          <DataTable
            title="Data Parameter Air Lagoon"
            icon={<FlaskConical className="size-5" />}
            rows={parameter.items}
            columns={parameterColumns}
            fileBase="parameter-air-lagoon"
            rowTitle={(r) => `${r.namaLagoon} (${formatTanggal(r.tanggal)})`}
            onEdit={setEditParameter}
            onDelete={(r) => parameter.remove(r.id)}
          />
        </div>
      )}

      {sub === 'lingkungan' && (
        <div id="panel-lingkungan" role="tabpanel" className="flex flex-col gap-5">
          <GlassCard>
            <SectionTitle icon={<TreePalm className="size-5" />} title="Kondisi Lingkungan Lagoon" description="Observasi vegetasi, sampah, akses, dan genangan" />
            <LingkunganForm onSubmit={lingkungan.add} suggestions={suggestions} />
          </GlassCard>
          <DataTable
            title="Data Kondisi Lingkungan Lagoon"
            icon={<Leaf className="size-5" />}
            rows={lingkungan.items}
            columns={lingkunganColumns}
            fileBase="kondisi-lingkungan-lagoon"
            rowTitle={(r) => `${r.namaLagoon} (${formatTanggal(r.tanggal)})`}
            onEdit={setEditLingkungan}
            onDelete={(r) => lingkungan.remove(r.id)}
          />
        </div>
      )}

      <Modal open={!!editJentik} onClose={() => setEditJentik(null)} title="Edit Pemantauan Jentik" description={editJentik?.namaLagoon} size="xl">
        {editJentik && (
          <JentikForm
            initial={editJentik}
            suggestions={suggestions}
            submitLabel="Simpan Perubahan"
            onCancel={() => setEditJentik(null)}
            onSubmit={(data) => {
              jentik.update(editJentik.id, data)
              setEditJentik(null)
            }}
          />
        )}
      </Modal>
      <Modal open={!!editParameter} onClose={() => setEditParameter(null)} title="Edit Parameter Air" description={editParameter?.namaLagoon}>
        {editParameter && (
          <ParameterForm
            initial={editParameter}
            suggestions={suggestions}
            submitLabel="Simpan Perubahan"
            onCancel={() => setEditParameter(null)}
            onSubmit={(data) => {
              parameter.update(editParameter.id, data)
              setEditParameter(null)
            }}
          />
        )}
      </Modal>
      <Modal open={!!editLingkungan} onClose={() => setEditLingkungan(null)} title="Edit Kondisi Lingkungan" description={editLingkungan?.namaLagoon}>
        {editLingkungan && (
          <LingkunganForm
            initial={editLingkungan}
            suggestions={suggestions}
            submitLabel="Simpan Perubahan"
            onCancel={() => setEditLingkungan(null)}
            onSubmit={(data) => {
              lingkungan.update(editLingkungan.id, data)
              setEditLingkungan(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}
