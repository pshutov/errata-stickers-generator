import { useAppStore } from '../store/useAppStore'
import { ProjectControls } from './ProjectControls'

export function Toolbar() {
  const regions = useAppStore((s) => s.regions)
  const docs = useAppStore((s) => s.docs)
  const error = useAppStore((s) => s.error)
  const setError = useAppStore((s) => s.setError)

  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-800 bg-slate-900/60 px-4 py-3">
      <div className="flex items-baseline gap-3">
        <h1 className="text-base font-semibold text-slate-100">Errata Stickers Generator</h1>
        <span className="text-xs text-slate-500">
          {docs.length} docs · {regions.length} regions
        </span>
      </div>
      <div className="flex items-center gap-4">
        {error && (
          <div className="flex items-center gap-2 rounded bg-red-500/15 px-3 py-1 text-xs text-red-300">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
              ✕
            </button>
          </div>
        )}
        <ProjectControls />
      </div>
    </header>
  )
}
