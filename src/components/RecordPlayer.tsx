import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { ease } from './tokens'

// What's actually on repeat, as an object you can play. The record slides
// out of its sleeve and turns, the arm swings on, and the bars follow the
// real audio (Web Audio analyser). Nothing downloads until the first press,
// except each track's length once the player is near.
const TRACKS = [
  { url: '/tenDays.mp3', title: 'ten' },
  { url: '/adoreU.mp3', title: 'adore u' },
  { url: '/glow.mp3', title: 'glow' },
]
const ARTIST = 'Fred again..'
const COVER = '/ten-cover.jpg'

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
// Lengths stay blank until the metadata says what they are.
const len = (s: number) => (Number.isFinite(s) && s > 0 ? fmt(s) : '')

export function RecordPlayer() {
  const audio = useRef<HTMLAudioElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const graph = useRef<{ ctx: AudioContext; analyser: AnalyserNode } | null>(null)
  const wantPlay = useRef(false)
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [lengths, setLengths] = useState<number[]>(() => TRACKS.map(() => 0))
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const near = useInView(card, { once: true, margin: '300px' })
  const visible = useInView(card, { margin: '-80px' })

  // Track lengths: metadata only, once the player is close.
  useEffect(() => {
    if (!near) return
    TRACKS.forEach((t, k) => {
      const a = new Audio()
      a.preload = 'metadata'
      a.src = t.url
      a.addEventListener('loadedmetadata', () =>
        setLengths((prev) => prev.map((v, j) => (j === k ? a.duration : v))),
      )
    })
  }, [near])

  useEffect(() => {
    const a = audio.current
    if (!a) return
    const onTime = () => setTime(a.currentTime)
    const onEnd = () => {
      wantPlay.current = true
      setI((n) => (n + 1) % TRACKS.length)
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('emptied', onTime) // a new track resets the clock
    a.addEventListener('ended', onEnd)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('emptied', onTime)
      a.removeEventListener('ended', onEnd)
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
    }
  }, [])

  // Changing track keeps playing if it was.
  useEffect(() => {
    const a = audio.current
    if (a && wantPlay.current) a.play().catch(() => setPlaying(false))
  }, [i])

  const ensureGraph = () => {
    const a = audio.current
    if (!a) return
    try {
      if (!graph.current) {
        const ctx = new AudioContext()
        const src = ctx.createMediaElementSource(a)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 128
        analyser.smoothingTimeConstant = 0.82
        src.connect(analyser)
        analyser.connect(ctx.destination)
        graph.current = { ctx, analyser }
        setAnalyser(analyser)
      } else if (graph.current.ctx.state === 'suspended') {
        graph.current.ctx.resume()
      }
    } catch {
      // No Web Audio: it still plays, the bars just rest.
    }
  }

  const toggle = useCallback(() => {
    const a = audio.current
    if (!a) return
    if (a.paused) {
      ensureGraph()
      wantPlay.current = true
      a.play().catch(() => setPlaying(false))
    } else {
      wantPlay.current = false
      a.pause()
    }
  }, [])
  const go = (k: number) => {
    ensureGraph()
    wantPlay.current = true
    if (k === i) audio.current?.play().catch(() => setPlaying(false))
    else setI(k)
  }
  const seek = (frac: number) => {
    const a = audio.current
    if (!a || !Number.isFinite(a.duration)) return
    a.currentTime = Math.max(0, Math.min(1, frac)) * a.duration
  }

  const track = TRACKS[i]
  const length = lengths[i]

  return (
    <>
      <div
        ref={card}
        className="grid items-center gap-8 rounded-[28px] border border-ink/10 bg-ink/2.5 p-6 sm:grid-cols-[minmax(0,330px)_1fr] sm:gap-10 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:px-14 lg:py-12"
      >
        <audio ref={audio} src={track.url} preload="none" />
        <div className="lg:my-10 lg:origin-center lg:scale-[1.3] lg:justify-self-center">
          <Turntable playing={playing} onToggle={toggle} title={track.title} />
        </div>

        <div className="min-w-0 lg:max-w-[470px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">On repeat</p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="relative h-9 overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.h3
                    key={track.title}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ duration: 0.45, ease }}
                    className="text-[28px] font-semibold leading-9 tracking-[-0.02em]"
                  >
                    {track.title}
                  </motion.h3>
                </AnimatePresence>
              </div>
              <p className="text-[14px] text-muted">{ARTIST}</p>
            </div>
            <Bars analyser={analyser} playing={playing} />
          </div>

          <Scrubber progress={length ? time / length : 0} onSeek={seek} />
          <div className="mt-2 flex justify-between font-mono text-[10px] tabular-nums tracking-[0.08em] text-muted">
            <span>{fmt(time)}</span>
            <span>{len(length)}</span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <IconButton label="Previous track" onClick={() => go((i - 1 + TRACKS.length) % TRACKS.length)}>
              <SkipBack className="h-4 w-4" />
            </IconButton>
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? `Pause ${track.title}` : `Play ${track.title} by ${ARTIST}`}
              className="grid h-12 w-12 place-items-center rounded-full bg-ink text-paper transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              {playing ? <Pause className="h-[18px] w-[18px]" /> : <Play className="ml-0.5 h-[18px] w-[18px]" />}
            </button>
            <IconButton label="Next track" onClick={() => go((i + 1) % TRACKS.length)}>
              <SkipForward className="h-4 w-4" />
            </IconButton>
          </div>

          <ol className="mt-6 border-t border-ink/[0.07]">
            {TRACKS.map((t, k) => (
              <li key={t.url}>
                <button
                  type="button"
                  onClick={() => go(k)}
                  className={`flex w-full items-center gap-4 border-b border-ink/[0.07] py-2.5 text-left text-[14px] transition-colors ${
                    k === i ? 'text-ink' : 'text-ink/55 hover:text-ink'
                  }`}
                >
                  <span className="w-5 font-mono text-[10px] text-muted">{String(k + 1).padStart(2, '0')}</span>
                  <span className="flex-1">{t.title}</span>
                  {k === i && playing && <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden />}
                  <span className="font-mono text-[10px] tabular-nums text-muted">{len(lengths[k])}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Follows you down the page while it plays. Portalled: the reveal
          wrapper's filter would otherwise trap position: fixed. */}
      {createPortal(
      <AnimatePresence>
        {playing && !visible && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full border border-ink/10 bg-paper/90 py-1.5 pl-1.5 pr-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.4)] backdrop-blur-md"
          >
            <button
              type="button"
              onClick={() => card.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className="flex items-center gap-3"
              aria-label="Back to the player"
            >
              <span className="vinyl spin-record is-playing relative grid h-9 w-9 place-items-center rounded-full">
                <img src={COVER} alt="" className="h-3.5 w-3.5 rounded-full object-cover" />
              </span>
              <span className="text-[13px]">
                {track.title} <span className="text-muted">· {ARTIST}</span>
              </span>
            </button>
            <button
              type="button"
              onClick={toggle}
              aria-label={`Pause ${track.title}`}
              className="grid h-8 w-8 place-items-center rounded-full bg-ink text-paper"
            >
              <Pause className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </>
  )
}

function Turntable({ playing, onToggle, title }: { playing: boolean; onToggle: () => void; title: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? `Pause ${title}` : `Play ${title}`}
      className="relative mx-auto block h-[200px] w-[300px] max-w-full sm:mx-0 sm:h-[220px] sm:w-[330px]"
    >
      {/* The record, behind the sleeve until it plays. */}
      <motion.span
        className="absolute left-[10px] top-[10px] block h-[180px] w-[180px] sm:h-[200px] sm:w-[200px]"
        initial={false}
        animate={{ x: playing ? 104 : 26 }}
        transition={{ type: 'spring', stiffness: 60, damping: 15 }}
      >
        <span className={`vinyl spin-record ${playing ? 'is-playing' : ''} absolute inset-0 grid place-items-center rounded-full`}>
          <span className="relative h-[34%] w-[34%] overflow-hidden rounded-full ring-1 ring-black/40">
            <img src={COVER} alt="" className="h-full w-full object-cover" />
            <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0B0B0B]" />
          </span>
        </span>
        <span className="vinyl-sheen pointer-events-none absolute inset-0 rounded-full" />
      </motion.span>

      {/* The sleeve. */}
      <span className="absolute left-0 top-0 block h-[200px] w-[200px] overflow-hidden rounded-[6px] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.55),0_0_0_1px_rgba(0,0,0,0.08)] sm:h-[220px] sm:w-[220px]">
        <img src={COVER} alt="" className="h-full w-full object-cover" />
        <span className="absolute inset-0 bg-linear-to-br from-white/15 via-transparent to-black/20" />
      </span>

      {/* The arm: rests off the record, swings on when it plays. */}
      <motion.svg
        viewBox="0 0 60 190"
        className="absolute right-0 top-0 h-[190px] w-[60px] text-ink/70 sm:h-[205px]"
        style={{ originX: '40px', originY: '16px' }}
        initial={false}
        animate={{ rotate: playing ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 50, damping: 12 }}
        aria-hidden
      >
        <circle cx="40" cy="16" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="40" cy="16" r="3" fill="currentColor" />
        <path d="M40 16 L38 130 L24 160" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="16" y="156" width="14" height="9" rx="2" transform="rotate(-35 23 160)" fill="currentColor" />
      </motion.svg>
    </button>
  )
}

// Bars from the real signal while playing; a calm baseline otherwise.
function Bars({ analyser, playing }: { analyser: AnalyserNode | null; playing: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W = 96
    const H = 28
    c.width = W * dpr
    c.height = H * dpr
    const N = 16
    const data = new Uint8Array(analyser ? analyser.frequencyBinCount : 64)
    const level = new Float32Array(N)
    let raf = 0
    const draw = () => {
      const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()
      if (analyser && playing) analyser.getByteFrequencyData(data)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = `rgb(${ink} / ${playing ? 0.6 : 0.18})`
      let moving = false
      for (let k = 0; k < N; k++) {
        const v = analyser && playing ? data[2 + Math.floor((k * (data.length * 0.55)) / N)] / 255 : 0
        level[k] += (v - level[k]) * 0.25
        if (level[k] > 0.01) moving = true
        const h = Math.max(playing ? 2 : 1, level[k] * H)
        ctx.fillRect(k * 6, H - h, 3, h)
      }
      if (playing || moving) raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [analyser, playing])
  return <canvas ref={ref} aria-hidden className="h-7 w-24 shrink-0" />
}

function Scrubber({ progress, onSeek }: { progress: number; onSeek: (f: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const at = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect()
    if (r) onSeek((clientX - r.left) / r.width)
  }
  return (
    <div
      ref={ref}
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') onSeek(progress + 0.05)
        if (e.key === 'ArrowLeft') onSeek(progress - 0.05)
      }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        at(e.clientX)
      }}
      onPointerMove={(e) => {
        if (e.buttons) at(e.clientX)
      }}
      className="group relative mt-6 h-4 cursor-pointer touch-none"
    >
      <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-ink/10" />
      <div className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-ink/70" style={{ width: `${progress * 100}%` }} />
      <div
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-ink transition-transform duration-200 group-hover:scale-100"
        style={{ left: `${progress * 100}%` }}
      />
    </div>
  )
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
    >
      {children}
    </button>
  )
}
