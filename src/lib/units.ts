import type { SheetFormatId, SheetSettings } from '../types'

/** PDF user-space unit is 1/72 inch. 1 inch = 25.4 mm. */
const PT_PER_MM = 72 / 25.4

export const mmToPt = (mm: number): number => mm * PT_PER_MM
export const ptToMm = (pt: number): number => pt / PT_PER_MM

/** Round to one decimal for display. */
export const fmtMm = (pt: number): string => ptToMm(pt).toFixed(1)

/** Portrait sheet sizes in millimetres. */
export const SHEET_PRESETS_MM: Record<Exclude<SheetFormatId, 'Custom'>, [number, number]> = {
  A4: [210, 297],
  A3: [297, 420],
  Letter: [215.9, 279.4],
}

/** Resolve the sheet size (width, height) in points, honouring orientation and custom size. */
export function sheetSizePt(s: SheetSettings): { widthPt: number; heightPt: number } {
  let wMm: number
  let hMm: number
  if (s.format === 'Custom') {
    wMm = s.customWidthMm
    hMm = s.customHeightMm
  } else {
    ;[wMm, hMm] = SHEET_PRESETS_MM[s.format]
  }
  if (s.orientation === 'landscape') {
    ;[wMm, hMm] = [hMm, wMm]
  }
  return { widthPt: mmToPt(wMm), heightPt: mmToPt(hMm) }
}
