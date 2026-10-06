'use client'

import { useState, type FormEvent } from 'react'
import { Save } from 'lucide-react'
import { ChoiceGroup, Field, FormActions, SelectInput, inputClass } from '../kit'
import { LagoonNameInput } from './jentik-form'
import { AKSES, GENANGAN, SAMPAH, VEGETASI, type Lingkungan } from '@/lib/types'
import type { NewRecord } from '@/lib/store'
import { today } from '@/lib/format'

type FormState = NewRecord<Lingkungan>

const blank = (): FormState => ({
  namaLagoon: '',
  tanggal: today(),
  vegetasi: 'Mangrove Lebat',
  sampah: 'Bersih',
  akses: 'Mudah',
  genangan: 'Ada',
})

export function LingkunganForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Simpan Data',
  suggestions,
}: {
  initial?: Lingkungan
  onSubmit: (data: FormState) => void
  onCancel?: () => void
  submitLabel?: string
  suggestions: string[]
}) {
  const [form, setForm] = useState<FormState>(() => (initial ? { ...initial } : blank()))
  const [error, setError] = useState('')
  const set = <K extends keyof FormState>(key: K, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.namaLagoon.trim()) return setError('Nama lagoon wajib diisi')
    onSubmit({ ...form, namaLagoon: form.namaLagoon.trim() })
    if (!initial) setForm(blank())
    setError('')
  }

  const p = initial ? 'edit-l' : 'l'

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nama Lagoon" htmlFor={`${p}-nama`} error={error}>
          <LagoonNameInput id={`${p}-nama`} value={form.namaLagoon} onChange={(v) => set('namaLagoon', v)} suggestions={suggestions} />
        </Field>
        <Field label="Tanggal Observasi" htmlFor={`${p}-tgl`}>
          <input id={`${p}-tgl`} type="date" value={form.tanggal} onChange={(e) => set('tanggal', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Vegetasi" htmlFor={`${p}-veg`}>
          <SelectInput id={`${p}-veg`} value={form.vegetasi} onChange={(v) => set('vegetasi', v)} options={VEGETASI} />
        </Field>
        <Field label="Sampah">
          <ChoiceGroup label="Sampah" value={form.sampah} onChange={(v) => set('sampah', v)} options={SAMPAH} />
        </Field>
        <Field label="Akses">
          <ChoiceGroup label="Akses" value={form.akses} onChange={(v) => set('akses', v)} options={AKSES} />
        </Field>
        <Field label="Genangan">
          <ChoiceGroup label="Genangan" value={form.genangan} onChange={(v) => set('genangan', v)} options={GENANGAN} />
        </Field>
      </div>
      <FormActions onCancel={onCancel} submitLabel={submitLabel} icon={<Save />} />
    </form>
  )
}
