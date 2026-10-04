import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const fine = matchMedia('(pointer: fine)').matches

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
    gsap.set(el, { transformPerspective: 1000 })
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height
      rx((0.5 - py) * 4); ry((px - 0.5) * 5)
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
  lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.9 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: id === 'top' ? 0 : -72, duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

/* ---------- intro + scroll reveals ---------- */
// Reduced-motion visitors (incl. Windows with "Animation effects" off) get soft opacity fades instead of movement.
const rise = (y) => (reduced ? 0 : y)

export function playIntro() {
  gsap.timeline()
    .from('.hero-name .ch', { yPercent: rise(110), opacity: reduced ? 0 : 1, duration: 1.4, ease: 'expo.out', stagger: 0.045 })
    .from('[data-intro]', { y: rise(24), opacity: 0, duration: 1.2, ease: 'power2.out', stagger: 0.1 }, '-=1')
    .from('.hl', { backgroundSize: '0% 100%', duration: 1.3, ease: 'power2.inOut', stagger: 0.3 }, '-=0.6')
    .from('.topbar', { yPercent: -rise(100), opacity: 0, duration: 1, ease: 'power2.out' }, 0.3)
}

export function initReveals() {
  gsap.utils.toArray('.sec-head .word').forEach((el) => {
    gsap.from(el.children, {
      yPercent: rise(110), opacity: reduced ? 0 : 1, duration: 1.2, ease: 'expo.out', stagger: 0.07,
      scrollTrigger: { trigger: el, start: 'top 90%' },
    })
  })
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: rise(30), opacity: 0, duration: 1.3, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%' },
    })
  })
  gsap.utils.toArray('[data-count]').forEach((el) => {
    const o = { v: 0 }
    gsap.to(o, {
      v: +el.dataset.count, duration: 1.8, ease: 'power2.out',
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
