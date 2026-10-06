'use client'

import type { jsPDF } from 'jspdf'

export type Cell = string | number
export interface PdfSection {
  title: string
  head: string[]
  body: Cell[][]
}
export interface KeyValue {
  label: string
  value: Cell
}

const SKY: [number, number, number] = [2, 132, 199]
const SKY_LIGHT: [number, number, number] = [240, 249, 255]
const INK: [number, number, number] = [30, 41, 59]

type DocWithTable = jsPDF & { lastAutoTable?: { finalY: number } }

async function createDoc(orientation: 'portrait' | 'landscape') {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' }) as DocWithTable
  return { doc, autoTable }
}

function drawHeader(doc: jsPDF, title: string, subtitle?: string) {
  const width = doc.internal.pageSize.getWidth()
  doc.setFillColor(...SKY)
  doc.rect(0, 0, width, 26, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('SURVEILANS MIGRASI MALARIA', 14, 9)
  doc.setFontSize(14)
  doc.text(title, 14, 17)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  const printed = `Dicetak: ${new Date().toLocaleString('id-ID')}`
  doc.text(subtitle ? `${subtitle}  |  ${printed}` : printed, 14, 23)
  doc.setTextColor(...INK)
}

function drawFooter(doc: jsPDF) {
  const pages = doc.getNumberOfPages()
  const width = doc.internal.pageSize.getWidth()
  const height = doc.internal.pageSize.getHeight()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(120, 130, 145)
    doc.text(`Halaman ${i} dari ${pages}`, width - 14, height - 8, { align: 'right' })
    doc.text('Program Pengendalian Malaria', 14, height - 8)
  }
}

const tableTheme = {
  theme: 'grid' as const,
  headStyles: { fillColor: SKY, textColor: 255, fontStyle: 'bold' as const, fontSize: 8.5 },
  bodyStyles: { fontSize: 8.5, textColor: INK },
  alternateRowStyles: { fillColor: SKY_LIGHT },
  styles: { cellPadding: 2, lineColor: [214, 230, 242] as [number, number, number], lineWidth: 0.2 },
  margin: { left: 14, right: 14 },
}

export async function exportTablePDF(
  title: string,
  head: string[],
  body: Cell[][],
  filename: string,
) {
  const { doc, autoTable } = await createDoc(head.length > 6 ? 'landscape' : 'portrait')
  drawHeader(doc, title, `Total data: ${body.length}`)
  autoTable(doc, {
    ...tableTheme,
    startY: 32,
    head: [['No', ...head]],
    body: body.length
      ? body.map((row, i) => [i + 1, ...row])
      : [[{ content: 'Belum ada data', colSpan: head.length + 1, styles: { halign: 'center' } }]],
  })
  drawFooter(doc)
  doc.save(`${filename}.pdf`)
}

export async function exportRecordPDF(
  title: string,
  fields: KeyValue[],
  filename: string,
  sections: PdfSection[] = [],
) {
  const { doc, autoTable } = await createDoc('portrait')
  drawHeader(doc, title, 'Detail Data')
  autoTable(doc, {
    ...tableTheme,
    startY: 32,
    body: fields.map((f) => [f.label, String(f.value)]),
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60, fillColor: SKY_LIGHT },
    },
    alternateRowStyles: {},
  })
  let y = (doc.lastAutoTable?.finalY ?? 40) + 8
  for (const section of sections) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(section.title, 14, y)
    autoTable(doc, { ...tableTheme, startY: y + 3, head: [section.head], body: section.body })
    y = (doc.lastAutoTable?.finalY ?? y) + 8
  }
  drawFooter(doc)
  doc.save(`${filename}.pdf`)
}

export async function exportReportPDF(
  title: string,
  subtitle: string,
  summary: KeyValue[],
  sections: PdfSection[],
  filename: string,
) {
  const { doc, autoTable } = await createDoc('portrait')
  drawHeader(doc, title, subtitle)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Ringkasan', 14, 34)
  autoTable(doc, {
    ...tableTheme,
    startY: 37,
    body: summary.map((s) => [s.label, String(s.value)]),
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 90, fillColor: SKY_LIGHT } },
    alternateRowStyles: {},
  })
  let y = (doc.lastAutoTable?.finalY ?? 40) + 9
  const pageHeight = doc.internal.pageSize.getHeight()
  for (const section of sections) {
    if (y > pageHeight - 40) {
      doc.addPage()
      y = 20
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...SKY)
    doc.text(section.title, 14, y)
    doc.setTextColor(...INK)
    autoTable(doc, {
      ...tableTheme,
      startY: y + 3,
      head: [section.head],
      body: section.body.length
        ? section.body
        : [[{ content: 'Tidak ada data pada periode ini', colSpan: section.head.length, styles: { halign: 'center' } }]],
    })
    y = (doc.lastAutoTable?.finalY ?? y) + 9
  }
  drawFooter(doc)
  doc.save(`${filename}.pdf`)
}

export async function exportExcel(
  filename: string,
  sheets: { name: string; head: string[]; body: Cell[][] }[],
) {
  const XLSX = await import('xlsx')
  const workbook = XLSX.utils.book_new()
  for (const sheet of sheets) {
    const worksheet = XLSX.utils.aoa_to_sheet([sheet.head, ...sheet.body])
    worksheet['!cols'] = sheet.head.map((h) => ({ wch: Math.max(12, h.length + 4) }))
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.slice(0, 31))
  }
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}
