'use client'

import { useState, type FormEvent } from 'react'
import { Save, Waves, Calculator, Bug, Gauge } from 'lucide-react'
import { Field, FormActions, inputClass } from '../kit'
import type { Jentik } from '@/lib/types'
import type { NewRecord } from '@/lib/store'
import {
  CIDUKAN_PER_TITIK,
  TITIK_COUNT,
  formatAngka,
  kepadatanLagoon,
  kepadatanTitik,
  today,
  totalLagoon,
  totalTitik,
} from '@/lib/format'
import { cn } from '@/lib/utils'

type FormState = Omit<NewRecord<Jentik>, 'titik'> & { titik: string[][] }

const blankTitik = () =>
  Array.from({ length: TITIK_COUNT }, () => Array.from({ length: CIDUKAN_PER_TITIK }, () => ''))

const blank = (): FormState => ({
  namaLagoon: '',
  lokasi: '',
  tanggal: today(),
  petugas: '',
  titik: blankTitik(),
})

const toNumbers = (titik: string[][]) => titik.map((t) => t.map((c) => Math.max(0, Number(c) || 0)))

export function LagoonNameInput({
  id,
  value,
  onChange,
  suggestions,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  suggestions: string[]
}) {
  return (
    <>
      <input
        id={id}
        list={`${id}-list`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder="Contoh: Lagoon Serangan"
        autoComplete="off"
      />
      <datalist id={`${id}-list`}>
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </>
  )
}

export function JentikSummary({ titik }: { titik: number[][] }) {
  const total = totalLagoon(titik)
  const kepadatan = kepadatanLagoon(titik)
  const items = [
    { label: 'Total Cidukan', value: `${TITIK_COUNT * CIDUKAN_PER_TITIK}x`, icon: Calculator },
    { label: 'Total Jentik Lagoon', value: formatAngka(total, 0), icon: Bug },
    { label: 'Kepadatan Lagoon', value: formatAngka(kepadatan, 3), unit: 'jentik/ciduk', icon: Gauge },
  ]
  return (
    <div className="grid grid-cols-3 gap-2 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 p-2 text-white shadow-lg shadow-sky-600/25 sm:gap-3 sm:p-3">
      {items.map(({ label, value, unit, icon: Icon }) => (
        <div key={label} className="rounded-xl bg-white/10 p-2.5 ring-1 ring-white/20 backdrop-blur sm:p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-sky-100 sm:text-xs">
            <Icon className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </div>
          <p className="mt-1 text-lg font-bold tabular-nums sm:text-2xl" aria-live="polite">
            {value}
          </p>
          {unit && <p className="text-[10px] text-sky-100 sm:text-xs">{unit}</p>}
        </div>
      ))}
    </div>
  )
}

export function JentikForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Simpan Data',
  suggestions,
}: {
  initial?: Jentik
  onSubmit: (data: NewRecord<Jentik>) => void
  onCancel?: () => void
  submitLabel?: string
  suggestions: string[]
}) {
  const [form, setForm] = useState<FormState>(() =>
    initial ? { ...initial, titik: initial.titik.map((t) => t.map(String)) } : blank(),
  )
  const [error, setError] = useState('')
  const numeric = toNumbers(form.titik)

  const setCell = (t: number, c: number, value: string) =>
    setForm((f) => ({
      ...f,
      titik: f.titik.map((row, ti) => (ti === t ? row.map((v, ci) => (ci === c ? value.replace(/\D/g, '') : v)) : row)),
    }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.namaLagoon.trim()) return setError('Nama lagoon wajib diisi')
    if (!form.tanggal) return setError('Tanggal wajib diisi')
    onSubmit({
      namaLagoon: form.namaLagoon.trim(),
      lokasi: form.lokasi.trim(),
      tanggal: form.tanggal,
      petugas: form.petugas.trim(),
      titik: numeric,
    })
    if (!initial) setForm(blank())
    setError('')
  }

  const p = initial ? 'edit-j' : 'j'

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="sticky top-0 z-10 -mx-1 px-1 pt-1 sm:static">
        <JentikSummary titik={numeric} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Nama Lagoon" htmlFor={`${p}-nama`} error={error}>
          <LagoonNameInput id={`${p}-nama`} value={form.namaLagoon} onChange={(v) => setForm((f) => ({ ...f, namaLagoon: v }))} suggestions={suggestions} />
        </Field>
        <Field label="Lokasi / Banjar" htmlFor={`${p}-lokasi`}>
          <input id={`${p}-lokasi`} value={form.lokasi} onChange={(e) => setForm((f) => ({ ...f, lokasi: e.target.value }))} className={inputClass} placeholder="Banjar / Desa" />
        </Field>
        <Field label="Tanggal Survei" htmlFor={`${p}-tgl`}>
          <input id={`${p}-tgl`} type="date" value={form.tanggal} onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))} className={inputClass} />
        </Field>
        <Field label="Petugas" htmlFor={`${p}-petugas`}>
          <input id={`${p}-petugas`} value={form.petugas} onChange={(e) => setForm((f) => ({ ...f, petugas: e.target.value }))} className={inputClass} placeholder="Nama petugas" />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {form.titik.map((cidukan, t) => {
          const total = totalTitik(numeric[t])
          return (
            <fieldset key={t} className="rounded-2xl border border-sky-100 bg-white/70 p-3.5">
              <legend className="sr-only">{`Titik ${t + 1}`}</legend>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-sky-100 text-sm font-bold text-sky-700">
                    {t + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{`Titik ${t + 1}`}</p>
                    <p className="text-xs text-muted-foreground">10x cidukan</p>
                  </div>
                </div>
                <div className="flex gap-2 text-right">
                  <div className="rounded-lg bg-sky-50 px-2.5 py-1">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</p>
                    <p className="text-sm font-bold tabular-nums text-sky-700">{total}</p>
                  </div>
                  <div className="rounded-lg bg-sky-50 px-2.5 py-1">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Kepadatan</p>
                    <p className="text-sm font-bold tabular-nums text-sky-700">{formatAngka(kepadatanTitik(numeric[t]), 2)}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {cidukan.map((value, c) => (
                  <div key={c} className="flex flex-col gap-1">
                    <label htmlFor={`${p}-t${t}-c${c}`} className="text-center text-[11px] font-semibold text-sky-900/60">
                      {`C${c + 1}`}
                    </label>
                    <input
                      id={`${p}-t${t}-c${c}`}
                      inputMode="numeric"
                      value={value}
                      onChange={(e) => setCell(t, c, e.target.value)}
                      placeholder="0"
                      aria-label={`Titik ${t + 1} cidukan ${c + 1}`}
                      className={cn(inputClass, 'h-10 px-1 text-center font-semibold tabular-nums', Number(value) > 0 && 'border-sky-300 bg-sky-50 text-sky-800')}
                    />
                  </div>
                ))}
              </div>
            </fieldset>
          )
        })}
      </div>

      <FormActions onCancel={onCancel} submitLabel={submitLabel} icon={<Save />} />
    </form>
  )
}

