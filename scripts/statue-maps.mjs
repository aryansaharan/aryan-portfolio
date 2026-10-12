// Builds the statue's textures from assets-raw/statue/marble.png.
//   graphite  the light-mode study, drawn stroke by stroke like a pencil
//             drawing: line work first, then hatching in layers, the head
//             finished and the back left loose. Alpha is the graphite; RGB
//             holds when each stroke is laid down, so the page can replay it.
//   relief    the dark-mode stone: RGB is a surface normal (a rounded body
//             plus the carved detail), alpha is the statue's silhouette.
// usage: npm run statue   (writes public/statue-graphite.webp, statue-relief.webp)
//        node scripts/statue-maps.mjs --preview   (also writes /tmp previews)
import puppeteer from 'puppeteer'
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const preview = process.argv.includes('--preview')
const src = 'data:image/png;base64,' + readFileSync('assets-raw/statue/marble.png').toString('base64')
const browser = await puppeteer.launch({ headless: 'new' })
const page = await browser.newPage()
page.on('console', (m) => console.log('  page:', m.text()))

const out = await page.evaluate(async (src) => {
  const img = new Image()
  img.src = src
  await img.decode()
  const N = 1024 // analysis
  const S = 2048 // drawing
  const K = S / N

  // ---------- fields ----------
  const canvas = (w) => {
    const c = document.createElement('canvas')
    c.width = c.height = w
    return [c, c.getContext('2d', { willReadFrequently: true })]
  }
  const [, sx] = canvas(N)
  sx.imageSmoothingQuality = 'high'
  sx.drawImage(img, 0, 0, N, N)
  const px = sx.getImageData(0, 0, N, N).data
  const L = new Float32Array(N * N)
  const A = new Float32Array(N * N)
  for (let i = 0; i < N * N; i++) {
    L[i] = (0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]) / 255
    A[i] = px[i * 4 + 3] / 255
  }

  // separable box blur x3 ~ gaussian
  const boxPass = (a, r) => {
    const t = new Float32Array(N * N)
    const o = new Float32Array(N * N)
    const w = 2 * r + 1
    for (let y = 0; y < N; y++) {
      let s = 0
      const row = y * N
      for (let x = -r; x <= r; x++) s += a[row + Math.min(N - 1, Math.max(0, x))]
      for (let x = 0; x < N; x++) {
        t[row + x] = s / w
        s += a[row + Math.min(N - 1, x + r + 1)] - a[row + Math.max(0, x - r)]
      }
    }
    for (let x = 0; x < N; x++) {
      let s = 0
      for (let y = -r; y <= r; y++) s += t[Math.min(N - 1, Math.max(0, y)) * N + x]
      for (let y = 0; y < N; y++) {
        o[y * N + x] = s / w
        s += t[Math.min(N - 1, y + r + 1) * N + x] - t[Math.max(0, y - r) * N + x]
      }
    }
    return o
  }
  const blur = (a, sigma) => {
    if (sigma < 0.5) return a
    const r = Math.max(1, Math.round((Math.sqrt(4 * sigma * sigma + 1) - 1) / 2))
    return boxPass(boxPass(boxPass(a, r), r), r)
  }
  const sm = (a, b, v) => {
    const t = Math.max(0, Math.min(1, (v - a) / (b - a)))
    return t * t * (3 - 2 * t)
  }
  const clamp = (v) => Math.max(0, Math.min(1, v))
  const hash = (x, y) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
    return s - Math.floor(s)
  }
  const vn = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
    return hash(xi, yi) * (1 - u) * (1 - v) + hash(xi + 1, yi) * u * (1 - v) + hash(xi, yi + 1) * (1 - u) * v + hash(xi + 1, yi + 1) * u * v
  }
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

  // Silhouette: flood the flat dark backdrop from the edges, then open.
  const bg = new Uint8Array(N * N)
  const q = new Int32Array(N * N)
  let qh = 0, qt = 0
  const L1 = blur(L, 1)
  const push = (i) => {
    if (!bg[i] && (L1[i] < 0.075 || A[i] < 0.5)) { bg[i] = 1; q[qt++] = i }
  }
  for (let t = 0; t < N; t++) { push(t); push(t * N); push(t * N + N - 1); push((N - 1) * N + t) }
  while (qh < qt) {
    const i = q[qh++], y = (i / N) | 0, x = i - y * N
    if (x > 0) push(i - 1)
    if (x < N - 1) push(i + 1)
    if (y > 0) push(i - N)
    if (y < N - 1) push(i + N)
  }
  let M = new Float32Array(N * N)
  for (let i = 0; i < N * N; i++) M[i] = bg[i] ? 0 : 1
  // open: erode then dilate by blurring and thresholding
  M = blur(M, 2).map((v) => (v > 0.85 ? 1 : 0))
  M = blur(M, 2).map((v) => (v > 0.15 ? 1 : 0))
  const Ms = blur(M, 1.2)
  // the tile's rounded corners also cut the shoulders: treat alpha as a hard stop
  for (let i = 0; i < N * N; i++) Ms[i] *= sm(0.4, 0.9, A[i])

  // Tone with local contrast, so the forms read at drawing scale.
  const Lb1 = blur(L, 0.8), Lb4 = blur(L, 4), Lb14 = blur(L, 14), Lb40 = blur(L, 40)
  const T = new Float32Array(N * N)
  for (let i = 0; i < N * N; i++) {
    let l = Lb1[i] + (Lb1[i] - Lb4[i]) * 0.35 + (Lb4[i] - Lb14[i]) * 0.55 + (Lb14[i] - Lb40[i]) * 0.5
    l = clamp((l - 0.1) / 0.72)
    T[i] = Math.pow(1 - l, 1.35)
  }

  // Finish: the head is rendered, the back is left as a loose study.
  const F = new Float32Array(N * N)
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = (x / N - 0.43) / 0.95, dy = (y / N - 0.3) / 0.62
    const d = Math.sqrt(dx * dx + dy * dy)
    F[y * N + x] = 0.22 + 0.78 * (1 - sm(0.2, 0.62, d + (vn(x / 60, y / 60) - 0.5) * 0.12))
  }
  // Down the back the photo is soft, so the study doesn't copy its blur: the
  // shadows are blocked in as clean shapes (three values) and hatched.
  const Tb = blur(T, 3)
  const TQ = new Float32Array(N * N)
  for (let i = 0; i < N * N; i++) {
    const v = Tb[i]
    const q = 0.2 + 0.28 * sm(0.36, 0.42, v) + 0.24 * sm(0.55, 0.6, v) + 0.2 * sm(0.72, 0.77, v)
    const w = sm(0.45, 0.85, F[i])
    TQ[i] = (v < 0.18 ? v : q) * (1 - w) + T[i] * w
  }

  // Rim: the drawing trails off toward the cut of the tile.
  const R = new Float32Array(N * N)
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = (x / N - 0.5) / 0.48, dy = (y / N - 0.33) / 0.66
    const rr = Math.sqrt(dx * dx + dy * dy) + (vn(x / 36, y / 36) - 0.5) * 0.16
    R[y * N + x] = 1 - sm(0.8, 1.12, rr)
  }

  // Orientation: structure tensor, so strokes can turn with the curls.
  const Lo = blur(L, 2.2)
  const J11 = new Float32Array(N * N), J12 = new Float32Array(N * N), J22 = new Float32Array(N * N)
  for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
    const i = y * N + x
    const gx = (Lo[i + 1] - Lo[i - 1]) / 2, gy = (Lo[i + N] - Lo[i - N]) / 2
    J11[i] = gx * gx; J12[i] = gx * gy; J22[i] = gy * gy
  }
  const j11 = blur(J11, 7), j12 = blur(J12, 7), j22 = blur(J22, 7)
  const ISO = new Float32Array(N * N), COH = new Float32Array(N * N)
  let cmax = 0
  for (let i = 0; i < N * N; i++) {
    const a = j11[i], b = j12[i], c = j22[i]
    ISO[i] = 0.5 * Math.atan2(2 * b, a - c) + Math.PI / 2
    const tr = a + c
    COH[i] = tr > 1e-7 ? Math.sqrt((a - c) * (a - c) + 4 * b * b) / tr : 0
    // weak gradients carry no direction worth following
    COH[i] *= sm(0.000004, 0.00008, tr)
    if (COH[i] > cmax) cmax = COH[i]
  }
  console.log('coherence max', cmax.toFixed(3))
  const at = (f, x, y) => f[Math.min(N - 1, Math.max(0, y | 0)) * N + Math.min(N - 1, Math.max(0, x | 0))]

  // Sweep: where the hand goes first (the head), then down the shoulders.
  const sweep = (x, y) => clamp(Math.hypot((x / N - 0.42) * 1.0, (y / N - 0.27) * 1.25) / 0.78)

  // ---------- drawing ----------
  const [ic, ix] = canvas(S) // ink, accumulated in alpha
  const [tc, tx] = canvas(S) // first-touch time, kept with 'darken'
  tx.fillStyle = '#fff'
  tx.fillRect(0, 0, S, S)
  tx.globalCompositeOperation = 'darken'
  ix.fillStyle = '#000'

  const BASE = -0.98 // '/' hatching, the hand's natural diagonal
  const dirAt = (x, y, base, follow) => {
    const iso = at(ISO, x, y), w = at(COH, x, y) * follow
    // blend on doubled angles so 0 and pi agree
    const cx = Math.cos(2 * base) * (1 - w) + Math.cos(2 * iso) * w
    const cy = Math.sin(2 * base) * (1 - w) + Math.sin(2 * iso) * w
    return 0.5 * Math.atan2(cy, cx)
  }
  let strokes = 0
  const stroke = (x, y, ang0, len, wid, alpha, base, follow, time, tau) => {
    // walk the field both ways from the centre: a stroke that bends with the form
    const pts = [[x, y]]
    for (const sgn of [1, -1]) {
      let px = x, py = y, a = ang0, dx0 = Math.cos(ang0) * sgn, dy0 = Math.sin(ang0) * sgn
      for (let s = 0; s < 3; s++) {
        a = dirAt(px, py, base, follow)
        let dx = Math.cos(a), dy = Math.sin(a)
        if (dx * dx0 + dy * dy0 < 0) { dx = -dx; dy = -dy }
        const nx = px + (dx * len) / 6, ny = py + (dy * len) / 6
        // lift the pencil where the tone (or the stone) runs out
        if (at(Ms, nx, ny) < 0.5 || at(TQ, nx, ny) < tau - 0.03) break
        px = nx; py = ny
        dx0 = dx; dy0 = dy
        if (sgn > 0) pts.push([px, py]); else pts.unshift([px, py])
      }
    }
    // tapered body: pressure rises and falls along the stroke
    const left = [], right = []
    const n = pts.length
    for (let k = 0; k < n; k++) {
      const p = pts[k], a = pts[Math.max(0, k - 1)], b = pts[Math.min(n - 1, k + 1)]
      let tx_ = b[0] - a[0], ty_ = b[1] - a[1]
      const tl = Math.hypot(tx_, ty_) || 1
      tx_ /= tl; ty_ /= tl
      const u = k / (n - 1)
      const w = (wid / 2) * Math.pow(Math.sin(Math.PI * (0.06 + 0.88 * u)), 0.7)
      left.push([(p[0] - ty_ * w) * K, (p[1] + tx_ * w) * K])
      right.push([(p[0] + ty_ * w) * K, (p[1] - tx_ * w) * K])
    }
    const path = new Path2D()
    path.moveTo(left[0][0], left[0][1])
    for (let k = 1; k < n; k++) path.lineTo(left[k][0], left[k][1])
    for (let k = n - 1; k >= 0; k--) path.lineTo(right[k][0], right[k][1])
    path.closePath()
    ix.globalAlpha = alpha
    ix.fill(path)
    const g = Math.round(clamp(time) * 254)
    tx.fillStyle = `rgb(${g},${g},${g})`
    tx.fill(path)
    strokes++
  }

  // Hatching layers, light to dark: rows of parallel strokes, the way a hand
  // hatches, each layer only where the tone asks for it.
  const layers = [
    { tau: 0.14, ang: BASE, len: 17, wid: 1.15, a: 0.3, row: 3.3, follow: 0.5, t0: 0.3 },
    { tau: 0.42, ang: BASE + 0.66, len: 13, wid: 1.05, a: 0.3, row: 3.0, follow: 0.45, t0: 0.5 },
    { tau: 0.66, ang: BASE - 0.3, len: 10, wid: 1.0, a: 0.3, row: 2.7, follow: 0.6, t0: 0.66 },
  ]
  const D = N * 0.72
  for (let li = 0; li < layers.length; li++) {
    const ly = layers[li]
    const c = Math.cos(ly.ang), s = Math.sin(ly.ang)
    let row = 0
    for (let v = -D; v < D; v += ly.row * (0.85 + rnd() * 0.3)) {
      const odd = row++ % 2 === 1
      let u = -D + rnd() * ly.len
      while (u < D) {
        const len0 = ly.len * (0.7 + rnd() * 0.6)
        const x = N / 2 + c * u - s * v, y = N / 2 + s * u + c * v
        u += len0 * (1.08 + rnd() * 0.4)
        if (x < 1 || y < 1 || x >= N - 1 || y >= N - 1) continue
        if (at(Ms, x, y) < 0.5) continue
        const f = at(F, x, y), r = at(R, x, y)
        // the loose back is hatched in open, longer lines
        if (odd && f < 0.5 + (vn(x / 50, y / 50) - 0.5) * 0.2) continue
        // loose areas keep the strokes but drop the darkest layer and thin out
        if (li >= 2 && rnd() > f) continue
        if (r < 0.3 + rnd() * 0.35 || rnd() > 0.6 + 0.4 * f) continue
        const t = at(TQ, x, y) + (rnd() - 0.5) * 0.04
        const strength = sm(ly.tau, ly.tau + 0.12, t)
        if (strength <= 0.03) continue
        const len = len0 * (1 + (1 - f) * 1.9)
        const follow = ly.follow * (0.4 + 0.6 * f)
        // the loose back is hatched one way; cross-hatching is for the finished head
        const base = BASE + (ly.ang - BASE) * Math.pow(f, 1.6)
        const ang = dirAt(x, y, base, follow) + (rnd() - 0.5) * 0.08
        const time = ly.t0 + sweep(x, y) * 0.3 + rnd() * 0.05
        const alpha = ly.a * strength * (1.2 - 0.5 * f) * (0.75 + rnd() * 0.5)
        stroke(x, y, ang, len, ly.wid * (0.85 + rnd() * 0.3) * (1 + (1 - f) * 0.25), alpha, base, follow, time, ly.tau)
      }
    }
  }
  console.log('strokes', strokes)

  // Tone: the smooth graphite under the hatching, full in the head and
  // fading to bare paper and strokes down the back.
  const tone = new Float32Array(N * N)
  for (let i = 0; i < N * N; i++) {
    const v = clamp((T[i] - 0.1) / 0.86)
    tone[i] = Math.pow(v, 1.1) * 0.9 * (0.08 + 0.92 * sm(0.4, 0.92, F[i])) * Ms[i] * sm(0.15, 0.75, R[i])
  }
  const ttime = new Float32Array(N * N)
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) ttime[y * N + x] = 0.42 + sweep(x, y) * 0.4 + vn(x / 5, y / 5) * 0.08

  // Line work: XDoG for the drawn edges (curls, profile, muscle seams)…
  const G1 = blur(L, 0.9), G2 = blur(L, 0.9 * 1.7)
  const lines = new Float32Array(N * N)
  for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
    const i = y * N + x
    const d = G1[i] - 0.985 * G2[i]
    const e = d < -0.004 ? Math.min(1, -Math.tanh(70 * (d + 0.004))) : 0
    const f = F[i]
    lines[i] = e * 0.55 * Math.pow(f, 1.4) * Ms[i] * R[i] * (0.6 + 0.4 * vn(x / 9, y / 9))
  }
  // …and the outline: a couple of searching passes, broken where the light falls.
  const edgeOf = (dx, dy) => {
    const e = new Float32Array(N * N)
    for (let y = 2; y < N - 2; y++) for (let x = 2; x < N - 2; x++) {
      const i = y * N + x
      const xs = Math.min(N - 2, Math.max(1, x + dx)), ys = Math.min(N - 2, Math.max(1, y + dy))
      const j = ys * N + xs
      const g = Math.hypot(Ms[j + 1] - Ms[j - 1], Ms[j + N] - Ms[j - N])
      e[i] = Math.min(1, g * 1.6)
    }
    return e
  }
  const e0 = edgeOf(0, 0), e1 = edgeOf(1, -1), e2 = edgeOf(-1, 1)
  const ltime = new Float32Array(N * N)
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = y * N + x
    const gap = sm(0.28, 0.55, vn(x / 22, y / 22))
    const gap2 = sm(0.4, 0.62, vn(x / 17 + 40, y / 17))
    const lit = 0.45 + 0.55 * (1 - Lb4[i])
    const o = Math.max(e0[i] * 0.5 * gap, Math.max(e1[i], e2[i]) * 0.3 * gap2) * lit * R[i]
    lines[i] = Math.max(lines[i], o)
    ltime[i] = sweep(x, y) * 0.32 + vn(x / 7, y / 7) * 0.05
  }

  // ---------- compose ----------
  const ink = ix.getImageData(0, 0, S, S).data
  const tim = tx.getImageData(0, 0, S, S).data
  const [oc, ox] = canvas(S)
  const o = ox.createImageData(S, S)
  const lineAt = (f, x, y) => {
    // bilinear from the analysis grid
    const fx = x / K - 0.5, fy = y / K - 0.5
    const x0 = Math.max(0, Math.min(N - 2, Math.floor(fx))), y0 = Math.max(0, Math.min(N - 2, Math.floor(fy)))
    const u = Math.max(0, Math.min(1, fx - x0)), v = Math.max(0, Math.min(1, fy - y0))
    const i = y0 * N + x0
    return f[i] * (1 - u) * (1 - v) + f[i + 1] * u * (1 - v) + f[i + N] * (1 - u) * v + f[i + N + 1] * u * v
  }
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x
    const sa = ink[i * 4 + 3] / 255
    const la = lineAt(lines, x, y)
    // paper tooth: graphite catches the peaks of the grain, and the pencil
    // leaves a faint drag along the hatching direction
    const cu = x * 0.55 - y * 0.83, cv = x * 0.83 + y * 0.55
    const tooth = 0.5 * hash(x * 0.73, y * 0.71) + 0.3 * vn(x / 1.7, y / 2.3) + 0.2 * vn(cu / 9, cv / 1.1)
    let ta = lineAt(tone, x, y)
    ta = clamp(ta + (tooth - 0.5) * 0.9 * ta * (1 - ta) * 2.2)
    let a = 1 - (1 - sa) * (1 - la) * (1 - ta)
    a *= 0.8 + 0.2 * tooth
    let t = tim[i * 4] / 254
    if (ta > sa && ta > 0.05) t = Math.min(t, lineAt(ttime, x, y))
    if (la > sa * 0.8 && la > 0.08) t = Math.min(t, lineAt(ltime, x, y))
    const g = Math.round(clamp(t) * 255)
    o.data[i * 4] = o.data[i * 4 + 1] = o.data[i * 4 + 2] = g
    o.data[i * 4 + 3] = Math.round(clamp(a * 1.04) * 255)
  }
  ox.putImageData(o, 0, 0)
  const graphite = oc.toDataURL('image/png')

  // ---------- relief (dark) ----------
  // a rounded body from the silhouette plus the carved detail from the light
  const body = blur(blur(M, 26), 18)
  const Hd = new Float32Array(N * N)
  const d1 = blur(L, 1.5), d2 = blur(L, 7), d3 = blur(L, 28)
  for (let i = 0; i < N * N; i++) Hd[i] = Math.sqrt(Math.max(0, body[i])) * 34 + (d1[i] - d2[i]) * 4 + (d2[i] - d3[i]) * 13
  const Hs = blur(Hd, 0.8)
  const [rc, rx] = canvas(N)
  const ro = rx.createImageData(N, N)
  for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
    const i = y * N + x
    let nx = -(Hs[i + 1] - Hs[i - 1]) * 0.5, ny = -(Hs[i + N] - Hs[i - N]) * 0.5, nz = 0.15
    const l = Math.hypot(nx, ny, nz)
    nx /= l; ny /= l; nz /= l
    ro.data[i * 4] = Math.round((nx * 0.5 + 0.5) * 255)
    ro.data[i * 4 + 1] = Math.round((ny * 0.5 + 0.5) * 255)
    ro.data[i * 4 + 2] = Math.round((nz * 0.5 + 0.5) * 255)
    ro.data[i * 4 + 3] = Math.round(Ms[i] * 255)
  }
  rx.putImageData(ro, 0, 0)
  const relief = rc.toDataURL('image/png')

  return { graphite, relief }
}, src)

