import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, type MotionValue } from 'framer-motion'
import { experience } from '../content/projects'
import { Label, Reveal, Rule } from './motion'
import { CONTAINER, GRID, ease } from './tokens'

// The line draws down as you read; each stop fills in as the line reaches it.
export function Path() {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 78%', 'end 60%'] })

  return (
    <section id="path" className={`${CONTAINER} scroll-mt-16 pb-24 sm:pb-36`}>
      <div className={GRID}>
        <Rule />
        <div className="col-span-4 mt-5 sm:col-span-3">
          <div className="sm:sticky sm:top-24">
            <Label>Path</Label>
            <p className="mt-3 max-w-[14rem] text-[14px] leading-relaxed text-ink/55">
              Engineering first, then product. Now building.
            </p>
          </div>
        </div>
        <ol ref={ref} className="relative col-span-4 mt-10 space-y-11 pl-9 sm:col-span-7 sm:col-start-5 sm:mt-5">
          <span aria-hidden className="absolute bottom-2 left-[4.5px] top-2 w-px bg-ink/10" />
          <motion.span
            aria-hidden
            className="absolute bottom-2 left-[4.5px] top-2 w-px origin-top bg-ink/60"
            style={{ scaleY: scrollYProgress }}
          />
          {experience.map((e, i) => (
            <Stop
              key={e.role + e.org}
              progress={scrollYProgress}
              at={experience.length > 1 ? i / (experience.length - 1) : 0}
              {...e}
            />
          ))}
        </ol>
      </div>
    </section>
  )
}

function Stop({
  role,
  org,
  when,
  note,
  progress,
  at,
}: {
  role: string
  org: string
  when: string
  note: string
  progress: MotionValue<number>
  at: number
}) {
  const [reached, setReached] = useState(false)
  useMotionValueEvent(progress, 'change', (v) => setReached(v >= at - 0.03))
  return (
    <Reveal as="li" className="relative">
      <span aria-hidden className="absolute -left-9 top-[8px] h-[10px] w-[10px] rounded-full border border-ink/25 bg-paper" />
      <motion.span
        aria-hidden
        className="absolute -left-9 top-[8px] h-[10px] w-[10px] rounded-full bg-ink"
        initial={false}
        animate={{ opacity: reached ? 1 : 0, scale: reached ? 1 : 0.3 }}
        transition={{ duration: 0.45, ease }}
      />
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="text-[18px] font-medium tracking-[-0.015em]">
          {role}
          {org && (
            <>
              {' '}
              <span className="text-muted">·</span> <span className="text-ink/65">{org}</span>
            </>
          )}
        </p>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">{when}</p>
      </div>
      {note && <p className="mt-2 max-w-[34rem] text-[15px] leading-relaxed text-ink/60">{note}</p>}
    </Reveal>
  )
}
