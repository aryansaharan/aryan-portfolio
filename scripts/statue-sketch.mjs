// Builds the light-mode statue: a graphite study generated from the icon.
// - Mask: the icon's backdrop is a flat L=9 fill, flooded from the edges;
//   an opening pass drops specks so no stray contour bits survive.
// - Tone: sharpened luminance plus a mid-frequency "form" band, so the back
//   reads drawn rather than upscaled; crevices get pressed-pencil accents.
// - Strokes bend gently over the form; cross-hatching only in shadow.
// - A thin contour, broken and lost where the stone is lit.
// - The rim trails off (strokes drop out) instead of ending in the tile's
//   straight cut.
// usage: npm run sketch   (writes public/statue-sketch.webp via cwebp)
import puppeteer from 'puppeteer'
import { readFileSync, writeFileSync } from 'node:fs'
const OUT = process.argv[2] ?? 'public/statue-sketch.png'
const P = JSON.parse(process.argv[3] ?? '{}')
const src = 'data:image/png;base64,' + readFileSync('public/favicon.png').toString('base64')
const browser = await puppeteer.launch({ headless: 'new', executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const page = await browser.newPage()
const out = await page.evaluate(async (src, P) => {
  const cfg = Object.assign({ S: 2048, sharpen: 0.8, form: 0.95, crevice: 1.6, warp: 18, gamma: 1.68, cap: 0.88, len: 52, w: 1.25, contour: 0.42, sbase: 0.55, samp: 0.75, slo: 0.15, shi: 0.85, cross: 0.6, rim0: 0.86, rim1: 1.16 }, P)
  const img = new Image(); img.src = src; await img.decode()
  const S = cfg.S, k = S / 1536
  const mk = () => { const c = document.createElement('canvas'); c.width = S; c.height = S; return [c, c.getContext('2d', { willReadFrequently: true })] }
  const gray = (srcEl, filter) => { const [, ctx] = mk(); ctx.imageSmoothingQuality = 'high'; ctx.filter = filter; ctx.drawImage(srcEl, 0, 0, S, S); const d = ctx.getImageData(0, 0, S, S).data; const o = new Float32Array(S * S); for (let i = 0; i < S * S; i++) o[i] = (0.299 * d[i*4] + 0.587 * d[i*4+1] + 0.114 * d[i*4+2]) / 255; return o }
  const [, x0] = mk(); x0.imageSmoothingQuality = 'high'; x0.drawImage(img, 0, 0, S, S); const d0 = x0.getImageData(0, 0, S, S).data
  const A = new Float32Array(S * S); for (let i = 0; i < S * S; i++) A[i] = d0[i*4+3] / 255
  const L0 = gray(img, `blur(${0.7 * k}px)`), L1 = gray(img, `blur(${2.6 * k}px)`), LM = gray(img, `blur(${7 * k}px)`), LB = gray(img, `blur(${18 * k}px)`)
  // mask: flood the flat backdrop (L≈9/255) from the edges
  const bg = new Uint8Array(S * S), q = new Int32Array(S * S); let qh = 0, qt = 0
  const push = (i) => { if (!bg[i] && (L0[i] < 12.5 / 255 || A[i] < 0.5)) { bg[i] = 1; q[qt++] = i } }
  for (let t = 0; t < S; t++) { push(t); push(t*S); push(t*S+S-1); push((S-1)*S+t) }
  while (qh < qt) { const i = q[qh++], y = (i / S) | 0, x = i - y * S; if (x > 0) push(i-1); if (x < S-1) push(i+1); if (y > 0) push(i-S); if (y < S-1) push(i+S) }
  // opening: drop stone specks thinner than ~4px, then regrow
  const r = Math.round(2 * k), stone = new Uint8Array(S * S), er = new Uint8Array(S * S), op = new Uint8Array(S * S)
  for (let i = 0; i < S * S; i++) stone[i] = bg[i] ? 0 : 1
  for (let y = r; y < S - r; y++) for (let x = r; x < S - r; x++) { let ok = 1; for (let dy = -r; dy <= r && ok; dy++) for (let dx = -r; dx <= r; dx++) if (!stone[(y+dy)*S+x+dx]) { ok = 0; break } er[y*S+x] = ok }
  for (let y = r; y < S - r; y++) for (let x = r; x < S - r; x++) { if (!stone[y*S+x]) continue; let any = 0; for (let dy = -r; dy <= r && !any; dy++) for (let dx = -r; dx <= r; dx++) if (er[(y+dy)*S+x+dx]) { any = 1; break } op[y*S+x] = any }
  const [mc, mx] = mk(); const mi = mx.createImageData(S, S)
  for (let i = 0; i < S * S; i++) { const v = op[i] ? 255 : 0; mi.data[i*4] = mi.data[i*4+1] = mi.data[i*4+2] = v; mi.data[i*4+3] = 255 }
  mx.putImageData(mi, 0, 0)
  const M = gray(mc, `blur(${1.2 * k}px)`), MS = gray(mc, `blur(${2.2 * k}px)`)
  // noise
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s) }
  const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf*xf*(3-2*xf), v = yf*yf*(3-2*yf); return hash(xi,yi)*(1-u)*(1-v) + hash(xi+1,yi)*u*(1-v) + hash(xi,yi+1)*(1-u)*v + hash(xi+1,yi+1)*u*v }
  const strokes = (x, y, t, len, w, bend) => { const ct = Math.cos(t), st = Math.sin(t); const u = x * ct + y * st, v = -x * st + y * ct + bend; return vn(u / len, v / w) * 0.62 + vn(u / (len * 0.45), v / (w * 0.55) + 17) * 0.38 }
  const sm = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t) }
  const o = x0.createImageData(S, S)
  for (let y = 1; y < S - 1; y++) for (let x = 1; x < S - 1; x++) {
    const i = y * S + x, m = M[i]
    if (m < 0.01) continue
    // organic rim: strokes thin and drop out toward the edge of the study
    const dx = (x / S - 0.5) / 0.47, dy = (y / S - 0.34) / 0.64, rr = Math.sqrt(dx*dx + dy*dy)
    const rim = 1 - sm(cfg.rim0, cfg.rim1, rr + (vn(x / (40*k), y / (40*k)) - 0.5) * 0.14)
    if (rim <= 0.001) continue
    // tone: sharpened luminance plus a mid-frequency band that models the forms
    let l = L0[i] + (L0[i] - L1[i]) * cfg.sharpen + (L1[i] - LM[i]) * cfg.form * 0.5 + (LM[i] - LB[i]) * cfg.form * 0.5
    l = Math.max(0, Math.min(1, (l - 0.094) / 0.84))
    let g = Math.pow(1 - l, cfg.gamma) * cfg.cap
    // crevices (curls, muscle edges) a touch darker, like pressed pencil accents
    g += Math.max(0, L1[i] - L0[i]) * cfg.crevice
    g = Math.max(0, Math.min(1, g)) * m
    // strokes bend over the form
    const bend = LB[i] * cfg.warp * k
    const s1 = strokes(x, y, 0.62, cfg.len * k, cfg.w * k, bend)
    const s2 = strokes(x, y, -0.8, cfg.len * 0.8 * k, cfg.w * 0.95 * k, bend * 0.7)
    let ink = g * (cfg.sbase + cfg.samp * (cfg.shi > cfg.slo ? (Math.max(0, Math.min(1, (s1 - cfg.slo) / (cfg.shi - cfg.slo)))) : s1))
    if (g > 0.5) ink += (g - 0.5) * cfg.cross * s2
    // stroke drop-out near the rim (the drawing trails off, it isn't faded)
    ink *= sm(0.0, 0.6, rim + (s1 - 0.5) * 0.25)
    // thin, broken contour from the smoothed mask, lost where the stone is lit
    const ex = MS[i + 1] - MS[i - 1], ey = MS[i + S] - MS[i - S]
    const edge = Math.min(1, Math.hypot(ex, ey) * 1.6)
    const gap = sm(0.32, 0.6, vn(x / (26*k), y / (26*k)))
    ink = Math.max(ink, edge * cfg.contour * gap * (0.35 + 0.65 * Math.pow(1 - l, 0.8)) * rim)
    // paper tooth
    ink *= 0.86 + 0.14 * hash(x * 0.7, y * 1.3)
    const a = Math.max(0, Math.min(1, ink)) * 0.94
    o.data[i*4] = 33; o.data[i*4+1] = 31; o.data[i*4+2] = 30; o.data[i*4+3] = a * 255
  }
  x0.putImageData(o, 0, 0)
  return x0.canvas.toDataURL('image/png')
}, src, P)
writeFileSync(OUT, Buffer.from(out.split(',')[1], 'base64'))
await browser.close()
console.log('wrote', OUT)