const save = (name, url) => writeFileSync(name, Buffer.from(url.split(',')[1], 'base64'))
save('/tmp/statue-graphite.png', out.graphite)
save('/tmp/statue-relief.png', out.relief)

if (preview) {
  // the drawing as it sits on the day paper, and half drawn
  const p2 = await browser.newPage()
  await p2.setViewport({ width: 1180, height: 600, deviceScaleFactor: 2 })
  const g = readFileSync('/tmp/statue-graphite.png').toString('base64')
  await p2.setContent(`<body style="margin:0;background:#F6F6F3;display:flex;gap:20px;padding:20px">
    <canvas id=a width=1024 height=1024 style="width:560px"></canvas><canvas id=b width=1024 height=1024 style="width:560px"></canvas>
    <script>
    const im = new Image(); im.src='data:image/png;base64,${g}'
    im.onload = () => {
      for (const [id, cut] of [['a', 2], ['b', 0.5]]) {
        const c = document.getElementById(id).getContext('2d'); c.imageSmoothingQuality = 'high'; c.drawImage(im, 0, 0, 1024, 1024)
        const d = c.getImageData(0, 0, 1024, 1024)
        for (let i = 0; i < d.data.length; i += 4) { const show = d.data[i] / 255 < cut ? 1 : 0; const a = d.data[i+3] / 255 * show * 0.92
          d.data[i] = 246*(1-a) + 38*a; d.data[i+1] = 246*(1-a) + 38*a; d.data[i+2] = 243*(1-a) + 42*a; d.data[i+3] = 255 }
        c.putImageData(d, 0, 0)
      }
      document.title = 'done'
    }
    </script></body>`)
  await p2.waitForFunction('document.title === "done"')
  await p2.screenshot({ path: '/tmp/statue-preview.png' })
}
await browser.close()

const webp = (from, to, args) => execFileSync('cwebp', ['-quiet', ...args, from, '-o', to])
webp('/tmp/statue-graphite.png', 'public/statue-graphite.webp', ['-q', '62', '-alpha_q', '72', '-exact', '-resize', '1100', '0'])
webp('/tmp/statue-relief.png', 'public/statue-relief.webp', ['-q', '90', '-alpha_q', '90', '-exact', '-resize', '768', '0'])
if (!preview) { rmSync('/tmp/statue-graphite.png'); rmSync('/tmp/statue-relief.png') }
console.log('wrote public/statue-graphite.webp, public/statue-relief.webp')
