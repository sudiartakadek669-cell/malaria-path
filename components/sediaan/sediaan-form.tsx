'use client'

import { useState, type FormEvent } from 'react'
import { Save, Lock } from 'lucide-react'
import { ChoiceGroup, Field, FormActions, SelectInput, inputClass } from '../kit'
import { HASIL, JENIS_SEDIAAN, PLASMODIUM, type Migran, type Sediaan } from '@/lib/types'
import type { NewRecord } from '@/lib/store'
import { today } from '@/lib/format'

type FormState = NewRecord<Sediaan>

const blank = (): FormState => ({
  migranId: '',
  nik: '',
  nama: '',
  umur: 0,
  jk: '',
  tglPengambilan: today(),
  jenisSediaan: 'RDT',
  hasil: 'Negatif',
  plasmodium: '-',
})

export function SediaanForm({
  migran,
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Simpan Data',
}: {
  migran: Migran[]
  initial?: Sediaan
  onSubmit: (data: FormState) => void
  onCancel?: () => void
  submitLabel?: string
}) {
  const [form, setForm] = useState<FormState>(() => (initial ? { ...initial } : blank()))
  const [error, setError] = useState('')

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const selectMigran = (id: string) => {
    const m = migran.find((x) => x.id === id)
    if (!m) return
    setError('')
    setForm((f) => ({ ...f, migranId: m.id, nik: m.nik, nama: m.nama, umur: m.umur, jk: m.jk }))
  }

  const setHasil = (hasil: string) =>
    setForm((f) => ({
      ...f,
      hasil: hasil as FormState['hasil'],
      plasmodium: hasil === 'Positif' ? (f.plasmodium === '-' ? 'Falciparum' : f.plasmodium) : '-',
    }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.migranId) return setError('Pilih migran terlebih dahulu')
    if (!form.tglPengambilan) return setError('Tanggal pengambilan wajib diisi')
    onSubmit(form)
    if (!initial) setForm(blank())
  }

  const p = initial ? 'edit-s' : 's'
  const options = migran.map((m) => ({ value: m.id, label: `${m.nama} — ${m.nik}` }))

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field
          label="Pilih Migran (dari Survei Migran)"
          htmlFor={`${p}-migran`}
          className="sm:col-span-2 lg:col-span-3"
          error={error}
          hint={migran.length === 0 ? 'Belum ada data migran. Isi Menu Survei Migran terlebih dahulu.' : undefined}
        >
          <SelectInput
            id={`${p}-migran`}
            value={form.migranId}
            onChange={selectMigran}
            options={options}
            placeholder={migran.length ? '-- Pilih migran --' : 'Tidak ada data migran'}
            disabled={migran.length === 0}
          />
        </Field>

        {(['nama', 'umur', 'jk'] as const).map((key) => (
          <Field key={key} label={key === 'nama' ? 'Nama' : key === 'umur' ? 'Umur' : 'Jenis Kelamin'} htmlFor={`${p}-${key}`}>
            <div className="relative">
              <input
                id={`${p}-${key}`}
                readOnly
                tabIndex={-1}
                value={form.migranId ? (key === 'umur' ? `${form.umur} tahun` : form[key]) : ''}
                placeholder="Otomatis terisi"
                className={inputClass}
              />
              <Lock className="pointer-events-none absolute right-3.5 top-1/2 size-3.5 -translate-y-1/2 text-sky-400" aria-hidden="true" />
            </div>
          </Field>
        ))}

        <Field label="Tanggal Pengambilan" htmlFor={`${p}-tgl`}>
          <input
            id={`${p}-tgl`}
            type="date"
            value={form.tglPengambilan}
            onChange={(e) => set('tglPengambilan', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Jenis Sediaan" htmlFor={`${p}-jenis`}>
          <SelectInput
            id={`${p}-jenis`}
            value={form.jenisSediaan}
            onChange={(v) => set('jenisSediaan', v as FormState['jenisSediaan'])}
            options={JENIS_SEDIAAN}
          />
        </Field>
        <Field label="Hasil Pemeriksaan">
          <ChoiceGroup label="Hasil Pemeriksaan" value={form.hasil} onChange={setHasil} options={HASIL} />
        </Field>
        <Field
          label="Jenis Plasmodium"
          htmlFor={`${p}-plas`}
          hint={form.hasil === 'Negatif' ? 'Hanya diisi bila hasil positif' : undefined}
        >
          <SelectInput
            id={`${p}-plas`}
            value={form.hasil === 'Positif' ? form.plasmodium : ''}
            onChange={(v) => set('plasmodium', v)}
            options={PLASMODIUM}
            placeholder="-"
            disabled={form.hasil === 'Negatif'}
          />
        </Field>
      </div>
      <FormActions onCancel={onCancel} submitLabel={submitLabel} icon={<Save />} />
    </form>
  )
}
