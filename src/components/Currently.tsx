const items = [
  {
    label: 'Building',
    lines: ['Shipping AI Roleplay at Lyearn', 'Voice roleplay personas, end to end'],
  },
  {
    label: 'Reading',
    lines: ['The Mom Test, again', 'Latent Space on voice agents'],
  },
  {
    label: 'Brewing',
    lines: ['An essay: prototype before PRD', 'Founder’s Office applications'],
  },
  {
    label: 'Listening to',
    lines: ['Fred again.., on repeat', 'the way he builds whole songs out of voice notes'],
  },
]

export function Currently() {
  return (
    <section className="relative bg-black py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="bloom-teal" />
      <div className="absolute inset-0 bg-noise opacity-[0.08] pointer-events-none" />
      <div className="relative max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div className="text-primary text-[11px] sm:text-[13px] uppercase tracking-[0.28em] font-medium">
            Currently
          </div>
          <div className="text-primary/60 text-[11px] sm:text-[13px] uppercase tracking-[0.28em]">
            June 2026
          </div>
        </div>

        <ul className="space-y-6 sm:space-y-8">
          {items.map((item) => (
            <li
              key={item.label}
              className="grid grid-cols-12 gap-4 items-start border-b border-primary/5 pb-6 sm:pb-8 last:border-0"
            >
              <div className="col-span-12 sm:col-span-4 text-primary/60 text-sm sm:text-base font-serif italic">
                {item.label}
              </div>
              <div className="col-span-12 sm:col-span-8 flex flex-col gap-1 text-base sm:text-lg md:text-xl text-primary leading-snug">
                {item.lines.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            </li>
          ))}
        </ul>

      </div>
    </section>
  )
}
