import type { PdfBBox, Region, SheetSettings, SourceDoc } from '../types'
import { sha256Hex } from './hash'

export const PROJECT_EXT = '.esproj.json'
const PROJECT_VERSION = 1

interface ProjectRegion {
  docName: string
  pageIndex: number
  bbox: PdfBBox
  scale: number
  quantity?: number
  marginMm?: number
  label: string
}

export interface ProjectDoc {
  name: string
  numPages: number
  /** SHA-256 of the source PDF bytes, so load can flag a mismatched/edited file. */
  hash?: string
}

export interface ProjectFile {
  version: number
  sheet: SheetSettings
  docs: ProjectDoc[]
  regions: ProjectRegion[]
}

/**
 * Serialise current state into a portable project (regions reference docs by file name).
 * Only docs that actually carry a region are saved, each fingerprinted with a SHA-256 hash.
 */
export async function buildProject(
  docs: SourceDoc[],
  regions: Region[],
  sheet: SheetSettings,
): Promise<ProjectFile> {
  const nameById = new Map(docs.map((d) => [d.id, d.name]))
  const usedIds = new Set(regions.map((r) => r.docId))
  const usedDocs = docs.filter((d) => usedIds.has(d.id))
  return {
    version: PROJECT_VERSION,
    sheet,
    docs: await Promise.all(
      usedDocs.map(async (d) => ({
        name: d.name,
        numPages: d.numPages,
        hash: await sha256Hex(d.bytes),
      })),
    ),
    regions: regions
      .filter((r) => nameById.has(r.docId))
      .map((r) => ({
        docName: nameById.get(r.docId)!,
        pageIndex: r.pageIndex,
        bbox: r.bbox,
        scale: r.scale,
        quantity: r.quantity,
        marginMm: r.marginMm,
        label: r.label,
      })),
  }
}

export function downloadProject(project: ProjectFile, filename: string): void {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function parseProjectFile(file: File): Promise<ProjectFile> {
  const text = await file.text()
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('File is not valid JSON.')
  }
  const p = data as Partial<ProjectFile>
  if (!p || p.version !== PROJECT_VERSION || !Array.isArray(p.docs) || !Array.isArray(p.regions) || !p.sheet) {
    throw new Error('Unrecognised or incompatible project file.')
  }
  return p as ProjectFile
}
