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
          onClick={() => setDone(true)}
          className="fixed inset-0 z-[150] bg-black flex items-center justify-center cursor-pointer px-6"
        >
          {/* Splash couplet: sibling of the hero greeting (sans line + serif-italic line) */}
          <div className="flex flex-col items-center gap-1.5 sm:gap-2 text-center">
            <motion.div
              initial={{ y: 14, opacity: 0, filter: 'blur(8px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, delay: 0.15, ease: easeOut }}
              className="text-primary font-semibold tracking-[-0.02em] text-3xl sm:text-4xl md:text-5xl"
            >
              Still climbing.
            </motion.div>
            <motion.div
              initial={{ y: 14, opacity: 0, filter: 'blur(8px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, delay: 0.55, ease: easeOut }}
              className="font-serif italic text-primary/90 text-3xl sm:text-4xl md:text-5xl"
            >
              Already glad you are here.
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
