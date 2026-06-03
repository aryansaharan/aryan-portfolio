import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// ──────────────────────────────────────────────────────────────────────────
// TRACK SOURCE: pick one path.
//
//  A. Self-hosted MP3 (best): drop a file into /public/track.mp3
//     and set TRACK_URL = '/track.mp3'.
//     Then change TRACK_TITLE + TRACK_ARTIST to match.
//
//  B. Any direct MP3/OGG/WAV URL on the web.
//
//  C. To replace this whole custom UI with an Apple Music embed instead:
//     swap the JSX below with an <iframe> pointing at
//     https://embed.music.apple.com/<country>/album/<id>?theme=dark
//     (loses the vinyl aesthetic, but plays full Apple Music tracks to
//     subscribers: guests still get 30s previews).
//
//  D. For Apple MusicKit JS with full custom UI control:
//     needs an Apple Developer account + JWT dev token + MusicKit.configure().
//     Out of scope for v1; happy to wire if you commit to the dev account.
// ──────────────────────────────────────────────────────────────────────────

const TRACK_URL = '/track.mp3'
const TRACK_TITLE = 'Chill deep house'
const TRACK_ARTIST = 'low and steady'
const easeOut = [0.16, 1, 0.3, 1] as const

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onEnded = () => setPlaying(false)
    const onError = () => setError(true)
    a.addEventListener('ended', onEnded)
    a.addEventListener('error', onError)
    return () => {
      a.removeEventListener('ended', onEnded)
      a.removeEventListener('error', onError)
    }
  }, [])

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

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={mounted ? { y: 0, opacity: 1 } : { y: 60, opacity: 0 }}
      transition={{ duration: 0.8, delay: 1.2, ease: easeOut }}
      className="fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6"
    >
      <audio ref={audioRef} src={TRACK_URL} loop preload="none" />
      <button
        onClick={toggle}
        aria-label={playing ? 'Pause music' : 'Play music'}
        className="group flex items-center gap-3 sm:gap-4 rounded-full border border-primary/15 bg-black/80 backdrop-blur pl-1.5 pr-4 sm:pl-2 sm:pr-5 py-1.5 sm:py-2 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)] hover:border-primary/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <Vinyl playing={playing} />
        <div className="flex flex-col items-start leading-tight min-w-0 max-w-[180px] sm:max-w-[220px] pr-1">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-primary/50">
            {error
              ? 'Audio unavailable'
              : playing
                ? 'Now spinning'
                : 'Press to spin'}
          </span>
          <span className="text-primary text-xs sm:text-sm font-bold truncate w-full text-left">
            {TRACK_TITLE}
          </span>
          <span className="text-primary/40 text-[9px] sm:text-[10px] italic truncate w-full text-left">
            {TRACK_ARTIST}
          </span>
        </div>
      </button>
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
          <radialGradient id="labelGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E1E0CC" />
            <stop offset="100%" stopColor="#B8B69E" />
          </radialGradient>
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
        {/* Center label */}
        <circle cx="50" cy="50" r="18" fill="url(#labelGrad)" />
        <circle
          cx="50"
          cy="50"
          r="18"
          fill="none"
          stroke="#000"
          strokeOpacity="0.18"
          strokeWidth="0.4"
        />
        {/* Tiny label tick (orients the spin visually) */}
        <rect x="49.5" y="34" width="1" height="6" fill="#000" opacity="0.35" />
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
