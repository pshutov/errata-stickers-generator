import { Toolbar } from './components/Toolbar'
import { Uploader } from './components/Uploader'
import { RegionTree } from './components/RegionTree'
import { PageViewer } from './components/PageViewer'
import { SheetSettings } from './components/SheetSettings'
import { ResultPreview } from './components/ResultPreview'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function App() {
  return (
    <div className="flex h-full flex-col">
      <Toolbar />
      <div className="grid min-h-0 flex-1 grid-cols-[280px_1fr_320px]">
        {/* Left: documents, pages, regions */}
        <aside className="space-y-5 overflow-y-auto border-r border-slate-800 p-4">
          <Section title="Sources">
            <Uploader />
          </Section>
          <Section title="Documents">
            <RegionTree />
          </Section>
        </aside>

        {/* Center: page viewer */}
        <main className="overflow-auto bg-slate-950/50 p-6">
          <PageViewer />
        </main>

        {/* Right: sheet settings + result */}
        <aside className="space-y-5 overflow-y-auto border-l border-slate-800 p-4">
          <Section title="Print sheet">
            <SheetSettings />
          </Section>
          <Section title="Output">
            <ResultPreview />
          </Section>
        </aside>
      </div>
    </div>
  )
}
