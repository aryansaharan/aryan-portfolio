// The statue, lit for real. One canvas, two materials:
//   light  graphite on paper. The study replays the order it was drawn in,
//          the graphite catches a silver sheen where the light falls, and
//          dragging across it smudges it like a finger would, then it settles.
//   dark   marble in a dark room. A surface map lets the light rake across
//          the curls and the shoulders instead of just brightening a circle.
// No React here; Statue.tsx drives it.

const VERT = `
attribute vec2 p;
varying vec2 uv;
void main() { uv = vec2(p.x * .5 + .5, .5 - p.y * .5); gl_Position = vec4(p, 0., 1.); }`

const GRAPHITE = `
precision highp float;
varying vec2 uv;
uniform sampler2D uTex, uSmudge;
uniform vec3 uLight;
uniform float uPower, uDraw;
uniform vec2 uTexel;
// rgb holds when each stroke was laid down; alpha is the graphite
float ink(vec2 p) {
  vec4 g = texture2D(uTex, p);
  return g.a * smoothstep(g.r, g.r + .035, uDraw);
}
void main() {
  // a smudge drags the graphite along and thins it, as a fingertip does
  // the field is stored the GL way up (row 0 at the bottom)
  vec2 off = (texture2D(uSmudge, vec2(uv.x, 1. - uv.y)).rg - .5) * .16;
  float a = 0.;
  for (int k = 0; k < 6; k++) a += ink(uv - off * (float(k) / 5.));
  a /= 6.;
  a *= 1. - min(length(off) * 9., 1.) * .35;
  // the strokes have a little relief, enough to glint
  float ix = ink(uv + vec2(uTexel.x, 0.)) - ink(uv - vec2(uTexel.x, 0.));
  float iy = ink(uv + vec2(0., uTexel.y)) - ink(uv - vec2(0., uTexel.y));
  vec3 n = normalize(vec3(-ix * 2.2, -iy * 2.2, 1.));
  vec3 lv = vec3(uLight.xy - uv, uLight.z);
  vec3 h = normalize(normalize(lv) + vec3(0., 0., 1.));
  float near = 1. / (1. + dot(lv.xy, lv.xy) * 26.);
  float sheen = pow(max(dot(n, h), 0.), 34.) * near * uPower;
  vec3 col = mix(vec3(.13, .13, .14), vec3(.62, .63, .66), clamp(sheen * smoothstep(.12, .7, a), 0., 1.) * .8);
  a *= .94;
  gl_FragColor = vec4(col * a, a);
}`

const MARBLE = `
precision highp float;
varying vec2 uv;
uniform sampler2D uTex, uRelief;
uniform vec3 uLight;
uniform float uPower;
void main() {
  vec4 r = texture2D(uRelief, uv);
  // the photo stops at the tile's edges; let the stone fade out before it does
  float m = r.a * smoothstep(0., .1, uv.x) * smoothstep(0., .1, 1. - uv.x) * smoothstep(0., .14, 1. - uv.y);
  vec3 n = normalize(r.rgb * 2. - 1.);
  vec3 c = texture2D(uTex, uv).rgb;
  c *= c;
  vec3 lv = vec3(uLight.xy - uv, uLight.z);
  vec3 l = normalize(lv);
  float wrap = max((dot(n, l) + .25) / 1.25, 0.);
  float pool = 1. / (1. + dot(lv.xy, lv.xy) * 20.);
  vec3 h = normalize(l + vec3(0., 0., 1.));
  // marble is soft, not glossy: a broad, faint sheen
  float spec = pow(max(dot(n, h), 0.), 14.) * .07 * smoothstep(.04, .4, c.g);
  float lit = pool * uPower;
  vec3 col = c * (.06 + 1.9 * wrap * lit) + spec * lit * vec3(1., .97, .92);
  // roll off the highlights instead of clipping them
  col = col / (1. + col * .45);
  col = sqrt(col * 1.2);
  gl_FragColor = vec4(col * m, m);
}`

// The smudge field: an offset per point that a drag pushes and time relaxes.
const SMUDGE = `
precision highp float;
varying vec2 uv;
uniform sampler2D uState;
uniform vec2 uA, uB, uVel;
uniform float uRadius, uDecay;
void main() {
  vec2 d = texture2D(uState, vec2(uv.x, 1. - uv.y)).rg - .5;
  float l = length(d);
  if (l > 0.) d *= max(l * uDecay - .7 / 255., 0.) / l;
  vec2 ab = uB - uA;
  vec2 q = uv - uA - ab * clamp(dot(uv - uA, ab) / max(dot(ab, ab), 1e-6), 0., 1.);
  d += uVel * exp(-dot(q, q) / (uRadius * uRadius));
  gl_FragColor = vec4(clamp(d, -.5, .5) + .5, 0., 1.);
}`

