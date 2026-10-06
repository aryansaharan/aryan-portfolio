import { useEffect, useState } from 'react'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { ThemeToggle } from './ThemeToggle'
import { CONTAINER, ease } from './tokens'

const sections = [
  { id: 'work', label: 'Work', n: '01' },
  { id: 'path', label: 'Path', n: '02' },
  { id: 'hi', label: 'Say hi', n: '03' },
]

// Quiet until you scroll: then a hairline appears, the statue slides in
// beside the name, and a small marker follows the section you're reading.
export function Header() {
  const { scrollY, scrollYProgress } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 120))

  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  useMotionValueEvent(scrollY, 'change', (y) => {
    if (y < 200) setActive(null)
  })

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500 ${
        scrolled ? 'border-ink/[0.07] bg-paper/90 backdrop-blur-sm' : 'border-transparent bg-transparent'
      }`}
    >
      <div className={`${CONTAINER} flex h-14 items-center justify-between sm:h-16`}>
        {/* The hero already says who this is; the header only takes the
            name once the hero has scrolled away. */}
        <motion.a
          href="#top"
          aria-label="Aryan Saharan, back to top"
          className="-my-2.5 flex items-center gap-3 py-2.5 text-[15px] font-medium tracking-[-0.01em]"
          initial={false}
          animate={{ opacity: scrolled ? 1 : 0, y: scrolled ? 0 : -4 }}
          transition={{ duration: 0.5, ease }}
          style={{ pointerEvents: scrolled ? 'auto' : 'none' }}
        >
          <img src="/favicon.png" alt="" className="h-7 w-7 rounded-[8px]" />
          <span className="hidden sm:inline">Aryan Saharan</span>
        </motion.a>
        <nav aria-label="Sections" className="flex items-center gap-1">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`group relative flex items-baseline gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2.5 text-[14px] transition-colors sm:px-4 sm:py-2 sm:text-[15px] ${
                active === s.id ? 'text-ink' : 'text-muted hover:text-ink'
              }`}
            >
              {active === s.id && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 -z-10 rounded-full bg-ink/[0.06]"
                  transition={{ duration: 0.45, ease }}
                />
              )}
              <span
                aria-hidden
                className={`hidden font-mono text-[9.5px] tracking-[0.06em] transition-colors sm:inline ${
                  active === s.id ? 'text-signal' : 'text-muted/70 group-hover:text-muted'
                }`}
              >
                {s.n}
              </span>
              {s.label}
            </a>
          ))}
          <span className="mx-1.5 h-4 w-px bg-ink/10" aria-hidden />
          <ThemeToggle />
        </nav>
      </div>
      {/* How far down the page you are: a hairline that fills as you read. */}
      <motion.span
        aria-hidden
        className="absolute inset-x-0 -bottom-px h-px origin-left bg-ink/40"
        style={{ scaleX: scrollYProgress, opacity: scrolled ? 1 : 0 }}
      />
    </header>
  )
}
