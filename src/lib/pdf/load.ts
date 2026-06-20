import * as pdfjs from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
// Vite resolves this to a hashed URL for the worker bundle.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { SourceDoc } from '../../types'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

/** Cache of pdfjs documents keyed by SourceDoc id (kept out of the store — not serialisable). */
const pdfjsCache = new Map<string, PDFDocumentProxy>()

let docCounter = 0

/**
 * Read a File into a SourceDoc (raw bytes + page count) and cache its pdfjs document.
 * Bytes are copied so pdfjs (which detaches the buffer it parses) does not affect the kept copy.
 */
export async function loadPdfFile(file: File): Promise<SourceDoc> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // pdfjs transfers/detaches the buffer it is given, so hand it a separate copy.
  const pdfjsDoc = await pdfjs.getDocument({ data: bytes.slice() }).promise

  const id = `doc_${++docCounter}`
  pdfjsCache.set(id, pdfjsDoc)

  return { id, name: file.name, bytes, numPages: pdfjsDoc.numPages }
}

export function getPdfjsDoc(docId: string): PDFDocumentProxy | undefined {
  return pdfjsCache.get(docId)
}

export function disposePdfjsDoc(docId: string): void {
  const doc = pdfjsCache.get(docId)
  if (doc) {
    void doc.destroy()
    pdfjsCache.delete(docId)
  }
}
