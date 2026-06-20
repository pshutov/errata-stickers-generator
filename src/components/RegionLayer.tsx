import { useEffect, useRef, useState } from 'react'
import type { PageViewport } from 'pdfjs-dist'
import type { ActivePage } from '../store/useAppStore'
import { useAppStore } from '../store/useAppStore'
import {
  bboxHeightPt,
  bboxWidthPt,
  clamp,
  pdfBBoxToViewportRect,
  viewportPageSizePt,
  viewportRectToPdfBBox,
} from '../lib/geometry/coords'
import { fmtMm, mmToPt } from '../lib/units'
import type { PdfBBox } from '../types'

interface Props {
  viewport: PageViewport
  active: ActivePage
}

type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
interface PxRect {
  left: number
  top: number
  width: number
  height: number
}

type Interaction =
  | { kind: 'create'; sx: number; sy: number; rect: PxRect }
  | { kind: 'move'; id: string; px: number; py: number; rectStart: PxRect; rect: PxRect; moved: boolean }
  | { kind: 'resize'; id: string; handle: Handle; rectStart: PxRect; rect: PxRect }

/** Min drawn size in points; below this a drag is treated as a stray click. */
const MIN_PT = mmToPt(2)

const HANDLES: { h: Handle; cx: number; cy: number; cursor: string }[] = [
  { h: 'nw', cx: 0, cy: 0, cursor: 'cursor-nwse-resize' },
  { h: 'n', cx: 0.5, cy: 0, cursor: 'cursor-ns-resize' },
  { h: 'ne', cx: 1, cy: 0, cursor: 'cursor-nesw-resize' },
  { h: 'e', cx: 1, cy: 0.5, cursor: 'cursor-ew-resize' },
  { h: 'se', cx: 1, cy: 1, cursor: 'cursor-nwse-resize' },
  { h: 's', cx: 0.5, cy: 1, cursor: 'cursor-ns-resize' },
  { h: 'sw', cx: 0, cy: 1, cursor: 'cursor-nesw-resize' },
  { h: 'w', cx: 0, cy: 0.5, cursor: 'cursor-ew-resize' },
]

