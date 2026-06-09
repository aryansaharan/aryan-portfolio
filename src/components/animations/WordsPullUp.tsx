import { Fragment, useState } from 'react'
import { motion } from 'framer-motion'

type Props = {
  text: string
  className?: string
  delay?: number
  stagger?: number
  showAsterisk?: boolean
}

const easeOut = [0.16, 1, 0.3, 1] as const

const wordVariant = {
  hidden: { y: 28, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.95, ease: easeOut } },
}

export function WordsPullUp({
  text,
  className = '',
  delay = 0,
  stagger = 0.08,
  showAsterisk = false,
}: Props) {
  const words = text.split(' ')
  // Clip the word only while it slides up. After the reveal settles, relax the
  // clip so tight line-heights do not shave letters (descenders, italic ascenders).
  const [revealed, setRevealed] = useState(false)

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      onAnimationComplete={() => setRevealed(true)}
    >
      {/* Real space text nodes between word spans keep textContent intact for
          copy-paste, find-in-page, and screen readers; the inline container
          renders them as the visual word gap. */}
      {words.map((word, i) => {
        const isLast = i === words.length - 1
        return (
          <Fragment key={i}>
          <span
            className={`inline-block align-bottom ${revealed ? '' : 'overflow-hidden'}`}
          >
            <motion.span
              className="inline-block relative"
              variants={wordVariant}
            >
              {word}
              {showAsterisk && isLast && (
                <motion.span
                  aria-hidden
                  className="absolute inline-block"
                  style={{
                    top: '0.65em',
                    right: '-0.3em',
                    fontSize: '0.31em',
                    transformOrigin: 'center',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  *
                </motion.span>
              )}
            </motion.span>
          </span>
          {isLast ? null : ' '}
          </Fragment>
        )
      })}
    </motion.span>
  )
}
