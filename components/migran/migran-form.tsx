'use client'

import { useState, type FormEvent } from 'react'
import { Save } from 'lucide-react'
import { ChoiceGroup, Field, FormActions, SelectInput, inputClass } from '../kit'
import { ASAL_ENDEMIS, JENIS_KELAMIN, type Migran } from '@/lib/types'
import type { NewRecord } from '@/lib/store'
import { today } from '@/lib/format'

type FormState = Omit<NewRecord<Migran>, 'umur'> & { umur: string }

const blank = (): FormState => ({
  nik: '',
  nama: '',
  umur: '',
  jk: 'Laki-laki',
  asal: 'Papua',
  tglDatang: today(),
  alamatBanjar: '',
  hp: '',
})

export function MigranForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Simpan Data',
  existingNiks = [],
}: {
  initial?: Migran
  onSubmit: (data: NewRecord<Migran>) => void
  onCancel?: () => void
  submitLabel?: string
  existingNiks?: string[]
}) {
  const [form, setForm] = useState<FormState>(() =>
    initial ? { ...initial, umur: String(initial.umur) } : blank(),
  )
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!/^\d{16}$/.test(form.nik)) next.nik = 'NIK harus 16 digit angka'
    else if (existingNiks.includes(form.nik) && form.nik !== initial?.nik) next.nik = 'NIK sudah terdaftar'
    if (!form.nama.trim()) next.nama = 'Nama wajib diisi'
    const umur = Number(form.umur)
    if (!form.umur || !Number.isInteger(umur) || umur < 0 || umur > 120) next.umur = 'Umur 0-120 tahun'
    if (!form.tglDatang) next.tglDatang = 'Tanggal wajib diisi'
    if (!form.alamatBanjar.trim()) next.alamatBanjar = 'Alamat banjar wajib diisi'
    if (!/^(\+62|62|0)8\d{7,12}$/.test(form.hp.replace(/[\s-]/g, ''))) next.hp = 'Nomor HP tidak valid (contoh 0812xxxxxxx)'
    setErrors(next)
    if (Object.keys(next).length) return
    onSubmit({
      ...form,
      nama: form.nama.trim(),
      alamatBanjar: form.alamatBanjar.trim(),
      hp: form.hp.replace(/[\s-]/g, ''),
      umur,
    })
    if (!initial) setForm(blank())
  }

  const p = initial ? 'edit-m' : 'm'

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="NIK" htmlFor={`${p}-nik`} error={errors.nik} hint="16 digit sesuai KTP">
          <input
            id={`${p}-nik`}
            inputMode="numeric"
            maxLength={16}
            value={form.nik}
            onChange={(e) => set('nik', e.target.value.replace(/\D/g, ''))}
            className={inputClass}
            placeholder="5171xxxxxxxxxxxx"
          />
        </Field>
        <Field label="Nama Lengkap" htmlFor={`${p}-nama`} error={errors.nama} className="lg:col-span-2">
          <input
            id={`${p}-nama`}
            value={form.nama}
            onChange={(e) => set('nama', e.target.value)}
            className={inputClass}
            placeholder="Nama sesuai KTP"
            autoComplete="off"
          />
        </Field>
        <Field label="Umur (tahun)" htmlFor={`${p}-umur`} error={errors.umur}>
          <input
            id={`${p}-umur`}
            type="number"
            inputMode="numeric"
            min={0}
            max={120}
            value={form.umur}
            onChange={(e) => set('umur', e.target.value)}
            className={inputClass}
            placeholder="0"
          />
        </Field>
        <Field label="Jenis Kelamin">
          <ChoiceGroup label="Jenis Kelamin" value={form.jk} onChange={(v) => set('jk', v as FormState['jk'])} options={JENIS_KELAMIN} />
        </Field>
        <Field label="Asal Daerah Endemis" htmlFor={`${p}-asal`}>
          <SelectInput id={`${p}-asal`} value={form.asal} onChange={(v) => set('asal', v as FormState['asal'])} options={ASAL_ENDEMIS} />
        </Field>
        <Field label="Tanggal Datang" htmlFor={`${p}-tgl`} error={errors.tglDatang}>
          <input id={`${p}-tgl`} type="date" value={form.tglDatang} onChange={(e) => set('tglDatang', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Alamat Banjar" htmlFor={`${p}-banjar`} error={errors.alamatBanjar}>
          <input
            id={`${p}-banjar`}
            value={form.alamatBanjar}
            onChange={(e) => set('alamatBanjar', e.target.value)}
            className={inputClass}
            placeholder="Banjar ..."
          />
        </Field>
        <Field label="Nomor HP" htmlFor={`${p}-hp`} error={errors.hp}>
          <input
            id={`${p}-hp`}
            type="tel"
            inputMode="tel"
            value={form.hp}
            onChange={(e) => set('hp', e.target.value)}
            className={inputClass}
            placeholder="0812xxxxxxxx"
          />
        </Field>
      </div>
      <FormActions onCancel={onCancel} submitLabel={submitLabel} icon={<Save />} />
    </form>
  )
}
