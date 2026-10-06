export interface BaseRecord {
  id: string
  createdAt: string
}

export const JENIS_KELAMIN = ['Laki-laki', 'Perempuan'] as const
export const ASAL_ENDEMIS = ['Papua', 'NTT', 'Maluku', 'Kalimantan'] as const
export const JENIS_SEDIAAN = ['RDT', 'Tetes Tebal', 'Tetes Tipis', 'RDT + Mikroskopis'] as const
export const HASIL = ['Positif', 'Negatif'] as const
export const PLASMODIUM = ['Falciparum', 'Vivax', 'Mix'] as const
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
  tglPengambilan: string
  jenisSediaan: (typeof JENIS_SEDIAAN)[number]
  hasil: (typeof HASIL)[number]
  plasmodium: string
}

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
