import { degrees, PDFDocument, rgb, type PDFEmbeddedPage, type PDFImage, type PDFPage } from 'pdf-lib'
import type { PackResult, Region, RenderMode, SheetSettings, SourceDoc } from '../../types'
import { mmToPt } from '../units'
import { bboxHeightPt, bboxWidthPt } from '../geometry/coords'
import { getPdfjsDoc } from './load'

const CROP_MARK_LEN = mmToPt(3.5)
const CROP_MARK_COLOR = rgb(0, 0, 0)
const CROP_MARK_THICKNESS = 0.25

/**
 * Print resolution for rasterised regions. Each region is drawn at its final physical
 * size, so this is the effective DPI of the printed sticker.
 */
const RENDER_DPI = 300

/**
 * Draw crop marks at the four corners of a sticker's trim box (footprint inset by bleed).
 * Each corner gets two short L-shaped strokes offset outward by the bleed so they sit
 * outside the trim, the way a print shop expects.
 */
function drawCropMarks(
  page: PDFPage,
  footLeft: number,
  footBottom: number,
  footW: number,
  footH: number,
  bleedPt: number,
): void {
  const L = footLeft + bleedPt
  const R = footLeft + footW - bleedPt
  const B = footBottom + bleedPt
  const T = footBottom + footH - bleedPt
  const g = bleedPt // gap from the trim edge before a mark starts
  const m = CROP_MARK_LEN
  const opts = { thickness: CROP_MARK_THICKNESS, color: CROP_MARK_COLOR }
  const line = (x1: number, y1: number, x2: number, y2: number) =>
    page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, ...opts })

  // bottom-left
  line(L, B - g, L, B - g - m)
  line(L - g, B, L - g - m, B)
  // bottom-right
  line(R, B - g, R, B - g - m)
  line(R + g, B, R + g + m, B)
  // top-left
  line(L, T + g, L, T + g + m)
  line(L - g, T, L - g - m, T)
  // top-right
  line(R, T + g, R, T + g + m)
  line(R + g, T, R + g + m, T)
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Failed to rasterise region.'))
      blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)), reject)
    }, 'image/png')
  })
}

/**
 * Rasterise a single region (its bbox expanded by bleed) via pdf.js — the same engine
 * that renders it correctly in the editor — at RENDER_DPI of the printed size. Rendering
 * each region directly (with a translation transform) avoids huge full-page canvases and
 * sidesteps pdf-lib's loss of soft masks / transparency groups when re-embedding vectors.
 */
async function rasterRegion(region: Region, bleedPt: number): Promise<Uint8Array> {
  const doc = getPdfjsDoc(region.docId)
  if (!doc) throw new Error(`PDF not loaded: ${region.docId}`)
  const page = await doc.getPage(region.pageIndex + 1)

  // Render scale so the printed sticker (source size × region.scale) ends up at RENDER_DPI.
  const s = (RENDER_DPI / 72) * region.scale
  const viewport = page.getViewport({ scale: s })
  const [, vy0, , vy1] = viewport.viewBox
  const pageHeightPt = vy1 - vy0

  const expand = region.scale > 0 ? bleedPt / region.scale : 0
  const b = region.bbox
  const leftPx = (b.left - expand) * s
  const topPx = (pageHeightPt - (b.top + expand)) * s
  const wPx = Math.max(1, Math.round((bboxWidthPt(b) + 2 * expand) * s))
  const hPx = Math.max(1, Math.round((bboxHeightPt(b) + 2 * expand) * s))

  const canvas = document.createElement('canvas')
  canvas.width = wPx
  canvas.height = hPx
  const ctx = canvas.getContext('2d')!
  // Shift the full-page render so the region's top-left lands at the canvas origin.
  await page.render({ canvasContext: ctx, viewport, transform: [1, 0, 0, 1, -leftPx, -topPx] })
    .promise

  return canvasToPng(canvas)
}

