'use client'

import { useState, type FormEvent } from 'react'
import { Save } from 'lucide-react'
import { Field, FormActions, inputClass } from '../kit'
import { LagoonNameInput } from './jentik-form'
import type { ParameterAir } from '@/lib/types'
import type { NewRecord } from '@/lib/store'
import { today } from '@/lib/format'

type NumKey = 'ph' | 'suhu' | 'salinitas' | 'kekeruhan' | 'oksigen' | 'kedalaman'
type FormState = { namaLagoon: string; tanggal: string } & Record<NumKey, string>

export const PARAMETER_FIELDS: { key: NumKey; label: string; unit: string; step: string; min?: number; max?: number }[] = [
  { key: 'ph', label: 'pH', unit: '', step: '0.1', min: 0, max: 14 },
  { key: 'suhu', label: 'Suhu', unit: '°C', step: '0.1' },
  { key: 'salinitas', label: 'Salinitas', unit: 'ppt', step: '0.1', min: 0 },
  { key: 'kekeruhan', label: 'Kekeruhan', unit: 'NTU', step: '0.1', min: 0 },
  { key: 'oksigen', label: 'DO (Oksigen Terlarut)', unit: 'mg/L', step: '0.1', min: 0 },
  { key: 'kedalaman', label: 'Kedalaman', unit: 'cm', step: '1', min: 0 },
]

const blank = (): FormState => ({
  namaLagoon: '',
  tanggal: today(),
  ph: '',
  suhu: '',
  salinitas: '',
  kekeruhan: '',
  oksigen: '',
  kedalaman: '',
})

export function ParameterForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Simpan Data',
  suggestions,
}: {
  initial?: ParameterAir
  onSubmit: (data: NewRecord<ParameterAir>) => void
  onCancel?: () => void
  submitLabel?: string
  suggestions: string[]
}) {
  const [form, setForm] = useState<FormState>(() => {
    if (!initial) return blank()
    const s = blank()
    s.namaLagoon = initial.namaLagoon
    s.tanggal = initial.tanggal
    for (const f of PARAMETER_FIELDS) s[f.key] = String(initial[f.key])
    return s
  })
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.namaLagoon.trim()) return setError('Nama lagoon wajib diisi')
    const missing = PARAMETER_FIELDS.find((f) => form[f.key] === '' || Number.isNaN(Number(form[f.key])))
    if (missing) return setError(`${missing.label} wajib diisi`)
    const ph = Number(form.ph)
    if (ph < 0 || ph > 14) return setError('pH harus antara 0-14')
    onSubmit({
      namaLagoon: form.namaLagoon.trim(),
      tanggal: form.tanggal,
      ph,
      suhu: Number(form.suhu),
      salinitas: Number(form.salinitas),
      kekeruhan: Number(form.kekeruhan),
      oksigen: Number(form.oksigen),
      kedalaman: Number(form.kedalaman),
    })
    if (!initial) setForm(blank())
    setError('')
  }

  const p = initial ? 'edit-p' : 'p'

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nama Lagoon" htmlFor={`${p}-nama`} error={error}>
          <LagoonNameInput id={`${p}-nama`} value={form.namaLagoon} onChange={(v) => setForm((f) => ({ ...f, namaLagoon: v }))} suggestions={suggestions} />
        </Field>
        <Field label="Tanggal Pengukuran" htmlFor={`${p}-tgl`}>
          <input id={`${p}-tgl`} type="date" value={form.tanggal} onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))} className={inputClass} />
        </Field>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PARAMETER_FIELDS.map((f) => (
          <Field key={f.key} label={f.unit ? `${f.label} (${f.unit})` : f.label} htmlFor={`${p}-${f.key}`}>
            <input
              id={`${p}-${f.key}`}
              type="number"
              inputMode="decimal"
              step={f.step}
              min={f.min}
              max={f.max}
              value={form[f.key]}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
              className={inputClass}
              placeholder="0"
            />
          </Field>
        ))}
      </div>
      <FormActions onCancel={onCancel} submitLabel={submitLabel} icon={<Save />} />
    </form>
  )
}
