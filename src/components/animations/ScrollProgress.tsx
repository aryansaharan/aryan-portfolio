import { motion, useScroll, useSpring } from 'framer-motion'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  })
  return (
    <motion.div
      aria-hidden
      style={{ scaleX, transformOrigin: '0 0' }}
      className="fixed top-0 left-0 right-0 h-[2px] z-[100] bg-primary"
    />
  )
}
