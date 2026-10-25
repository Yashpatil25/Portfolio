import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

// Reduced-motion visitors (incl. Windows with "Animation effects" off) get soft fades instead of movement.
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const rise = (y) => (reduced ? 0 : y)

/* ---------- smooth scroll ---------- */
let lenis = null
export function initScroll() {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (lenis) lenis.scrollTo(el, { duration: 1.6 })
  else el?.scrollIntoView({ behavior: 'smooth' })
}

/* ---------- intro ---------- */
export function playIntro() {
  gsap.timeline()
    .from('.hero-title .ln > span', { yPercent: rise(105), opacity: reduced ? 0 : 1, duration: 1.3, ease: 'expo.out', stagger: 0.09 })
    .from('[data-intro]', { y: rise(16), opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08 }, 0.1)
    .from('.mascot-img', { yPercent: rise(40), opacity: 0, duration: 1.2, ease: 'expo.out' }, 0.2)
}

/* ---------- scroll reveals ---------- */
export function initReveals() {
  // about statement lights up word by word as you scroll (scrubbed, so it follows the reader)
  gsap.utils.toArray('.statement').forEach((el) => {
    gsap.fromTo(el.querySelectorAll('.w'), { opacity: 0.14 }, {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 50%', scrub: true },
    })
  })
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: rise(60), opacity: 0, duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    })
  })
  gsap.utils.toArray('.phone').forEach((el) => {
    gsap.from(el, {
      y: rise(120), rotate: reduced ? 0 : -4, opacity: 0, duration: 1.4, delay: 0.25, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 95%' },
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
}

/* ---------- the pixel me: swap sides / shrink between sections ---------- */
// A section takes over the mascot once its top passes `data-at` (default 85% down the viewport), so the
// mascot leaves before the new section's content can slide under it. Hero/about use 50%: their headline
// shares the side the mascot is moving to.
export function watchScenes(onScene) {
  document.querySelectorAll('[data-mascot]').forEach((s) => {
    const at = s.dataset.at || '85%'
    ScrollTrigger.create({
      trigger: s, start: `top ${at}`, end: `bottom ${at}`,
      onToggle: (st) => st.isActive && onScene({ id: s.id, mode: s.dataset.mascot }),
    })
  })
}

let moveTl = null
export function moveMascot(el, mode, onSwap) {
  moveTl?.kill() // fast scrolling: only the latest move (and its text swap) should run
  if (reduced) { el.dataset.mode = mode; onSwap(); return }
  moveTl = gsap.timeline()
    .to(el, { yPercent: 110, duration: 0.45, ease: 'power3.in' })
    .add(() => { el.dataset.mode = mode; onSwap() })
    .to(el, { yPercent: 0, duration: 0.8, ease: 'back.out(1.4)' })
}

export function popBubble(el) {
  gsap.fromTo(el, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2.2)' })
}
