import { Label, Reveal, Rule } from './motion'
import { CONTAINER, GRID } from './tokens'
import { RecordPlayer } from './RecordPlayer'

const rows = [
  { label: 'Building', body: 'Think Peepal’s native app' },
  { label: 'Exploring', body: 'New AI tools, usually by building something with them' },
]

export function Currently() {
  return (
    <section id="currently" className={`${CONTAINER} pb-24 sm:pb-36`}>
      <div className={GRID}>
        <Rule />
        <div className="col-span-4 mt-5 sm:col-span-3">
          <Label>Currently</Label>
        </div>
        <div className="col-span-4 mt-8 sm:col-span-8 sm:col-start-5 sm:mt-5">
          <dl>
            {rows.map((r, i) => (
              <Reveal
                key={r.label}
                delay={i * 0.06}
                className="grid gap-1.5 border-b border-ink/[0.07] pb-5 pt-0 [&:not(:first-child)]:pt-5 sm:grid-cols-[120px_1fr] sm:gap-6"
              >
                <dt className="pt-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">{r.label}</dt>
                <dd className="text-[17px] text-ink/85">{r.body}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
        {/* Full width, so it shares both edges with the view below it. */}
        <Reveal delay={0.1} className="col-span-full mt-12 sm:mt-16">
          <RecordPlayer />
        </Reveal>
      </div>
    </section>
  )
}
