import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { WordsPullUpMultiStyle } from './animations/WordsPullUpMultiStyle'
import { MagneticButton } from './animations/MagneticButton'

const EMAIL = 'aryansaharan30@gmail.com'

export function Footer() {
  const [copied, setCopied] = useState(false)

  // Click copies the address (half of visitors have no mail client wired);
  // silent success — the label swaps inline, no toast. Clipboard failure
  // falls back to the mailto.
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      window.location.href = `mailto:${EMAIL}`
    }
  }

  return (
    <footer id="contact" className="relative overflow-hidden bg-black px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 md:pt-24 pb-28 sm:pb-32">
      <div className="bloom-warm" />
      <div className="relative max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] leading-[0.95] tracking-[-0.02em] text-center">
          <WordsPullUpMultiStyle
            segments={[
              { text: 'Find me', className: 'font-normal text-primary' },
              {
                text: 'building.',
                className: 'font-normal italic font-serif text-primary',
              },
            ]}
            stagger={0.1}
          />
        </h2>

        <div className="mt-10 sm:mt-14 flex flex-col items-center gap-6">
          <p className="text-primary/60 text-sm sm:text-base text-center max-w-xl leading-relaxed">
            If you’re building something AI-native, I’d like to hear about it.
            Open to Product, Founder’s Office, or Generalist roles.
          </p>

          <MagneticButton strength={0.25}>
            <button
              type="button"
              onClick={copyEmail}
              className="group inline-flex items-center gap-2 bg-primary text-black rounded-full pl-5 pr-1.5 py-1.5 font-bold text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <span aria-live="polite">{copied ? 'copied to clipboard' : EMAIL}</span>
              <span className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
                {copied ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                ) : (
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:translate-x-0.5 transition-transform" />
                )}
              </span>
            </button>
          </MagneticButton>
        </div>

        <div className="mt-16 sm:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-[11px] sm:text-[13px] uppercase tracking-[0.18em] sm:tracking-[0.26em] text-primary/60">
          <a
            href="https://linkedin.com/in/aryansaharan1"
            target="_blank"
            rel="noreferrer"
            className="inline-block py-2 -my-2 hover:text-primary transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="mailto:aryansaharan30@gmail.com"
            className="inline-block py-2 -my-2 hover:text-primary transition-colors"
          >
            Email
          </a>
          <a
            href="/Aryan_Saharan.pdf"
            className="inline-block py-2 -my-2 hover:text-primary transition-colors"
          >
            Resume
          </a>
          <div className="col-span-2 sm:col-span-1 text-primary/60">Gurgaon · IST</div>
        </div>

        <div className="mt-12 sm:mt-16 pt-6 border-t border-primary/5 text-[10px] sm:text-xs text-primary/60 text-center">
          © {new Date().getFullYear()} Aryan Saharan
        </div>
      </div>
    </footer>
  )
}
