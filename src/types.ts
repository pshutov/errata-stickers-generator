/** A bounding box in PDF user-space (points, origin bottom-left of the page). */
export interface PdfBBox {
  left: number
  bottom: number
  right: number
  top: number
}

/** A loaded source PDF. Raw bytes are kept for pdf-lib; the pdfjs document is cached separately by id. */
export interface SourceDoc {
  id: string
  name: string
  bytes: Uint8Array
  numPages: number
}

/** A user-marked print region on a single source page. */
export interface Region {
  id: string
  docId: string
  /** 0-based page index within the source document. */
  pageIndex: number
  /** Marked area in PDF user-space points. */
  bbox: PdfBBox
  /** Output scale factor (1 = original physical size). */
  scale: number
  /** Number of identical copies to place in the layout (integer ≥ 1). */
  quantity: number
  /** Extra empty margin (mm) reserved around this sticker in the layout (0 = none). */
  marginMm?: number
  label: string
}

export type SheetFormatId = 'A4' | 'A3' | 'Letter' | 'Custom'

/** Sheet/print settings. Linear values are in millimetres. */
export interface SheetSettings {
  format: SheetFormatId
  orientation: 'portrait' | 'landscape'
  /** Custom sheet size (mm), used when format === 'Custom'. */
  customWidthMm: number
  customHeightMm: number
  /** Sheet margin (mm) reserved on every side. */
  marginMm: number
  /** Gap between adjacent stickers (mm). */
  gapMm: number
  /** Bleed added around every sticker (mm). */
  bleedMm: number
  /** Allow rotating a region 90° to pack tighter. */
  allowRotate: boolean
  /** Draw crop/cut marks at each sticker's trim corners. */
  cropMarks: boolean
}

/** Placement of one region instance on a sheet (points, origin top-left as produced by the packer). */
export interface Placement {
  regionId: string
  x: number
  y: number
  /** Final drawn width including bleed and scale (points). */
  w: number
  h: number
  rotated: boolean
}

export interface PackedSheet {
  index: number
  /** Sheet dimensions in points. */
  widthPt: number
  heightPt: number
  placements: Placement[]
}

export interface PackResult {
  sheets: PackedSheet[]
  /** Regions that could not fit on a single sheet even alone. */
  unplaced: string[]
}

/** How a region is rendered into the output PDF. */
export type RenderMode = 'raster' | 'vector'

/** One candidate layout produced by the variant generator. */
export interface PackVariant {
  id: number
  result: PackResult
  /** Number of sheets used. */
  sheets: number
  /** Area utilisation 0..1 (sticker footprint area / used sheet area). */
  efficiency: number
  unplaced: string[]
}
