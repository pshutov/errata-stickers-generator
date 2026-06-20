import type { PageViewport, RenderTask } from 'pdfjs-dist'
import { getPdfjsDoc } from './load'

export interface RenderOptions {
  /** Target on-screen CSS width in pixels. */
  cssWidth: number
  /** Device pixel ratio for crisp rendering. */
  dpr: number
}

export interface RenderControls {
  /** Receives the pdf.js RenderTask as soon as it starts, so the caller can cancel it. */
  onTask?: (task: RenderTask) => void
  /** Checked after the async getPage await; if true the render is abandoned before starting. */
  isCancelled?: () => boolean
}

function cancelledError(): Error {
  const e = new Error('Rendering cancelled')
  e.name = 'RenderingCancelledException'
  return e
}

/**
 * Render a source page into the canvas, fitting the given CSS width.
 *
 * pdf.js forbids two concurrent render() calls on one canvas, so callers must serialise:
 * pass `isCancelled` (checked before render starts) and `onTask` (to cancel an in-flight task).
 */
export async function renderPage(
  docId: string,
  pageIndex: number,
  canvas: HTMLCanvasElement,
  { cssWidth, dpr }: RenderOptions,
  controls?: RenderControls,
): Promise<PageViewport> {
  const doc = getPdfjsDoc(docId)
  if (!doc) throw new Error(`PDF document not loaded: ${docId}`)

  const page = await doc.getPage(pageIndex + 1)
  // A newer render may have superseded this one while getPage was pending.
  if (controls?.isCancelled?.()) throw cancelledError()

  const unscaled = page.getViewport({ scale: 1 })
  const scale = (cssWidth * dpr) / unscaled.width
  const viewport = page.getViewport({ scale })

  const ctx = canvas.getContext('2d')!
  canvas.width = Math.ceil(viewport.width)
  canvas.height = Math.ceil(viewport.height)
  canvas.style.width = `${cssWidth}px`
  canvas.style.height = `${(cssWidth * unscaled.height) / unscaled.width}px`

  const task = page.render({ canvasContext: ctx, viewport })
  controls?.onTask?.(task)
  await task.promise
  return viewport
}
