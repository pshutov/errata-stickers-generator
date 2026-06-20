import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Minimal type for the one Node global we read (avoids pulling in @types/node just for this).
declare const process: { env: Record<string, string | undefined> }

// On GitHub Actions GITHUB_REPOSITORY = "owner/errata-stickers-generator" → base "/errata-stickers-generator/".
// Undefined locally → base "/". (For a user/org page or custom domain, this would need to be "/".)
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]

export default defineConfig({
  base: repo ? `/${repo}/` : '/',
  plugins: [react(), tailwindcss()],
})
