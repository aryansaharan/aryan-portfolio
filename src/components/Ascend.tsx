import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { WordsPullUpMultiStyle } from './animations/WordsPullUpMultiStyle'

const easeOut = [0.16, 1, 0.3, 1] as const

const beats = [
  {
    label: 'Constraint',
    text: '4-day build window. Designed and shipped as the NextLeap fellowship submission.',
  },
  {
    label: 'Stack',
    text: 'Next.js (App Router), React, TypeScript, Tailwind, Framer Motion.',
  },
  {
    label: 'Flow',
    text: '6-question assessment, then 3 to 5 personalized course picks with fit notes, then side-by-side compare with peer reviews.',
  },
  {
    label: 'Corpus',
    text: '37 curated courses spanning tech (DevOps, Data, AI/ML, Frontend, Backend, PM, Design, Leadership) and non-tech (Marketing, Growth, Sales, Customer Success).',
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

export function Ascend() {
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
          <div className="relative inline-block group">
            <div className="ascend-hover-aurora opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out" />
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

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.2, ease: easeOut }}
          className="text-center text-primary/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12 sm:mb-16"
        >
          A course-recommendation MVP. Most early-career people freeze at the same step:
          too many courses, no idea which one is theirs. Ascend asks six questions and
          narrows the field down to three to five picks, each with a reason and peer
          reviews.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-12 sm:mb-16">
          {beats.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.1, ease: easeOut }}
              className="bg-[#101010] border border-primary/10 rounded-2xl p-6 sm:p-7 hover:border-primary/25 transition-colors"
            >
              <div className="text-[11px] sm:text-[13px] uppercase tracking-[0.24em] text-primary/70 font-medium mb-3">
                {b.label}
              </div>
              <div className="text-base sm:text-lg text-primary/85 leading-snug">
                {b.text}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.2, ease: easeOut }}
          className="flex justify-center"
        >
          <a
            href="https://ascendmvp.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 bg-primary text-black rounded-full pl-5 pr-1.5 py-1.5 font-bold text-sm sm:text-base hover:gap-3 transition-all"
          >
            See Ascend live
            <span className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" color="#E1E0CC" />
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
