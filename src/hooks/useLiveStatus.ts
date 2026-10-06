import { useEffect, useState } from 'react'
import snapshot from 'virtual:status-snapshot'

export type LiveStatus = {
  up: Record<string, boolean> | null
  checkedAt: Date | null
  /** live: measured by /api/status now. deploy: baked in at build. none: unknown. */
  source: 'live' | 'deploy' | 'none'
}

const fromSnapshot = (): LiveStatus =>
  snapshot
    ? { up: snapshot.up, checkedAt: new Date(snapshot.checkedAt), source: 'deploy' }
    : { up: null, checkedAt: null, source: 'none' }

// One fetch per page view; the endpoint itself is edge-cached for 5 minutes.
let inflight: Promise<LiveStatus> | null = null
function fetchStatus(): Promise<LiveStatus> {
  inflight ??= fetch('/api/status')
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((j: { checkedAt: string; up: Record<string, boolean> }) => ({
      up: j.up,
      checkedAt: new Date(j.checkedAt),
      source: 'live' as const,
    }))
    .catch(fromSnapshot)
  return inflight
}

export function useLiveStatus(): LiveStatus {
  const [status, setStatus] = useState<LiveStatus>(fromSnapshot)
  useEffect(() => {
    let alive = true
    fetchStatus().then((s) => alive && setStatus(s))
    return () => {
      alive = false
    }
  }, [])
  return status
}

export function checkedAgo(d: Date | null): string {
  if (!d) return ''
  const mins = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 48) return `${hours} h ago`
  return `${Math.round(hours / 24)} days ago`
}
