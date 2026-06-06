import { motion } from 'framer-motion'
import { WordsPullUpMultiStyle } from './animations/WordsPullUpMultiStyle'
import { CursorSpotlight } from './animations/CursorSpotlight'
import { ParticleField } from './animations/ParticleField'

const easeOut = [0.16, 1, 0.3, 1] as const

export function OriginStory() {
  return (
    <CursorSpotlight radius={620} intensity={0.10} className="bg-black">
    <section className="relative py-20 sm:py-28 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
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
                text: 'Two and a half years ago, I was writing backend code.',
                className: 'font-normal text-primary',
              },
              {
                text: 'Now I build the product.',
                className: 'font-normal italic font-serif text-primary',
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
          Same instinct, different title. I trust a prototype over a pitch, mostly
          because I have shipped a few that did not survive contact with a real user.
        </motion.p>
      </div>
    </section>
    </CursorSpotlight>
  )
}
