import { useCallback, useRef, useState } from 'react'
import { loadPdfFile } from '../lib/pdf/load'
import { useAppStore } from '../store/useAppStore'

export function Uploader() {
  const addDocs = useAppStore((s) => s.addDocs)
  const setError = useAppStore((s) => s.setError)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)

  const ingest = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      const pdfs = Array.from(files).filter(
        (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'),
      )
      if (pdfs.length === 0) {
        setError('Please choose PDF files.')
        return
      }
      setLoading(true)
      setError(null)
      try {
        const docs = await Promise.all(pdfs.map(loadPdfFile))
        addDocs(docs)
      } catch (e) {
        setError(`Failed to open PDF: ${(e as Error).message}`)
      } finally {
        setLoading(false)
      }
    },
    [addDocs, setError],
  )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        void ingest(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-lg border-2 border-dashed p-4 text-center text-sm transition ${
        dragging ? 'border-sky-400 bg-sky-400/10' : 'border-slate-700 hover:border-slate-500'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={(e) => void ingest(e.target.files)}
      />
      {loading ? (
        <span className="text-slate-300">Loading…</span>
      ) : (
        <span className="text-slate-400">
          Drag &amp; drop PDFs here or <span className="text-sky-400">choose files</span>
        </span>
      )}
    </div>
  )
}
