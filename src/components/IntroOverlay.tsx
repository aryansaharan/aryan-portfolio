import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const easeOut = [0.16, 1, 0.3, 1] as const

export function IntroOverlay() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setDone(true)
      return
    }
    const t = setTimeout(() => setDone(true), 2300)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, ease: easeOut }}
          className="fixed inset-0 z-[150] bg-black flex items-center justify-center pointer-events-none px-6"
        >
          <div className="flex flex-col items-center gap-4 sm:gap-5">
            {/* Name */}
            <div className="text-primary tracking-[0.5em] uppercase text-base sm:text-lg md:text-xl font-medium select-none flex">
              {'ARYAN  SAHARAN'.split('').map((c, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 14, opacity: 0, filter: 'blur(8px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.55,
                    delay: 0.1 + i * 0.04,
                    ease: easeOut,
                  }}
                  className="inline-block"
                  style={{ minWidth: c === ' ' ? '0.4em' : undefined }}
                >
                  {c === ' ' ? ' ' : c}
                </motion.span>
              ))}
            </div>

            {/* Divider line */}
            <motion.div
              className="h-px bg-primary/35"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: ['0%', '100%'], opacity: [0, 1] }}
              transition={{
                duration: 0.7,
                delay: 0.85,
                ease: easeOut,
              }}
              style={{ width: '180px' }}
            />

            {/* Tagline: italic serif, matches portfolio voice */}
            <motion.div
              initial={{ y: 10, opacity: 0, filter: 'blur(6px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, delay: 1.05, ease: easeOut }}
              className="font-serif italic text-primary/85 text-lg sm:text-xl md:text-2xl text-center"
            >
              a PM who builds.
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
