import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { ease } from './tokens'

// Light and dark, both taken from the statue. The default follows the
// visitor's own clock (set before paint in index.html); a choice made here
// is remembered. Switching spreads the new theme from the button in a
// circle (View Transitions where supported, an instant swap elsewhere).
export function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = !dark
    const apply = () => {
      document.documentElement.classList.toggle('dark', next)
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next ? '#090909' : '#FAFAF9')
      try {
        localStorage.setItem('theme', next ? 'dark' : 'light')
      } catch {
        // private mode: the choice just won't persist
      }
      setDark(next)
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduce) return apply()

    const { clientX: x, clientY: y } = e
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    document.startViewTransition(apply).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="relative grid h-10 w-10 place-items-center rounded-full text-muted sm:h-8 sm:w-8 transition-colors hover:bg-ink/5 hover:text-ink"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={dark ? 'sun' : 'moon'}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.4, ease }}
        >
          {dark ? <Sun className="h-[15px] w-[15px]" /> : <Moon className="h-[15px] w-[15px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
