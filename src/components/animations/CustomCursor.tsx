import { useEffect, useRef, useState } from 'react'

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [hover, setHover] = useState(false)
  const [visible, setVisible] = useState(false)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Only take over the cursor on a real mouse. A hybrid laptop (touchscreen +
    // trackpad) matches (pointer: coarse), so gate on a fine hover pointer instead.
    const hasMousePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (reducedMotion || !hasMousePointer) return
    setEnabled(true)
    document.documentElement.classList.add('custom-cursor-active')

    let lastSeen = false
    const onMove = (e: MouseEvent) => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      }
      if (!lastSeen) {
        lastSeen = true
        setVisible(true)
      }
    }
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      if (!t) return
      const interactive = !!t.closest(
        'a, button, [role="button"], [data-cursor-hover], input, select, textarea, iframe',
      )
      setHover(interactive)
    }
    const onLeave = () => setVisible(false)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    document.addEventListener('mouseleave', onLeave)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseleave', onLeave)
      document.documentElement.classList.remove('custom-cursor-active')
    }
  }, [])

  if (!enabled) return null

  return (
    <div
      ref={dotRef}
      aria-hidden
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 200ms ease',
        willChange: 'transform',
      }}
      className="fixed top-0 left-0 z-[200] pointer-events-none"
    >
      <div
        style={{
          transform: `translate(-50%, -50%) scale(${hover ? 1.6 : 1})`,
          transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="w-2 h-2 rounded-full bg-primary"
      />
    </div>
  )
}
