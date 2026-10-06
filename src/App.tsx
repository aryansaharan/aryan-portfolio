import { MotionConfig } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Work } from './components/Work'
import { Path } from './components/Path'
import { Currently } from './components/Currently'
import { SayHi } from './components/SayHi'
import { View } from './components/View'

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <main>
        <Hero />
        <Work />
        <Path />
        <Currently />
        <View />
        <SayHi />
      </main>
      <Analytics />
    </MotionConfig>
  )
}

export default App
