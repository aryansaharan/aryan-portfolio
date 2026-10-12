import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, type MotionValue } from 'framer-motion'
import { useIsDark } from '../hooks/useIsDark'
import { ease } from './tokens'
import { Scramble } from './motion'
import { createStatueGL, type StatueGL } from './statue-gl'

// The mark, at full size, in two states:
//   light  a graphite study on paper that redraws itself, catches a sheen
//          where the light falls, and smudges under a dragging finger;
//   dark   the marble in a dark room, raked by a light that follows the
//          cursor (or a finger) and wanders on its own when nobody is pointing.
// Switching theme turns the drawing into stone.
const SRC = { graphite: '/statue-graphite.webp', marble: '/statue-marble.webp', relief: '/statue-relief.webp' }
// Dissolves the tile's edges so the bust rises out of the page.
const FADE = 'radial-gradient(112% 88% at 50% 30%, #000 50%, transparent 76%)'

type Pointer = { x: MotionValue<number>; y: MotionValue<number>; active: MotionValue<number> }

export function Statue({ pointer }: { pointer: Pointer }) {
  const dark = useIsDark()
  const reduce = useReducedMotion()
  const stage = useRef<HTMLDivElement>(null)
  const engine = useRef<StatueGL | null>(null)
  const [failed, setFailed] = useState(false)
  const [shown, setShown] = useState(false)
  const live = !reduce && !failed
  // The light only runs while the statue is on screen.
  const onScreen = useInView(stage)

  // While a finger is down, it owns the light (not the hero's mouse).
  const touching = useRef(false)

  // Tilt toward the light, a few degrees, damped.
  const rx = useSpring(useMotionValue(0), { stiffness: 90, damping: 20 })
  const ry = useSpring(useMotionValue(0), { stiffness: 90, damping: 20 })

  // The engine lives as long as its canvas; without WebGL, the still images stand in.
  const mount = useCallback((el: HTMLCanvasElement | null) => {
    if (!el) return
    const gl = createStatueGL(el, SRC, () => setShown(true))
    if (!gl) {
      setFailed(true)
      return
    }
    engine.current = gl
    return () => {
      gl.destroy()
      engine.current = null
    }
  }, [])

  useEffect(() => engine.current?.setDark(dark), [dark, live])
  useEffect(() => engine.current?.setVisible(onScreen), [onScreen, live])

  // Points in the stage's own 0..1 space.
  const local = (cx: number, cy: number) => {
    const r = stage.current!.getBoundingClientRect()
    return [(cx - r.left) / r.width, (cy - r.top) / r.height] as const
  }
  const aim = (x: number, y: number, active: boolean) => {
    engine.current?.point(x, y, active)
    ry.set(active ? Math.max(-1, Math.min(1, x * 2 - 1)) * 5 : 0)
    rx.set(active ? -Math.max(-1, Math.min(1, y * 2 - 1)) * 4 : 0)
  }

  // The whole hero steers the light with a mouse.
  useEffect(() => {
    if (!live) return
    const update = () => {
      if (touching.current) return
      const [x, y] = local(pointer.x.get(), pointer.y.get())
      aim(x, y, pointer.active.get() > 0.5)
    }
    const offs = [pointer.x.on('change', update), pointer.y.on('change', update), pointer.active.on('change', update)]
    return () => offs.forEach((off) => off())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, pointer])

  // A finger (or a pressed mouse) on the statue itself: the light follows it,
  // and on the drawing a drag smudges the graphite.
  const drag = useRef<{ x: number; y: number; id: number } | null>(null)
  const release = useRef<ReturnType<typeof setTimeout>>(undefined)
  const down = (e: React.PointerEvent) => {
    const [x, y] = local(e.clientX, e.clientY)
    drag.current = { x, y, id: e.pointerId }
    if (e.pointerType !== 'mouse') {
      touching.current = true
      clearTimeout(release.current)
      aim(x, y, true)
    }
  }
  const move = (e: React.PointerEvent) => {
    const [x, y] = local(e.clientX, e.clientY)
    if (e.pointerType !== 'mouse') aim(x, y, true)
    const d = drag.current
    if (d && d.id === e.pointerId) {
      engine.current?.drag(x, y, x - d.x, y - d.y)
      d.x = x
      d.y = y
    }
  }
  const up = (e: React.PointerEvent) => {
    drag.current = null
    if (e.pointerType === 'mouse') return
    // let the light linger where the finger left it, then drift again
    clearTimeout(release.current)
    release.current = setTimeout(() => {
      touching.current = false
      aim(0.5, 0.4, false)
    }, 1600)
  }
  useEffect(() => () => clearTimeout(release.current), [])

  const caption = `Fig. 1 · ${dark ? 'Shipped in marble' : 'Drafted in graphite'}`

  return (
    <figure className="relative w-full">
      <div ref={stage} className="relative aspect-square w-full perspective-[1000px]">
        <motion.div
          className="absolute inset-0"
          style={{ rotateX: rx, rotateY: ry, maskImage: FADE, WebkitMaskImage: FADE }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease }}
        >
          {live ? (
            <canvas
              ref={mount}
              aria-hidden
              className="absolute inset-0 h-full w-full touch-pan-y select-none transition-opacity duration-700"
              style={{ opacity: shown ? 1 : 0 }}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              onPointerLeave={up}
            />
          ) : dark ? (
            <img src={SRC.marble} alt="" className="absolute inset-0 h-full w-full object-contain opacity-70" />
          ) : (
            // the colour channels hold stroke timing; brightness(0) leaves the graphite
            <img src={SRC.graphite} alt="" className="absolute inset-0 h-full w-full object-contain opacity-90 brightness-0" />
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
