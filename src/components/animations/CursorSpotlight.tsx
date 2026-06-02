import { useRef, type ReactNode } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  useMotionTemplate,
} from 'framer-motion'

type Props = {
  children: ReactNode
  /** Spotlight radius in px */
  radius?: number
  /** 0–1 spotlight strength */
  intensity?: number
  className?: string
}

export function CursorSpotlight({
  children,
  radius = 520,
  intensity = 0.14,
  className = '',
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(-1000)
  const y = useMotionValue(-1000)
  const px = useTransform(x, (v) => `${v}px`)
  const py = useTransform(y, (v) => `${v}px`)
  const gradient = useMotionTemplate`radial-gradient(${radius}px circle at ${px} ${py}, rgba(225,224,204,${intensity}), transparent 60%)`

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    x.set(e.clientX - rect.left)
    y.set(e.clientY - rect.top)
  }
  const handleLeave = () => {
    x.set(-1000)
    y.set(-1000)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative ${className}`}
    >
      {children}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: gradient }}
      />
    </div>
  )
}
