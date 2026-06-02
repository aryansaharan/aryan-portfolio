import { motion } from 'framer-motion'

type Segment = { text: string; className?: string }

type Props = {
  segments: Segment[]
  className?: string
  delay?: number
  stagger?: number
}

const easeOut = [0.16, 1, 0.3, 1] as const

const wordVariant = {
  hidden: { y: 28, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.95, ease: easeOut } },
}

export function WordsPullUpMultiStyle({
  segments,
  className = '',
  delay = 0,
  stagger = 0.08,
}: Props) {
  const flat: { word: string; className?: string }[] = []
  segments.forEach((seg) => {
    seg.text.split(' ').forEach((w) => {
      if (w) flat.push({ word: w, className: seg.className })
    })
  })

  return (
    <motion.span
      className={`inline-flex flex-wrap justify-center ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {flat.map((item, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          style={{ marginRight: '0.25em' }}
        >
          <motion.span
            className={`inline-block ${item.className ?? ''}`}
            variants={wordVariant}
          >
            {item.word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}
