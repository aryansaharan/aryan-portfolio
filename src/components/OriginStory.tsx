import { motion } from 'framer-motion'
import { WordsPullUpMultiStyle } from './animations/WordsPullUpMultiStyle'
import { CursorSpotlight } from './animations/CursorSpotlight'
import { ParticleField } from './animations/ParticleField'

const easeOut = [0.16, 1, 0.3, 1] as const

const beliefs = [
  {
    head: 'Prototype before you PRD.',
    body: 'The fastest way to expose what you don\'t know is to make the thing, badly, before you write about it well. Every system I have shipped started in code before a doc.',
  },
  {
    head: 'Vendor evaluation is product strategy.',
    body: 'The deal you negotiate shapes the surface you ship. Pay-per-use vs. subscription. Caps, credits, and contract terms are product decisions.',
  },
  {
    head: 'Right ontology, half the product.',
    body: 'Get the nouns wrong and every screen lies. The data model is the product. Change a noun and you change the product.',
  },
  {
    head: 'Two pilots beat two thousand signups.',
    body: 'Two enterprise pilots tell you more than two thousand beta users. The constraint sharpens the product.',
  },
]

export function OriginStory() {
  return (
    <CursorSpotlight radius={620} intensity={0.10} className="bg-black">
    <section className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="bloom-indigo" />
      <ParticleField count={42} intensity={0.6} />
      <div className="relative max-w-5xl mx-auto">
        <div className="text-primary text-[11px] sm:text-[13px] uppercase tracking-[0.28em] font-medium text-center mb-6 sm:mb-8">
          Origin
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] xl:text-5xl leading-[1.05] tracking-[-0.01em] text-center max-w-4xl mx-auto">
          <WordsPullUpMultiStyle
            segments={[
              {
                text: 'Two and a half years ago I was writing backend code.',
                className: 'font-normal text-primary',
              },
              {
                text: 'Today I ship AI-native product.',
                className: 'font-normal italic font-serif text-primary',
              },
              {
                text: 'The bridge was a slow realization: the PRDs that ship are the ones grounded in prototype, not pitch.',
                className: 'font-normal text-primary/70',
              },
            ]}
            stagger={0.05}
          />
        </h2>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: easeOut, delay: 0.3 }}
          className="mt-10 sm:mt-14 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed text-center text-primary/70"
        >
          Same instincts. Different verb on the title. The PMs I trust most can
          still open the codebase and find the lie. I learned to trust the
          prototype over the pitch the hard way, by shipping a few pitches that
          did not survive contact.
        </motion.p>

        <div className="mt-16 sm:mt-20 md:mt-24 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {beliefs.map((b, i) => (
            <motion.div
              key={b.head}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.95,
                delay: 0.15 + i * 0.12,
                ease: easeOut,
              }}
              className="group relative bg-[#101010] border border-primary/10 rounded-2xl p-6 sm:p-7 hover:border-primary/25 transition-colors"
            >
              <div className="text-[11px] sm:text-[13px] uppercase tracking-[0.24em] text-primary/70 font-medium mb-3">
                Belief 0{i + 1}
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-serif italic leading-tight text-primary mb-3">
                {b.head}
              </div>
              <div className="text-sm text-primary/60 leading-relaxed">
                {b.body}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    </CursorSpotlight>
  )
}
