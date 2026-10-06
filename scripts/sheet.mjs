// Tiles screenshots into one labelled contact sheet for quick review.
// usage: node scripts/sheet.mjs out.png cols img1.png img2.png ...
import puppeteer from 'puppeteer'
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'

const [out, colsArg, ...imgs] = process.argv.slice(2)
const cols = Number(colsArg) || 3
const tiles = imgs
  .map((p) => `<figure><img src="data:image/png;base64,${readFileSync(p).toString('base64')}"><figcaption>${basename(p)}</figcaption></figure>`)
  .join('')
const html = `<html><body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;padding:6px;width:1800px;font:12px monospace;color:#ddd">
<style>figure{margin:0}img{width:100%;display:block}figcaption{padding:2px 0}</style>${tiles}</body></html>`
const browser = await puppeteer.launch({ headless: 'new', executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const page = await browser.newPage()
await page.setViewport({ width: 1812, height: 800 })
await page.setContent(html, { waitUntil: 'load' })
await page.screenshot({ path: out, fullPage: true })
await browser.close()
