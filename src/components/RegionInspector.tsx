import type { PageViewport } from 'pdfjs-dist'
import { useAppStore } from '../store/useAppStore'
import {
  bboxHeightPt,
  bboxWidthPt,
  clamp,
  pdfBBoxToViewportRect,
  viewportPageSizePt,
} from '../lib/geometry/coords'
import { mmToPt, ptToMm } from '../lib/units'
import type { PdfBBox, Region } from '../types'

interface Props {
  region: Region
  viewport: PageViewport
}

const round1 = (v: number) => Math.round(v * 10) / 10

function NumField({
  label,
  value,
  onChange,
  min = 0,
  step = 0.5,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  min?: number
  step?: number
}) {
  return (
    <label className="flex flex-col gap-0.5 text-[10px] text-slate-400">
      {label}
      <input
        type="number"
        value={round1(value)}
        min={min}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded border border-slate-600 bg-slate-900 px-1 py-0.5 text-right text-xs text-slate-100"
      />
    </label>
  )
}

export function RegionInspector({ region, viewport }: Props) {
  const updateRegion = useAppStore((s) => s.updateRegion)
  const removeRegion = useAppStore((s) => s.removeRegion)
  const selectRegion = useAppStore((s) => s.selectRegion)

  const { widthPt, heightPt } = viewportPageSizePt(viewport)
  const b = region.bbox
  const wPt = bboxWidthPt(b)
  const hPt = bboxHeightPt(b)

  // Anchor the panel near the region; flip above if it sits low on the page.
  const vr = pdfBBoxToViewportRect(viewport, b)
  const leftPct = clamp((vr.left / viewport.width) * 100, 0, 62)
  const belowPct = ((vr.top + vr.height) / viewport.height) * 100
  const placeAbove = belowPct > 68
  const posStyle = placeAbove
    ? { left: `${leftPct}%`, top: `${(vr.top / viewport.height) * 100}%`, transform: 'translateY(-100%)' }
    : { left: `${leftPct}%`, top: `${belowPct}%` }

  const commit = (next: PdfBBox) => updateRegion(region.id, { bbox: next })

  const setX = (mm: number) => {
    const left = clamp(mmToPt(mm), 0, widthPt - wPt)
    commit({ ...b, left, right: left + wPt })
  }
  const setY = (mm: number) => {
    const top = clamp(heightPt - mmToPt(mm), hPt, heightPt)
    commit({ ...b, top, bottom: top - hPt })
  }
  const setW = (mm: number) => {
    const w = clamp(mmToPt(mm), mmToPt(2), widthPt - b.left)
    commit({ ...b, right: b.left + w })
  }
  const setH = (mm: number) => {
    const h = clamp(mmToPt(mm), mmToPt(2), b.top)
    commit({ ...b, bottom: b.top - h })
  }

  return (
    <div
      style={posStyle}
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute z-10 mt-1 w-44 rounded-lg border border-slate-600 bg-slate-800/95 p-2 shadow-xl backdrop-blur"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <input
          value={region.label}
          onChange={(e) => updateRegion(region.id, { label: e.target.value })}
          className="min-w-0 flex-1 rounded border border-slate-600 bg-slate-900 px-1 py-0.5 text-xs text-slate-100"
        />
        <button
          onClick={() => selectRegion(null)}
          className="shrink-0 text-slate-400 hover:text-slate-200"
          title="Close"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <NumField label="X, mm" value={ptToMm(b.left)} onChange={setX} />
        <NumField label="Y, mm (from top)" value={ptToMm(heightPt - b.top)} onChange={setY} />
        <NumField label="Width, mm" value={ptToMm(wPt)} min={2} onChange={setW} />
        <NumField label="Height, mm" value={ptToMm(hPt)} min={2} onChange={setH} />
      </div>

      <div className="mt-1.5 grid grid-cols-3 gap-1.5">
        <NumField
          label="Scale ×"
          value={region.scale}
          min={0.1}
          step={0.05}
          onChange={(n) => updateRegion(region.id, { scale: Math.max(0.1, n || 1) })}
        />
        <NumField
          label="Copies"
          value={region.quantity}
          min={1}
          step={1}
          onChange={(n) => updateRegion(region.id, { quantity: Math.max(1, Math.round(n || 1)) })}
        />
        <NumField
          label="Margin, mm"
          value={region.marginMm ?? 0}
          min={0}
          step={0.5}
          onChange={(n) => updateRegion(region.id, { marginMm: Math.max(0, n || 0) })}
        />
      </div>

      <button
        onClick={() => removeRegion(region.id)}
        className="mt-2 w-full rounded bg-red-500/80 px-2 py-1 text-xs font-medium text-white hover:bg-red-500"
      >
        Delete
      </button>
    </div>
  )
}
