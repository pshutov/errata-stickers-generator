import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { generateVariants } from '../lib/packing/pack'
import { generatePdf } from '../lib/pdf/generate'
import type { PackVariant, RenderMode } from '../types'

export function ResultPreview() {
  const regions = useAppStore((s) => s.regions)
  const docs = useAppStore((s) => s.docs)
  const sheet = useAppStore((s) => s.sheet)
  const revision = useAppStore((s) => s.revision)
  const setError = useAppStore((s) => s.setError)

  const [variants, setVariants] = useState<PackVariant[] | null>(null)
  const [generating, setGenerating] = useState(false)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  // Variant awaiting a raster/vector choice in the download popup.
  const [pending, setPending] = useState<PackVariant | null>(null)

  // Any change to regions/sheet/docs invalidates the computed variants.
  useEffect(() => {
    setVariants(null)
  }, [revision])

  const handleGenerate = () => {
    setError(null)
    setGenerating(true)
    // Defer so the button shows its busy state before the (sync) packing runs.
    setTimeout(() => {
      try {
        const v = generateVariants(regions, sheet, 10)
        setVariants(v)
        if (v.length > 0 && v[0].unplaced.length > 0) {
          setError(
            `${v[0].unplaced.length} region(s) don't fit on a sheet — reduce scale/bleed or use a larger format.`,
          )
        }
      } catch (e) {
        setError(`Generation error: ${(e as Error).message}`)
      } finally {
        setGenerating(false)
      }
    }, 0)
  }

  const doDownload = async (variant: PackVariant, mode: RenderMode) => {
    setPending(null)
    setDownloadingId(variant.id)
    setError(null)
    try {
      const pdfBytes = await generatePdf(variant.result, regions, docs, sheet, mode)
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `errata-stickers-v${variant.id}-${variant.sheets}sheets-${mode}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(`Generation error: ${(e as Error).message}`)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleGenerate}
        disabled={generating || regions.length === 0}
        className="w-full rounded bg-sky-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
      >
        {generating ? 'Generating…' : 'Generate layout'}
      </button>

      {variants && variants.length === 0 && (
        <p className="text-xs text-slate-500">No layout — add regions that fit the sheet.</p>
      )}

      {variants && variants.length > 0 && (
        <ul className="space-y-1.5">
          {variants.map((v) => (
            <li
              key={v.id}
              className="flex items-center justify-between gap-2 rounded border border-slate-700 bg-slate-800/40 p-2 text-xs"
            >
              <div className="min-w-0">
                <div className="text-slate-200">
                  #{v.id} · {v.sheets} {v.sheets === 1 ? 'sheet' : 'sheets'}
                </div>
                <div className="text-slate-500">
                  {Math.round(v.efficiency * 100)}% used
                  {v.unplaced.length > 0 && (
                    <span className="text-amber-400"> · {v.unplaced.length} don't fit</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setPending(v)}
                disabled={downloadingId !== null}
                className="shrink-0 rounded bg-emerald-500 px-3 py-1 font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500"
              >
                {downloadingId === v.id ? '…' : 'Download'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {pending && (
        <DownloadModal
          variant={pending}
          onPick={(mode) => void doDownload(pending, mode)}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  )
}

function DownloadModal({
  variant,
  onPick,
  onCancel,
}: {
  variant: PackVariant
  onPick: (mode: RenderMode) => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div
        className="w-80 rounded-lg border border-slate-600 bg-slate-800 p-4 text-xs shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-1 text-sm font-semibold text-slate-100">
          Download variant #{variant.id}
        </h3>
        <p className="mb-3 text-slate-400">
          {variant.sheets} {variant.sheets === 1 ? 'sheet' : 'sheets'} · choose how regions are
          rendered:
        </p>

        <button
          onClick={() => onPick('raster')}
          className="mb-2 w-full rounded border border-sky-500 bg-sky-500/10 p-2 text-left hover:bg-sky-500/20"
        >
          <div className="font-semibold text-sky-200">Raster (recommended)</div>
          <div className="text-slate-400">
            Exact match to the editor (300 DPI). Works with any PDF, larger file.
          </div>
        </button>

        <button
          onClick={() => onPick('vector')}
          className="w-full rounded border border-slate-600 p-2 text-left hover:bg-slate-700/50"
        >
          <div className="font-semibold text-slate-200">Vector</div>
          <div className="text-slate-400">
            Crisp at any zoom, small file. May drop some images on complex PDFs.
          </div>
        </button>

        <button
          onClick={onCancel}
          className="mt-3 w-full rounded border border-slate-600 px-3 py-1 text-slate-300 hover:border-slate-400"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
