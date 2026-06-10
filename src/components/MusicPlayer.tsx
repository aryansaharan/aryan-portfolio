import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { SkipForward } from 'lucide-react'

// ──────────────────────────────────────────────────────────────────────────
// TRACKS: self-hosted MP3s in /public. The player advances on "next" and
// auto-advances when a track ends (wrapping). Audio is preload="none", so
// nothing downloads until the first press.
// ──────────────────────────────────────────────────────────────────────────

const TRACKS = [
  { url: '/tenDays.mp3', title: 'ten days' },
  { url: '/adoreU.mp3', title: 'adore u' },
  { url: '/glow.mp3', title: 'glow' },
]
const TRACK_ARTIST = 'Fred again..'
const COVER_URL = '/ten-cover.jpg'
const easeOut = [0.16, 1, 0.3, 1] as const

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [index, setIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState(false)
  const track = TRACKS[index]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    // Track ended: roll to the next one; the index effect below keeps it playing.
    const onEnded = () => setIndex((i) => (i + 1) % TRACKS.length)
    const onError = () => setError(true)
    a.addEventListener('ended', onEnded)
    a.addEventListener('error', onError)
    return () => {
      a.removeEventListener('ended', onEnded)
      a.removeEventListener('error', onError)
    }
  }, [])

  // When the track changes mid-play (next button or auto-advance), keep spinning.
  useEffect(() => {
    const a = audioRef.current
    if (!a || !playing) return
    setError(false)
    a.volume = 0.55
    a.play().catch(() => setError(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const toggle = async () => {
    const a = audioRef.current
    if (!a) return
    if (playing) {
      a.pause()
      setPlaying(false)
    } else {
      try {
        a.volume = 0.55
        await a.play()
        setPlaying(true)
      } catch {
        setError(true)
      }
    }
  }

  const next = () => {
    setIndex((i) => (i + 1) % TRACKS.length)
  }

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={mounted ? { y: 0, opacity: 1 } : { y: 60, opacity: 0 }}
      transition={{ duration: 0.8, delay: 1.2, ease: easeOut }}
      className="fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6"
    >
      <audio ref={audioRef} src={track.url} preload="none" />
      <div className="flex items-center rounded-full border border-primary/15 bg-black/80 backdrop-blur pl-1.5 pr-2 sm:pl-2 sm:pr-2.5 py-1.5 sm:py-2 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)] hover:border-primary/30 transition-colors">
        <button
          onClick={toggle}
          aria-label={playing ? 'Pause music' : 'Play music'}
          className="group flex items-center gap-3 sm:gap-4 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <Vinyl playing={playing} />
          <div className="flex flex-col items-start leading-tight min-w-0 max-w-[150px] sm:max-w-[190px]">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-primary/60">
              {error
                ? 'Audio unavailable'
                : playing
                  ? 'Now spinning'
                  : 'Press to spin'}
            </span>
            <span className="text-primary text-xs sm:text-sm font-bold truncate w-full text-left">
              {track.title}
            </span>
            <span className="text-primary/60 text-[10px] sm:text-[11px] font-serif italic truncate w-full text-left">
              {TRACK_ARTIST}
            </span>
          </div>
        </button>
        <button
          onClick={next}
          aria-label="Next track"
          className="ml-2 sm:ml-3 shrink-0 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border border-primary/15 text-primary/60 hover:text-primary hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </motion.div>
  )
}

function Vinyl({ playing }: { playing: boolean }) {
  return (
    <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0">
      {/* Disc */}
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full vinyl-disc ${playing ? 'is-playing' : ''}`}
        aria-hidden
      >
        <defs>
          <radialGradient id="vinylGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="60%" stopColor="#0a0a0a" />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>
          <clipPath id="vinylLabelClip">
            <circle cx="50" cy="50" r="18" />
          </clipPath>
        </defs>
        <circle cx="50" cy="50" r="49" fill="url(#vinylGrad)" />
        {/* Grooves */}
        {[44, 39, 34, 29, 25].map((r) => (
          <circle
            key={r}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#222"
            strokeOpacity="0.55"
            strokeWidth="0.4"
          />
        ))}
        {/* Reflective highlight (single sweep) */}
        <path
          d="M 50 6 A 44 44 0 0 1 94 50"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.05"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Center label: the album cover, clipped to the label circle */}
        <image
          href={COVER_URL}
          x="32"
          y="32"
          width="36"
          height="36"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#vinylLabelClip)"
        />
        <circle
          cx="50"
          cy="50"
          r="18"
          fill="none"
          stroke="#000"
          strokeOpacity="0.25"
          strokeWidth="0.6"
        />
        {/* Center hole */}
        <circle cx="50" cy="50" r="2.5" fill="#000" />
      </svg>

      {/* Tonearm: pivot top-right of the vinyl, swings over the record on play */}
      <div
        aria-hidden
        className="absolute -top-1 -right-2 sm:-top-1.5 sm:-right-2.5 transition-transform duration-700 ease-out pointer-events-none"
        style={{
          transformOrigin: '100% 0%',
          transform: playing ? 'rotate(-45deg)' : 'rotate(15deg)',
        }}
      >
        <div className="relative">
          {/* Arm shaft */}
          <div className="w-[1.5px] h-9 sm:h-11 bg-gradient-to-b from-primary/60 to-primary/20 rounded-full" />
          {/* Pivot dot: anchors the arm */}
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary/50 border border-primary/30" />
          {/* Cartridge head: the bit that touches the record */}
          <div className="absolute -bottom-0.5 -left-1 w-2 h-1.5 rounded-sm bg-primary/50" />
        </div>
      </div>
    </div>
  )
}
