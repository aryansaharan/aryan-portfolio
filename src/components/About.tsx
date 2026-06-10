import { WordsPullUpMultiStyle } from './animations/WordsPullUpMultiStyle'

const bodyText =
  'Engineer by training, PM at Lyearn now. I like the part where it doesn’t work yet.'

export function About() {
  return (
    <section className="relative overflow-hidden bg-black py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="bloom-amber" />
      <div className="relative bg-surface max-w-6xl mx-auto rounded-2xl md:rounded-[2rem] py-12 sm:py-16 md:py-20 px-6 sm:px-10 md:px-16 text-center">
        <div className="text-primary text-[11px] sm:text-[13px] uppercase tracking-[0.28em] font-medium mb-6 sm:mb-8">
          About
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl max-w-3xl mx-auto leading-[0.95] sm:leading-[0.9]">
          <WordsPullUpMultiStyle
            segments={[
              { text: 'I am Aryan Saharan.', className: 'font-normal' },
              {
                text: 'I model the domain before I draw the screens.',
                className: 'italic font-serif font-normal',
              },
            ]}
          />
        </h2>

        {/* Body text is still: reading is not a cinematic experience. */}
        <p className="mt-10 sm:mt-14 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed text-primary">
          {bodyText}
        </p>
      </div>
    </section>
  )
}
