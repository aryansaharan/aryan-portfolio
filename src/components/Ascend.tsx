import { useEffect, useRef } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { WordsPullUpMultiStyle } from './animations/WordsPullUpMultiStyle'

const beats = [
  {
    label: 'Constraint',
    text: '4-day build window. Designed and shipped as the NextLeap fellowship submission.',
  },
  {
    label: 'Stack',
    text: 'Next.js 16 (App Router), React, TypeScript, Tailwind, Framer Motion. Server route calls an LLM through an OpenAI-compatible API, provider-swappable by env.',
  },
  {
    label: 'Flow',
    text: '6-question assessment, then 3 to 5 personalized course picks with fit notes, then side-by-side compare with peer reviews.',
  },
  {
    label: 'Corpus',
    text: '36 curated courses spanning tech (DevOps, Data, AI/ML, Frontend, Backend, PM, Design, Leadership) and non-tech (Marketing, Growth, Sales, Customer Success).',
  },
  {
    label: 'Recommender',
    text: 'An LLM ranks the corpus against your answers: experience, time, goals, even a free-text role. Each pick shows the signals behind the match, and a deterministic scorer takes over if the model is unavailable.',
  },
  {
    label: 'Polish',
    text: 'Aurora atmospheric backdrop, serif-italic accents, OG image, sitemap, error and not-found boundaries.',
  },
]

const alsoBuilt = [
  {
    name: 'Shram',
    blurb: 'Landing page redesign for an AI follow-up agent.',
    domain: 'shram-ai.netlify.app',
    href: 'https://shram-ai.netlify.app',
  },
  {
    name: 'Braino',
    blurb: 'Landing page redesign for an AI investing coach.',
    domain: 'braino-landing.vercel.app',
    href: 'https://braino-landing.vercel.app',
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
      className="relative overflow-hidden bg-black py-20 sm:py-28 md:py-32 px-4 sm:px-6 lg:px-8"
    >
      <div className="bloom-aurora" />
      <div className="relative max-w-6xl mx-auto">
        <div className="text-primary text-[11px] sm:text-[13px] uppercase tracking-[0.28em] font-medium text-center mb-6 sm:mb-8">
          The Project
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

        <p className="text-center text-primary/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12 sm:mb-16">
          A course-recommendation MVP. Most early-career people freeze at the same step:
          too many courses, no idea which one is theirs. Ascend asks six questions and
          narrows the field down to three to five picks, each with a reason and peer
          reviews.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-12 sm:mb-16">
          {beats.map((b) => (
            <div
              key={b.label}
              className="bg-surface border border-primary/10 rounded-2xl p-6 sm:p-7 hover:border-primary/30 transition-colors"
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
            See Ascend live
            <span className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </a>
        </div>

        {/* Also built: build-to-apply landing redesigns. Cards match the beat
            grid above; an aurora-hint glow fades in on hover. */}
        <div className="mt-20 sm:mt-24 md:mt-28">
          <div className="text-primary text-[11px] sm:text-[13px] uppercase tracking-[0.28em] font-medium text-center mb-6 sm:mb-8">
            Also built
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-4xl mx-auto">
            {alsoBuilt.map((p) => (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noreferrer"
                className="group relative overflow-hidden bg-surface border border-primary/10 rounded-2xl p-6 sm:p-7 hover:border-primary/30 transition-colors"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      'radial-gradient(70% 90% at 25% 15%, rgba(245, 180, 90, 0.12) 0%, transparent 60%), radial-gradient(65% 85% at 85% 90%, rgba(170, 140, 220, 0.12) 0%, transparent 60%)',
                  }}
                />
                <div className="relative flex items-center justify-between gap-3">
                  <span className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-primary/90 group-hover:text-primary transition-colors">
                    {p.name}
                  </span>
                  <ArrowUpRight className="w-5 h-5 shrink-0 text-primary/60 transition-all duration-300 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <div className="relative mt-2 text-sm sm:text-base text-primary/70 leading-snug">
                  {p.blurb}
                </div>
                <div className="relative mt-3 text-[11px] sm:text-xs text-primary/60 tracking-[0.08em]">
                  {p.domain}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
