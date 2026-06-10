import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { WordsPullUp } from './animations/WordsPullUp'
import { MagneticButton } from './animations/MagneticButton'

const navItems: { label: string; href: string; external?: boolean }[] = [
  { label: 'Resume', href: '/Aryan_Saharan.pdf', external: true },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/aryansaharan1', external: true },
]
const easeOut = [0.16, 1, 0.3, 1] as const

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  // Video parallax: drifts down slightly slower than content exits: content "passes over" the deeper layer.
  const videoY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0.2])

  return (
    <section ref={sectionRef} className="flex min-h-[100svh] p-4 md:p-6">
      <div className="relative flex w-full flex-1 flex-col overflow-hidden rounded-2xl md:rounded-[2rem] bg-black">
        <motion.video
          src="/hero.mp4"
          poster="/hero-poster.jpg"
          preload="metadata"
          autoPlay={!reduceMotion}
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover object-[50%_58%] md:object-[35%_75%]"
          style={reduceMotion ? undefined : { y: videoY, scale: videoScale }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, ease: easeOut }}
        />
        <div className="absolute inset-0 noise-overlay opacity-[0.7] mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

        {/* Mini-nav: action links only, centered hanging from the top */}
        <div className="relative z-20 flex justify-center pointer-events-none">
          <motion.nav
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: easeOut }}
            className="pointer-events-auto bg-black rounded-b-2xl md:rounded-b-3xl px-[1.6em] py-[0.8em]"
            style={{ fontSize: 'min(1.75vh, max(0.95vw, 3vmin))' }}
          >
            <ul className="flex items-center gap-[1.8em]">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noreferrer' : undefined}
                    className="inline-block px-[0.7em] -mx-[0.7em] py-[1em] -my-[1em] text-primary/80 hover:text-primary focus-visible:text-primary transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        </div>

        {/* Hero content, in normal flow so nothing can overlap under browser zoom
            or odd aspect ratios: a top spacer floats the couplet to roughly 60%
            of the frame, and the tagline + CTA row sits at the bottom. If zoomed
            text needs more room, the frame grows (section is min-h, not h) and
            everything pushes instead of colliding. */}
        <motion.div
          style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}
          className="relative z-10 flex flex-1 flex-col pointer-events-none px-[5vw] sm:px-[3.8vw] pb-[11.5vh] sm:pb-[6vh]"
        >
          {/* Couplet anchor: sized so the h1 top lands at ~60% of the viewport
              (matching the old absolute pin), but shrinkable, so under browser
              zoom the spacer gives way before anything can overlap. The 70px
              offsets the card padding + nav above this column. */}
          <div
            aria-hidden
            className="shrink-[2]"
            style={{ flexBasis: 'calc(60svh - min(9vh, 70px))' }}
          />

          {/* Greeting couplet: centered, floated below the figure. One h1, two
              voiced lines: a couplet is one heading, not two levels. */}
          <div className="flex justify-center">
            <div className="w-full max-w-[92vw] text-center">
              {/* All hero type is sized in viewport units (no rem): browser zoom
                  inflates rem but not vw/vh, and the backdrop video always fills
                  the physical screen regardless of zoom — so viewport-unit type
                  is the only way the text stays locked to the image. The hero is
                  a poster; the rest of the page still zooms normally. */}
              <h1
                className="text-primary"
                style={{ fontSize: 'min(5.8vh, max(5vw, 9vmin))' }}
              >
                <span className="block font-bold leading-[1.16] tracking-[-0.04em]">
                  <WordsPullUp text="Glad you climbed up." />
                </span>{' '}
                <span className="block italic font-serif font-normal leading-[1.16] tracking-[-0.02em]">
                  <WordsPullUp text="View’s worth it." />
                </span>
              </h1>
            </div>
          </div>

          <div aria-hidden className="grow min-h-6" />

          {/* Tagline + CTA: bottom-left on desktop, centered above the player on mobile. */}
          <div className="flex justify-center sm:justify-start">
            <div className="flex flex-col items-center sm:items-start max-w-[22em] text-center sm:text-left">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: easeOut }}
                className="text-primary/80"
                style={{
                  lineHeight: 1.45,
                  fontSize: 'min(2.25vh, max(1.4vw, 3.6vmin))',
                }}
              >
                PM by title. Engineer by reflex. Builder by instinct.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7, ease: easeOut }}
                className="mt-[1.2em] pointer-events-auto"
                style={{ fontSize: 'min(2vh, max(1.1vw, 3.6vmin))' }}
              >
                <MagneticButton strength={0.25}>
                  {/* Pill geometry is em-based, so it scales with its own
                      viewport-unit font and stays proportional to the image. */}
                  <a
                    href="#contact"
                    className="group inline-flex items-center gap-[0.5em] bg-primary text-black rounded-full pl-[1.25em] pr-[0.4em] py-[0.4em] font-bold"
                  >
                    Get in touch
                    <span className="bg-black rounded-full w-[2.4em] h-[2.4em] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowRight className="w-[1.15em] h-[1.15em] text-primary group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </a>
                </MagneticButton>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
