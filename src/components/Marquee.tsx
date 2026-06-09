type Props = {
  items: string[]
  /** Seconds for one full loop */
  speed?: number
}

// CSS-driven (keyframes in index.css): no JS animation loop, pauses on
// hover/focus-within, and the global reduced-motion kill-switch stops it.
// aria-hidden: every line here restates copy that exists as accessible text
// elsewhere on the page (hero, about, currently, footer).
export function Marquee({ items, speed = 38 }: Props) {
  const loop = [...items, ...items]
  return (
    <div
      aria-hidden
      className="marquee relative w-full overflow-hidden border-y border-primary/10 bg-black py-5 sm:py-7"
    >
      <div
        className="marquee-track flex whitespace-nowrap will-change-transform"
        style={{ animationDuration: `${speed}s` }}
      >
        {loop.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-6 sm:gap-10 px-6 sm:px-10 text-primary/80 text-sm sm:text-base md:text-lg tracking-[0.18em] uppercase"
          >
            <span>{item}</span>
            <span className="text-primary/30 text-xs">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
