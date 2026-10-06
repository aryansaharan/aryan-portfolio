// Section-by-section review captures at 2x: every section and plate, in
// light, dark and on a phone. usage: node scripts/audit.mjs [outDir]
import puppeteer from 'puppeteer'
import { mkdirSync } from 'node:fs'
const out = process.argv[2] ?? '/tmp/audit'
mkdirSync(out, { recursive: true })
const browser = await puppeteer.launch({ headless: 'new', executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const targets = [
  ['hero', '#top', 'start'],
  ['tp', 'a[aria-label="Open Think Peepal"]', 'center'],
  ['prod', 'a[aria-label="Open Prod AI"]', 'center'],
  ['trial', 'a[aria-label="Open Trial Shift"]', 'center'],
  ['ilumos', 'a[aria-label="Open iLumos"]', 'center'],
  ['ascend', 'a[aria-label="Open Ascend"]', 'center'],
  ['also', '#path', 'end'],
  ['path', '#path', 'start'],
  ['currently', '#currently', 'start'],
  ['view', 'section[aria-label="The view"]', 'center'],
  ['hi', '#hi', 'start'],
]
async function run(tag, w, h, scheme, dpr) {
  const p = await browser.newPage()
  await p.setViewport({ width: w, height: h, deviceScaleFactor: dpr })
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }])
  await p.evaluateOnNewDocument(() => localStorage.clear())
  p.on('pageerror', (e) => console.log(tag, 'pageerror', e.message))
  p.on('console', (m) => m.type() === 'error' && console.log(tag, 'console', m.text()))
  p.on('requestfailed', (r) => console.log(tag, 'requestfailed', r.url()))
  await p.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
  await wait(3600)
  for (const [name, sel, block] of targets) {
    await p.evaluate((sel, block) => {
      const el = document.querySelector(sel)
      if (block === 'end') window.scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight + 40)
      else el.scrollIntoView({ block })
    }, sel, block)
    await wait(1700)
    await p.screenshot({ path: `${out}/${tag}-${name}.png` })
  }
  await p.close()
}
await run('l', 1440, 900, 'light', 1)
await run('d', 1440, 900, 'dark', 1)
await run('m', 390, 844, 'light', 1)
await run('md', 390, 844, 'dark', 1)
await browser.close()
console.log('done', out)
