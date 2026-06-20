import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { mmToPt } from '../lib/units'
import type { Region } from '../types'

const DUP_OFFSET = mmToPt(4)

export function RegionTree() {
  const docs = useAppStore((s) => s.docs)
  const regions = useAppStore((s) => s.regions)
  const active = useAppStore((s) => s.active)
  const selectedRegionId = useAppStore((s) => s.selectedRegionId)
  const setActive = useAppStore((s) => s.setActive)
  const selectRegion = useAppStore((s) => s.selectRegion)
  const removeRegion = useAppStore((s) => s.removeRegion)
  const removeDoc = useAppStore((s) => s.removeDoc)
  const addRegion = useAppStore((s) => s.addRegion)

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [confirm, setConfirm] = useState<string | null>(null) // "region:<id>" | "doc:<id>"
  const [dup, setDup] = useState<{ regionId: string; docId: string; pageIndex: number } | null>(null)

  // Keep the active document/page expanded so the current selection is visible.
  useEffect(() => {
    if (!active) return
    setExpanded((prev) => {
      const next = new Set(prev)
      next.add(active.docId)
      next.add(`${active.docId}:${active.pageIndex}`)
      return next
    })
  }, [active])

  if (docs.length === 0) {
    return <p className="px-1 text-xs text-slate-500">No documents loaded.</p>
  }

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const regionsOf = (docId: string, pageIndex: number) =>
    regions.filter((r) => r.docId === docId && r.pageIndex === pageIndex)

  const duplicate = () => {
    if (!dup) return
    const src = regions.find((r) => r.id === dup.regionId)
    if (!src) return
    const samePage = dup.docId === src.docId && dup.pageIndex === src.pageIndex
    const o = samePage ? DUP_OFFSET : 0
    const b = src.bbox
    const id = addRegion({
      docId: dup.docId,
      pageIndex: dup.pageIndex,
      bbox: { left: b.left + o, right: b.right + o, top: b.top - o, bottom: b.bottom - o },
      scale: src.scale,
      quantity: src.quantity,
      label: `${src.label} copy`,
    })
    setActive({ docId: dup.docId, pageIndex: dup.pageIndex })
    selectRegion(id)
    setDup(null)
  }

  let confirmMessage = ''
  if (confirm) {
    const [kind, id] = splitKey(confirm)
    if (kind === 'doc') {
      const d = docs.find((x) => x.id === id)
      const cnt = regions.filter((r) => r.docId === id).length
      confirmMessage = `Remove "${d?.name ?? 'document'}"${cnt ? ` and its ${cnt} region(s)` : ''}?`
    } else {
      const r = regions.find((x) => x.id === id)
      confirmMessage = `Delete region "${r?.label ?? ''}"?`
    }
  }

  return (
    <div className="space-y-1 text-xs">
      {docs.map((doc) => {
        const docOpen = expanded.has(doc.id)
        const docRegionCount = regions.filter((r) => r.docId === doc.id).length
        return (
          <div key={doc.id}>
            {/* Document row */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggle(doc.id)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-700"
                title={docOpen ? 'Collapse' : 'Expand'}
              >
                {docOpen ? '▾' : '▸'}
              </button>
              <span className="min-w-0 flex-1 truncate font-medium text-slate-200" title={doc.name}>
                {doc.name}
              </span>
              <span className="shrink-0 text-slate-500">{docRegionCount}</span>
              <button
                onClick={() => setConfirm(`doc:${doc.id}`)}
                className="shrink-0 rounded px-1 text-slate-500 hover:text-red-400"
                title="Remove document"
              >
                ✕
              </button>
            </div>

            {/* Pages */}
            {docOpen && (
              <div className="ml-3 border-l border-slate-700 pl-2">
                {Array.from({ length: doc.numPages }, (_, pageIndex) => {
                  const pageKey = `${doc.id}:${pageIndex}`
                  const pageRegions = regionsOf(doc.id, pageIndex)
                  const pageOpen = expanded.has(pageKey)
                  const isActive = active?.docId === doc.id && active.pageIndex === pageIndex
                  return (
                    <div key={pageKey}>
                      <div
                        className={`flex items-center gap-1 rounded px-1 ${
                          isActive ? 'bg-sky-400/15' : 'hover:bg-slate-800'
                        }`}
                      >
                        {pageRegions.length > 0 ? (
                          <button
                            onClick={() => toggle(pageKey)}
                            className="flex h-5 w-4 shrink-0 items-center justify-center text-slate-400 hover:text-slate-200"
                            title={pageOpen ? 'Collapse' : 'Expand'}
                          >
                            {pageOpen ? '−' : '+'}
                          </button>
                        ) : (
                          <span className="h-5 w-4 shrink-0" />
                        )}
                        <button
                          onClick={() => setActive({ docId: doc.id, pageIndex })}
                          className={`flex-1 py-0.5 text-left ${
                            isActive ? 'text-sky-200' : 'text-slate-300'
                          }`}
                        >
                          Page {pageIndex + 1}
                        </button>
                        {pageRegions.length > 0 && (
                          <span className="shrink-0 text-slate-500">{pageRegions.length}</span>
                        )}
                      </div>

                      {/* Regions */}
                      {pageOpen &&
                        pageRegions.map((r) => (
                          <RegionRow
                            key={r.id}
                            region={r}
                            selected={r.id === selectedRegionId}
                            onOpen={() => {
                              setActive({ docId: doc.id, pageIndex })
                              selectRegion(r.id)
                            }}
                            onDelete={() => setConfirm(`region:${r.id}`)}
                            onDuplicate={() =>
                              setDup({ regionId: r.id, docId: r.docId, pageIndex: r.pageIndex })
                            }
                          />
                        ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {dup && (
        <DuplicateDialog
          dup={dup}
          docs={docs}
          onChange={setDup}
          onConfirm={duplicate}
          onCancel={() => setDup(null)}
        />
      )}

      {confirm && (
        <DeleteConfirmDialog
          message={confirmMessage}
          onConfirm={() => {
            const [kind, id] = splitKey(confirm)
            if (kind === 'doc') removeDoc(id)
            else removeRegion(id)
            setConfirm(null)
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}

const splitKey = (key: string): [string, string] => {
  const i = key.indexOf(':')
  return [key.slice(0, i), key.slice(i + 1)]
}

function DeleteConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div
        className="w-72 rounded-lg border border-slate-600 bg-slate-800 p-4 text-xs shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-1 text-sm font-semibold text-slate-100">Delete</h3>
        <p className="mb-4 text-slate-300">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded border border-slate-600 px-3 py-1 text-slate-300 hover:border-slate-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded bg-red-500 px-3 py-1 font-semibold text-white hover:bg-red-400"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function RegionRow({
  region,
  selected,
  onOpen,
  onDelete,
  onDuplicate,
}: {
  region: Region
  selected: boolean
  onOpen: () => void
  onDelete: () => void
  onDuplicate: () => void
}) {
  return (
    <div
      className={`ml-4 flex items-center gap-1 rounded px-1 ${
        selected ? 'bg-sky-400/20' : 'hover:bg-slate-800'
      }`}
    >
      <span className="text-slate-600">·</span>
      <button
        onClick={onOpen}
        className={`min-w-0 flex-1 truncate py-0.5 text-left ${
          selected ? 'text-sky-200' : 'text-slate-300'
        }`}
        title={region.label}
      >
        {region.label}
        {region.quantity > 1 && <span className="ml-1 text-slate-500">×{region.quantity}</span>}
      </button>
      <button
        onClick={onDuplicate}
        className="shrink-0 rounded px-1 text-slate-500 hover:text-sky-300"
        title="Duplicate"
      >
        ⧉
      </button>
      <button
        onClick={onDelete}
        className="shrink-0 rounded px-1 text-slate-500 hover:text-red-400"
        title="Delete"
      >
        ✕
      </button>
    </div>
  )
}

function DuplicateDialog({
  dup,
  docs,
  onChange,
  onConfirm,
  onCancel,
}: {
  dup: { regionId: string; docId: string; pageIndex: number }
  docs: { id: string; name: string; numPages: number }[]
  onChange: (d: { regionId: string; docId: string; pageIndex: number }) => void
  onConfirm: () => void
  onCancel: () => void
}) {
  const targetDoc = docs.find((d) => d.id === dup.docId) ?? docs[0]
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div
        className="w-72 rounded-lg border border-slate-600 bg-slate-800 p-4 text-xs shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 text-sm font-semibold text-slate-100">Duplicate region</h3>

        <label className="mb-2 flex flex-col gap-1 text-slate-400">
          Document
          <select
            value={dup.docId}
            onChange={(e) => onChange({ ...dup, docId: e.target.value, pageIndex: 0 })}
            className="rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
          >
            {docs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label className="mb-4 flex flex-col gap-1 text-slate-400">
          Page
          <select
            value={dup.pageIndex}
            onChange={(e) => onChange({ ...dup, pageIndex: Number(e.target.value) })}
            className="rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
          >
            {Array.from({ length: targetDoc.numPages }, (_, i) => (
              <option key={i} value={i}>
                Page {i + 1}
              </option>
            ))}
          </select>
        </label>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded border border-slate-600 px-3 py-1 text-slate-300 hover:border-slate-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded bg-sky-500 px-3 py-1 font-semibold text-white hover:bg-sky-400"
          >
            Duplicate
          </button>
        </div>
      </div>
    </div>
  )
}
