import { useMemo, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { loadPdfFile } from '../lib/pdf/load'
import { sha256Hex } from '../lib/hash'
import type { ProjectFile } from '../lib/project'

type RowStatus = 'empty' | 'ok' | 'mismatch' | 'unknown'

interface Row {
  name: string
  numPages: number
  expectedHash?: string
  file: File | null
  status: RowStatus
}

interface Props {
  project: ProjectFile
  onClose: () => void
}

const isPdf = (f: File) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')

const STATUS_PILL: Record<RowStatus, { label: string; cls: string }> = {
  empty: { label: 'Not attached', cls: 'bg-slate-700 text-slate-300' },
  ok: { label: 'Match', cls: 'bg-emerald-600/80 text-white' },
  mismatch: { label: 'Hash differs', cls: 'bg-amber-500/90 text-black' },
  unknown: { label: 'Attached', cls: 'bg-sky-600/80 text-white' },
}

export function LoadProjectDialog({ project, onClose }: Props) {
  const addDocs = useAppStore((s) => s.addDocs)
  const addRegion = useAppStore((s) => s.addRegion)
  const setSheet = useAppStore((s) => s.setSheet)
  const resetProject = useAppStore((s) => s.resetProject)
  const setError = useAppStore((s) => s.setError)

  const [rows, setRows] = useState<Row[]>(() =>
    project.docs.map((d) => ({
      name: d.name,
      numPages: d.numPages,
      expectedHash: d.hash,
      file: null,
      status: 'empty',
    })),
  )
  const [confirmMissing, setConfirmMissing] = useState(false)
  const [working, setWorking] = useState(false)
  const [dragRow, setDragRow] = useState<number | null>(null)
  const [dragAll, setDragAll] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const targetRowRef = useRef<number>(-1)

  const missingCount = useMemo(() => rows.filter((r) => !r.file).length, [rows])
  const hasMismatch = useMemo(() => rows.some((r) => r.status === 'mismatch'), [rows])

  const pickFor = (index: number) => {
    targetRowRef.current = index
    fileInputRef.current?.click()
  }

  // Hash each dropped/picked file and place it into its target row.
  const applyAssignments = async (assignments: { index: number; file: File }[]) => {
    if (assignments.length === 0) return
    const withHash = await Promise.all(
      assignments.map(async (a) => ({
        ...a,
        hash: await sha256Hex(new Uint8Array(await a.file.arrayBuffer())),
      })),
    )
    setRows((prev) =>
      prev.map((r, i) => {
        const hit = withHash.find((x) => x.index === i)
        if (!hit) return r
        const status: RowStatus = !r.expectedHash
          ? 'unknown'
          : hit.hash === r.expectedHash
            ? 'ok'
            : 'mismatch'
        return { ...r, file: hit.file, status }
      }),
    )
  }

  const onFilePicked = (file: File | undefined) => {
    const index = targetRowRef.current
    targetRowRef.current = -1
    if (!file || index < 0) return
    void applyAssignments([{ index, file }])
  }

  // Drop a single PDF onto a specific row.
  const onRowDrop = (index: number, files: FileList) => {
    setDragRow(null)
    setDragAll(false)
    const file = Array.from(files).find(isPdf)
    if (file) void applyAssignments([{ index, file }])
  }

  // Drop one or more PDFs anywhere on the dialog: match each to a row by its saved name,
  // otherwise drop it into the next still-empty row.
  const onDialogDrop = (files: FileList) => {
    setDragAll(false)
    setDragRow(null)
    const pdfs = Array.from(files).filter(isPdf)
    if (pdfs.length === 0) return
    const used = new Set<number>()
    const plan: { index: number; file: File }[] = []
    for (const file of pdfs) {
      let idx = rows.findIndex((r, i) => !used.has(i) && r.name === file.name)
      if (idx < 0) idx = rows.findIndex((r, i) => !used.has(i) && !r.file)
      if (idx < 0) break
      used.add(idx)
      plan.push({ index: idx, file })
    }
    void applyAssignments(plan)
  }

  const applyLoad = async () => {
    setWorking(true)
    setError(null)
    try {
      resetProject()
      setSheet(project.sheet)

      const docIdByName = new Map<string, string>()
      const loaded = await Promise.all(
        rows.map(async (r) => {
          if (!r.file) return null
          const doc = await loadPdfFile(r.file)
          docIdByName.set(r.name, doc.id)
          return doc
        }),
      )
      const ok = loaded.filter((d): d is NonNullable<typeof d> => d !== null)
      if (ok.length > 0) addDocs(ok)

      let restored = 0
      let skipped = 0
      for (const r of project.regions) {
        const docId = docIdByName.get(r.docName)
        if (!docId) {
          skipped++
          continue
        }
        addRegion({
          docId,
          pageIndex: r.pageIndex,
          bbox: r.bbox,
          scale: r.scale,
          quantity: r.quantity ?? 1,
          marginMm: r.marginMm ?? 0,
          label: r.label,
        })
        restored++
      }

      if (skipped > 0) {
        setError(`Loaded ${restored} region(s); skipped ${skipped} from unattached PDF(s).`)
      }
      onClose()
    } catch (e) {
      setError(`Open failed: ${(e as Error).message}`)
      onClose()
    } finally {
      setWorking(false)
    }
  }

  const onLoadClick = () => {
    if (missingCount > 0) {
      setConfirmMissing(true)
      return
    }
    void applyLoad()
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/50"
      onClick={onClose}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <div
        className={`w-[28rem] max-w-[92vw] rounded-lg border bg-slate-800 p-4 text-xs shadow-xl transition ${
          dragAll ? 'border-sky-400' : 'border-slate-600'
        }`}
        onClick={(e) => e.stopPropagation()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragAll(true)
        }}
        onDragLeave={() => setDragAll(false)}
        onDrop={(e) => {
          e.preventDefault()
          onDialogDrop(e.dataTransfer.files)
        }}
      >
        <h3 className="mb-1 text-sm font-semibold text-slate-100">Open project</h3>
        <p className="mb-3 text-slate-400">
          Attach each source PDF used by this project — click a row, or drag a PDF onto it.
          Drop several files at once to match them by name. A warning appears if a file’s
          contents don’t match the one it was saved with.
        </p>

        <div className="mb-3 max-h-72 space-y-1.5 overflow-y-auto">
          {rows.map((r, i) => {
            const pill = STATUS_PILL[r.status]
            return (
              <div
                key={`${r.name}-${i}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setDragRow(i)
                }}
                onDragLeave={() => setDragRow((d) => (d === i ? null : d))}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onRowDrop(i, e.dataTransfer.files)
                }}
                className={`flex items-center gap-2 rounded border px-2 py-1.5 transition ${
                  dragRow === i
                    ? 'border-sky-400 bg-sky-400/10'
                    : r.status === 'mismatch'
                      ? 'border-amber-500/60 bg-amber-500/10'
                      : 'border-slate-600 bg-slate-900'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-slate-100" title={r.name}>
                    {r.name}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {r.numPages} page{r.numPages === 1 ? '' : 's'}
                    {r.file && r.file.name !== r.name ? ` · attached: ${r.file.name}` : ''}
                  </div>
                </div>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${pill.cls}`}>
                  {pill.label}
                </span>
                <button
                  onClick={() => pickFor(i)}
                  className="shrink-0 rounded border border-slate-600 px-2 py-0.5 text-slate-300 transition hover:border-slate-400"
                >
                  {r.file ? 'Replace' : 'Attach'}
                </button>
              </div>
            )
          })}
        </div>

        {hasMismatch && (
          <p className="mb-2 text-amber-400">
            ⚠ One or more files differ from the originals — output may not match.
          </p>
        )}

        {confirmMissing ? (
          <div className="rounded border border-amber-500/60 bg-amber-500/10 p-2">
            <p className="mb-2 text-amber-200">
              {missingCount} PDF(s) not attached. Regions referencing them will be skipped.
              Continue anyway?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmMissing(false)}
                className="rounded border border-slate-600 px-3 py-1 text-slate-300 hover:border-slate-400"
              >
                Back
              </button>
              <button
                onClick={() => void applyLoad()}
                disabled={working}
                className="rounded bg-amber-500 px-3 py-1 font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-500">
              {rows.length - missingCount}/{rows.length} attached
            </span>
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded border border-slate-600 px-3 py-1 text-slate-300 hover:border-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={onLoadClick}
                disabled={working}
                className="rounded bg-sky-500 px-3 py-1 font-semibold text-white hover:bg-sky-400 disabled:opacity-50"
              >
                {working ? 'Loading…' : 'Load'}
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            void onFilePicked(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
