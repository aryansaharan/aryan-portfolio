import { useState } from 'react'

/** Copy to clipboard with a short "copied" state; falls back to `fallback`. */
export function useCopy(text: string, fallback?: () => void) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      fallback?.()
    }
  }
  return { copied, copy }
}
