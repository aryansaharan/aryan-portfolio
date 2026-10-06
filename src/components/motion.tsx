import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ease } from './tokens'

// The page's motion vocabulary, kept small: things arrive softly, once.

/** Fades and lifts in (with a trace of blur) the first time it is seen. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'section' | 'p'
}) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.85, delay, ease }}
    >
      {children}
    </Tag>
  )
}

/** A rule across the full grid that draws itself left to right on arrival. */
export function Rule() {
  const ref = useRef<HTMLDivElement>(null)
  const seen = useInView(ref, { once: true, margin: '0px 0px -8% 0px' })
  return (
    <div ref={ref} className="col-span-full h-px">
      <motion.div
        className="h-px origin-left bg-ink/10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: seen ? 1 : 0 }}
        transition={{ duration: 1.4, ease }}
      />
    </div>
  )
}

/** Small mono label used at the head of every section; it decodes in. */
export function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted ${className}`}>
      {typeof children === 'string' ? <Scramble text={children} /> : children}
    </p>
  )
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+·'

/** Mono text that settles out of random glyphs, left to right, the first
 *  time it is seen (and again whenever the text itself changes). */
export function Scramble({ text, delay = 0 }: { text: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true, margin: '0px 0px -8% 0px' })
  const reduce = useReducedMotion()
  const [shown, setShown] = useState<string | null>(null)

  useEffect(() => {
    if (!seen || reduce) return
    let raf = 0
    const start = performance.now() + delay * 1000
    const span = 380 + text.length * 26
    const tick = (now: number) => {
      const t = now - start
      if (t < 0) {
        raf = requestAnimationFrame(tick)
        return
      }
      let done = true
      const out = text
        .split('')
        .map((ch, i) => {
          if (ch === ' ') return ' '
          if (t >= (i / text.length) * span * 0.75 + 140) return ch
          done = false
          return GLYPHS[(Math.random() * GLYPHS.length) | 0]
        })
        .join('')
      setShown(out)
      if (!done) raf = requestAnimationFrame(tick)
      else setShown(text)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, reduce, text, delay])

  const visible = reduce || seen
  return (
    <span ref={ref} className="relative inline-block">
      <span className="sr-only">{text}</span>
      <span aria-hidden className={`transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {shown ?? text}
      </span>
    </span>
  )
}

/** A line that rises into place from behind its own baseline, once. */
export function Rise({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <span className={`mb-[-0.14em] block overflow-hidden pb-[0.14em] ${className}`}>
      <motion.span
        className="block"
        initial={{ y: '108%' }}
        whileInView={{ y: '0%' }}
        viewport={{ once: true, margin: '0px 0px -8% 0px' }}
        transition={{ duration: 0.95, delay, ease }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/** A phrase whose underline draws itself once it scrolls into view. */
export function Mark({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (!seen) return
    const t = setTimeout(() => setOn(true), delay * 1000)
    return () => clearTimeout(t)
  }, [seen, delay])
  return <span ref={ref} className={`mark text-ink ${on ? 'is-seen' : ''}`}>{children}</span>
}
