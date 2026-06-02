import { useMemo } from 'react'
import { motion } from 'framer-motion'

type Props = {
  count?: number
  className?: string
  /** 0–1, multiplier on opacity */
  intensity?: number
}

type Particle = {
  id: number
  left: number
  top: number
  size: number
  duration: number
  delay: number
  drift: number
  opacityPeak: number
}

export function ParticleField({
  count = 36,
  className = '',
  intensity = 1,
}: Props) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i): Particle => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      duration: 8 + Math.random() * 14,
      delay: Math.random() * 6,
      drift: 10 + Math.random() * 30,
      opacityPeak: (0.25 + Math.random() * 0.45) * intensity,
    }))
  }, [count, intensity])

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-primary"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
          animate={{
            y: [0, -p.drift, 0],
            opacity: [0, p.opacityPeak, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
