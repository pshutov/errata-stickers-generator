import { create } from 'zustand'
import type { Region, SheetSettings, SourceDoc } from '../types'
import { disposePdfjsDoc } from '../lib/pdf/load'

let idCounter = 0
const nextId = (prefix: string): string => `${prefix}_${++idCounter}`

export interface ActivePage {
  docId: string
  pageIndex: number
}

interface AppState {
  docs: SourceDoc[]
  regions: Region[]
  active: ActivePage | null
  /** Id of the region currently selected for editing, if any. */
  selectedRegionId: string | null
  sheet: SheetSettings
  /** Bumped on any change that invalidates a generated layout (regions/sheet/docs). */
  revision: number
  /** True while generating the output PDF. */
  busy: boolean
  error: string | null

  addDocs: (docs: SourceDoc[]) => void
  removeDoc: (docId: string) => void
  setActive: (active: ActivePage) => void

  addRegion: (region: Omit<Region, 'id'>) => string
  updateRegion: (id: string, patch: Partial<Region>) => void
  removeRegion: (id: string) => void
  selectRegion: (id: string | null) => void

  setSheet: (patch: Partial<SheetSettings>) => void
  setBusy: (busy: boolean) => void
  setError: (error: string | null) => void
  resetProject: () => void
}

const DEFAULT_SHEET: SheetSettings = {
  format: 'A4',
  orientation: 'portrait',
  customWidthMm: 210,
  customHeightMm: 297,
  marginMm: 5,
  gapMm: 2,
  bleedMm: 0,
  allowRotate: true,
  cropMarks: false,
}

export const useAppStore = create<AppState>((set) => ({
  docs: [],
  regions: [],
  active: null,
  selectedRegionId: null,
  sheet: DEFAULT_SHEET,
  revision: 0,
  busy: false,
  error: null,

  addDocs: (docs) =>
    set((s) => ({
      docs: [...s.docs, ...docs],
      active: s.active ?? (docs[0] ? { docId: docs[0].id, pageIndex: 0 } : null),
      revision: s.revision + 1,
    })),

  removeDoc: (docId) =>
    set((s) => {
      disposePdfjsDoc(docId)
      const docs = s.docs.filter((d) => d.id !== docId)
      const regions = s.regions.filter((r) => r.docId !== docId)
      const active =
        s.active?.docId === docId
          ? docs[0]
            ? { docId: docs[0].id, pageIndex: 0 }
            : null
          : s.active
      const selectedRegionId = regions.some((r) => r.id === s.selectedRegionId)
        ? s.selectedRegionId
        : null
      return { docs, regions, active, selectedRegionId, revision: s.revision + 1 }
    }),

  // Keep the same reference when the page is already active, so the page viewer doesn't re-render.
  setActive: (active) =>
    set((s) =>
      s.active && s.active.docId === active.docId && s.active.pageIndex === active.pageIndex
        ? {}
        : { active },
    ),

  addRegion: (region) => {
    const id = nextId('region')
    set((s) => ({ regions: [...s.regions, { ...region, id }], revision: s.revision + 1 }))
    return id
  },

  updateRegion: (id, patch) =>
    set((s) => ({
      regions: s.regions.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      revision: s.revision + 1,
    })),

  removeRegion: (id) =>
    set((s) => ({
      regions: s.regions.filter((r) => r.id !== id),
      selectedRegionId: s.selectedRegionId === id ? null : s.selectedRegionId,
      revision: s.revision + 1,
    })),

  selectRegion: (id) => set({ selectedRegionId: id }),

  setSheet: (patch) =>
    set((s) => ({ sheet: { ...s.sheet, ...patch }, revision: s.revision + 1 })),
  setBusy: (busy) => set({ busy }),
  setError: (error) => set({ error }),

  resetProject: () =>
    set((s) => {
      s.docs.forEach((d) => disposePdfjsDoc(d.id))
      return {
        docs: [],
        regions: [],
        active: null,
        selectedRegionId: null,
        revision: s.revision + 1,
      }
    }),
}))
