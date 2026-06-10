import { WordsPullUpMultiStyle } from './animations/WordsPullUpMultiStyle'

export function OriginStory() {
  return (
    <section className="relative bg-black py-20 sm:py-28 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="bloom-indigo" />
      <div className="relative max-w-5xl mx-auto">
        <div className="text-primary text-[11px] sm:text-[13px] uppercase tracking-[0.28em] font-medium text-center mb-6 sm:mb-8">
          Origin
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] xl:text-5xl leading-[1.05] tracking-[-0.01em] text-center max-w-4xl mx-auto">
          <WordsPullUpMultiStyle
            segments={[
              {
                text: 'Two and a half years ago, I was writing backend code.',
                className: 'font-normal text-primary',
              },
              {
                text: 'Now I build the product.',
                className: 'font-normal italic font-serif text-primary',
              },
            ]}
            stagger={0.05}
          />
        </h2>

        <p className="mt-10 sm:mt-14 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed text-center text-primary/70">
          Same instinct, different title. I trust a prototype over a pitch, mostly
          because I’ve shipped a few that didn’t survive contact with a real user.
        </p>
      </div>
    </section>
  )
}
