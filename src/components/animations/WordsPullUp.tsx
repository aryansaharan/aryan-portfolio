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

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {words.map((word, i) => {
        const isLast = i === words.length - 1
        return (
          <span
            key={i}
            className="inline-block overflow-hidden align-bottom"
            style={{ marginRight: '0.25em' }}
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
        )
      })}
    </motion.span>
  )
}
