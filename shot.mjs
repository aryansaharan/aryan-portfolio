import puppeteer from 'puppeteer'

const url = 'http://localhost:5173/'
const browser = await puppeteer.launch({ headless: 'new' })

async function fullPage(width, height, name) {
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
  await new Promise((r) => setTimeout(r, 2000))
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight
    for (let y = 0; y <= h; y += 400) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 80))
    }
    window.scrollTo(0, 0)
  })
  await new Promise((r) => setTimeout(r, 1500))
  await page.screenshot({ path: `/tmp/aryan-portfolio-shots/${name}.png`, fullPage: true })
  console.log(`${name} ${width}x${height} fullpage captured`)
  await page.close()
}

async function viewport(width, height, scrollY, name) {
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
  await new Promise((r) => setTimeout(r, 1500))
  await page.evaluate((y) => window.scrollTo(0, y), scrollY)
  await new Promise((r) => setTimeout(r, 1500))
  await page.screenshot({ path: `/tmp/aryan-portfolio-shots/${name}.png` })
  console.log(`${name} ${width}x${height} @ y=${scrollY} captured`)
  await page.close()
}

await fullPage(1440, 900, 'desktop-fullpage')
await fullPage(390, 844, 'mobile-fullpage')

await viewport(1440, 900, 0, 'desktop-01-hero')
await viewport(1440, 900, 900, 'desktop-02-marquee')
await viewport(1440, 900, 1800, 'desktop-03-about')
await viewport(1440, 900, 2700, 'desktop-04-features-start')
await viewport(1440, 900, 4200, 'desktop-05-features-mid')
await viewport(1440, 900, 5800, 'desktop-06-features-end')

await browser.close()
