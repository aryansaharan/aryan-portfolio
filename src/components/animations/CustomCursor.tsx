import { useEffect, useRef, useState } from 'react'

// A cursor ring that follows the pointer with NO lag: the outer element's
// transform is written straight from the mousemove event (compositor-only, no
// CSS transition on position, no spring/lerp). Only the ring's hover scale and
// the visibility fade animate. The native cursor stays visible — the ring is a
// halo, not a replacement — so the I-beam over text and the pointer over links
// keep working. Disabled on touch devices and when reduced motion is requested.
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const seen = useRef(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (reduced || !hasMouse) return

    setEnabled(true)

    const onMove = (e: MouseEvent) => {
      const el = wrap.current
      if (el) el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      if (!seen.current) {
        seen.current = true
        setVisible(true)
      }
    }
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      setHovering(
        !!t?.closest('a, button, [role="button"], [data-cursor-hover]'),
      )
    }
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
    }
  }, [])

  if (!enabled) return null

  return (
    <div
      ref={wrap}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[200]"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
      }}
    >
      {/* ring: position is instant (on the wrapper); only scale + fill animate */}
      <div
        className="rounded-full border border-primary/80"
        style={{
          width: 28,
          height: 28,
          transform: `translate(-50%, -50%) scale(${hovering ? 1.5 : 1})`,
          backgroundColor: hovering ? 'oklch(var(--ink-lch) / 0.12)' : 'transparent',
          transition:
            'transform 160ms cubic-bezier(0.16, 1, 0.3, 1), background-color 160ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </div>
  )
}
