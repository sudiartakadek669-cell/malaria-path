'use client'

import { useState, type FormEvent } from 'react'
import { Save, Lock } from 'lucide-react'
import { Field, FormActions, SelectInput, inputClass } from '../kit'
import {
  HASIL,
  JENIS_PEMERIKSAAN,
  PLASMODIUM,
  type Hasil,
  type JenisPemeriksaan,
  type Migran,
  type Sediaan,
} from '@/lib/types'
import type { NewRecord } from '@/lib/store'
import { today } from '@/lib/format'

type SediaanInput = NewRecord<Sediaan>
type FormState = Omit<SediaanInput, 'jenisPemeriksaan' | 'hasil'> & {
  jenisPemeriksaan: JenisPemeriksaan | ''
  hasil: Hasil | ''
}
type Errors = Partial<Record<'migran' | 'tgl' | 'jenis' | 'hasil', string>>

const blank = (): FormState => ({
  migranId: '',
  nik: '',
  nama: '',
  umur: 0,
  jk: '',
  tglPemeriksaan: today(),
  jenisPemeriksaan: '',
  hasil: '',
  plasmodium: '',
  petugas: '',
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
  onSubmit: (data: SediaanInput) => void
  onCancel?: () => void
  submitLabel?: string
}) {
  const [form, setForm] = useState<FormState>(() => {
    if (!initial) return blank()
    const { id: _id, createdAt: _c, ...rest } = initial
    return rest
  })
  const [errors, setErrors] = useState<Errors>({})

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const selectMigran = (id: string) => {
    const m = migran.find((x) => x.id === id)
    if (!m) return
    setErrors((e) => ({ ...e, migran: undefined }))
    setForm((f) => ({ ...f, migranId: m.id, nik: m.nik, nama: m.nama, umur: m.umur, jk: m.jk }))
  }

  const setHasil = (hasil: string) => {
    setErrors((e) => ({ ...e, hasil: undefined }))
    setForm((f) => ({ ...f, hasil: hasil as Hasil, plasmodium: hasil === 'Positif' ? f.plasmodium : '' }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const next: Errors = {}
    if (!form.migranId) next.migran = 'Pilih migran terlebih dahulu'
    if (!form.tglPemeriksaan) next.tgl = 'Tanggal pemeriksaan wajib diisi'
    if (!form.jenisPemeriksaan) next.jenis = 'Pilih jenis pemeriksaan'
    if (!form.hasil) next.hasil = 'Pilih hasil pemeriksaan'
    setErrors(next)
    if (Object.keys(next).length) return
    onSubmit({
      ...form,
      jenisPemeriksaan: form.jenisPemeriksaan as JenisPemeriksaan,
      hasil: form.hasil as Hasil,
      petugas: form.petugas.trim(),
    })
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
          error={errors.migran}
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

        <Field label="Tanggal Pemeriksaan" htmlFor={`${p}-tgl`} error={errors.tgl}>
          <input
            id={`${p}-tgl`}
            type="date"
            required
            value={form.tglPemeriksaan}
            onChange={(e) => set('tglPemeriksaan', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Jenis Pemeriksaan *" htmlFor={`${p}-jenis`} error={errors.jenis}>
          <SelectInput
            id={`${p}-jenis`}
            value={form.jenisPemeriksaan}
            onChange={(v) => {
              setErrors((e) => ({ ...e, jenis: undefined }))
              set('jenisPemeriksaan', v as JenisPemeriksaan)
            }}
            options={JENIS_PEMERIKSAAN}
            placeholder="-- Pilih jenis --"
          />
        </Field>
        <Field label="Hasil Pemeriksaan *" htmlFor={`${p}-hasil`} error={errors.hasil}>
          <SelectInput
            id={`${p}-hasil`}
            value={form.hasil}
            onChange={setHasil}
            options={HASIL}
            placeholder="-- Pilih hasil --"
          />
        </Field>
        <Field
          label="Jenis Plasmodium (opsional)"
          htmlFor={`${p}-plas`}
          hint={form.hasil !== 'Positif' ? 'Aktif bila hasil positif' : undefined}
        >
          <SelectInput
            id={`${p}-plas`}
            value={form.hasil === 'Positif' ? form.plasmodium : ''}
            onChange={(v) => set('plasmodium', v)}
            options={PLASMODIUM}
            placeholder="- Tidak diketahui -"
            disabled={form.hasil !== 'Positif'}
          />
        </Field>
        <Field label="Petugas" htmlFor={`${p}-petugas`} className="sm:col-span-2 lg:col-span-1">
          <input
            id={`${p}-petugas`}
            value={form.petugas}
            onChange={(e) => set('petugas', e.target.value)}
            placeholder="Nama petugas pemeriksa"
            autoComplete="name"
            className={inputClass}
          />
        </Field>
      </div>
      <FormActions onCancel={onCancel} submitLabel={submitLabel} icon={<Save />} />
    </form>
  )
}
