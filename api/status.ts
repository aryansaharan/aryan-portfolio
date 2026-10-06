// GET /api/status: pings every public project and reports which ones are up,
// so the "Live" dots on the page are measured, not asserted.
//
// Self-contained on purpose: Vercel compiles api/ separately from the Vite
// app, so this file imports nothing. vite.config.ts fails the build if
// TARGETS drifts from src/content/projects.ts. It is also an allowlist: the
// endpoint never fetches a URL a visitor supplies.

export const TARGETS: Record<string, string> = {
  'prod-ai': 'https://prod-ai-studio.vercel.app',
  'trial-shift': 'https://trial-shift.vercel.app',
  ilumos: 'https://ilumos-v3.vercel.app',
  ascend: 'https://ascendmvp.vercel.app',
  'think-peepal': 'https://think-peepal.vercel.app',
}

export type StatusReport = {
  checkedAt: string
  up: Record<string, boolean>
}

async function ping(url: string): Promise<boolean> {
  // One retry: a cold serverless app can miss the first window.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(6000),
        headers: { 'user-agent': 'aryansaharan.vercel.app status check' },
      })
      await res.body?.cancel()
      if (res.ok) return true
    } catch {
      // timeout or network error: fall through to the retry
    }
  }
  return false
}

export async function checkAll(): Promise<StatusReport> {
  const entries = await Promise.all(
    Object.entries(TARGETS).map(async ([id, url]) => [id, await ping(url)] as const),
  )
  return { checkedAt: new Date().toISOString(), up: Object.fromEntries(entries) }
}

type Res = {
  setHeader(name: string, value: string): void
  status(code: number): { json(body: unknown): void }
}

export default async function handler(_req: unknown, res: Res) {
  const report = await checkAll()
  // Five minutes at the edge: visitors never wait on eight pings.
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  res.status(200).json(report)
}
