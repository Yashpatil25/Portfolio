import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const fine = matchMedia('(pointer: fine)').matches
const AMBER = 0xffb547

/* ---------- 3D particle network ---------- */
export function initScene(canvas) {
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  } catch {
    return () => {} // no WebGL: the CSS background still looks fine
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100)
  camera.position.z = 14
  const group = new THREE.Group()
  scene.add(group)

  const N = innerWidth < 768 ? 80 : 170
  const B = [13, 8, 6] // half-extents of the box the nodes drift in
  const pos = new Float32Array(N * 3)
  const vel = new Float32Array(N * 3)
  for (let i = 0; i < N * 3; i++) {
    pos[i] = (Math.random() * 2 - 1) * B[i % 3]
    vel[i] = reduced ? 0 : (Math.random() - 0.5) * 0.012
  }

  // soft round sprite for the nodes
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grd.addColorStop(0, 'rgba(255,240,220,1)')
  grd.addColorStop(0.25, 'rgba(255,190,100,0.7)')
  grd.addColorStop(1, 'rgba(255,181,71,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 64, 64)

  const pGeo = new THREE.BufferGeometry()
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  group.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: 0.32, map: new THREE.CanvasTexture(c), color: AMBER,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  })))

  const MAX = N * 10
  const lPos = new Float32Array(MAX * 6)
  const lCol = new Float32Array(MAX * 6)
  const lGeo = new THREE.BufferGeometry()
  lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3).setUsage(THREE.DynamicDrawUsage))
  lGeo.setAttribute('color', new THREE.BufferAttribute(lCol, 3).setUsage(THREE.DynamicDrawUsage))
  group.add(new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  })))

  const amber = new THREE.Color(AMBER)
  const mouse = { x: 0, y: 0, on: false }
  const m = new THREE.Vector3()
  const D2 = 3.3 * 3.3
  const MD2 = 5.5 * 5.5
  let n = 0

  const seg = (ax, ay, az, bx, by, bz, a) => {
    const o = n * 6
    lPos[o] = ax; lPos[o + 1] = ay; lPos[o + 2] = az
    lPos[o + 3] = bx; lPos[o + 4] = by; lPos[o + 5] = bz
    for (let k = 0; k < 6; k += 3) {
      lCol[o + k] = amber.r * a; lCol[o + k + 1] = amber.g * a; lCol[o + k + 2] = amber.b * a
    }
    n++
  }

  const onMove = (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1
    mouse.y = -(e.clientY / innerHeight) * 2 + 1
    mouse.on = true
  }
  const onLeave = () => { mouse.on = false }

  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false)
    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()
    if (reduced) frame()
  }

  function frame() {
    for (let i = 0; i < N * 3; i++) {
      pos[i] += vel[i]
      if (Math.abs(pos[i]) > B[i % 3]) vel[i] *= -1
    }
    pGeo.attributes.position.needsUpdate = true

    // ponytail: O(n²) pair scan, fine for ≤170 nodes; use a spatial grid if N grows a lot
    n = 0
    for (let i = 0; i < N && n < MAX; i++) {
      const ix = i * 3
      for (let j = i + 1; j < N && n < MAX; j++) {
        const jx = j * 3
        const dx = pos[ix] - pos[jx], dy = pos[ix + 1] - pos[jx + 1], dz = pos[ix + 2] - pos[jx + 2]
        const d2 = dx * dx + dy * dy + dz * dz
        if (d2 < D2) seg(pos[ix], pos[ix + 1], pos[ix + 2], pos[jx], pos[jx + 1], pos[jx + 2], (1 - d2 / D2) * 0.32)
      }
    }

    // cursor acts as an extra node that links to everything near it
    if (mouse.on) {
      m.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(camera.position).normalize()
      m.multiplyScalar(-camera.position.z / m.z).add(camera.position)
      group.worldToLocal(m)
      for (let i = 0; i < N && n < MAX; i++) {
        const ix = i * 3
        const dx = pos[ix] - m.x, dy = pos[ix + 1] - m.y, dz = pos[ix + 2] - m.z
        const d2 = dx * dx + dy * dy + dz * dz
        if (d2 < MD2) seg(m.x, m.y, m.z, pos[ix], pos[ix + 1], pos[ix + 2], (1 - d2 / MD2) * 0.9)
      }
    }
    lGeo.setDrawRange(0, n * 2)
    lGeo.attributes.position.needsUpdate = true
    lGeo.attributes.color.needsUpdate = true

    const s = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)
    group.rotation.y += (mouse.x * 0.2 + s * 1.4 - group.rotation.y) * 0.04
    group.rotation.x += (-mouse.y * 0.12 + s * 0.35 - group.rotation.x) * 0.04
    camera.position.z += (14 - s * 3 - camera.position.z) * 0.05
    renderer.render(scene, camera)
  }

  let raf
  const loop = () => { frame(); raf = requestAnimationFrame(loop) }
  addEventListener('resize', resize)
  addEventListener('pointermove', onMove)
  document.addEventListener('pointerleave', onLeave)
  resize()
  if (!reduced) loop()

  return () => {
    cancelAnimationFrame(raf)
    removeEventListener('resize', resize)
    removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerleave', onLeave)
    renderer.dispose()
  }
}

