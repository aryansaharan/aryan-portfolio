import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Check, Copy, FileText } from 'lucide-react'
import { Label, Reveal, Rise, Rule } from './motion'
import { CONTAINER, GRID, ease } from './tokens'
import { LinkedInIcon } from './icons'
import { EMAIL } from '../content/projects'
import { useClock } from '../hooks/useClock'
import { useCopy } from '../hooks/useCopy'

export function SayHi() {
  const clock = useClock()
  const { copied, copy } = useCopy(EMAIL, () => (window.location.href = `mailto:${EMAIL}`))
  return (
    <>
      <section id="hi" className={`${CONTAINER} scroll-mt-16 pb-24 sm:pb-32`}>
        <div className={GRID}>
          <Rule />
          <div className="col-span-4 mt-5 sm:col-span-3">
            <Label>Say hi</Label>
          </div>
          <div className="col-span-4 mt-8 sm:col-span-8 sm:col-start-5 sm:mt-5">
            <Reveal>
              <h2 className="text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
                <Rise>Working on something interesting?</Rise>
                <Rise delay={0.08} className="text-muted">I’d love to hear about it.</Rise>
              </h2>
              <p className="mt-4 text-[16px] text-ink/60">Happy to talk product roles, founder’s office, or just ideas.</p>
            </Reveal>
            <Reveal delay={0.08} className="mt-10 grid gap-3 sm:grid-cols-[1.5fr_1fr_1fr]">
              <button
                type="button"
                onClick={copy}
                className="group flex items-start justify-between rounded-2xl border border-ink/10 p-5 text-left transition-colors hover:border-ink/30"
              >
                <span className="min-w-0">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Email</span>
                  <span className="mt-2 block truncate text-[15px]" aria-live="polite">
                    {copied ? 'Copied to clipboard' : EMAIL}
                  </span>
                </span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={copied ? 'done' : 'copy'}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.25, ease }}
                    className="ml-3 shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4 text-signal" /> : <Copy className="h-4 w-4 text-muted group-hover:text-ink" />}
                  </motion.span>
                </AnimatePresence>
              </button>
              <Card href="https://linkedin.com/in/aryansaharan1" label="LinkedIn" value="aryansaharan1" icon={<LinkedInIcon className="h-3.5 w-3.5" />} />
              <Card href="/Aryan_Saharan.pdf" label="Resume" value="One page, PDF" icon={<FileText className="h-3.5 w-3.5" />} />
            </Reveal>
          </div>
        </div>
      </section>
      <footer className={CONTAINER}>
        <div className={`${GRID} border-t border-ink/[0.07] py-8 font-mono text-[10px] uppercase tracking-[0.12em] text-muted`}>
          <span className="col-span-2 sm:col-span-6">© {new Date().getFullYear()} Aryan Saharan</span>
          <span className="col-span-2 text-right sm:col-span-6">
            Bengaluru, <time className="tabular-nums">{clock}</time>
          </span>
        </div>
      </footer>
    </>
  )
}

function Card({ href, label, value, icon }: { href: string; label: string; value: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-start justify-between rounded-2xl border border-ink/10 p-5 transition-colors hover:border-ink/30"
    >
      <span className="min-w-0">
        <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{label}</span>
        <span className="mt-2 flex items-center gap-2 text-[15px]">
          {icon} {value}
        </span>
      </span>
      <ArrowUpRight className="ml-3 h-4 w-4 shrink-0 text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
    </a>
  )
}
