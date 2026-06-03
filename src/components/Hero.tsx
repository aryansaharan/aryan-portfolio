import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { WordsPullUp } from './animations/WordsPullUp'
import { MagneticButton } from './animations/MagneticButton'

const navItems: { label: string; href: string; external?: boolean }[] = [
  { label: 'Resume', href: '/Aryan_Saharan.pdf', external: true },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/aryansaharan1', external: true },
]
const easeOut = [0.16, 1, 0.3, 1] as const
const heroVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
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
    <section ref={sectionRef} className="h-[100svh] p-4 md:p-6">
      <div className="relative h-full w-full overflow-hidden rounded-2xl md:rounded-[2rem] bg-black">
        <motion.video
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover object-[50%_58%] md:object-[35%_75%]"
          style={{ y: videoY, scale: videoScale }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, ease: easeOut }}
        />
        <div className="absolute inset-0 noise-overlay opacity-[0.7] mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

        {/* Mini-nav: action links only, centered hanging from the top */}
        <div className="absolute top-0 inset-x-0 z-20 flex justify-center pointer-events-none">
          <motion.nav
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: easeOut }}
            className="pointer-events-auto bg-black rounded-b-2xl md:rounded-b-3xl px-5 py-2.5 md:px-7 md:py-3"
          >
            <ul className="flex items-center gap-4 sm:gap-6 md:gap-8 text-[11px] sm:text-xs md:text-sm">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noreferrer' : undefined}
                    className="transition-colors"
                    style={{ color: 'rgba(225, 224, 204, 0.8)' }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = '#E1E0CC')
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color =
                        'rgba(225, 224, 204, 0.8)')
                    }
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        </div>

        {/* Hero content. The greeting couplet is anchored at a fixed fraction below
            the seated figure, with viewport-HEIGHT-aware sizing (min(vw,vh)) so it
            shrinks on short laptop viewports and stays clear of the figure instead of
            riding up over it. The tagline + CTA sit bottom-left on desktop, centered
            above the music player on mobile. */}
        <motion.div
          style={{ y: contentY, opacity: contentOpacity }}
          className="absolute inset-0 z-10 pointer-events-none"
        >
          {/* Greeting couplet: centered, anchored below the figure. */}
          <div className="absolute inset-x-0 top-[60%] flex justify-center px-5 sm:px-8 md:px-12">
            <div className="w-full max-w-[min(92vw,56rem)] text-center">
              <h1
                className="font-bold leading-[1.16] tracking-[-0.04em]"
                style={{ color: '#E1E0CC', fontSize: 'clamp(1.55rem, min(4.6vw, 5.8vh), 3.9rem)' }}
              >
                <WordsPullUp text="Glad you climbed up." />
              </h1>
              <h2
                className="italic font-serif font-normal leading-[1.16] tracking-[-0.02em]"
                style={{ color: '#E1E0CC', fontSize: 'clamp(1.55rem, min(4.6vw, 5.8vh), 3.9rem)' }}
              >
                <WordsPullUp text="View's worth it." />
              </h2>
            </div>
          </div>

          {/* Tagline + CTA: bottom-left on desktop, centered above the player on mobile. */}
          <div className="absolute inset-x-5 sm:inset-x-8 md:inset-x-12 bottom-24 sm:bottom-10 md:bottom-12 flex justify-center sm:justify-start">
            <div className="flex flex-col items-center sm:items-start max-w-[20rem] text-center sm:text-left">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: easeOut }}
                className="text-primary/80 text-sm sm:text-base md:text-lg"
                style={{ lineHeight: 1.45 }}
              >
                PM by title. Engineer by reflex. Builder by instinct.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7, ease: easeOut }}
                className="mt-4 sm:mt-5 pointer-events-auto"
              >
                <MagneticButton strength={0.25}>
                  <a
                    href="#contact"
                    className="group inline-flex items-center gap-2 hover:gap-3 transition-all bg-primary text-black rounded-full pl-5 pr-1.5 py-1.5 font-bold text-sm sm:text-base"
                  >
                    Get in touch
                    <span className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowRight
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        color="#E1E0CC"
                      />
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