export function RegionLayer({ viewport, active }: Props) {
  const regions = useAppStore((s) => s.regions)
  const selectedRegionId = useAppStore((s) => s.selectedRegionId)
  const addRegion = useAppStore((s) => s.addRegion)
  const updateRegion = useAppStore((s) => s.updateRegion)
  const selectRegion = useAppStore((s) => s.selectRegion)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [interaction, setInteraction] = useState<Interaction | null>(null)

  const pageRegions = regions.filter(
    (r) => r.docId === active.docId && r.pageIndex === active.pageIndex,
  )

  const minPx = MIN_PT * viewport.scale
  const pxToPt = (px: number) => px / viewport.scale

  // Pointer position in viewport (device) px, clamped to the page.
  const toPx = (e: { clientX: number; clientY: number }) => {
    const r = overlayRef.current!.getBoundingClientRect()
    return {
      vx: clamp(((e.clientX - r.left) / r.width) * viewport.width, 0, viewport.width),
      vy: clamp(((e.clientY - r.top) / r.height) * viewport.height, 0, viewport.height),
    }
  }

  const rectOf = (bbox: PdfBBox): PxRect => pdfBBoxToViewportRect(viewport, bbox)

  const pctStyle = (rect: PxRect) => ({
    left: `${(rect.left / viewport.width) * 100}%`,
    top: `${(rect.top / viewport.height) * 100}%`,
    width: `${(rect.width / viewport.width) * 100}%`,
    height: `${(rect.height / viewport.height) * 100}%`,
  })

  const sizeLabel = (rect: PxRect) =>
    `${fmtMm(pxToPt(rect.width))}×${fmtMm(pxToPt(rect.height))} mm`

  const rectToBBox = (rect: PxRect): PdfBBox =>
    viewportRectToPdfBBox(viewport, rect.left, rect.top, rect.left + rect.width, rect.top + rect.height)

  const startCapture = (e: React.PointerEvent) => {
    overlayRef.current?.setPointerCapture(e.pointerId)
  }

  // Empty-area press: deselect and start drawing a new region.
  const onBackgroundDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || e.target !== overlayRef.current) return
    startCapture(e)
    selectRegion(null)
    const { vx, vy } = toPx(e)
    setInteraction({ kind: 'create', sx: vx, sy: vy, rect: { left: vx, top: vy, width: 0, height: 0 } })
  }

  const onRegionDown = (e: React.PointerEvent, id: string, rectStart: PxRect) => {
    if (e.button !== 0) return
    e.stopPropagation()
    startCapture(e)
    selectRegion(id)
    const { vx, vy } = toPx(e)
    setInteraction({ kind: 'move', id, px: vx, py: vy, rectStart, rect: rectStart, moved: false })
  }

  const onHandleDown = (e: React.PointerEvent, id: string, handle: Handle, rectStart: PxRect) => {
    if (e.button !== 0) return
    e.stopPropagation()
    startCapture(e)
    selectRegion(id)
    setInteraction({ kind: 'resize', id, handle, rectStart, rect: rectStart })
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!interaction) return
    const { vx, vy } = toPx(e)
    if (interaction.kind === 'create') {
      setInteraction({
        ...interaction,
        rect: {
          left: Math.min(interaction.sx, vx),
          top: Math.min(interaction.sy, vy),
          width: Math.abs(vx - interaction.sx),
          height: Math.abs(vy - interaction.sy),
        },
      })
    } else if (interaction.kind === 'move') {
      const dx = vx - interaction.px
      const dy = vy - interaction.py
      const { rectStart } = interaction
      setInteraction({
        ...interaction,
        moved: interaction.moved || Math.abs(dx) > 1 || Math.abs(dy) > 1,
        rect: {
          left: clamp(rectStart.left + dx, 0, viewport.width - rectStart.width),
          top: clamp(rectStart.top + dy, 0, viewport.height - rectStart.height),
          width: rectStart.width,
          height: rectStart.height,
        },
      })
    } else {
      setInteraction({ ...interaction, rect: resizeRect(interaction.rectStart, interaction.handle, vx, vy, minPx, viewport.width, viewport.height) })
    }
  }

  const onPointerUp = (e: React.PointerEvent) => {
    overlayRef.current?.releasePointerCapture(e.pointerId)
    if (!interaction) return
    const { rect } = interaction
    if (interaction.kind === 'create') {
      if (pxToPt(rect.width) >= MIN_PT && pxToPt(rect.height) >= MIN_PT) {
        const id = addRegion({
          docId: active.docId,
          pageIndex: active.pageIndex,
          bbox: rectToBBox(rect),
          scale: 1,
          quantity: 1,
          label: `Region ${regions.length + 1}`,
        })
        selectRegion(id)
      }
    } else if (interaction.kind === 'resize' || (interaction.kind === 'move' && interaction.moved)) {
      updateRegion(interaction.id, { bbox: rectToBBox(rect) })
    }
    setInteraction(null)
  }

  // Keyboard: delete / deselect / nudge the selected region (ignored while typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const id = useAppStore.getState().selectedRegionId
      if (!id) return
      const region = useAppStore.getState().regions.find((r) => r.id === id)
      if (!region || region.docId !== active.docId || region.pageIndex !== active.pageIndex) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        useAppStore.getState().removeRegion(id)
      } else if (e.key === 'Escape') {
        selectRegion(null)
      } else if (e.key.startsWith('Arrow')) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const { widthPt, heightPt } = viewportPageSizePt(viewport)
        let dx = 0
        let dy = 0
        if (e.key === 'ArrowLeft') dx = -step
        else if (e.key === 'ArrowRight') dx = step
        else if (e.key === 'ArrowUp') dy = step
        else if (e.key === 'ArrowDown') dy = -step
        const b = region.bbox
        const w = bboxWidthPt(b)
        const h = bboxHeightPt(b)
        const left = clamp(b.left + dx, 0, widthPt - w)
        const bottom = clamp(b.bottom + dy, 0, heightPt - h)
        updateRegion(id, { bbox: { left, bottom, right: left + w, top: bottom + h } })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active.docId, active.pageIndex, viewport, selectRegion, updateRegion])

  const liveRectFor = (id: string): PxRect | null =>
    interaction && 'id' in interaction && interaction.id === id ? interaction.rect : null

  return (
    <div
      ref={overlayRef}
      onPointerDown={onBackgroundDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="absolute inset-0 cursor-crosshair touch-none select-none"
    >
      {pageRegions.map((r) => {
        const rect = liveRectFor(r.id) ?? rectOf(r.bbox)
        const selected = r.id === selectedRegionId
        return (
          <div
            key={r.id}
            style={pctStyle(rect)}
            onPointerDown={(e) => onRegionDown(e, r.id, rect)}
            className={`absolute cursor-move border-2 ${
              selected ? 'border-sky-400 bg-sky-400/15' : 'border-emerald-400 bg-emerald-400/15'
            }`}
          >
            <span
              className={`absolute left-0 top-0 -translate-y-full whitespace-nowrap px-1 text-[10px] font-medium text-slate-900 ${
                selected ? 'bg-sky-400' : 'bg-emerald-500'
              }`}
            >
              {sizeLabel(rect)}
            </span>
            {selected &&
              HANDLES.map((hd) => (
                <span
                  key={hd.h}
                  onPointerDown={(e) => onHandleDown(e, r.id, hd.h, rect)}
                  style={{ left: `${hd.cx * 100}%`, top: `${hd.cy * 100}%` }}
                  className={`absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-sky-600 bg-white ${hd.cursor}`}
                />
              ))}
          </div>
        )
      })}

      {/* Live preview of the region being drawn. */}
      {interaction?.kind === 'create' && (interaction.rect.width > 0 || interaction.rect.height > 0) && (
        <div
          style={pctStyle(interaction.rect)}
          className="pointer-events-none absolute border-2 border-dashed border-sky-400 bg-sky-400/20"
        >
          <span className="absolute left-0 top-0 -translate-y-full whitespace-nowrap rounded-t bg-sky-400 px-1 text-[10px] font-medium text-slate-900">
            {sizeLabel(interaction.rect)}
          </span>
        </div>
      )}
    </div>
  )
}

/** Recompute a rectangle when dragging `handle`, keeping it >= minPx and within [0,maxW]×[0,maxH]. */
function resizeRect(
  start: PxRect,
  handle: Handle,
  vx: number,
  vy: number,
  minPx: number,
  maxW: number,
  maxH: number,
): PxRect {
  let l = start.left
  let t = start.top
  let r = start.left + start.width
  let b = start.top + start.height
  if (handle.includes('w')) l = clamp(vx, 0, r - minPx)
  if (handle.includes('e')) r = clamp(vx, l + minPx, maxW)
  if (handle.includes('n')) t = clamp(vy, 0, b - minPx)
  if (handle.includes('s')) b = clamp(vy, t + minPx, maxH)
  return { left: l, top: t, width: r - l, height: b - t }
}
