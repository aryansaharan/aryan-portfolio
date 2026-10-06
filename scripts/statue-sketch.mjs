// Builds the light-mode statue: a graphite study generated from the icon.
//
// 1. Mask: the icon's backdrop is a flat L=9 fill, so a tight flood fill from
//    the edges separates it from the marble (even the shadowed face sits ~33).
// 2. Tone: marble highlights stay paper, shadows become graphite.
// 3. Detail: a high-pass layer darkens crevices (curls, muscle edges) like
//    pencil accents.
// 4. Strokes: anisotropic noise along two directions gives drawn texture,
//    mostly in the mid and dark tones; paper grain breaks up flat areas.
// 5. Contour: a light line where marble meets backdrop, lost in highlights.
// usage: node scripts/statue-sketch.mjs  (writes public/statue-sketch.png)
import puppeteer from 'puppeteer'
import { readFileSync, writeFileSync } from 'node:fs'

const src = 'data:image/png;base64,' + readFileSync('public/favicon.png').toString('base64')
const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
})
const page = await browser.newPage()
const out = await page.evaluate(async (src) => {
  const img = new Image()
  img.src = src
  await img.decode()
  const S = 1536
  const mk = () => {
    const c = document.createElement('canvas')
    c.width = S
    c.height = S
    return [c, c.getContext('2d', { willReadFrequently: true })]
  }
  const gray = (ctx, src2, filter) => {
    ctx.filter = filter
    ctx.drawImage(src2, 0, 0, S, S)
    ctx.filter = 'none'
    const d = ctx.getImageData(0, 0, S, S).data
    const o = new Float32Array(S * S)
    for (let i = 0; i < S * S; i++) o[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]
    return o
  }
  const [c, x] = mk()
  x.imageSmoothingQuality = 'high'
  x.drawImage(img, 0, 0, S, S)
  const d0 = x.getImageData(0, 0, S, S).data
  const A = new Float32Array(S * S)
  for (let i = 0; i < S * S; i++) A[i] = d0[i * 4 + 3] / 255
  const [, x1] = mk()
  const L = gray(x1, img, 'blur(0.6px)')
  const [, x2] = mk()
  const LB = gray(x2, img, 'blur(9px)')

  // mask
  const bg = new Uint8Array(S * S)
  const q = new Int32Array(S * S)
  let qh = 0
  let qt = 0
  const push = (i) => {
    if (!bg[i] && (L[i] < 12.5 || A[i] < 0.5)) {
      bg[i] = 1
      q[qt++] = i
    }
  }
  for (let k = 0; k < S; k++) {
    push(k)
    push(k * S)
    push(k * S + S - 1)
    push((S - 1) * S + k)
  }
  while (qh < qt) {
    const i = q[qh++]
    const y = (i / S) | 0
    const xx = i - y * S
    if (xx > 0) push(i - 1)
    if (xx < S - 1) push(i + 1)
    if (y > 0) push(i - S)
    if (y < S - 1) push(i + S)
  }
  const [mc, mx] = mk()
  const mi = mx.createImageData(S, S)
  for (let i = 0; i < S * S; i++) {
    const v = bg[i] ? 0 : 255
    mi.data[i * 4] = mi.data[i * 4 + 1] = mi.data[i * 4 + 2] = v
    mi.data[i * 4 + 3] = 255
  }
  mx.putImageData(mi, 0, 0)
  const [, sx] = mk()
  const M = gray(sx, mc, 'blur(1.4px)').map((v) => v / 255)

  const flat = (j) => bg[j] === 1 && A[j] >= 0.5
  const stone = (j) => bg[j] === 0
  // Solid stone only: a pixel needs most of its 5x5 neighbourhood to be
  // stone, so specks of backdrop noise never grow a contour of their own.
  const solid = new Uint8Array(S * S)
  for (let y = 2; y < S - 2; y++)
    for (let xx = 2; xx < S - 2; xx++) {
      const i = y * S + xx
      if (!stone(i)) continue
      let n = 0
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) n += stone(i + dy * S + dx) ? 1 : 0
      solid[i] = n >= 15 ? 1 : 0
    }
  const E = new Float32Array(S * S)
  for (let y = 1; y < S - 1; y++)
    for (let xx = 1; xx < S - 1; xx++) {
      const i = y * S + xx
      if (solid[i] && [i - 1, i + 1, i - S, i + S].some(flat)) E[i] = 1
    }

  // noise
  const hash = (x, y) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
    return s - Math.floor(s)
  }
  const vnoise = (x, y) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = x - xi
    const yf = y - yi
    const u = xf * xf * (3 - 2 * xf)
    const v = yf * yf * (3 - 2 * yf)
    const a = hash(xi, yi)
    const b = hash(xi + 1, yi)
    const c2 = hash(xi, yi + 1)
    const e = hash(xi + 1, yi + 1)
    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c2 * (1 - u) * v + e * u * v
  }
  // Long thin streaks along angle t: slow along the stroke, fast across it.
  const strokes = (x, y, t, len, w) => {
    const ct = Math.cos(t)
    const st = Math.sin(t)
    const u = x * ct + y * st
    const v = -x * st + y * ct
    return vnoise(u / len, v / w) * 0.65 + vnoise(u / (len * 0.5), v / (w * 0.6) + 17) * 0.35
  }

  const o = x.createImageData(S, S)
  for (let y = 1; y < S - 1; y++)
    for (let xx = 1; xx < S - 1; xx++) {
      const i = y * S + xx
      const m = M[i]
      if (m < 0.01) continue
      const lum = Math.max(0, Math.min(1, (L[i] - 24) / (238 - 24)))
      // tone: highlights to paper, a long soft shoulder into the shadows
      let g = Math.pow(1 - lum, 1.55) * 0.92
      // detail: crevices darker than their surroundings read as accents
      const hp = (LB[i] - L[i]) / 255
      g += Math.max(0, hp) * 1.6 - Math.max(0, -hp) * 0.35
      g = Math.max(0, Math.min(1, g)) * m * (solid[i] || m > 0.9 ? 1 : 0.4)
      // drawn texture: one direction everywhere, a cross direction in shadow
      const s1 = strokes(xx, y, 0.62, 46, 1.35)
      const s2 = strokes(xx, y, -0.78, 38, 1.2)
      let ink = g * (0.62 + 0.62 * s1)
      if (g > 0.5) ink += (g - 0.5) * 0.7 * s2
      // contour, lost where the marble is lit
      ink += E[i] * (0.32 + 0.22 * vnoise(xx / 11, y / 11)) * (1 - lum * 0.8)
      // paper tooth
      ink *= 0.84 + 0.16 * hash(xx * 0.7, y * 1.3)
      const a = Math.max(0, Math.min(1, ink)) * 0.92
      o.data[i * 4] = 34
      o.data[i * 4 + 1] = 32
      o.data[i * 4 + 2] = 30
      o.data[i * 4 + 3] = a * 255
    }
  x.putImageData(o, 0, 0)
  return c.toDataURL('image/png')
}, src)
writeFileSync('public/statue-sketch.png', Buffer.from(out.split(',')[1], 'base64'))
await browser.close()
console.log('wrote public/statue-sketch.png')
