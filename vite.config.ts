import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { projects } from './src/content/projects'
import { TARGETS, checkAll, type StatusReport } from './api/status'

const SNAPSHOT_ID = 'virtual:status-snapshot'

// Live status, three ways:
// - dev: serves /api/status from the same checkAll the Vercel function uses;
// - build: pings once and bakes the result in as the fallback the page shows
//   ("as of deploy") if the live endpoint is unreachable;
// - always: refuses to build if the function's allowlist drifts from the
//   project list the page renders.
function liveStatus(): Plugin {
  let snapshot: StatusReport | null = null
  return {
    name: 'live-status',
    async buildStart() {
      const expected = projects.map((p) => `${p.id} ${p.url}`).sort()
      const actual = Object.entries(TARGETS).map(([id, url]) => `${id} ${url}`).sort()
      if (expected.join('\n') !== actual.join('\n')) {
        this.error(
          `api/status.ts TARGETS is out of sync with src/content/projects.ts.\nexpected:\n${expected.join('\n')}\nactual:\n${actual.join('\n')}`,
        )
      }
      if (this.meta.watchMode) return
      try {
        snapshot = await checkAll()
      } catch {
        snapshot = null
      }
    },
    resolveId(id) {
      if (id === SNAPSHOT_ID) return '\0' + SNAPSHOT_ID
    },
    load(id) {
      if (id === '\0' + SNAPSHOT_ID) return `export default ${JSON.stringify(snapshot)}`
    },
    configureServer(server) {
      server.middlewares.use('/api/status', async (_req, res) => {
        const report = await checkAll()
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(report))
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), liveStatus()],
})