/**
 * Build the print-ready PDF from a packing result. Each region is prepared once (cached by
 * id, so copies are reused) and drawn at every packed placement. Packer coordinates are
 * top-left origin; pdf-lib is bottom-left origin, so y is flipped per sheet. Rotated
 * placements are drawn with a 90° rotation, positioned so the rotated footprint lands exactly.
 *
 * mode 'raster': render each region via pdf.js → PNG (exact WYSIWYG, survives any source PDF).
 * mode 'vector': re-embed the source page region with pdf-lib (crisp/small, but can drop
 * soft-masked images inside transparency groups for some PDFs). Defaults to 'raster'.
 */
export async function generatePdf(
  result: PackResult,
  regions: Region[],
  docs: SourceDoc[],
  sheet: SheetSettings,
  mode: RenderMode = 'raster',
): Promise<Uint8Array> {
  const bleedPt = mmToPt(sheet.bleedMm)
  const regionById = new Map(regions.map((r) => [r.id, r]))

  const targetDoc = await PDFDocument.create()

  // --- raster assets (pdf.js → PNG) ---
  const imageByRegion = new Map<string, PDFImage>()
  const imageFor = async (region: Region): Promise<PDFImage> => {
    let img = imageByRegion.get(region.id)
    if (!img) {
      img = await targetDoc.embedPng(await rasterRegion(region, bleedPt))
      imageByRegion.set(region.id, img)
    }
    return img
  }

  // --- vector assets (pdf-lib embedPage of the clipped source page) ---
  const docById = new Map(docs.map((d) => [d.id, d]))
  const srcDocCache = new Map<string, PDFDocument>()
  const embByRegion = new Map<string, PDFEmbeddedPage>()
  const embedFor = async (region: Region): Promise<PDFEmbeddedPage> => {
    let emb = embByRegion.get(region.id)
    if (!emb) {
      let src = srcDocCache.get(region.docId)
      if (!src) {
        const sd = docById.get(region.docId)
        if (!sd) throw new Error(`Source document missing: ${region.docId}`)
        src = await PDFDocument.load(sd.bytes.slice())
        srcDocCache.set(region.docId, src)
      }
      const expand = region.scale > 0 ? bleedPt / region.scale : 0
      const b = region.bbox
      emb = await targetDoc.embedPage(src.getPage(region.pageIndex), {
        left: b.left - expand,
        bottom: b.bottom - expand,
        right: b.right + expand,
        top: b.top + expand,
      })
      embByRegion.set(region.id, emb)
    }
    return emb
  }

  for (const sheetData of result.sheets) {
    const page = targetDoc.addPage([sheetData.widthPt, sheetData.heightPt])
    for (const p of sheetData.placements) {
      const region = regionById.get(p.regionId)
      if (!region) continue

      // Footprint dimensions in sheet space (content dims swap when rotated). The footprint
      // includes the per-region empty margin; the sticker is drawn centered inside it.
      const marginPt = mmToPt(region.marginMm ?? 0)
      const footprintW = p.rotated ? p.h : p.w
      const footprintH = p.rotated ? p.w : p.h
      // Flip top-left packer y to bottom-left PDF y.
      const yBottom = sheetData.heightPt - (p.y + footprintH)
      const xLeft = p.x
      // Inner rect = footprint minus the empty margin band (where the sticker actually sits).
      const innerLeft = xLeft + marginPt
      const innerBottom = yBottom + marginPt
      const innerFootW = footprintW - 2 * marginPt
      const innerFootH = footprintH - 2 * marginPt
      const imgW = p.w - 2 * marginPt
      const imgH = p.h - 2 * marginPt
      const rot = p.rotated ? degrees(90) : degrees(0)
      // For a 90° rotation the anchor shifts by the rotated (inner) footprint width.
      const x = p.rotated ? innerLeft + innerFootW : innerLeft

      if (mode === 'raster') {
        const img = await imageFor(region)
        page.drawImage(img, { x, y: innerBottom, width: imgW, height: imgH, rotate: rot })
      } else {
        const emb = await embedFor(region)
        page.drawPage(emb, {
          x,
          y: innerBottom,
          xScale: region.scale,
          yScale: region.scale,
          rotate: rot,
        })
      }

      if (sheet.cropMarks) {
        drawCropMarks(page, innerLeft, innerBottom, innerFootW, innerFootH, bleedPt)
      }
    }
  }

  return targetDoc.save()
}
