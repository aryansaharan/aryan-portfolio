import { useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { ArrowUpRight, Plus } from 'lucide-react'
import { alsoBuilt, projects, type Project } from '../content/projects'
import { Label, Reveal, Rise, Rule, Scramble } from './motion'
import { CONTAINER, GRID, ease } from './tokens'
import { checkedAgo, useLiveStatus, type LiveStatus } from '../hooks/useLiveStatus'
import { useIsDark } from '../hooks/useIsDark'

export function Work() {
  const status = useLiveStatus()
  const up = status.up ? projects.filter((p) => status.up?.[p.id]).length : null
  // Quiet on purpose: the dots on each project carry the detail.
  const aside = up === null ? null : up === projects.length ? 'All live' : `${up} live`
  const checked = status.source === 'live' ? `Checked ${checkedAgo(status.checkedAt)}` : 'As of the last deploy'

  return (
    <section id="work" className={`${CONTAINER} scroll-mt-16 pb-24 sm:pb-36`}>
      <div className={GRID}>
        <Rule />
        <Label className="col-span-2 mt-5 sm:col-span-3">Selected work</Label>
        {aside && (
          <p
            title={checked}
            className="col-span-2 mt-5 flex items-center justify-end gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted sm:col-span-5 sm:col-start-8"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden />
            <Scramble key={aside} text={aside} />
          </p>
        )}
      </div>
      <div className="mt-14 space-y-28 sm:mt-20 sm:space-y-40">
        {projects.map((p, i) => (
          <ProjectBlock key={p.id} project={p} n={i + 1} status={status} />
        ))}
      </div>
      <Reveal className={`${GRID} mt-28 sm:mt-36`}>
        <Label className="col-span-4 sm:col-span-1">Also</Label>
        <p className="col-span-4 mt-2 text-[15px] leading-relaxed text-ink/65 sm:col-span-8 sm:col-start-2 sm:mt-0">
          <a
            href={alsoBuilt.url}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:decoration-ink"
          >
            {alsoBuilt.name}
          </a>{' '}
          <span className="text-muted">(now {alsoBuilt.now})</span>. {alsoBuilt.line}
        </p>
      </Reveal>
    </section>
  )
}

function ProjectBlock({ project: p, n, status }: { project: Project; n: number; status: LiveStatus }) {
  return (
    <article aria-labelledby={`${p.id}-title`}>
      <Reveal className={`${GRID} items-baseline gap-y-3`}>
        <span className="col-span-4 font-mono text-[11px] text-muted sm:col-span-1">
          <Scramble text={String(n).padStart(2, '0')} />
        </span>
        <h3
          id={`${p.id}-title`}
          className="col-span-4 -mt-1 text-[clamp(1.6rem,2.5vw,2.2rem)] font-semibold leading-tight tracking-[-0.03em] sm:col-span-3 sm:mt-0"
        >
          <Rise>{p.name}</Rise>
        </h3>
        <p className="col-span-4 text-[15.5px] leading-relaxed text-ink/65 sm:col-span-5 sm:col-start-5">{p.line}</p>
        <div className="col-span-4 flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted sm:col-span-3 sm:col-start-10 sm:justify-end">
          <span className={p.lane === 'Now' ? 'text-ink' : undefined}>{p.lane}</span>
          <span aria-hidden>·</span>
          <span>{p.year}</span>
          <LiveDot up={status.up?.[p.id]} replay={status.source} />
        </div>
      </Reveal>

      <Plate project={p} />

      <div className={`${GRID} mt-5`}>
        <div className="col-span-4 sm:col-span-11 sm:col-start-2">
          <Story project={p} />
        </div>
      </div>
    </article>
  )
}

// A composed plate on a hint of the product's own colour. Honest about
// what each thing is: web products in a browser with one moment magnified
// beside it; the phone app on phones, in the app's own light or dark theme.
// Layers sit at different depths and drift apart a little on scroll.
function Plate({ project: p }: { project: Project }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const near = useTransform(scrollYProgress, [0, 1], [28, -28])
  const far = useTransform(scrollYProgress, [0, 1], [80, -80])
  // The cursor adds a little depth on top of the scroll: the far layer moves
  // more than the near one, so the composition turns slightly toward you.
  const px = useSpring(0, { stiffness: 110, damping: 20, mass: 0.6 })
  const py = useSpring(0, { stiffness: 110, damping: 20, mass: 0.6 })
  const nearX = useTransform(px, (v) => v * -10)
  const farX = useTransform(px, (v) => v * -26)
  const nearY = useTransform(() => near.get() + py.get() * -8)
  const farY = useTransform(() => far.get() + py.get() * -20)
  const depth: Depth = reduce ? undefined : { nearX, nearY, farX, farY }
  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (reduce || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    px.set(0)
    py.set(0)
  }

  return (
    <motion.a
      ref={ref}
      href={p.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${p.name}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group relative mt-8 block overflow-hidden rounded-[22px] bg-(--tint) dark:bg-(--tint-dark) sm:mt-10 sm:aspect-video sm:rounded-[28px] ${
        p.kind === 'app' ? 'aspect-4/5' : 'aspect-square'
      }`}
      style={{ ['--tint' as string]: p.tint[0], ['--tint-dark' as string]: p.tint[1] }}
      initial={reduce ? false : { opacity: 0, scale: 0.975 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.2, ease }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_15%_0%,rgba(255,255,255,0.7),transparent_60%)] dark:bg-[radial-gradient(90%_70%_at_15%_0%,rgba(255,255,255,0.05),transparent_60%)]"
      />
      {p.kind === 'app' ? <AppScene project={p} depth={depth} /> : <WebScene project={p} depth={depth} />}
      <span className="absolute bottom-4 left-5 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white opacity-0 backdrop-blur-xs transition-opacity duration-300 group-hover:opacity-100 sm:bottom-6 sm:left-7">
        Open <ArrowUpRight className="h-3 w-3" />
      </span>
    </motion.a>
  )
}

type Depth =
  | { nearX: MotionValue<number>; nearY: MotionValue<number>; farX: MotionValue<number>; farY: MotionValue<number> }
  | undefined

function WebScene({ project: p, depth }: { project: Project; depth: Depth }) {
  const host = new URL(p.url).host
  const d = p.detail
  const tall = d ? d.ratio < 1.2 : false
  return (
    <>
      <motion.div
        className="absolute left-[5%] top-[6%] w-[90%] sm:left-[5.5%] sm:top-[8%] sm:w-[71%]"
        style={depth ? { x: depth.nearX, y: depth.nearY } : undefined}
      >
        <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_40px_90px_-40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(0,0,0,0.08)] transition-transform duration-700 ease-out group-hover:-translate-y-1">
          <div className="flex h-6 items-center gap-1.5 border-b border-black/6 bg-[#F6F6F4] px-3 sm:h-7">
            <span className="h-[7px] w-[7px] rounded-full bg-black/10" />
            <span className="h-[7px] w-[7px] rounded-full bg-black/10" />
            <span className="h-[7px] w-[7px] rounded-full bg-black/10" />
            <span className="mx-auto pr-10 font-mono text-[9px] tracking-[0.04em] text-black/40 sm:text-[10px]">{host}</span>
          </div>
          <img src={p.image} alt={p.alt} loading="lazy" decoding="async" className="block aspect-16/10 w-full object-cover object-top" />
        </div>
      </motion.div>
      {d && (
        <motion.figure
          className={
            tall
              ? 'absolute bottom-[5%] right-[5%] w-[46%] sm:bottom-auto sm:right-[5%] sm:top-[13%] sm:w-[21%]'
              : 'absolute bottom-[5%] right-[4%] w-[82%] sm:bottom-[8%] sm:right-[4.5%] sm:w-[40%]'
          }
          style={depth ? { x: depth.farX, y: depth.farY } : undefined}
        >
          <div className="overflow-hidden rounded-[12px] bg-white shadow-[0_36px_80px_-28px_rgba(0,0,0,0.55),0_0_0_1px_rgba(0,0,0,0.08)] transition-transform duration-700 ease-out group-hover:-translate-y-2">
            <img src={d.src} alt={d.alt} loading="lazy" decoding="async" className="block w-full" style={{ aspectRatio: String(d.ratio) }} />
          </div>
        </motion.figure>
      )}
    </>
  )
}

function AppScene({ project: p, depth }: { project: Project; depth: Depth }) {
  const dark = useIsDark()
  const shots = (dark ? p.screens?.dark : p.screens?.light) ?? []
  const [left, center, right] = shots
  const phone = (src: string | undefined, alt: string) =>
    src && (
      <div className="rounded-[26px] bg-[#0B0B0B] p-[4px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] sm:rounded-[34px] sm:p-[6px]">
        <div className="overflow-hidden rounded-[22px] sm:rounded-[28px]">
          <img src={src} alt={alt} loading="lazy" decoding="async" className="block aspect-352/738 w-full object-cover object-top" />
        </div>
      </div>
    )
  return (
    <>
      <motion.div
        className="absolute left-[4%] top-[16%] w-[34%] sm:left-[24%] sm:top-[15%] sm:w-[17%]"
        style={depth ? { x: depth.farX, y: depth.farY } : undefined}
      >
        <div className="transition-transform duration-700 ease-out group-hover:-translate-y-1">{phone(left, 'The focus timer')}</div>
      </motion.div>
      <motion.div
        className="absolute right-[4%] top-[16%] w-[34%] sm:right-[24%] sm:top-[15%] sm:w-[17%]"
        style={depth ? { x: depth.farX, y: depth.farY } : undefined}
      >
        <div className="transition-transform duration-700 ease-out group-hover:-translate-y-1">{phone(right, 'The orchard')}</div>
      </motion.div>
      <motion.div
        className="absolute left-[30%] top-[8%] w-[40%] sm:left-[40.25%] sm:top-[7%] sm:w-[19.5%]"
        style={depth ? { x: depth.nearX, y: depth.nearY } : undefined}
      >
        <div className="transition-transform duration-700 ease-out group-hover:-translate-y-2">{phone(center, p.alt)}</div>
      </motion.div>
    </>
  )
}

const beats: { key: keyof Project['story']; label: string }[] = [
  { key: 'problem', label: 'The problem' },
  { key: 'call', label: 'The call' },
  { key: 'build', label: 'The build' },
  { key: 'result', label: 'Where it is' },
]

function Story({ project: p }: { project: Project }) {
  const [open, setOpen] = useState(false)
  const id = `${p.id}-story`
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="group -my-2.5 inline-flex items-center gap-2.5 py-2.5 pr-2 text-[14px] text-ink/75 transition-colors hover:text-ink"
        >
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.35, ease }}
            className="grid h-6 w-6 place-items-center rounded-full border border-ink/15 transition-colors group-hover:border-ink/40"
          >
            <Plus className="h-3 w-3" />
          </motion.span>
          {open ? 'Close' : 'The story'}
        </button>
        <div className="flex items-center gap-5 text-[13.5px]">
          <a href={p.url} target="_blank" rel="noreferrer" className="group -my-3 inline-flex items-center gap-1 px-1 py-3 text-ink/70 hover:text-ink">
            Visit
            <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-px group-hover:translate-x-px" />
          </a>
          {p.repo && (
            <a href={p.repo} target="_blank" rel="noreferrer" className="group -my-3 inline-flex items-center gap-1 px-1 py-3 text-ink/70 hover:text-ink">
              Code
              <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-px group-hover:translate-x-px" />
            </a>
          )}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.55, ease }}
            className="overflow-hidden"
          >
            <dl className="grid gap-x-10 gap-y-7 pb-2 pt-8 sm:grid-cols-2 lg:grid-cols-4">
              {beats.map((b, i) => (
                <motion.div
                  key={b.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.12 + i * 0.07, ease }}
                >
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{b.label}</dt>
                  <dd className="mt-2.5 text-[14.5px] leading-relaxed text-ink/75">{p.story[b.key]}</dd>
                </motion.div>
              ))}
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Measured, not asserted: pings once when the real check comes back.
function LiveDot({ up, replay }: { up: boolean | undefined; replay: string }) {
  if (up === undefined) return null
  return (
    <span className="inline-flex items-center gap-1.5" title={up ? 'Responding right now' : 'Not responding right now'}>
      <span className="relative inline-flex h-1.5 w-1.5">
        {up && (
          <motion.span
            key={replay}
            className="absolute inset-0 rounded-full bg-signal"
            initial={{ scale: 1, opacity: 0.55 }}
            animate={{ scale: 3.2, opacity: 0 }}
            transition={{ duration: 1.6, ease }}
          />
        )}
        <span className={`relative h-1.5 w-1.5 rounded-full ${up ? 'bg-signal' : 'border border-ink/30'}`} />
      </span>
      {up ? 'Live' : 'Down'}
    </span>
  )
}
