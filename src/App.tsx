import { MotionConfig } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { OriginStory } from './components/OriginStory'
import { Ascend } from './components/Ascend'
import { Currently } from './components/Currently'
import { Footer } from './components/Footer'
import { Marquee } from './components/Marquee'
import { MusicPlayer } from './components/MusicPlayer'
import { SmoothScroll } from './components/animations/SmoothScroll'
import { CustomCursor } from './components/animations/CustomCursor'

const marqueeItems = [
  'Engineer turned PM',
  'AI-native product',
  'Prototype before PRD',
  '28°N, 77°E · IST',
]

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <CustomCursor />
      <main>
        <Hero />
        <Marquee items={marqueeItems} />
        <About />
        <OriginStory />
        <Ascend />
        <Currently />
      </main>
      <Footer />
      <MusicPlayer />
      <Analytics />
    </MotionConfig>
  )
}

export default App
