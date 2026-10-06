import { useEffect, useState } from 'react'

const fmt = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

/** The time where I am (IST), refreshed often enough to turn over on the minute. */
export function useClock(): string {
  const [now, setNow] = useState(() => fmt.format(new Date()))
  useEffect(() => {
    const t = setInterval(() => setNow(fmt.format(new Date())), 10_000)
    return () => clearInterval(t)
  }, [])
  return now.toUpperCase()
}
