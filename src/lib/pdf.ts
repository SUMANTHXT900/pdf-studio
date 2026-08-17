import { PDFDocument, degrees } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export type PdfFile = {
  id: string
  name: string
  size: number
  data: ArrayBuffer
}

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function stripExt(name: string): string {
  return name.replace(/\.\w+$/, '')
}

export async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer()
}

export async function pageCount(buffer: ArrayBuffer): Promise<number> {
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) }).promise
  const n = doc.numPages
  await doc.destroy()
  return n
}

export async function renderThumb(
  buffer: ArrayBuffer,
  pageNum: number,
  scale = 0.5,
): Promise<string> {
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) }).promise
  try {
    const page = await doc.getPage(pageNum)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas unavailable')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvasContext: ctx, viewport }).promise
    return canvas.toDataURL('image/jpeg', 0.85)
  } finally {
    await doc.destroy()
  }
}

export async function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export async function downloadBytes(bytes: Uint8Array, name: string) {
  await downloadBlob(new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }), name)
}

/* ---------- Merge ---------- */
export async function mergePdfs(files: ArrayBuffer[]): Promise<Uint8Array> {
  const out = await PDFDocument.create()
  for (const buf of files) {
    const src = await PDFDocument.load(buf, { ignoreEncryption: true })
    const pages = await out.copyPages(src, src.getPageIndices())
    pages.forEach((p) => out.addPage(p))
  }
  return out.save()
}

/* ---------- Split / Extract ranges ---------- */
export type PageRange = [number, number] // 1-indexed inclusive

export async function splitRanges(
  buffer: ArrayBuffer,
  ranges: PageRange[],
): Promise<{ bytes: Uint8Array; range: PageRange }[]> {
  const src = await PDFDocument.load(buffer, { ignoreEncryption: true })
  const total = src.getPageCount()
  const results: { bytes: Uint8Array; range: PageRange }[] = []
  for (const [a, b] of ranges) {
    const indices: number[] = []
    const start = Math.max(1, a)
    const end = Math.min(b, total)
    for (let i = start; i <= end; i++) indices.push(i - 1)
    if (indices.length === 0) continue
    const doc = await PDFDocument.create()
    const pages = await doc.copyPages(src, indices)
    pages.forEach((p) => doc.addPage(p))
    results.push({ bytes: await doc.save(), range: [start, end] })
  }
  return results
}

export async function splitEveryN(
  buffer: ArrayBuffer,
  pagesPerFile: number,
): Promise<{ bytes: Uint8Array; range: PageRange }[]> {
  const total = await pageCount(buffer)
  const ranges: PageRange[] = []
  for (let start = 1; start <= total; start += pagesPerFile) {
    ranges.push([start, Math.min(start + pagesPerFile - 1, total)])
  }
  return splitRanges(buffer, ranges)
}

/* ---------- Remove selected pages (keep the rest) ---------- */
export async function removePages(
  buffer: ArrayBuffer,
  keep: number[], // 0-based page indices to keep, in order
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true })
  const out = await PDFDocument.create()
  for (const idx of keep) {
    if (idx < 0 || idx >= doc.getPageCount()) continue
    const [copied] = await out.copyPages(doc, [idx])
    out.addPage(copied)
  }
  if (out.getPageCount() === 0) throw new Error('Keep at least one page')
  return out.save()
}

/* ---------- Rearrange ---------- */
export async function reorderPages(
  buffer: ArrayBuffer,
  order: number[], // 0-indexed target page numbers, in desired sequence
): Promise<Uint8Array> {
  const src = await PDFDocument.load(buffer, { ignoreEncryption: true })
  const doc = await PDFDocument.create()
  const pages = await doc.copyPages(src, order)
  pages.forEach((p) => doc.addPage(p))
  return doc.save()
}

/* ---------- Rotate ---------- */
export async function rotateOnePage(
  buffer: ArrayBuffer,
  pageIndex: number,
  deltaDeg = 90,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true })
  const page = doc.getPage(pageIndex)
  const cur = page.getRotation().angle
  page.setRotation(degrees(cur + deltaDeg))
  return doc.save()
}

export async function rotateAllPages(
  buffer: ArrayBuffer,
  deltaDeg: number,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true })
  for (const page of doc.getPages()) {
    const cur = page.getRotation().angle
    page.setRotation(degrees(cur + deltaDeg))
  }
  return doc.save()
}

