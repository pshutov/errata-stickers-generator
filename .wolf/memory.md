# Memory

> Chronological action log. Hooks and AI append to this file automatically.
> Old sessions are consolidated by the daemon weekly.

## Session: 2026-06-19 07:49

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 07:55 | Created ../../../../../.claude/plans/clever-drifting-hare.md | — | ~1952 |
| 07:56 | Created package.json | — | ~195 |
| 07:56 | Created vite.config.ts | — | ~55 |
| 07:56 | Created tsconfig.json | — | ~34 |
| 07:56 | Created tsconfig.app.json | — | ~146 |
| 07:56 | Created tsconfig.node.json | — | ~96 |
| 07:56 | Created index.html | — | ~84 |
| 07:56 | Created src/index.css | — | ~65 |
| 07:56 | Created src/main.tsx | — | ~66 |
| 07:56 | Created src/types.ts | — | ~548 |
| 07:56 | Created src/lib/units.ts | — | ~309 |
| 07:57 | Created src/store/useAppStore.ts | — | ~770 |
| 07:57 | Created src/lib/pdf/load.ts | — | ~398 |
| 07:57 | Created src/lib/pdf/render.ts | — | ~278 |
| 07:57 | Created src/lib/geometry/coords.ts | — | ~512 |
| 07:58 | Created src/lib/packing/pack.ts | — | ~770 |
| 07:59 | Created src/lib/pdf/generate.ts | — | ~948 |
| 08:00 | Created src/lib/pdf/render.ts | — | ~365 |
| 08:00 | Created src/components/Uploader.tsx | — | ~599 |
| 08:00 | Created src/components/PageNavigator.tsx | — | ~652 |
| 08:00 | Created src/components/RegionLayer.tsx | — | ~1197 |
| 08:00 | Created src/components/PageViewer.tsx | — | ~588 |
| 08:01 | Created src/components/RegionList.tsx | — | ~671 |
| 08:01 | Created src/components/SheetSettings.tsx | — | ~950 |
| 08:01 | Created src/components/ResultPreview.tsx | — | ~1063 |
| 08:02 | Created src/components/Toolbar.tsx | — | ~284 |
| 08:02 | Created src/App.tsx | — | ~494 |
| 08:02 | Created src/vite-env.d.ts | — | ~11 |
| 08:02 | Edited src/components/ResultPreview.tsx | inline fix | ~12 |
| 08:03 | Edited src/lib/packing/pack.ts | 7→7 lines | ~64 |
| 08:04 | Created ../../../../../../../tmp/verify-gen.mjs | — | ~859 |
| 05:00 | Scaffold Vite+React+TS+Tailwind, deps installed | package.json, vite/tsconfig, index.html | build+typecheck green | ~3k |
| 05:02 | Core model/units/store | types.ts, lib/units.ts, store/useAppStore.ts | done | ~2k |
| 05:04 | PDF load/render/coords + pack + generate libs | lib/pdf/*, lib/geometry/coords.ts, lib/packing/pack.ts | done | ~4k |
| 05:06 | UI components + App layout | components/*.tsx, App.tsx | done | ~4k |
| 05:08 | Fix typecheck (maxrects generic, vite ?url types) | pack.ts, vite-env.d.ts | typecheck clean; build ok | ~1k |
| 05:10 | Verify gen pipeline headlessly (pdf-lib+maxrects) | /tmp script | footprint/crop/rotation/A4 correct | ~1k |
| 05:11 | Dev server smoke test | — | http 200, title served | ~0.5k |
| 08:07 | Session end: 31 writes across 28 files (clever-drifting-hare.md, package.json, vite.config.ts, tsconfig.json, tsconfig.app.json) | 0 reads | ~15242 tok |
| 08:08 | Created src/components/PageViewer.tsx | — | ~805 |
| 05:30 | Fix: страница не рендерилась (ResizeObserver на условно-смонтированном контейнере) + подсказка по выделению | components/PageViewer.tsx | typecheck clean, HMR | ~1k |
| 08:09 | Session end: 32 writes across 28 files (clever-drifting-hare.md, package.json, vite.config.ts, tsconfig.json, tsconfig.app.json) | 0 reads | ~16047 tok |
| 08:13 | Created src/lib/pdf/render.ts | — | ~558 |
| 08:14 | Edited src/components/PageViewer.tsx | modified PageViewer() | ~186 |
| 08:14 | Edited src/components/PageViewer.tsx | CSS: onTask, isCancelled | ~295 |
| 05:40 | Fix: pdfjs "same canvas during multiple render()" — отмена RenderTask + isCancelled-гард перед render (StrictMode/быстрые переключения) | lib/pdf/render.ts, components/PageViewer.tsx | typecheck clean | ~1.5k |
| 08:14 | Session end: 35 writes across 28 files (clever-drifting-hare.md, package.json, vite.config.ts, tsconfig.json, tsconfig.app.json) | 0 reads | ~17086 tok |
| 08:19 | Created ../../../../../.claude/plans/clever-drifting-hare.md | — | ~1671 |
| 08:20 | Edited src/store/useAppStore.ts | 17→20 lines | ~185 |
| 08:20 | Edited src/store/useAppStore.ts | 4→5 lines | ~27 |
| 08:20 | Edited src/store/useAppStore.ts | 8→11 lines | ~106 |
| 08:20 | Edited src/store/useAppStore.ts | expanded (+6 lines) | ~79 |
| 08:20 | Edited src/lib/geometry/coords.ts | modified viewportPageSizePt() | ~154 |
| 08:21 | Created src/components/RegionLayer.tsx | — | ~2880 |
| 08:22 | Created src/components/RegionInspector.tsx | — | ~1197 |
| 08:22 | Edited src/components/PageViewer.tsx | 9→12 lines | ~160 |
| 08:22 | Edited src/components/PageViewer.tsx | added 1 import(s) | ~96 |
| 08:22 | Edited src/components/PageViewer.tsx | expanded (+10 lines) | ~111 |
| 08:23 | Edited src/components/RegionList.tsx | CSS: docId, pageIndex, id | ~157 |
| 08:23 | Edited src/components/RegionList.tsx | setActive() → focusRegion() | ~175 |
| 06:10 | Feature: выбор областей (selectedRegionId+selectRegion) | store/useAppStore.ts | done | ~1k |
| 06:14 | RegionLayer: move/resize (8 якорей), device-px машина состояний, клавиши Del/Esc/стрелки | components/RegionLayer.tsx, lib/geometry/coords.ts | typecheck+build green | ~4k |
| 06:18 | Плавающая панель X/Y/W/H мм + scale + delete | components/RegionInspector.tsx, PageViewer.tsx, RegionList.tsx | done | ~3k |
| 08:24 | Session end: 48 writes across 29 files (clever-drifting-hare.md, package.json, vite.config.ts, tsconfig.json, tsconfig.app.json) | 5 reads | ~28274 tok |
| 08:27 | Edited src/types.ts | 5→7 lines | ~65 |
| 08:27 | Edited src/store/useAppStore.ts | 3→4 lines | ~16 |
| 08:27 | Edited src/lib/pdf/generate.ts | modified drawCropMarks() | ~425 |
| 08:27 | Edited src/lib/pdf/generate.ts | added 1 condition(s) | ~84 |
| 08:27 | Created src/components/SheetSettings.tsx | — | ~1050 |
| 08:28 | Edited src/App.tsx | 11→11 lines | ~101 |
| 08:28 | Edited src/App.tsx | 6→6 lines | ~51 |
| 08:28 | Edited src/components/Toolbar.tsx | 3→3 lines | ~35 |
| 08:28 | Edited src/components/Uploader.tsx | modified if() | ~28 |
| 08:28 | Edited src/components/Uploader.tsx | modified catch() | ~29 |
| 08:28 | Edited src/components/Uploader.tsx | 7→7 lines | ~70 |
| 08:28 | Edited src/components/PageNavigator.tsx | inline fix | ~23 |
| 08:28 | Edited src/components/PageNavigator.tsx | 2→2 lines | ~33 |
| 08:28 | Edited src/components/PageViewer.tsx | CSS: error | ~47 |
| 08:28 | Edited src/components/PageViewer.tsx | 3→3 lines | ~50 |
| 08:28 | Edited src/components/PageViewer.tsx | 3→3 lines | ~45 |
| 08:28 | Edited src/components/PageViewer.tsx | 4→3 lines | ~51 |
| 08:28 | Edited src/components/RegionLayer.tsx | 4→4 lines | ~33 |
| 08:28 | Edited src/components/RegionLayer.tsx | inline fix | ~21 |
| 08:29 | Edited src/components/RegionList.tsx | inline fix | ~28 |
| 08:29 | Edited src/components/RegionList.tsx | 2→2 lines | ~42 |
| 08:29 | Edited src/components/RegionList.tsx | 2→2 lines | ~28 |
| 08:29 | Edited src/components/RegionList.tsx | 4→4 lines | ~50 |
| 08:29 | Edited src/components/RegionInspector.tsx | 31→31 lines | ~318 |
| 08:29 | Edited src/components/ResultPreview.tsx | CSS: error | ~93 |
| 08:30 | Edited src/components/ResultPreview.tsx | CSS: Sheets | ~138 |
| 08:30 | Edited index.html | "ru" → "en" | ~5 |
| 06:40 | Feature: crop marks как настройка (toggle) + отрисовка по углам trim-бокса | types.ts, store, SheetSettings.tsx, lib/pdf/generate.ts | build green, headless OK | ~2k |
| 06:50 | UI переведён полностью на английский (Cyrillic = 0) | App, Toolbar, Uploader, PageNavigator, PageViewer, RegionLayer, RegionList, RegionInspector, SheetSettings, ResultPreview, index.html | build green | ~2k |
| 08:31 | Session end: 75 writes across 29 files (clever-drifting-hare.md, package.json, vite.config.ts, tsconfig.json, tsconfig.app.json) | 5 reads | ~31233 tok |
| 08:51 | Edited src/components/RegionLayer.tsx | expanded (+10 lines) | ~128 |
| 08:51 | Edited src/components/RegionLayer.tsx | added optional chaining | ~524 |
| 08:52 | Session end: 77 writes across 29 files (clever-drifting-hare.md, package.json, vite.config.ts, tsconfig.json, tsconfig.app.json) | 5 reads | ~31885 tok |
| 09:49 | Created ../../../../../.claude/plans/clever-drifting-hare.md | — | ~2129 |
| 09:50 | Created src/lib/random.ts | — | ~196 |
| 09:50 | Edited src/types.ts | expanded (+11 lines) | ~126 |
| 09:50 | Created src/lib/packing/pack.ts | — | ~1790 |
| 09:51 | Created src/store/useAppStore.ts | — | ~986 |
| 09:51 | Created src/components/ResultPreview.tsx | — | ~1134 |
| 09:52 | Created src/lib/project.ts | — | ~529 |
| 09:52 | Created src/components/ProjectControls.tsx | — | ~1171 |
| 09:52 | Edited src/components/Toolbar.tsx | modified Toolbar() | ~330 |
| 09:53 | Created src/components/RegionTree.tsx | — | ~3259 |
| 09:54 | Edited src/App.tsx | 7→6 lines | ~92 |
| 09:54 | Edited src/App.tsx | 9→6 lines | ~48 |
| 09:55 | Edited src/lib/packing/pack.ts | modified costKey() | ~180 |
| 09:55 | Edited src/lib/packing/pack.ts | signatureOf() → costKey() | ~131 |
| 07:20 | Packing variants: random.ts (mulberry32/shuffle), packRegionsWith+generateVariants, PackVariant, efficiency | lib/random.ts, lib/packing/pack.ts, types.ts | headless OK | ~3k |
| 07:24 | Store: revision-счётчик вместо generated; resetProject (dispose pdfjs) | store/useAppStore.ts | done | ~1k |
| 07:28 | ResultPreview → список вариантов (#N sheets % + Download per row) | components/ResultPreview.tsx | done | ~2k |
| 07:34 | Save/Load проекта: project.ts (JSON, refs by name) + ProjectControls в Toolbar (re-attach PDF) | lib/project.ts, components/ProjectControls.tsx, Toolbar.tsx | build green | ~3k |
| 07:45 | Дерево Doc→Page→Region (expand, navigate, inline-confirm delete, duplicate-в-попапе); удалены PageNavigator/RegionList | components/RegionTree.tsx, App.tsx | build green | ~5k |
| 07:50 | Variant dedupe по cost (sheets+eff+unfit) вместо arrangement — чтобы строки не дублировались визуально | lib/packing/pack.ts | build green | ~0.5k |
| 09:56 | Session end: 91 writes across 33 files (clever-drifting-hare.md, package.json, vite.config.ts, tsconfig.json, tsconfig.app.json) | 10 reads | ~47134 tok |
| 17:12 | Created ../../../../../.claude/plans/clever-drifting-hare.md | — | ~856 |
| 17:14 | Edited src/types.ts | 4→6 lines | ~53 |
| 17:14 | Edited src/lib/packing/pack.ts | modified if() | ~76 |
| 17:15 | Edited src/components/RegionLayer.tsx | CSS: quantity | ~39 |
| 17:15 | Edited src/components/RegionTree.tsx | CSS: quantity | ~54 |
| 17:15 | Edited src/components/RegionTree.tsx | 9→10 lines | ~98 |
| 17:15 | Edited src/components/ProjectControls.tsx | added nullish coalescing | ~56 |
| 17:15 | Edited src/lib/project.ts | 7→8 lines | ~38 |
| 17:15 | Edited src/lib/project.ts | 5→6 lines | ~41 |
| 17:15 | Edited src/components/RegionInspector.tsx | CSS: quantity | ~209 |
| 08:05 | Feature: copies/quantity у региона (тип, упаковка-размножение, инспектор Copies, ×N в дереве, save/load, duplicate) | types.ts, lib/packing/pack.ts, lib/project.ts, RegionLayer/RegionTree/RegionInspector/ProjectControls.tsx | build green, headless OK (q7→7 placements) | ~2k |
| 17:16 | Session end: 101 writes across 33 files (clever-drifting-hare.md, package.json, vite.config.ts, tsconfig.json, tsconfig.app.json) | 11 reads | ~49910 tok |
| 17:23 | Session end: 101 writes across 33 files (clever-drifting-hare.md, package.json, vite.config.ts, tsconfig.json, tsconfig.app.json) | 11 reads | ~49910 tok |
| 17:27 | Created src/lib/pdf/generate.ts | — | ~1638 |
| 17:28 | Edited src/lib/pdf/generate.ts | 4→3 lines | ~36 |
| 08:40 | Fix: картинки пропадали в скачанном PDF (pdf-lib embedPage теряет SMask/transparency-group/nested-Form картинки этого PDF). Перевёл генерацию на растеризацию региона через pdf.js (300 DPI) + embedPng | lib/pdf/generate.ts | build green; headless raster на реальном PDF = 47% ink (PASS) | ~3k |
| 17:30 | Session end: 103 writes across 33 files (clever-drifting-hare.md, package.json, vite.config.ts, tsconfig.json, tsconfig.app.json) | 12 reads | ~52937 tok |
| 18:09 | Edited src/types.ts | 1→4 lines | ~46 |
| 18:09 | Edited src/lib/pdf/generate.ts | 2→2 lines | ~56 |
| 18:09 | Edited src/lib/pdf/generate.ts | added 3 condition(s) | ~1041 |
| 18:09 | Edited src/components/ResultPreview.tsx | 3→3 lines | ~46 |
| 18:10 | Edited src/components/ResultPreview.tsx | 3→5 lines | ~96 |
| 18:10 | Edited src/components/ResultPreview.tsx | CSS: mode | ~199 |
| 18:10 | Edited src/components/ResultPreview.tsx | modified DownloadModal() | ~697 |
| 09:00 | Download-попап: выбор Raster/Vector. generatePdf(mode); восстановлен векторный embedPage путь рядом с растровым | lib/pdf/generate.ts, types.ts (RenderMode), components/ResultPreview.tsx (DownloadModal) | build green | ~2k |
| 18:10 | Session end: 110 writes across 33 files (clever-drifting-hare.md, package.json, vite.config.ts, tsconfig.json, tsconfig.app.json) | 12 reads | ~55118 tok |
| 18:11 | Edited src/components/RegionTree.tsx | reduced (-10 lines) | ~98 |
| 18:11 | Edited src/components/RegionTree.tsx | reduced (-6 lines) | ~186 |
| 18:12 | Edited src/components/RegionTree.tsx | added 1 condition(s) | ~499 |
| 18:12 | Edited src/components/RegionTree.tsx | added optional chaining | ~163 |
| 18:12 | Edited src/components/RegionTree.tsx | CSS: onDelete | ~56 |
| 18:12 | Edited src/components/RegionTree.tsx | reduced (-6 lines) | ~101 |
| 18:12 | Session end: 116 writes across 33 files (clever-drifting-hare.md, package.json, vite.config.ts, tsconfig.json, tsconfig.app.json) | 12 reads | ~56221 tok |
| 18:14 | Edited src/store/useAppStore.ts | expanded (+6 lines) | ~79 |
| 18:14 | Session end: 117 writes across 33 files (clever-drifting-hare.md, package.json, vite.config.ts, tsconfig.json, tsconfig.app.json) | 12 reads | ~56300 tok |

## Session: 2026-06-20 13:12

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 13:41 | Created ../../../../../.claude/plans/lucky-hatching-catmull.md | — | ~2718 |
| 13:49 | Edited src/types.ts | 4→6 lines | ~63 |
| 13:49 | Edited src/lib/packing/pack.ts | added nullish coalescing | ~163 |
| 13:49 | Edited src/lib/pdf/generate.ts | added nullish coalescing | ~443 |
| 13:49 | Edited src/components/RegionInspector.tsx | added nullish coalescing | ~209 |
| 13:49 | Created src/lib/hash.ts | — | ~89 |
| 13:50 | Edited src/lib/project.ts | modified buildProject() | ~471 |
| 13:50 | Created src/components/LoadProjectDialog.tsx | — | ~2300 |
| 13:50 | Created src/components/ProjectControls.tsx | — | ~760 |
| 13:51 | Edited src/lib/hash.ts | 1→2 lines | ~50 |
| 18:00 | Per-region margin (empty layout band) + PDF SHA-256 hash on save + interactive load dialog | types.ts, pack.ts, generate.ts, RegionInspector.tsx, hash.ts, project.ts, ProjectControls.tsx, LoadProjectDialog.tsx | build green | ~9k |
| 13:52 | Session end: 10 writes across 9 files (lucky-hatching-catmull.md, types.ts, pack.ts, generate.ts, RegionInspector.tsx) | 14 reads | ~24145 tok |
| 14:00 | Created ../../../../../.claude/plans/lucky-hatching-catmull.md | — | ~1356 |
| 14:01 | Edited ../../../../../.claude/plans/lucky-hatching-catmull.md | expanded (+9 lines) | ~246 |
| 14:02 | Edited vite.config.ts | added optional chaining | ~142 |
| 14:02 | Created .github/workflows/deploy.yml | — | ~224 |
| 14:02 | Created .gitignore | — | ~11 |
| 14:02 | Edited vite.config.ts | 3→6 lines | ~124 |
| 18:30 | GitHub Pages deploy prep: Vite base auto-derive + Actions workflow + .gitignore | vite.config.ts, .github/workflows/deploy.yml, .gitignore | CI-base build emits /<repo>/assets + worker; local stays / | ~3k |
| 14:03 | Session end: 16 writes across 12 files (lucky-hatching-catmull.md, types.ts, pack.ts, generate.ts, RegionInspector.tsx) | 17 reads | ~26695 tok |
| 14:05 | Edited src/components/LoadProjectDialog.tsx | CSS: f | ~49 |
| 14:05 | Edited src/components/LoadProjectDialog.tsx | 2→4 lines | ~63 |
| 14:06 | Edited src/components/LoadProjectDialog.tsx | added 5 condition(s) | ~539 |
| 14:06 | Edited src/components/LoadProjectDialog.tsx | expanded (+14 lines) | ~310 |
| 14:06 | Edited src/components/LoadProjectDialog.tsx | CSS: null | ~244 |
| 14:06 | Edited src/components/LoadProjectDialog.tsx | 3→4 lines | ~42 |
| 19:00 | Drag-and-drop file attach in LoadProjectDialog (per-row drop + dialog-wide drop auto-matched by name) | LoadProjectDialog.tsx | build green | ~2k |
| 14:07 | Session end: 22 writes across 12 files (lucky-hatching-catmull.md, types.ts, pack.ts, generate.ts, RegionInspector.tsx) | 17 reads | ~27942 tok |
| 14:10 | Created README.md | — | ~1620 |
| 19:30 | Init git, push to GitHub main, add README + docs/screenshots/, enable Pages | README.md, docs/screenshots/, git | pushed; Actions deploy green; live at pshutov.github.io/errata-stickers-generator/ (JS+worker 200) | ~5k |
| 14:13 | Session end: 23 writes across 13 files (lucky-hatching-catmull.md, types.ts, pack.ts, generate.ts, RegionInspector.tsx) | 17 reads | ~29678 tok |
| 14:24 | Edited .claude/rules/openwolf.md | 1→4 lines | ~217 |
| 14:24 | Edited .gitignore | expanded (+8 lines) | ~77 |
| 14:25 | Edited .claude/rules/openwolf.md | inline fix | ~51 |
| 20:00 | Harden .wolf privacy: gitignore+untrack runtime-state files leaking home paths; add privacy rules; commit 10 screenshots | .gitignore, .claude/rules/openwolf.md, .wolf/cerebrum.md, docs/screenshots/ | pushed; tracked tree clean of home paths | ~4k |
| 14:26 | Session end: 26 writes across 14 files (lucky-hatching-catmull.md, types.ts, pack.ts, generate.ts, RegionInspector.tsx) | 19 reads | ~30802 tok |
| 14:32 | Edited README.md | 32→28 lines | ~333 |
| 14:32 | Edited README.md | 3→2 lines | ~54 |
