import { useEffect, useRef } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { WordsPullUpMultiStyle } from './animations/WordsPullUpMultiStyle'

// Research -> Call -> Build: the PM story arc, every number from the
// fellowship research deck (surveyed cohort, RICE table, North Star).
const beats = [
  {
    label: 'Research',
    text: 'Surveyed the cohort before designing anything: 61% named choice overload, 52% feared wasting money on the wrong course, 87% rated peer proof as decisive. North Star: confident learning decisions made per month.',
  },
  {
    label: 'The call',
    text: 'A narrowing machine, not another catalog. RICE scoring put the guided assessment and peer reviews in the MVP, and pushed commitment nudges and community features out.',
  },
  {
    label: 'The build',
    text: 'Six questions, then an LLM ranks 36 curated courses against the answers, a deterministic scorer standing by if the model fails. Shipped in a 4-day window as the fellowship submission.',
  },
]

// Stories locked with the owner 2026-07-13: honest origins, no invented
// numbers. Shram/Braino were applications sent as work; Think Peepal was
// founder-inbound through a mutual.
const alsoBuilt = [
  {
    name: 'Shram',
    tag: 'Built to apply',
    blurb:
      'An application sent as work instead of a CV: Shram’s landing, reimagined. The founder reached out after using it.',
    domain: 'shram-ai.netlify.app',
    href: 'https://shram-ai.netlify.app',
    img: '/work/shram.webp',
    alt: 'Shram landing page: Keep every conversation alive',
    live: false,
  },
  {
    name: 'Think Peepal',
    tag: 'Client work',
    blurb:
      'The founder reached out through a mutual: rebuild the landing for conversions and downloads. Six rounds later it runs as the team’s production page, and every claim on it is one the app can keep.',
    domain: 'think-peepal.vercel.app',
    href: 'https://think-peepal.vercel.app',
    img: '/work/think-peepal.webp',
    alt: 'Think Peepal landing page: Turn screen time into a forest, with a hand-drawn focus scene',
    live: true,
  },
  {
    name: 'Braino',
    tag: 'Built to apply',
    blurb:
      'The same play for an AI investing coach: lead with the buyer’s outcome, not the model. This one drew a founder’s note too.',
    domain: 'braino-landing.vercel.app',
    href: 'https://braino-landing.vercel.app',
    img: '/work/braino.webp',
    alt: 'Braino landing page: AI for insurance and investment',
    live: false,
  },
]

