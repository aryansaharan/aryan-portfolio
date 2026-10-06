import { useSyncExternalStore } from 'react'

// Follows the `dark` class on <html> (set before paint, flipped by ThemeToggle).
const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => mo.disconnect()
}
const get = () => document.documentElement.classList.contains('dark')

export const useIsDark = () => useSyncExternalStore(subscribe, get, () => false)
