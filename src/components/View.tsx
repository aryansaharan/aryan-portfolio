import { useEffect, useRef } from 'react'
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { CONTAINER, GRID, ease } from './tokens'
import { Rise, Scramble } from './motion'

// The old hero's scene, kept as the ending: after the work and the path, the view.
// The video loads only when it's close, plays only while it's on screen,
// and settles from a slight zoom as you arrive.
export function View() {
  const frame = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const reduce = useReducedMotion()
  const near = useInView(frame, { once: true, margin: '600px' })
  const onScreen = useInView(frame, { margin: '-10%' })
  const { scrollYProgress } = useScroll({ target: frame, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1.02, 1])

  useEffect(() => {
    const v = video.current
    if (!v || !near) return
    if (onScreen && !reduce) v.play().catch(() => {})
    else v.pause()
  }, [near, onScreen, reduce])

  return (
    <section aria-label="The view" className={`${CONTAINER} pb-24 sm:pb-36`}>
      <div className={GRID}>
        <motion.div
          ref={frame}
          className="relative isolate col-span-full aspect-[4/5] overflow-hidden rounded-[22px] bg-[#111] [transform:translateZ(0)] sm:aspect-[21/9] sm:rounded-[28px]"
          initial={reduce ? false : { clipPath: 'inset(5% 4% 5% 4% round 32px)', opacity: 0 }}
          whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 0px)', opacity: 1 }}
          viewport={{ once: true, margin: '0px 0px -12% 0px' }}
          transition={{ duration: 1.3, ease }}
        >
          <motion.video
            ref={video}
            src={near ? '/view.mp4' : undefined}
            poster="/view-poster.webp"
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover object-[50%_62%]"
            style={reduce ? undefined : { scale }}
          />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-6 sm:p-10">
            <p className="text-balance text-[clamp(1.5rem,2.6vw,2.4rem)] font-medium leading-[1.1] tracking-[-0.025em] text-white">
              <Rise>Above the noise.</Rise>
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/60">
              <Scramble text="Fig. 2 · The view from here" />
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
