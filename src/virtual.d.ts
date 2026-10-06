declare module 'virtual:status-snapshot' {
  const snapshot: { checkedAt: string; up: Record<string, boolean> } | null
  export default snapshot
}
