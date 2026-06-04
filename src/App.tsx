import { Hero } from './components/Hero'
import { About } from './components/About'
import { OriginStory } from './components/OriginStory'
import { Ascend } from './components/Ascend'
import { Currently } from './components/Currently'
import { Footer } from './components/Footer'
import { Marquee } from './components/Marquee'
import { MusicPlayer } from './components/MusicPlayer'
import { SmoothScroll } from './components/animations/SmoothScroll'
import { ScrollProgress } from './components/animations/ScrollProgress'
import { CustomCursor } from './components/animations/CustomCursor'

const marqueeItems = [
  'Still ships code on weekends',
  'Reads the contract, not the summary',
  'Prototypes it before it has a name',
  'Picks the vendor by stress-testing the API',
  'Engineer past, PM present',
  'Gurgaon, IST',
]

function App() {
  return (
    <>
      <SmoothScroll />
      <ScrollProgress />
      <CustomCursor />
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
