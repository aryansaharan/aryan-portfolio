import { motion, useTransform, type MotionValue } from 'framer-motion'

type Props = {
  char: string
  index: number
  total: number
  progress: MotionValue<number>
}

export function AnimatedLetter({ char, index, total, progress }: Props) {
  const charProgress = index / total
  const opacity = useTransform(
    progress,
    [Math.max(0, charProgress - 0.1), Math.min(1, charProgress + 0.05)],
    [0.2, 1],
  )

  if (char === ' ') return <span> </span>

  return (
    <motion.span style={{ opacity }} className="inline-block">
      {char}
    </motion.span>
  )
}
