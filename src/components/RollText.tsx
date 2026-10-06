import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ease } from './tokens'

// A departure board, softened: every few seconds the line rolls to the next
// phrase, letter by letter from the left (a nod to the airline years).
// Screen readers get all phrases once, not a live-updating string.
export function RollText({
  phrases,
  interval = 3200,
  className = '',
}: {
  phrases: string[]
  interval?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setI((n) => (n + 1) % phrases.length), interval)
    return () => clearInterval(t)
  }, [reduce, phrases.length, interval])

  const text = phrases[i]
  return (
    <span className={`relative inline-flex ${className}`}>
      <span className="sr-only">{phrases.join('. ')}</span>
      <span aria-hidden className="relative inline-flex overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={i} className="inline-flex whitespace-pre">
            {text.split('').map((ch, k) => (
              <motion.span
                key={k}
                className="inline-block"
                initial={{ y: '105%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: '-105%', opacity: 0 }}
                transition={{ duration: 0.42, delay: k * 0.018, ease }}
              >
                {ch}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  )
}
