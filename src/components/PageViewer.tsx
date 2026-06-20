import { useEffect, useRef, useState } from 'react'
import type { PageViewport, RenderTask } from 'pdfjs-dist'
import { useAppStore } from '../store/useAppStore'
import { renderPage } from '../lib/pdf/render'
import { RegionLayer } from './RegionLayer'
import { RegionInspector } from './RegionInspector'

export function PageViewer() {
  const active = useAppStore((s) => s.active)
  const regions = useAppStore((s) => s.regions)
  const selectedRegionId = useAppStore((s) => s.selectedRegionId)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const taskRef = useRef<RenderTask | null>(null)
  const [viewport, setViewport] = useState<PageViewport | null>(null)
  const [cssWidth, setCssWidth] = useState(0)

  // Container is always mounted, so the observer attaches immediately and tracks width.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setCssWidth(Math.min(el.clientWidth, 1000))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!active || !canvasRef.current || cssWidth === 0) return
    let cancelled = false
    // Cancel any render still in flight before starting a new one on the same canvas.
    taskRef.current?.cancel()
    taskRef.current = null
    setViewport(null)
    void renderPage(
      active.docId,
      active.pageIndex,
      canvasRef.current,
      { cssWidth, dpr: window.devicePixelRatio || 1 },
      {
        onTask: (t) => {
          taskRef.current = t
        },
        isCancelled: () => cancelled,
      },
    )
      .then((vp) => {
        if (!cancelled) setViewport(vp)
      })
      .catch((e) => {
        // RenderingCancelledException is expected when switching pages quickly.
        if (!cancelled && e?.name !== 'RenderingCancelledException') {
          useAppStore.getState().setError(`Render error: ${(e as Error).message}`)
        }
      })
    return () => {
      cancelled = true
      taskRef.current?.cancel()
      taskRef.current = null
    }
  }, [active, cssWidth])

  const pageHasRegions =
    active && regions.some((r) => r.docId === active.docId && r.pageIndex === active.pageIndex)

  // Only show the inspector for a selection that lives on the active page.
  const selectedRegion =
    active &&
    regions.find(
      (r) =>
        r.id === selectedRegionId &&
        r.docId === active.docId &&
        r.pageIndex === active.pageIndex,
    )

  return (
    <div ref={containerRef} className="flex h-full w-full justify-center">
      {!active ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          Load a PDF and pick a page, then mark the regions to print.
        </div>
      ) : (
        <div className="self-start">
          <div className="relative inline-block">
            <canvas ref={canvasRef} className="block rounded shadow-lg" />
            {viewport && <RegionLayer viewport={viewport} active={active} />}
            {viewport && selectedRegion && (
              <RegionInspector region={selectedRegion} viewport={viewport} />
            )}
            {!viewport && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
                Rendering page…
              </div>
            )}
          </div>
          {viewport && !pageHasRegions && (
            <p className="mt-2 text-center text-xs text-slate-500">
              Press and drag the left mouse button across the page to mark a region to print.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
