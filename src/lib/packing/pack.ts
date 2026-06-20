import { MaxRectsPacker, PACKING_LOGIC } from 'maxrects-packer'
import type {
  PackResult,
  PackVariant,
  PackedSheet,
  Placement,
  Region,
  SheetSettings,
} from '../../types'
import { mmToPt, sheetSizePt } from '../units'
import { bboxHeightPt, bboxWidthPt } from '../geometry/coords'
import { mulberry32, shuffle } from '../random'

/**
 * Output footprint (points) of a region's sticker, including scale, bleed and the optional
 * per-region empty margin on every side. The margin is reserved empty space in the layout —
 * the captured content stays the same size; generate.ts insets the draw so the band is blank.
 */
export function stickerFootprintPt(region: Region, bleedPt: number): { w: number; h: number } {
  const pad = bleedPt + mmToPt(region.marginMm ?? 0)
  return {
    w: bboxWidthPt(region.bbox) * region.scale + 2 * pad,
    h: bboxHeightPt(region.bbox) * region.scale + 2 * pad,
  }
}

interface PackItemData {
  regionId: string
}
interface PackItem {
  width: number
  height: number
  data: PackItemData
}

export type OrderStrategy =
  | 'input'
  | 'area-desc'
  | 'area-asc'
  | 'height-desc'
  | 'width-desc'
  | 'maxside-desc'
  | 'shuffle'

export interface PackOptions {
  order: OrderStrategy
  logic: PACKING_LOGIC
  /** Seed for the 'shuffle' ordering. */
  seed?: number
}

function orderItems(items: PackItem[], opts: PackOptions): PackItem[] {
  const by = (f: (i: PackItem) => number) => items.slice().sort((a, b) => f(b) - f(a))
  switch (opts.order) {
    case 'area-desc':
      return by((i) => i.width * i.height)
    case 'area-asc':
      return by((i) => -(i.width * i.height))
    case 'height-desc':
      return by((i) => i.height)
    case 'width-desc':
      return by((i) => i.width)
    case 'maxside-desc':
      return by((i) => Math.max(i.width, i.height))
    case 'shuffle':
      return shuffle(items, mulberry32(opts.seed ?? 1))
    case 'input':
    default:
      return items.slice()
  }
}

/** Pack regions onto sheets with a specific ordering/logic strategy. */
export function packRegionsWith(
  regions: Region[],
  sheet: SheetSettings,
  opts: PackOptions,
): PackResult {
  const { widthPt, heightPt } = sheetSizePt(sheet)
  const marginPt = mmToPt(sheet.marginMm)
  const gapPt = mmToPt(sheet.gapMm)
  const bleedPt = mmToPt(sheet.bleedMm)

  const usableW = widthPt - 2 * marginPt
  const usableH = heightPt - 2 * marginPt

  const unplaced: string[] = []
  const items: PackItem[] = []

  for (const region of regions) {
    const { w, h } = stickerFootprintPt(region, bleedPt)
    const fitsAsIs = w <= usableW && h <= usableH
    const fitsRotated = sheet.allowRotate && h <= usableW && w <= usableH
    if (!fitsAsIs && !fitsRotated) {
      unplaced.push(region.id)
      continue
    }
    const copies = Math.max(1, Math.floor(region.quantity))
    for (let i = 0; i < copies; i++) {
      items.push({ width: w, height: h, data: { regionId: region.id } })
    }
  }

  if (items.length === 0) return { sheets: [], unplaced }

  const packer = new MaxRectsPacker(usableW, usableH, gapPt, {
    smart: true,
    pot: false,
    square: false,
    allowRotation: sheet.allowRotate,
    logic: opts.logic,
  })
  for (const it of orderItems(items, opts)) packer.add(it.width, it.height, it.data)

  const sheets: PackedSheet[] = packer.bins.map((bin, index) => {
    const placements: Placement[] = bin.rects.map((rect) => {
      const rotated = Boolean(rect.rot)
      // maxrects swaps width/height when it rotates; recover the unrotated content size.
      const contentW = rotated ? rect.height : rect.width
      const contentH = rotated ? rect.width : rect.height
      return {
        regionId: (rect.data as PackItemData).regionId,
        x: rect.x + marginPt,
        y: rect.y + marginPt,
        w: contentW,
        h: contentH,
        rotated,
      }
    })
    return { index, widthPt, heightPt, placements }
  })

  return { sheets, unplaced }
}

/** Default pack used as a single best-effort layout. */
export function packRegions(regions: Region[], sheet: SheetSettings): PackResult {
  return packRegionsWith(regions, sheet, { order: 'area-desc', logic: PACKING_LOGIC.MAX_AREA })
}

/** Total used sheet area (usable area × sheets) in pt². */
function usableSheetAreaPt(sheet: SheetSettings): number {
  const { widthPt, heightPt } = sheetSizePt(sheet)
  const marginPt = mmToPt(sheet.marginMm)
  return (widthPt - 2 * marginPt) * (heightPt - 2 * marginPt)
}

function efficiencyOf(result: PackResult, sheet: SheetSettings): number {
  if (result.sheets.length === 0) return 0
  let used = 0
  for (const s of result.sheets) for (const p of s.placements) used += p.w * p.h
  const denom = result.sheets.length * usableSheetAreaPt(sheet)
  return denom > 0 ? used / denom : 0
}

/**
 * Cost key for de-duplication: variants with the same sheet count, utilisation and
 * unfit count are equivalent for printing, so we collapse them (arrangement differences
 * are cosmetic — the stickers get cut out anyway).
 */
function costKey(sheets: number, efficiency: number, unplaced: number): string {
  return `${sheets}:${Math.round(efficiency * 1000)}:${unplaced}`
}

/**
 * Produce up to `count` distinct packing variants by sweeping ordering strategies and
 * both MaxRects logics plus several seeded shuffles, then de-duplicating by cost and
 * ranking (fewest sheets first, then highest area utilisation).
 */
export function generateVariants(
  regions: Region[],
  sheet: SheetSettings,
  count = 10,
): PackVariant[] {
  const orders: OrderStrategy[] = [
    'area-desc',
    'area-asc',
    'height-desc',
    'width-desc',
    'maxside-desc',
    'input',
  ]
  const logics = [PACKING_LOGIC.MAX_AREA, PACKING_LOGIC.MAX_EDGE]

  const candidates: PackOptions[] = []
  for (const logic of logics) for (const order of orders) candidates.push({ order, logic })
  for (let s = 1; s <= 12; s++) {
    candidates.push({ order: 'shuffle', logic: logics[s % 2], seed: s * 2654435761 })
  }

  const seen = new Set<string>()
  const variants: PackVariant[] = []
  for (const opts of candidates) {
    const result = packRegionsWith(regions, sheet, opts)
    const sheets = result.sheets.length
    const efficiency = efficiencyOf(result, sheet)
    const key = costKey(sheets, efficiency, result.unplaced.length)
    if (seen.has(key)) continue
    seen.add(key)
    variants.push({ id: 0, result, sheets, efficiency, unplaced: result.unplaced })
  }

  variants.sort((a, b) => a.sheets - b.sheets || b.efficiency - a.efficiency)
  return variants.slice(0, count).map((v, i) => ({ ...v, id: i + 1 }))
}
