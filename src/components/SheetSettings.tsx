import { useAppStore } from '../store/useAppStore'
import type { SheetFormatId } from '../types'

const FORMATS: SheetFormatId[] = ['A4', 'A3', 'Letter', 'Custom']

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  min?: number
  step?: number
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-400">
      {label}
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
        className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200"
      />
    </label>
  )
}

export function SheetSettings() {
  const sheet = useAppStore((s) => s.sheet)
  const setSheet = useAppStore((s) => s.setSheet)

  return (
    <div className="space-y-3">
      <label className="flex flex-col gap-1 text-xs text-slate-400">
        Sheet format
        <select
          value={sheet.format}
          onChange={(e) => setSheet({ format: e.target.value as SheetFormatId })}
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200"
        >
          {FORMATS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>

      {sheet.format === 'Custom' && (
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label="Width, mm"
            value={sheet.customWidthMm}
            min={10}
            onChange={(n) => setSheet({ customWidthMm: n })}
          />
          <NumberField
            label="Height, mm"
            value={sheet.customHeightMm}
            min={10}
            onChange={(n) => setSheet({ customHeightMm: n })}
          />
        </div>
      )}

      <label className="flex flex-col gap-1 text-xs text-slate-400">
        Orientation
        <select
          value={sheet.orientation}
          onChange={(e) =>
            setSheet({ orientation: e.target.value as 'portrait' | 'landscape' })
          }
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200"
        >
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </label>

      <div className="grid grid-cols-3 gap-2">
        <NumberField
          label="Margin, mm"
          value={sheet.marginMm}
          step={0.5}
          onChange={(n) => setSheet({ marginMm: n })}
        />
        <NumberField
          label="Gap, mm"
          value={sheet.gapMm}
          step={0.5}
          onChange={(n) => setSheet({ gapMm: n })}
        />
        <NumberField
          label="Bleed, mm"
          value={sheet.bleedMm}
          step={0.5}
          onChange={(n) => setSheet({ bleedMm: n })}
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-slate-300">
        <input
          type="checkbox"
          checked={sheet.allowRotate}
          onChange={(e) => setSheet({ allowRotate: e.target.checked })}
          className="h-4 w-4 rounded border-slate-600 bg-slate-900"
        />
        Allow 90° rotation for tighter packing
      </label>

      <label className="flex items-center gap-2 text-xs text-slate-300">
        <input
          type="checkbox"
          checked={sheet.cropMarks}
          onChange={(e) => setSheet({ cropMarks: e.target.checked })}
          className="h-4 w-4 rounded border-slate-600 bg-slate-900"
        />
        Crop marks around each sticker
      </label>
    </div>
  )
}
