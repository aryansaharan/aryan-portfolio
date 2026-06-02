import { motion, useReducedMotion } from 'framer-motion'

type Props = {
  items: string[]
  /** Seconds for one full loop */
  speed?: number
}

export function Marquee({ items, speed = 38 }: Props) {
  const reduceMotion = useReducedMotion()
  const loop = [...items, ...items]
  return (
    <div
      aria-hidden
      className="relative w-full overflow-hidden border-y border-primary/10 bg-black py-5 sm:py-7"
    >
      <motion.div
        className="flex whitespace-nowrap will-change-transform"
        animate={reduceMotion ? undefined : { x: ['0%', '-50%'] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: speed, repeat: Infinity, ease: 'linear' }
        }
      >
        {loop.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-6 sm:gap-10 px-6 sm:px-10 text-primary/80 text-sm sm:text-base md:text-lg tracking-[0.18em] uppercase"
          >
            <span>{item}</span>
            <span aria-hidden className="text-primary/30 text-xs">
              ✦
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
