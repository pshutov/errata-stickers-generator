import { useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import {
  buildProject,
  downloadProject,
  parseProjectFile,
  PROJECT_EXT,
  type ProjectFile,
} from '../lib/project'
import { LoadProjectDialog } from './LoadProjectDialog'

export function ProjectControls() {
  const docs = useAppStore((s) => s.docs)
  const regions = useAppStore((s) => s.regions)
  const sheet = useAppStore((s) => s.sheet)
  const setSheet = useAppStore((s) => s.setSheet)
  const resetProject = useAppStore((s) => s.resetProject)
  const setError = useAppStore((s) => s.setError)

  const jsonInputRef = useRef<HTMLInputElement>(null)
  const [pendingProject, setPendingProject] = useState<ProjectFile | null>(null)
  const [working, setWorking] = useState(false)

  const handleSave = async () => {
    setWorking(true)
    try {
      const project = await buildProject(docs, regions, sheet)
      downloadProject(project, `project${PROJECT_EXT}`)
    } catch (e) {
      setError(`Save failed: ${(e as Error).message}`)
    } finally {
      setWorking(false)
    }
  }

  const onJsonSelected = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    try {
      const project = await parseProjectFile(file)
      if (project.docs.length === 0) {
        // No source PDFs needed — apply immediately.
        resetProject()
        setSheet(project.sheet)
        return
      }
      // Defer reset until the user confirms in the dialog (so Cancel keeps current work).
      setPendingProject(project)
    } catch (e) {
      setError(`Open failed: ${(e as Error).message}`)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => void handleSave()}
        disabled={regions.length === 0 || working}
        className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-300 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {working ? 'Saving…' : 'Save'}
      </button>
      <button
        onClick={() => jsonInputRef.current?.click()}
        className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-300 transition hover:border-slate-400"
      >
        Open
      </button>
      <input
        ref={jsonInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          void onJsonSelected(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      {pendingProject && (
        <LoadProjectDialog project={pendingProject} onClose={() => setPendingProject(null)} />
      )}
    </div>
  )
}
