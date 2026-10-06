export function formatTanggal(value: string) {
  if (!value) return '-'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatAngka(value: number, digits = 2) {
  if (!Number.isFinite(value)) return '0'
  return value.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })
}

export function isInMonth(dateValue: string, month: number, year: number) {
  if (!dateValue) return false
  const [y, m] = dateValue.split('-').map(Number)
  return y === year && m === month + 1
}

export function today() {
  const d = new Date()
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().slice(0, 10)
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const TITIK_COUNT = 4
export const CIDUKAN_PER_TITIK = 10

export function emptyTitik(): number[][] {
  return Array.from({ length: TITIK_COUNT }, () =>
    Array.from({ length: CIDUKAN_PER_TITIK }, () => 0),
  )
}

export function totalTitik(cidukan: number[]) {
  return cidukan.reduce((sum, n) => sum + (Number(n) || 0), 0)
}

export function kepadatanTitik(cidukan: number[]) {
  return totalTitik(cidukan) / CIDUKAN_PER_TITIK
}

export function totalLagoon(titik: number[][]) {
  return titik.reduce((sum, t) => sum + totalTitik(t), 0)
}

export function kepadatanLagoon(titik: number[][]) {
  return totalLagoon(titik) / (TITIK_COUNT * CIDUKAN_PER_TITIK)
}
