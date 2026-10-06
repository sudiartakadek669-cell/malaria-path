export interface BaseRecord {
  id: string
  createdAt: string
}

export const JENIS_KELAMIN = ['Laki-laki', 'Perempuan'] as const
export const ASAL_ENDEMIS = ['Papua', 'NTT', 'Maluku', 'Kalimantan'] as const
export const JENIS_PEMERIKSAAN = ['RDT', 'Mikroskopis'] as const
export const HASIL = ['Negatif', 'Positif'] as const
export const PLASMODIUM = ['Falciparum', 'Vivax', 'Mix', 'Malariae'] as const
export type JenisPemeriksaan = (typeof JENIS_PEMERIKSAAN)[number]
export type Hasil = (typeof HASIL)[number]
export const VEGETASI = ['Mangrove Lebat', 'Mangrove Jarang', 'Enceng Gondok'] as const
export const SAMPAH = ['Bersih', 'Plastik'] as const
export const AKSES = ['Mudah', 'Sulit', 'Perahu'] as const
export const GENANGAN = ['Ada', 'Tidak Ada'] as const

export interface Migran extends BaseRecord {
  nik: string
  nama: string
  umur: number
  jk: (typeof JENIS_KELAMIN)[number]
  asal: (typeof ASAL_ENDEMIS)[number]
  tglDatang: string
  alamatBanjar: string
  hp: string
}

export interface Sediaan extends BaseRecord {
  migranId: string
  nik: string
  nama: string
  umur: number
  jk: string
  tglPemeriksaan: string
  jenisPemeriksaan: JenisPemeriksaan
  hasil: Hasil
  plasmodium: string
  petugas: string
}

type LegacySediaan = Partial<Sediaan> & { tglPengambilan?: string; jenisSediaan?: string }

/** Upgrades records saved before the RDT/Mikroskopis change so old localStorage data keeps working. */
export function normalizeSediaan(raw: Sediaan): Sediaan {
  const r = raw as LegacySediaan & Sediaan
  return {
    ...r,
    tglPemeriksaan: r.tglPemeriksaan ?? r.tglPengambilan ?? '',
    jenisPemeriksaan: r.jenisPemeriksaan ?? (r.jenisSediaan === 'RDT' ? 'RDT' : 'Mikroskopis'),
    plasmodium: r.hasil === 'Positif' && r.plasmodium && r.plasmodium !== '-' ? r.plasmodium : '',
    petugas: r.petugas ?? '',
  }
}

export const plasmodiumLabel = (s: Pick<Sediaan, 'hasil' | 'plasmodium'>) =>
  s.hasil === 'Positif' && s.plasmodium ? `P. ${s.plasmodium}` : '-'

export interface Jentik extends BaseRecord {
  namaLagoon: string
  lokasi: string
  tanggal: string
  petugas: string
  titik: number[][]
}

export interface ParameterAir extends BaseRecord {
  namaLagoon: string
  tanggal: string
  ph: number
  suhu: number
  salinitas: number
  kekeruhan: number
  oksigen: number
  kedalaman: number
}

export interface Lingkungan extends BaseRecord {
  namaLagoon: string
  tanggal: string
  vegetasi: (typeof VEGETASI)[number]
  sampah: (typeof SAMPAH)[number]
  akses: (typeof AKSES)[number]
  genangan: (typeof GENANGAN)[number]
}

export const STORAGE_KEYS = {
  migran: 'smm.migran',
  sediaan: 'smm.sediaan',
  jentik: 'smm.vektor.jentik',
  parameter: 'smm.vektor.parameter',
  lingkungan: 'smm.vektor.lingkungan',
} as const

export const BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const

export const TAHUN = [2025, 2026] as const