/* ---------- custom cursor + spotlight ---------- */
export function initCursor(dot, ring) {
  if (!fine) return
  const root = document.documentElement
  root.classList.add('has-cursor')
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y
  addEventListener('pointermove', (e) => {
    x = e.clientX; y = e.clientY
    dot.style.transform = `translate(${x}px, ${y}px)`
    root.style.setProperty('--mx', `${x}px`)
    root.style.setProperty('--my', `${y}px`)
    ring.classList.toggle('is-hover', !!e.target.closest?.('a, button, input, textarea, [data-cursor]'))
  })
  document.addEventListener('pointerleave', () => root.classList.add('cursor-out'))
  document.addEventListener('pointerenter', () => root.classList.remove('cursor-out'))
  const tick = () => {
    rx += (x - rx) * 0.16; ry += (y - ry) * 0.16
    ring.style.transform = `translate(${rx}px, ${ry}px)`
    requestAnimationFrame(tick)
  }
  tick()
}

/* ---------- magnetic buttons + tilt cards ---------- */
export function initHover() {
  if (!fine || reduced) return
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' })
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - r.left - r.width / 2) * 0.3)
      yTo((e.clientY - r.top - r.height / 2) * 0.3)
    })
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0) })
  })
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' })
    gsap.set(el, { transformPerspective: 900 })
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height
      rx((0.5 - py) * 6); ry((px - 0.5) * 8)
      el.style.setProperty('--gx', `${px * 100}%`)
      el.style.setProperty('--gy', `${py * 100}%`)
    })
    el.addEventListener('pointerleave', () => { rx(0); ry(0) })
  })
}

/* ---------- smooth scroll ---------- */
let lenis = null
export function initScroll() {
  document.documentElement.classList.remove('is-loading')
  if (reduced) return
  lenis = new Lenis({ lerp: 0.09 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: innerWidth < 1024 ? -20 : -80, duration: 1.4 })
  else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
}

/* ---------- intro + scroll reveals ---------- */
export function playIntro() {
  if (reduced) return
  gsap.timeline()
    .from('.name .ch', { yPercent: 115, rotate: 6, duration: 1.1, ease: 'expo.out', stagger: 0.035 })
    .from('[data-intro]', { y: 24, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.06 }, '-=0.85')
    .from('#scene', { opacity: 0, duration: 2.2, ease: 'power2.out' }, 0)
    .from('main > section:first-child', { y: 40, opacity: 0, duration: 1.1, ease: 'power3.out' }, 0.3)
}

export function initReveals() {
  if (reduced) return
  gsap.utils.toArray('main > section:not(:first-child) .sec-head .word').forEach((el) => {
    gsap.from(el.children, {
      yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.06,
      scrollTrigger: { trigger: el, start: 'top 90%' },
    })
  })
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 50, opacity: 0, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    })
  })
  gsap.utils.toArray('[data-count]').forEach((el) => {
    const end = +el.dataset.count
    const o = { v: 0 }
    gsap.to(o, {
      v: end, duration: 1.8, ease: 'power2.out',
      onUpdate: () => { el.textContent = Math.round(o.v) },
      scrollTrigger: { trigger: el, start: 'top 92%' },
    })
  })
  gsap.utils.toArray('.viz-market .draw').forEach((p, i) => {
    gsap.fromTo(p, { strokeDashoffset: 1 }, {
      strokeDashoffset: 0, duration: i ? 1.4 : 1.8, delay: i ? 1 + i * 0.05 : 0, ease: 'power2.inOut',
      scrollTrigger: { trigger: p.closest('svg'), start: 'top 85%' },
    })
  })
  gsap.to('.marquee-track', {
    xPercent: -15, ease: 'none',
    scrollTrigger: { trigger: '.marquee', scrub: true },
  })
}
