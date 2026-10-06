'use client'

import { useMemo, useState, type ReactNode } from 'react'
import {
  Bug,
  CalendarRange,
  Droplets,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  Gauge,
  Leaf,
  ShieldAlert,
  ShieldCheck,
  Users,
  Waves,
} from 'lucide-react'
import { Badge, Button, Field, GlassCard, SectionTitle, SelectInput, StatCard } from '../kit'
import { useCollection } from '@/lib/store'
import {
  BULAN,
  PLASMODIUM,
  STORAGE_KEYS,
  TAHUN,
  ASAL_ENDEMIS,
  VEGETASI,
  type Jentik,
  type Lingkungan,
  type Migran,
  type ParameterAir,
  type Sediaan,
} from '@/lib/types'
import { formatAngka, formatTanggal, isInMonth, kepadatanLagoon, totalLagoon, totalTitik } from '@/lib/format'
import { exportExcel, exportReportPDF, type Cell, type PdfSection } from '@/lib/export'

const average = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0)

function MiniTable({ head, body, empty = 'Tidak ada data pada periode ini' }: { head: string[]; body: ReactNode[][]; empty?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-sky-100">
      <table className="w-full min-w-max text-sm">
        <thead>
          <tr className="bg-sky-50 text-left text-xs font-semibold uppercase tracking-wide text-sky-900/70">
            {head.map((h) => (
              <th key={h} scope="col" className="px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-sky-50 bg-white/70">
          {body.length === 0 ? (
            <tr>
              <td colSpan={head.length} className="px-3 py-6 text-center text-sm text-muted-foreground">
                {empty}
              </td>
            </tr>
          ) : (
            body.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2 tabular-nums">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function SubHeading({ icon, title, count }: { icon: ReactNode; title: string; count: number }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground [&_svg]:size-4 [&_svg]:text-sky-600">
        {icon}
        {title}
      </h3>
      <Badge>{`${count} data`}</Badge>
    </div>
  )
}

export function RekapSection() {
  const now = new Date()
  const [bulan, setBulan] = useState(now.getMonth())
  const [tahun, setTahun] = useState<number>((TAHUN as readonly number[]).includes(now.getFullYear()) ? now.getFullYear() : 2026)
  const [busy, setBusy] = useState(false)

  const { items: migranAll } = useCollection<Migran>(STORAGE_KEYS.migran)
  const { items: sediaanAll } = useCollection<Sediaan>(STORAGE_KEYS.sediaan)
  const { items: jentikAll } = useCollection<Jentik>(STORAGE_KEYS.jentik)
  const { items: parameterAll } = useCollection<ParameterAir>(STORAGE_KEYS.parameter)
  const { items: lingkunganAll } = useCollection<Lingkungan>(STORAGE_KEYS.lingkungan)

  const data = useMemo(() => {
    const migran = migranAll.filter((r) => isInMonth(r.tglDatang, bulan, tahun))
    const sediaan = sediaanAll.filter((r) => isInMonth(r.tglPengambilan, bulan, tahun))
    const jentik = jentikAll.filter((r) => isInMonth(r.tanggal, bulan, tahun))
    const parameter = parameterAll.filter((r) => isInMonth(r.tanggal, bulan, tahun))
    const lingkungan = lingkunganAll.filter((r) => isInMonth(r.tanggal, bulan, tahun))
    const positif = sediaan.filter((s) => s.hasil === 'Positif')
    const lagoons = new Set([...jentik, ...parameter, ...lingkungan].map((r) => r.namaLagoon.trim().toLowerCase()))
    return {
      migran,
      sediaan,
      jentik,
      parameter,
      lingkungan,
      positif: positif.length,
      negatif: sediaan.length - positif.length,
      plasmodium: PLASMODIUM.map((p) => ({ jenis: p, jumlah: positif.filter((s) => s.plasmodium === p).length })),
      asal: ASAL_ENDEMIS.map((a) => ({ asal: a, jumlah: migran.filter((m) => m.asal === a).length })),
      totalLagoon: lagoons.size,
      totalJentik: jentik.reduce((sum, j) => sum + totalLagoon(j.titik), 0),
      avgKepadatan: average(jentik.map((j) => kepadatanLagoon(j.titik))),
      avgParam: {
        ph: average(parameter.map((p) => p.ph)),
        suhu: average(parameter.map((p) => p.suhu)),
        salinitas: average(parameter.map((p) => p.salinitas)),
        kekeruhan: average(parameter.map((p) => p.kekeruhan)),
        oksigen: average(parameter.map((p) => p.oksigen)),
        kedalaman: average(parameter.map((p) => p.kedalaman)),
      },
      vegetasi: VEGETASI.map((v) => ({ v, n: lingkungan.filter((l) => l.vegetasi === v).length })),
      sampahPlastik: lingkungan.filter((l) => l.sampah === 'Plastik').length,
      genanganAda: lingkungan.filter((l) => l.genangan === 'Ada').length,
      aksesSulit: lingkungan.filter((l) => l.akses !== 'Mudah').length,
    }
  }, [migranAll, sediaanAll, jentikAll, parameterAll, lingkunganAll, bulan, tahun])

  const periode = `${BULAN[bulan]} ${tahun}`
  const fileBase = `rekap-bulanan-${BULAN[bulan].toLowerCase()}-${tahun}`

  const tables = {
    migran: {
      head: ['No', 'NIK', 'Nama', 'Umur', 'JK', 'Asal', 'Tgl Datang', 'Banjar'],
      body: data.migran.map((m, i): Cell[] => [i + 1, m.nik, m.nama, m.umur, m.jk, m.asal, formatTanggal(m.tglDatang), m.alamatBanjar]),
    },
    sediaan: {
      head: ['No', 'Nama', 'Tgl Ambil', 'Jenis', 'Hasil', 'Plasmodium'],
      body: data.sediaan.map((s, i): Cell[] => [i + 1, s.nama, formatTanggal(s.tglPengambilan), s.jenisSediaan, s.hasil, s.hasil === 'Positif' ? s.plasmodium : '-']),
    },
    jentik: {
      head: ['No', 'Lagoon', 'Tanggal', 'T1', 'T2', 'T3', 'T4', 'Total', 'Kepadatan'],
      body: data.jentik.map((j, i): Cell[] => [
        i + 1,
        j.namaLagoon,
        formatTanggal(j.tanggal),
        ...j.titik.map((t) => totalTitik(t)),
        totalLagoon(j.titik),
        formatAngka(kepadatanLagoon(j.titik), 3),
      ]),
    },
    parameter: {
      head: ['No', 'Lagoon', 'Tanggal', 'pH', 'Suhu', 'Salinitas', 'Kekeruhan', 'DO', 'Kedalaman'],
      body: data.parameter.map((p, i): Cell[] => [
        i + 1,
        p.namaLagoon,
        formatTanggal(p.tanggal),
        p.ph,
        p.suhu,
        p.salinitas,
        p.kekeruhan,
        p.oksigen,
        p.kedalaman,
      ]),
    },
    lingkungan: {
      head: ['No', 'Lagoon', 'Tanggal', 'Vegetasi', 'Sampah', 'Akses', 'Genangan'],
      body: data.lingkungan.map((l, i): Cell[] => [i + 1, l.namaLagoon, formatTanggal(l.tanggal), l.vegetasi, l.sampah, l.akses, l.genangan]),
    },
  }

  const summary = [
    { label: 'Total Survei Migran', value: data.migran.length },
    { label: 'Total Sediaan Darah', value: data.sediaan.length },
    { label: 'Sediaan Positif', value: data.positif },
    { label: 'Sediaan Negatif', value: data.negatif },
    ...data.plasmodium.map((p) => ({ label: `  - P. ${p.jenis}`, value: p.jumlah })),
    { label: 'Total Lagoon Disurvei', value: data.totalLagoon },
    { label: 'Survei Pemantauan Jentik', value: data.jentik.length },
    { label: 'Total Jentik', value: data.totalJentik },
    { label: 'Rata-rata Kepadatan (jentik/ciduk)', value: formatAngka(data.avgKepadatan, 3) },
    { label: 'Survei Parameter Air', value: data.parameter.length },
    { label: 'Survei Kondisi Lingkungan', value: data.lingkungan.length },
  ]

  const avgParamRows: Cell[][] = data.parameter.length
    ? [[
        formatAngka(data.avgParam.ph),
        formatAngka(data.avgParam.suhu, 1),
        formatAngka(data.avgParam.salinitas, 1),
        formatAngka(data.avgParam.kekeruhan, 1),
        formatAngka(data.avgParam.oksigen, 1),
        formatAngka(data.avgParam.kedalaman, 0),
      ]]
    : []

  const lingkunganSummary: Cell[][] = data.lingkungan.length
    ? [
        ...data.vegetasi.map((v): Cell[] => [`Vegetasi: ${v.v}`, v.n]),
        ['Sampah Plastik', data.sampahPlastik],
        ['Akses Sulit / Perahu', data.aksesSulit],
        ['Genangan Ada', data.genanganAda],
      ]
    : []

  const downloadPdf = async () => {
    setBusy(true)
    try {
      const sections: PdfSection[] = [
        { title: '1. Survei Migran', ...tables.migran },
        { title: '2. Pengambilan Sediaan Darah', ...tables.sediaan },
        { title: '3a. Vektor Lagoon - Pemantauan Jentik', ...tables.jentik },
        { title: '3b. Vektor Lagoon - Parameter Air', ...tables.parameter },
        { title: '3b. Rata-rata Parameter Air', head: ['pH', 'Suhu (°C)', 'Salinitas (ppt)', 'Kekeruhan (NTU)', 'DO (mg/L)', 'Kedalaman (cm)'], body: avgParamRows },
        { title: '3c. Vektor Lagoon - Kondisi Lingkungan', ...tables.lingkungan },
        { title: '3c. Ringkasan Kondisi Lingkungan', head: ['Indikator', 'Jumlah'], body: lingkunganSummary },
      ]
      await exportReportPDF(`Rekap Bulanan - ${periode}`, `Periode ${periode}`, summary, sections, fileBase)
    } finally {
      setBusy(false)
    }
  }

  const downloadExcel = async () => {
    setBusy(true)
    try {
      await exportExcel(fileBase, [
        { name: 'Ringkasan', head: ['Indikator', 'Nilai'], body: summary.map((s) => [s.label.trim(), s.value]) },
        { name: 'Survei Migran', ...tables.migran },
        { name: 'Sediaan Darah', ...tables.sediaan },
        { name: 'Pemantauan Jentik', ...tables.jentik },
        { name: 'Parameter Air', ...tables.parameter },
        { name: 'Kondisi Lingkungan', ...tables.lingkungan },
      ])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <GlassCard>
        <SectionTitle
          icon={<CalendarRange className="size-5" />}
          title="Rekap Bulanan"
          description={`Ringkasan seluruh kegiatan surveilans periode ${periode}`}
          action={
            <div className="flex gap-2">
              <Button onClick={downloadPdf} disabled={busy}>
                <FileText />
                PDF Rekap
              </Button>
              <Button variant="success" onClick={downloadExcel} disabled={busy}>
                <FileSpreadsheet />
                Excel
              </Button>
            </div>
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:max-w-md">
          <Field label="Bulan" htmlFor="rekap-bulan">
            <SelectInput
              id="rekap-bulan"
              value={String(bulan)}
              onChange={(v) => setBulan(Number(v))}
              options={BULAN.map((b, i) => ({ value: String(i), label: b }))}
            />
          </Field>
          <Field label="Tahun" htmlFor="rekap-tahun">
            <SelectInput
              id="rekap-tahun"
              value={String(tahun)}
              onChange={(v) => setTahun(Number(v))}
              options={TAHUN.map((t) => ({ value: String(t), label: String(t) }))}
            />
          </Field>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Survei Migran" value={data.migran.length} icon={<Users />} />
        <StatCard label="Sediaan Positif" value={data.positif} icon={<ShieldAlert />} tone="red" sub={`dari ${data.sediaan.length} sediaan`} />
        <StatCard label="Sediaan Negatif" value={data.negatif} icon={<ShieldCheck />} tone="emerald" />
        <StatCard label="Lagoon Disurvei" value={data.totalLagoon} icon={<Waves />} />
        <StatCard label="Total Jentik" value={formatAngka(data.totalJentik, 0)} icon={<Bug />} tone="amber" />
        <StatCard label="Rata-rata Kepadatan" value={formatAngka(data.avgKepadatan, 3)} icon={<Gauge />} sub="jentik/ciduk" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <GlassCard>
          <SubHeading icon={<Users />} title="Survei Migran" count={data.migran.length} />
          <div className="mb-3 flex flex-wrap gap-2">
            {data.asal.map((a) => (
              <Badge key={a.asal} tone="amber">{`${a.asal}: ${a.jumlah}`}</Badge>
            ))}
          </div>
          <MiniTable
            head={['No', 'Nama', 'NIK', 'Asal', 'Tgl Datang']}
            body={data.migran.map((m, i) => [i + 1, <span key="n" className="font-semibold">{m.nama}</span>, <span key="k" className="font-mono text-xs">{m.nik}</span>, m.asal, formatTanggal(m.tglDatang)])}
          />
        </GlassCard>

        <GlassCard>
          <SubHeading icon={<Droplets />} title="Pengambilan Sediaan Darah" count={data.sediaan.length} />
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge tone="red">{`Positif: ${data.positif}`}</Badge>
            <Badge tone="emerald">{`Negatif: ${data.negatif}`}</Badge>
            {data.plasmodium.map((p) => (
              <Badge key={p.jenis} tone="slate">{`P. ${p.jenis}: ${p.jumlah}`}</Badge>
            ))}
          </div>
          <MiniTable
            head={['No', 'Nama', 'Tgl', 'Jenis', 'Hasil']}
            body={data.sediaan.map((s, i) => [
              i + 1,
              <span key="n" className="font-semibold">{s.nama}</span>,
              formatTanggal(s.tglPengambilan),
              s.jenisSediaan,
              <Badge key="h" tone={s.hasil === 'Positif' ? 'red' : 'emerald'}>
                {s.hasil === 'Positif' ? `Positif (${s.plasmodium})` : 'Negatif'}
              </Badge>,
            ])}
          />
        </GlassCard>
      </div>

      <GlassCard>
        <SectionTitle
          icon={<Waves className="size-5" />}
          title="Pengendalian Vektor Lagoon"
          description={`${data.totalLagoon} lagoon disurvei - breakdown per sub kegiatan`}
        />
        <div className="flex flex-col gap-6">
          <div>
            <SubHeading icon={<Bug />} title="Pemantauan Jentik" count={data.jentik.length} />
            <MiniTable
              head={['Lagoon', 'Tanggal', 'T1', 'T2', 'T3', 'T4', 'Total', 'Kepadatan']}
              body={data.jentik.map((j) => [
                <span key="n" className="font-semibold">{j.namaLagoon}</span>,
                formatTanggal(j.tanggal),
                ...j.titik.map((t) => totalTitik(t)),
                <span key="t" className="font-bold text-sky-700">{totalLagoon(j.titik)}</span>,
                formatAngka(kepadatanLagoon(j.titik), 3),
              ])}
            />
          </div>

          <div>
            <SubHeading icon={<FlaskConical />} title="Parameter Air (rata-rata)" count={data.parameter.length} />
            <MiniTable
              head={['pH', 'Suhu (°C)', 'Salinitas (ppt)', 'Kekeruhan (NTU)', 'DO (mg/L)', 'Kedalaman (cm)']}
              body={avgParamRows}
            />
          </div>

          <div>
            <SubHeading icon={<Leaf />} title="Kondisi Lingkungan" count={data.lingkungan.length} />
            <MiniTable head={['Indikator', 'Jumlah Lagoon']} body={lingkunganSummary} />
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