type Program = { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null> }
type FBO = { tex: WebGLTexture; fb: WebGLFramebuffer }

export type Sources = { graphite: string; marble: string; relief: string }

export type StatueGL = {
  setDark: (dark: boolean) => void
  /** Light position in the canvas's 0..1 space; `active` false lets it wander. */
  point: (x: number, y: number, active: boolean) => void
  /** A drag in 0..1 space: smudges the graphite (light theme only). */
  drag: (x: number, y: number, dx: number, dy: number) => void
  setVisible: (on: boolean) => void
  destroy: () => void
}

const SM = 256 // smudge field resolution; it is smooth, so this is plenty

export function createStatueGL(canvas: HTMLCanvasElement, src: Sources, onReady: () => void): StatueGL | null {
  const ctx = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false })
  if (!ctx) return null
  const gl: WebGLRenderingContext = ctx

  const compile = (frag: string, names: string[]): Program => {
    const sh = (type: number, code: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, code)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
      return s
    }
    const p = gl.createProgram()!
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT))
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, frag))
    gl.bindAttribLocation(p, 0, 'p')
    gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link')
    return { p, u: Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(p, n)])) }
  }

  let progs: { graphite: Program; marble: Program; smudge: Program }
  try {
    progs = {
      graphite: compile(GRAPHITE, ['uTex', 'uSmudge', 'uLight', 'uPower', 'uDraw', 'uTexel']),
      marble: compile(MARBLE, ['uTex', 'uRelief', 'uLight', 'uPower']),
      smudge: compile(SMUDGE, ['uState', 'uA', 'uB', 'uVel', 'uRadius', 'uDecay']),
    }
  } catch (e) {
    if (import.meta.env.DEV) console.warn('statue-gl', e)
    return null
  }

  const quad = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  const texture = (w = 0, h = 0, data: ArrayBufferView | null = null) => {
    const t = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, t)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    if (w) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
    return t
  }
  const textures: Partial<Record<keyof Sources, WebGLTexture>> = {}
  const loading = new Set<keyof Sources>()
  const load = (key: keyof Sources) => {
    if (textures[key] || loading.has(key)) return
    loading.add(key)
    const img = new Image()
    img.decoding = 'async'
    img.src = src[key]
    img
      .decode()
      .then(() => {
        if (dead) return
        const t = texture()
        // the graphite's colour channels are data (stroke timing), keep them exact
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
        gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        textures[key] = t
        if (key === 'graphite') texel = [1 / img.naturalWidth, 1 / img.naturalHeight]
        kick()
      })
      .catch(() => loading.delete(key))
  }

  // the smudge field, ping-ponged
  const blank = new Uint8Array(SM * SM * 4).fill(128)
  const fbo = (): FBO => {
    const tex = texture(SM, SM, blank)
    const fb = gl.createFramebuffer()!
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    return { tex, fb }
  }
  let smA = fbo()
  let smB = fbo()

  let dead = false
  let dark = false
  let visible = true
  let ready = false
  let texel: [number, number] = [1 / 1200, 1 / 1200]
  // the light: where it is, where it's headed, how bright
  const L = { x: 0.42, y: 0.3, tx: 0.42, ty: 0.3, vx: 0, vy: 0, active: false }
  let power = 0
  let drawT = 0
  let drawStart = -1
  let smudgeUntil = 0
  // the path a drag covered since the last frame, and how far it went
  let brush: { ax: number; ay: number; bx: number; by: number; vx: number; vy: number } | null = null
  const t0 = performance.now()
  let raf = 0
  let last = t0

  const kick = () => {
    if (!raf && visible && !dead) raf = requestAnimationFrame(frame)
  }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.round(canvas.clientWidth * dpr)
    const h = Math.round(canvas.clientHeight * dpr)
    if (w && h && (canvas.width !== w || canvas.height !== h)) {
      canvas.width = w
      canvas.height = h
    }
  }
  const ro = new ResizeObserver(() => {
    resize()
    kick()
  })
  ro.observe(canvas)
  resize()

  const bind = (unit: number, tex: WebGLTexture, loc: WebGLUniformLocation | null) => {
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.uniform1i(loc, unit)
  }

  function frame(now: number) {
    raf = 0
    if (dead || !visible) return
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    const s = (now - t0) / 1000

    // where the light wants to be: the pointer, or a slow drift over the curls
    if (!L.active) {
      L.tx = 0.5 + Math.sin(s * 0.23) * 0.26
      L.ty = 0.42 + Math.sin(s * 0.17 + 1.2) * 0.2
    }
    // a damped spring, so the light has a little weight to it
    const k = L.active ? 70 : 18
    const c = 2 * Math.sqrt(k) * 0.9
    L.vx += (k * (L.tx - L.x) - c * L.vx) * dt
    L.vy += (k * (L.ty - L.y) - c * L.vy) * dt
    L.x += L.vx * dt
    L.y += L.vy * dt

    const tex = dark ? textures.marble && textures.relief : textures.graphite
    if (tex) {
      if (!ready) {
        ready = true
        onReady()
      }
      if (drawStart < 0) drawStart = now
      power = Math.min(1, power + dt / 1.1)
      // the study replays itself once, in about four seconds: the outline,
      // the first hatching, the tone, then the darks
      const p = Math.min(1, (now - drawStart) / 4200)
      drawT = (0.5 - 0.5 * Math.cos(Math.PI * Math.pow(p, 0.8))) * 1.06
    }

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    if (!dark && textures.graphite) {
      // relax and push the smudge field
      if (brush || now < smudgeUntil) {
        const u = progs.smudge
        gl.useProgram(u.p)
        gl.bindFramebuffer(gl.FRAMEBUFFER, smB.fb)
        gl.viewport(0, 0, SM, SM)
        bind(0, smA.tex, u.u.uState)
        gl.uniform2f(u.u.uA, brush?.ax ?? -9, brush?.ay ?? -9)
        gl.uniform2f(u.u.uB, brush?.bx ?? -9, brush?.by ?? -9)
        // offsets are stored x6.25 (±0.08 of the canvas); a drag pushes about half its length
        const cap = (v: number) => Math.max(-0.05, Math.min(0.05, v))
        gl.uniform2f(u.u.uVel, cap(brush?.vx ?? 0) * 6.25 * 0.6, cap(brush?.vy ?? 0) * 6.25 * 0.6)
        gl.uniform1f(u.u.uRadius, 0.045)
        gl.uniform1f(u.u.uDecay, 0.982)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, canvas.width, canvas.height)
        ;[smA, smB] = [smB, smA]
        brush = null
      }
      const g = progs.graphite
      gl.useProgram(g.p)
      bind(0, textures.graphite, g.u.uTex)
      bind(1, smA.tex, g.u.uSmudge)
      gl.uniform3f(g.u.uLight, L.x, L.y, 0.22)
      gl.uniform1f(g.u.uPower, power)
      gl.uniform1f(g.u.uDraw, drawT)
      gl.uniform2f(g.u.uTexel, texel[0], texel[1])
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    } else if (dark && textures.marble && textures.relief) {
      const m = progs.marble
      gl.useProgram(m.p)
      bind(0, textures.marble, m.u.uTex)
      bind(1, textures.relief, m.u.uRelief)
      gl.uniform3f(m.u.uLight, L.x, L.y, 0.3)
      gl.uniform1f(m.u.uPower, power)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    kick()
  }

  const loadFor = (d: boolean) => {
    if (d) {
      load('marble')
      load('relief')
    } else load('graphite')
  }

  return {
    setDark(d) {
      if (d === dark && drawStart >= 0) return
      dark = d
      // a theme switch relights the stone, or redraws the study
      power = 0
      drawStart = -1
      loadFor(d)
      // warm the other material once the page is idle, so a switch is instant
      setTimeout(() => !dead && loadFor(!d), 2500)
      kick()
    },
    point(x, y, active) {
      L.active = active
      if (active) {
        L.tx = Math.max(-0.05, Math.min(1.05, x))
        L.ty = Math.max(-0.05, Math.min(1.05, y))
      }
      kick()
    },
    drag(x, y, dx, dy) {
      if (dark) return
      brush = brush
        ? { ...brush, bx: x, by: y, vx: brush.vx + dx, vy: brush.vy + dy }
        : { ax: x - dx, ay: y - dy, bx: x, by: y, vx: dx, vy: dy }
      smudgeUntil = performance.now() + 4000
      kick()
    },
    setVisible(on) {
      visible = on
      if (on) {
        last = performance.now()
        kick()
      }
    },
    destroy() {
      dead = true
      cancelAnimationFrame(raf)
      ro.disconnect()
    },
  }
}
