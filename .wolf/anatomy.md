# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-06-20T11:47:27.366Z
> Files: 44 tracked | Anatomy hits: 0 | Misses: 0

## ../../../../../../../tmp/

- `verify-gen.mjs` — Declares PT (~859 tok)

## ../../../../../.claude/plans/

- `clever-drifting-hare.md` — План: Число повторов (copies) для региона (~802 tok)
- `lucky-hatching-catmull.md` — Plan: Deploy to GitHub Pages (project page) (~1495 tok)

## ../../../../../.claude/projects/-Users-pshutau-Documents-dev-projects-pets-errata-stickers-generator/memory/

- `MEMORY.md` (~28 tok)
- `no-git-without-command.md` (~221 tok)

## ./

- `.gitignore` — Git ignore rules (~77 tok)
- `CLAUDE.md` — OpenWolf (~57 tok)
- `index.html` — Errata Stickers Generator (~84 tok)
- `package.json` — Node.js package manifest (~195 tok)
- `README.md` — Project documentation (~1501 tok)
- `tsconfig.app.json` (~146 tok)
- `tsconfig.json` — TypeScript configuration (~34 tok)
- `tsconfig.node.json` (~96 tok)
- `vite.config.ts` — Minimal type for the one Node global we read (avoids pulling in @types/node just for this). (~189 tok)

## .claude/

- `settings.json` (~441 tok)

## .claude/rules/

- `openwolf.md` (~479 tok)

## .github/workflows/

- `deploy.yml` — CI: Deploy to GitHub Pages (~224 tok)

## src/

- `App.tsx` — Section (~451 tok)
- `index.css` — Styles: 3 rules, 1 vars (~65 tok)
- `main.tsx` (~66 tok)
- `types.ts` — A bounding box in PDF user-space (points, origin bottom-left of the page). (~742 tok)
- `vite-env.d.ts` — / <reference types="vite/client" /> (~11 tok)

## src/components/

- `LoadProjectDialog.tsx` — isPdf (~3070 tok)
- `PageNavigator.tsx` — PageNavigator (~651 tok)
- `PageViewer.tsx` — PageViewer (~1058 tok)
- `ProjectControls.tsx` — ProjectControls (~760 tok)
- `RegionInspector.tsx` — round1 (~1320 tok)
- `RegionLayer.tsx` — Min drawn size in points; below this a drag is treated as a stray click. (~3066 tok)
- `RegionList.tsx` — RegionList (~773 tok)
- `RegionTree.tsx` — DUP_OFFSET (~3440 tok)
- `ResultPreview.tsx` — ResultPreview (~1750 tok)
- `SheetSettings.tsx` — FORMATS (~1050 tok)
- `Toolbar.tsx` — Toolbar (~330 tok)
- `Uploader.tsx` — Uploader (~600 tok)

## src/lib/

- `hash.ts` — SHA-256 of raw bytes as a lowercase hex string (used to fingerprint source PDFs). (~122 tok)
- `project.ts` — SHA-256 of the source PDF bytes, so load can flag a mismatched/edited file. (~703 tok)
- `random.ts` — Small deterministic PRNG so packing variants are reproducible per seed. (~196 tok)
- `units.ts` — PDF user-space unit is 1/72 inch. 1 inch = 25.4 mm. (~309 tok)

## src/lib/geometry/

- `coords.ts` — Convert a rectangle drawn in canvas/CSS pixels into a PDF user-space bounding box. (~627 tok)

## src/lib/packing/

- `pack.ts` — Output footprint (points) of a region's sticker, including scale, bleed and the optional (~1887 tok)

## src/lib/pdf/

- `generate.ts` — Print resolution for rasterised regions. Each region is drawn at its final physical (~2242 tok)
- `load.ts` — Cache of pdfjs documents keyed by SourceDoc id (kept out of the store — not serialisable). (~398 tok)
- `render.ts` — Target on-screen CSS width in pixels. (~558 tok)

## src/store/

- `useAppStore.ts` — Id of the region currently selected for editing, if any. (~1052 tok)