export function Ascend() {
  // Aurora ignition: the glow blooms once when the headline enters the
  // viewport (nobody hovers a headline), settles to a quiet presence,
  // and hover re-kindles it.
  const headRef = useRef<HTMLDivElement>(null)
  const inView = useInView(headRef, { once: true, amount: 0.6 })
  const aurora = useAnimation()
  const ignited = useRef(false)

  useEffect(() => {
    if (inView && !ignited.current) {
      ignited.current = true
      aurora.start({
        opacity: [0, 1, 0.35],
        transition: { duration: 1.8, times: [0, 0.45, 1], ease: 'easeOut' },
      })
    }
  }, [inView, aurora])

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-black py-14 sm:py-28 md:py-32 px-4 sm:px-6 lg:px-8"
    >
      <div className="bloom-aurora" />
      <div className="relative max-w-6xl mx-auto">
        <div className="text-primary text-[11px] sm:text-[13px] uppercase tracking-[0.28em] font-medium text-center mb-6 sm:mb-8">
          Work
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <div
            ref={headRef}
            className="relative inline-block"
            onMouseEnter={() =>
              ignited.current &&
              aurora.start({ opacity: 1, transition: { duration: 0.6 } })
            }
            onMouseLeave={() =>
              ignited.current &&
              aurora.start({ opacity: 0.35, transition: { duration: 0.8 } })
            }
          >
            <motion.div
              className="ascend-hover-aurora"
              initial={{ opacity: 0 }}
              animate={aurora}
            />
            <h2 className="relative text-6xl sm:text-7xl md:text-8xl lg:text-[8rem] xl:text-[8.5rem] leading-[0.9] tracking-[-0.03em]">
              <WordsPullUpMultiStyle
                segments={[
                  {
                    text: 'Ascend.',
                    className: 'font-serif italic text-primary',
                  },
                ]}
                stagger={0.08}
              />
            </h2>
          </div>
        </div>

        <p className="text-center text-primary/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 sm:mb-16">
          My NextLeap fellowship build. The problem statement: early-career
          professionals want to upskill but freeze at the choice, too many courses,
          no conviction, money wasted on the wrong ones. Ascend answers it with a
          guided session: six questions, three to five picks with the why behind
          each, peer reviews beside them, no signup.
        </p>

        {/* The page a visitor actually lands on, clickable straight into it. */}
        <a
          href="https://ascendmvp.vercel.app"
          target="_blank"
          rel="noreferrer"
          className="block max-w-3xl mx-auto mb-12 sm:mb-16 group"
        >
          <div className="rounded-2xl md:rounded-3xl border border-primary/15 group-hover:border-primary/35 transition-colors bg-surface overflow-hidden shadow-[0_0_120px_-30px_rgba(170,140,220,0.25)]">
            <img
              src="/work/ascend-home.webp"
              alt="Ascend's landing page: Overwhelmed by learning choices? Find your next skill in 15 minutes."
              className="block w-full"
              loading="lazy"
              decoding="async"
            />
          </div>
        </a>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5 mb-12 sm:mb-16">
          {beats.map((b) => (
            <div
              key={b.label}
              className="bg-surface border border-primary/10 rounded-2xl p-5 sm:p-7 hover:border-primary/30 transition-colors"
            >
              <div className="text-[11px] sm:text-[13px] uppercase tracking-[0.24em] text-primary/70 font-medium mb-3">
                {b.label}
              </div>
              <div className="text-base sm:text-lg text-primary/80 leading-snug">
                {b.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <a
            href="https://ascendmvp.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 bg-primary text-black rounded-full pl-5 pr-1.5 py-1.5 font-bold text-sm sm:text-base"
          >
            Try Ascend live
            <span className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </a>
        </div>

        {/* Also built: shipped landing pages, one in production for a real
            team. Cards match the beat grid above; an aurora-hint glow fades
            in on hover. */}
        <div className="mt-14 sm:mt-24 md:mt-28">
          <div className="text-primary text-[11px] sm:text-[13px] uppercase tracking-[0.28em] font-medium text-center mb-6 sm:mb-8">
            Also built
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5 max-w-5xl mx-auto">
            {alsoBuilt.map((p) => (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noreferrer"
                className="group relative overflow-hidden bg-surface border border-primary/10 rounded-2xl hover:border-primary/30 transition-colors"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      'radial-gradient(70% 90% at 25% 15%, rgba(245, 180, 90, 0.10) 0%, transparent 60%), radial-gradient(65% 85% at 85% 90%, rgba(170, 140, 220, 0.10) 0%, transparent 60%)',
                  }}
                />
                {/* Static preview: owner tried a hover scroll-pan and rejected
                    it; keep the top-of-page slice still. */}
                <div className="relative aspect-[16/10] overflow-hidden border-b border-primary/10">
                  <img
                    src={p.img}
                    alt={p.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-top"
                  />
                </div>
                <div className="relative p-6 sm:p-7">
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-primary/50 mb-2">
                    {p.tag}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-primary/90 group-hover:text-primary transition-colors">
                      {p.name}
                    </span>
                    <ArrowUpRight className="w-5 h-5 shrink-0 text-primary/60 transition-all duration-300 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <div className="mt-2 text-sm sm:text-base text-primary/70 leading-snug">
                    {p.blurb}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-[11px] sm:text-xs text-primary/60 tracking-[0.08em]">
                      {p.domain}
                    </span>
                    {p.live && (
                      <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-primary/70">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="motion-reduce:hidden animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/70" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </span>
                        Live
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