export function JentikDetail({ titik }: { titik: number[][] }) {
  return (
    <div className="flex flex-col gap-3">
      <JentikSummary titik={titik} />
      <div className="overflow-x-auto rounded-xl border border-sky-100">
        <table className="w-full min-w-max text-center text-sm">
          <caption className="sr-only">Rincian cidukan per titik</caption>
          <thead>
            <tr className="bg-sky-50 text-xs font-semibold text-sky-900/70">
              <th scope="col" className="px-2 py-2 text-left">
                <span className="inline-flex items-center gap-1">
                  <Waves className="size-3.5" aria-hidden="true" />
                  Titik
                </span>
              </th>
              {Array.from({ length: CIDUKAN_PER_TITIK }, (_, i) => (
                <th key={i} scope="col" className="px-2 py-2">{`C${i + 1}`}</th>
              ))}
              <th scope="col" className="px-2 py-2">Total</th>
              <th scope="col" className="px-2 py-2">Kepadatan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-50">
            {titik.map((row, t) => (
              <tr key={t}>
                <th scope="row" className="px-2 py-2 text-left font-semibold">{`Titik ${t + 1}`}</th>
                {row.map((c, i) => (
                  <td key={i} className={cn('px-2 py-2 tabular-nums', c > 0 && 'font-semibold text-sky-700')}>
                    {c}
                  </td>
                ))}
                <td className="px-2 py-2 font-bold tabular-nums">{totalTitik(row)}</td>
                <td className="px-2 py-2 font-bold tabular-nums text-sky-700">{formatAngka(kepadatanTitik(row), 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
