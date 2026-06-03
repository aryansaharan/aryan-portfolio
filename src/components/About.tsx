import { useRef } from 'react'
import { useScroll } from 'framer-motion'
import { WordsPullUpMultiStyle } from './animations/WordsPullUpMultiStyle'
import { AnimatedLetter } from './animations/AnimatedLetter'

const bodyText =
  'Engineer by training, PM at Lyearn now. I lean engineering when most PMs would defer to it: Colab notebooks before mockups, domain models before screens, vendor contracts I read before I sign. The title changed. The instinct to build the thing did not.'

export function About() {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  })

  const chars = bodyText.split('')

  return (
    <section className="relative overflow-hidden bg-black py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="bloom-amber" />
      <div className="relative bg-[#101010] max-w-6xl mx-auto rounded-2xl md:rounded-[2rem] py-12 sm:py-16 md:py-20 px-6 sm:px-10 md:px-16 text-center">
        <div className="text-primary text-[11px] sm:text-[13px] uppercase tracking-[0.28em] font-medium mb-6 sm:mb-8">
          About
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl max-w-3xl mx-auto leading-[0.95] sm:leading-[0.9]">
          <WordsPullUpMultiStyle
            segments={[
              { text: 'I am Aryan Saharan,', className: 'font-normal' },
              {
                text: 'a PM who builds.',
                className: 'italic font-serif font-normal',
              },
              {
                text: 'I ship AI-native product end to end: vendor strategy, API integration, voice agents, and AI persona design.',
                className: 'font-normal',
              },
            ]}
          />
        </h2>

        <p
          ref={ref}
          className="mt-10 sm:mt-14 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed"
          style={{ color: '#DEDBC8' }}
        >
          {chars.map((c, i) => (
            <AnimatedLetter
              key={i}
              char={c}
              index={i}
              total={chars.length}
              progress={scrollYProgress}
            />
          ))}
        </p>
      </div>
    </section>
  )
}
