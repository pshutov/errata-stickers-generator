import type { PageViewport } from 'pdfjs-dist'
import type { PdfBBox } from '../../types'

/**
 * Convert a rectangle drawn in canvas/CSS pixels into a PDF user-space bounding box.
 *
 * `vx*`/`vy*` are pixel coordinates in the viewport (device) space — i.e. relative to
 * the canvas backing store, already corrected for any CSS scaling by the caller.
 * `convertToPdfPoint` maps them into PDF user space (origin bottom-left), so the result
 * is invariant to the on-screen render scale.
 */
export function viewportRectToPdfBBox(
  viewport: PageViewport,
  vx0: number,
  vy0: number,
  vx1: number,
  vy1: number,
): PdfBBox {
  const [ax, ay] = viewport.convertToPdfPoint(vx0, vy0)
  const [bx, by] = viewport.convertToPdfPoint(vx1, vy1)
  return {
    left: Math.min(ax, bx),
    right: Math.max(ax, bx),
    bottom: Math.min(ay, by),
    top: Math.max(ay, by),
  }
}

/** Map a PDF user-space point back to viewport pixels (for drawing overlays). */
export function pdfPointToViewport(
  viewport: PageViewport,
  px: number,
  py: number,
): [number, number] {
  return viewport.convertToViewportPoint(px, py) as [number, number]
}

/** Viewport-pixel rectangle (top-left origin) for a PDF bbox, for overlay rendering. */
export function pdfBBoxToViewportRect(
  viewport: PageViewport,
  bbox: PdfBBox,
): { left: number; top: number; width: number; height: number } {
  const [x0, y0] = pdfPointToViewport(viewport, bbox.left, bbox.top)
  const [x1, y1] = pdfPointToViewport(viewport, bbox.right, bbox.bottom)
  return {
    left: Math.min(x0, x1),
    top: Math.min(y0, y1),
    width: Math.abs(x1 - x0),
    height: Math.abs(y1 - y0),
  }
}

export const bboxWidthPt = (b: PdfBBox): number => b.right - b.left
export const bboxHeightPt = (b: PdfBBox): number => b.top - b.bottom

/** Page size in PDF points, derived from the viewport's unscaled view box. */
export function viewportPageSizePt(viewport: PageViewport): {
  widthPt: number
  heightPt: number
} {
  const [x0, y0, x1, y1] = viewport.viewBox
  return { widthPt: Math.abs(x1 - x0), heightPt: Math.abs(y1 - y0) }
}

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v))