/* ---------- Apply rotation map (page index -> net clockwise increments) ---------- */
export async function applyRotations(
  buffer: ArrayBuffer,
  rotations: Record<number, number>,
): Promise<ArrayBuffer> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true })
  const pages = doc.getPages()
  for (const [idx, turns] of Object.entries(rotations)) {
    const t = ((turns % 4) + 4) % 4
    if (t === 0) continue
    const page = pages[parseInt(idx, 10)]
    if (!page) continue
    const cur = page.getRotation().angle
    page.setRotation(degrees(cur + t * 90))
  }
  const out = await doc.save()
  return out.buffer.slice(0) as ArrayBuffer
}

/* ---------- Compress (rasterize to JPEG) ---------- */
export async function compressPdf(
  buffer: ArrayBuffer,
  quality: number, // 0..1 JPEG quality
  targetWidth: number, // max output width in px; never upscales
): Promise<Uint8Array> {
  const src = await pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) }).promise
  const outPdf = await PDFDocument.create()
  const total = src.numPages
  try {
    for (let i = 1; i <= total; i++) {
      const page = await src.getPage(i)
      const base = page.getViewport({ scale: 1 })
      const scale = Math.min(1, targetWidth / base.width) // never upscale -> avoids growth
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('canvas unavailable')
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      await page.render({ canvasContext: ctx, viewport }).promise
      const jpeg = canvas.toDataURL('image/jpeg', quality)
      const img = await outPdf.embedJpg(jpeg)
      const p = outPdf.addPage([viewport.width, viewport.height])
      p.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height })
    }
  } finally {
    await src.destroy()
  }
  return outPdf.save()
}

/* ---------- PDF → text (for docx) ---------- */
export async function extractTextPerPage(
  buffer: ArrayBuffer,
): Promise<string[]> {
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) }).promise
  const pages: string[] = []
  try {
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const content = await page.getTextContent()
      // Group items by their vertical position roughly to reconstruct lines
      let text = content.items
        .map((it: any) => ('str' in it ? it.str : ''))
        .join(' ')
      pages.push(text.trim())
    }
  } finally {
    await doc.destroy()
  }
  return pages
}
/* ---------- PDF → Word (.docx) ---------- */
export async function pdfToDocx(buffer: ArrayBuffer, baseName: string): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, PageBreak, HeadingLevel } = await import('docx')
  const pages = await extractTextPerPage(buffer)
  const children: import('docx').Paragraph[] = []
  pages.forEach((text, i) => {
    if (i > 0) children.push(new Paragraph({ children: [new PageBreak()] }))
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: `Page ${i + 1}`, bold: true, color: '888888' })],
      }),
    )
    const lines = text.split(/\s+/).join(' ').split('. ')
    for (const line of lines) {
      if (line.trim()) children.push(new Paragraph({ children: [new TextRun(line.trim() + '.')] }))
    }
  })
  const doc = new Document({ sections: [{ children }] })
  return Packer.toBlob(doc)
}

/* ---------- Word → PDF (mammoth to HTML → rasterize to PDF pages) ---------- */
export async function wordToPdf(buffer: ArrayBuffer): Promise<Blob> {
  const mammoth = await import('mammoth')
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buffer })
  const PX_W = 794 // A4 at 96dpi
  const PX_H = 1123
  const holder = document.createElement('div')
  holder.style.position = 'fixed'
  holder.style.left = '-20000px'
  holder.style.top = '0'
  holder.style.width = `${PX_W}px`
  holder.style.background = '#fff'
  holder.style.color = '#222'
  holder.style.padding = '48px'
  holder.style.fontFamily = 'Georgia, serif'
  holder.style.fontSize = '15px'
  holder.style.lineHeight = '1.5'
  holder.innerHTML = html
  document.body.appendChild(holder)
  try {
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(holder, { backgroundColor: '#ffffff', scale: 1 })
    // page through the tall canvas in A4-ish slices
    const { PDFDocument } = await import('pdf-lib')
    const out = await PDFDocument.create()
    for (let y0 = 0; y0 < canvas.height; y0 += PX_H) {
      const h = Math.min(PX_H, canvas.height - y0)
      const slice = document.createElement('canvas')
      slice.width = PX_W
      slice.height = h
      const sctx = slice.getContext('2d')!
      sctx.fillStyle = '#fff'
      sctx.fillRect(0, 0, PX_W, h)
      sctx.drawImage(canvas, 0, y0, PX_W, h, 0, 0, PX_W, h)
      const jpeg = slice.toDataURL('image/jpeg', 0.92)
      const img = await out.embedJpg(jpeg)
      const page = out.addPage([595, 842]) // A4 pt
      const scale2 = 595 / PX_W
      page.drawImage(img, { x: 0, y: 0, width: 595, height: h * scale2 })
    }
    const bytes = await out.save()
    return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' })
  } finally {
    holder.remove()
  }
}
