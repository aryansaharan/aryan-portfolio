// Renders public/og.png (the link-preview card) from the site's own parts:
// the marble statue under a spotlight, the name, the role. 1200x630 @2x.
// usage: node scripts/og.mjs
import puppeteer from 'puppeteer'
import { readFileSync } from 'node:fs'
const marble = 'data:image/png;base64,' + readFileSync('public/favicon.png').toString('base64')
const html = `<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@400..700&family=Martian+Mono:wdth,wght@87.5,400&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;width:1200px;height:630px;background:#090909;overflow:hidden}
  .stage{position:absolute;right:40px;top:-10px;width:640px;height:640px;
    -webkit-mask-image:radial-gradient(112% 88% at 50% 30%,#000 50%,transparent 76%)}
  .stage img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}
  .dim{opacity:.24}
  .lit{-webkit-mask-image:radial-gradient(circle at 46% 36%,#000 0%,rgba(0,0,0,.85) 13%,rgba(0,0,0,.3) 29%,transparent 44%)}
  .copy{position:absolute;left:84px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;color:#ECECEA}
  .now{font:400 15px/1 'Martian Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:#969694;display:flex;align-items:center;gap:12px}
  .dot{width:9px;height:9px;border-radius:50%;background:#FF4F1F}
  h1{font:600 104px/0.96 'Host Grotesk',sans-serif;letter-spacing:-.04em;margin:28px 0 0}
  .role{margin-top:26px;font:400 17px/1 'Martian Mono',monospace;letter-spacing:.18em;text-transform:uppercase;color:#BDBDBB}
  .url{position:absolute;left:84px;bottom:52px;font:400 14px/1 'Martian Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:#6f6f6d}
  .fig{position:absolute;right:84px;bottom:52px;font:400 13px/1 'Martian Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:#6f6f6d}
</style></head><body>
<div class="stage"><img class="dim" src="${marble}"><img class="lit" src="${marble}"></div>
<div class="copy"><div class="now"><span class="dot"></span>Now building Think Peepal</div>
<h1>Aryan<br>Saharan</h1><div class="role">Technical product manager</div></div>
<div class="url">aryansaharan.vercel.app</div><div class="fig">Fig. 1 · Shipped in marble</div>
</body></html>`
const b = await puppeteer.launch({ headless: 'new', executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const p = await b.newPage()
await p.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 })
await p.setContent(html, { waitUntil: 'networkidle0' })
await p.evaluate(() => document.fonts.ready)
await p.screenshot({ path: 'public/og.png' })
await b.close()
console.log('wrote public/og.png')
