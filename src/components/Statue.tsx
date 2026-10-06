import { useEffect, useRef } from 'react'
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from 'framer-motion'
import { useIsDark } from '../hooks/useIsDark'
import { ease } from './tokens'
import { Scramble } from './motion'

// The mark, at full size, in two states:
//   light  a graphite study on paper that draws itself in;
//   dark   the marble in a dark room, lit by a spotlight that follows the
//          cursor and wanders on its own when nobody is pointing.
// Switching theme turns the drawing into stone.
const SKETCH = '/statue-sketch.webp'
const MARBLE = '/statue-marble.webp'
// Dissolves the tile's edges so the bust rises out of the page.
const FADE = 'radial-gradient(112% 88% at 50% 30%, #000 50%, transparent 76%)'

export function Statue({ pointer }: { pointer: { x: MotionValue<number>; y: MotionValue<number>; active: MotionValue<number> } }) {
  const dark = useIsDark()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  // The light and tilt only run while the statue is on screen.
  const onScreen = useInView(ref)

  // Warm the other theme's image once the page is idle, so the switch is instant.
  useEffect(() => {
    const t = setTimeout(() => {
      const img = new Image()
      img.src = dark ? SKETCH : MARBLE
    }, 2500)
    return () => clearTimeout(t)
  }, [dark])

  // Tilt toward the pointer, a few degrees, damped.
  const rx = useSpring(useMotionValue(0), { stiffness: 90, damping: 20 })
  const ry = useSpring(useMotionValue(0), { stiffness: 90, damping: 20 })
  // Spotlight position in % of the stage.
  const lx = useSpring(useMotionValue(38), { stiffness: 60, damping: 18 })
  const ly = useSpring(useMotionValue(30), { stiffness: 60, damping: 18 })

  useEffect(() => {
    if (reduce || !onScreen) return
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const el = ref.current
      if (el) {
        const r = el.getBoundingClientRect()
        if (pointer.active.get() > 0.5) {
          const px = ((pointer.x.get() - r.left) / r.width) * 100
          const py = ((pointer.y.get() - r.top) / r.height) * 100
          lx.set(Math.max(5, Math.min(95, px)))
          ly.set(Math.max(5, Math.min(90, py)))
          ry.set(Math.max(-1, Math.min(1, px / 50 - 1)) * 5)
          rx.set(-Math.max(-1, Math.min(1, py / 50 - 1)) * 4)
        } else {
          // Idle: the light drifts slowly across the shoulders and the curls.
          const s = (now - t0) / 1000
          lx.set(50 + Math.sin(s * 0.23) * 26)
          ly.set(40 + Math.sin(s * 0.17 + 1.2) * 18)
          rx.set(0)
          ry.set(0)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduce, onScreen, pointer, lx, ly, rx, ry])

  const light = useMotionTemplate`radial-gradient(circle at ${lx}% ${ly}%, #000 0%, rgba(0,0,0,0.85) 11%, rgba(0,0,0,0.3) 25%, transparent 38%)`

  // The study draws itself in along a diagonal, once.
  const sweep = useMotionValue(reduce ? 120 : -20)
  useEffect(() => {
    if (reduce || dark) return
    sweep.set(-20)
    const c = animate(sweep, 120, { duration: 2.4, delay: 0.35, ease })
    return () => c.stop()
  }, [dark, reduce, sweep])
  const draw = useMotionTemplate`linear-gradient(120deg, #000 ${sweep}%, transparent calc(${sweep}% + 14%))`

  const caption = `Fig. 1 · ${dark ? 'Shipped in marble' : 'Drafted in graphite'}`

  return (
    <figure className="relative w-full">
      <div ref={ref} className="relative aspect-square w-full perspective-[1000px]">
        <motion.div
          className="absolute inset-0"
          style={{ rotateX: rx, rotateY: ry, maskImage: FADE, WebkitMaskImage: FADE }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease }}
        >
          {dark ? (
            <>
              {/* Dimmed by opacity, not brightness: the tile's background stays the page's. */}
              <img src={MARBLE} alt="" className="absolute inset-0 h-full w-full object-contain opacity-[0.24]" />
              <motion.img
                src={MARBLE}
                alt=""
                className="absolute inset-0 h-full w-full object-contain"
                style={{ maskImage: light, WebkitMaskImage: light }}
              />
            </>
          ) : (
            <motion.img
              src={SKETCH}
              alt=""
              className="absolute inset-0 h-full w-full object-contain"
              style={{ maskImage: draw, WebkitMaskImage: draw }}
            />
          )}
        </motion.div>
      </div>
      {/* A museum label, because it is one. */}
      <figcaption className="mt-1 flex items-center justify-end gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        <span className="h-px w-8 bg-ink/15" aria-hidden />
        <Scramble key={caption} text={caption} delay={0.6} />
      </figcaption>
    </figure>
  )
}
