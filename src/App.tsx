import { Hero } from './components/Hero'
import { About } from './components/About'
import { OriginStory } from './components/OriginStory'
import { Ascend } from './components/Ascend'
import { Currently } from './components/Currently'
import { Footer } from './components/Footer'
import { Marquee } from './components/Marquee'
import { MusicPlayer } from './components/MusicPlayer'
import { IntroOverlay } from './components/IntroOverlay'
import { SmoothScroll } from './components/animations/SmoothScroll'
import { ScrollProgress } from './components/animations/ScrollProgress'

const marqueeItems = [
  'Ascend, NextLeap fellowship MVP',
  'AI-native product',
  'Engineer past, PM present',
  'Prototype before PRD',
  'Read vendor contracts',
  'Gurgaon, IST',
  "Open to Founder's Office",
  'Available for senior PM roles',
]

function App() {
  return (
    <>
      <IntroOverlay />
      <SmoothScroll />
      <ScrollProgress />
      <Hero />
      <Marquee items={marqueeItems} />
      <About />
      <OriginStory />
      <Ascend />
      <Currently />
      <Footer />
      <MusicPlayer />
    </>
  )
}

export default App
