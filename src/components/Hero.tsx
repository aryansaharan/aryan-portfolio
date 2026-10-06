import { AnimatePresence, motion, useMotionValue } from 'framer-motion'
import { ArrowUpRight, Check, Copy, FileText } from 'lucide-react'
import { RollText } from './RollText'
import { Statue } from './Statue'
import { Mark } from './motion'
import { CONTAINER, GRID, ease } from './tokens'
import { LinkedInIcon } from './icons'
import { useClock } from '../hooks/useClock'
import { useCopy } from '../hooks/useCopy'
import { EMAIL } from '../content/projects'

// Two halves on the grid: who, on the left; the mark, large, on the right.
// Everything arrives in one soft cascade and then stays still, except the
// light on the statue.
const enter = (i: number) => ({
  initial: { opacity: 0, y: 10, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.95, delay: 0.15 + i * 0.09, ease },
})

export function Hero() {
  const clock = useClock()
  const { copied, copy } = useCopy(EMAIL, () => (window.location.href = `mailto:${EMAIL}`))
  // The whole hero steers the statue's light, not just the image.
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const active = useMotionValue(0)

  return (
    <section
      id="top"
      className={`${CONTAINER} flex min-h-svh items-center pb-16 pt-24 sm:pb-20`}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        x.set(e.clientX)
        y.set(e.clientY)
        active.set(1)
      }}
      onPointerLeave={() => active.set(0)}
    >
      <div className={`${GRID} w-full items-center gap-y-10`}>
        <div className="order-2 col-span-4 sm:order-1 sm:col-span-6 lg:col-span-5">
          <motion.p
            {...enter(0)}
            className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden />
            Now building Think Peepal
          </motion.p>
          <motion.h1
            {...enter(1)}
            className="mt-5 text-[clamp(2.8rem,5.4vw,4.9rem)] font-semibold leading-[0.98] tracking-[-0.04em]"
          >
            Aryan Saharan
          </motion.h1>
          <motion.div {...enter(2)} className="mt-4">
            <RollText
              phrases={['Product', 'Engineering', 'Design']}
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/70 sm:text-[12px]"
            />
          </motion.div>
          <motion.p {...enter(3)} className="mt-8 max-w-120 text-[17px] leading-[1.7] text-ink/70 sm:text-[18px]">
            Engineer turned product manager. I like finding the real problem, making the call,
            and then <Mark delay={1}>building it myself</Mark>, mostly with Claude Code and Cursor.
          </motion.p>
          <motion.div {...enter(4)} className="mt-9 flex flex-wrap gap-2">
            <Chip href="/Aryan_Saharan.pdf" icon={<FileText className="h-3.5 w-3.5" />} label="Resume" />
            <Chip href="https://linkedin.com/in/aryansaharan1" icon={<LinkedInIcon className="h-3.5 w-3.5" />} label="LinkedIn" />
            <button
              type="button"
              onClick={copy}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-ink/10 px-3.5 sm:h-9 text-[13px] text-ink/80 transition-colors hover:border-ink/30 hover:text-ink"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={copied ? 'done' : 'copy'}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.25 }}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-signal" /> : <Copy className="h-3.5 w-3.5" />}
                </motion.span>
              </AnimatePresence>
              <span aria-live="polite">{copied ? 'Copied' : 'Copy email'}</span>
            </button>
          </motion.div>
          <motion.p {...enter(5)} className="mt-10 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
            Bengaluru, <time className="tabular-nums">{clock}</time>
          </motion.p>
        </div>

        <div className="order-1 col-span-4 mx-auto w-full max-w-[300px] sm:order-2 sm:col-span-6 sm:mx-0 sm:max-w-none lg:col-span-6 lg:col-start-7">
          <Statue pointer={{ x, y, active }} />
        </div>
      </div>
    </section>
  )
}

function Chip({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group inline-flex h-10 items-center gap-2 rounded-full border border-ink/10 px-3.5 sm:h-9 text-[13px] text-ink/80 transition-colors hover:border-ink/30 hover:text-ink"
    >
      {icon}
      {label}
      <ArrowUpRight className="-ml-0.5 h-3 w-3 text-muted transition-transform duration-300 group-hover:-translate-y-px group-hover:translate-x-px" />
    </a>
  )
}
