<template>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <ShaderBackground />
  <CustomCursor />
  <NavBar />
  <main id="main-content" tabindex="-1">
    <HeroSection />
    <StatsBar />
    <FeaturesGrid />
    <SplitSection />
    <WorkflowSection />
    <MarqueeSection />
    <CtaSection />
    <FooterSection />
  </main>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import ShaderBackground from './components/ShaderBackground.vue'
import CustomCursor from './components/CustomCursor.vue'
import NavBar from './components/NavBar.vue'
import HeroSection from './components/HeroSection.vue'
import StatsBar from './components/StatsBar.vue'
import FeaturesGrid from './components/FeaturesGrid.vue'
import SplitSection from './components/SplitSection.vue'
import WorkflowSection from './components/WorkflowSection.vue'
import MarqueeSection from './components/MarqueeSection.vue'
import CtaSection from './components/CtaSection.vue'
import FooterSection from './components/FooterSection.vue'
import { useReveal } from './composables/useReveal.js'

useReveal()

// Cross-component event handlers (stored for cleanup)
const handlers = []

function addListener(target, type, fn, opts) {
  target.addEventListener(type, fn, opts)
  handlers.push({ target, type, fn, opts })
}

function throttleRAF(fn) {
  let scheduled = false
  let lastArgs = null
  let lastThis = null
  return function (...args) {
    lastArgs = args
    lastThis = this
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(() => {
      const toProcess = lastArgs
      const ctx = lastThis
      lastArgs = null
      lastThis = null
      scheduled = false
      if (toProcess) fn.apply(ctx, toProcess)
    })
  }
}

onMounted(() => {
  // ── MAGNETIC BUTTONS (throttled to rAF) ────────
  document.querySelectorAll('.magnet').forEach(btn => {
    const onMove = throttleRAF(e => {
      const r = btn.getBoundingClientRect()
      const x = e.clientX - r.left - r.width / 2
      const y = e.clientY - r.top - r.height / 2
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`
    })
    const onLeave = () => { btn.style.transform = '' }
    btn.addEventListener('mousemove', onMove)
    btn.addEventListener('mouseleave', onLeave)
    handlers.push({ target: btn, type: 'mousemove', fn: onMove })
    handlers.push({ target: btn, type: 'mouseleave', fn: onLeave })
  })

  // ── BENTO CARD MOUSE GLOW (throttled to rAF) ──
  document.querySelectorAll('.bento-card').forEach(card => {
    const onMove = throttleRAF(e => {
      const r = card.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width) * 100
      const y = ((e.clientY - r.top) / r.height) * 100
      card.style.setProperty('--mx', x + '%')
      card.style.setProperty('--my', y + '%')
    })
    card.addEventListener('mousemove', onMove)
    handlers.push({ target: card, type: 'mousemove', fn: onMove })
  })

  // ── NAV SCROLL EFFECT ─────────────────────────
  const nav = document.querySelector('nav')
  const onScroll = () => {
    if (nav) {
      nav.style.borderBottomColor = window.scrollY > 40
        ? 'var(--stroke-bright)' : 'var(--stroke)'
    }
  }
  addListener(window, 'scroll', onScroll, { passive: true })

  // ── HERO PARALLAX (skip when reduced-motion) ───
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!prefersReducedMotion) {
    const hero = document.querySelector('.hero')
    const onScrollParallax = () => {
      const sy = window.scrollY
      if (hero) {
        const mathFloats = hero.querySelectorAll('.hero-math-float')
        mathFloats.forEach((el, i) => {
          el.style.transform = `translateY(${sy * (0.1 + i * 0.04)}px)`
        })
      }
    }
    addListener(window, 'scroll', onScrollParallax, { passive: true })
  }
})

onUnmounted(() => {
  handlers.forEach(({ target, type, fn, opts }) => {
    target.removeEventListener(type, fn, opts)
  })
})
</script>

<style>
  /* ═══════════════════════════════════════════
     VARIABLES & RESET
  ═══════════════════════════════════════════ */
  :root {
    /* Base */
    --obsidian: #030305;
    --obsidian-translucent: rgba(3,3,5,0.7);
    --deep: #07090f;
    --surface: #0d1117;
    --surface2: #111827;
    /* Blueprint */
    --blueprint: #3B82F6;
    --blueprint-dark: #1d4ed8;
    --blueprint-mid: #818cf8;
    --blueprint-dim: rgba(59,130,246,0.15);
    --blueprint-dim-subtle: rgba(59,130,246,0.12);
    --blueprint-dim-hover: rgba(59,130,246,0.25);
    --blueprint-glow: rgba(59,130,246,0.4);
    --blueprint-grid: rgba(59,130,246,0.04);
    --blueprint-glow-soft: rgba(59,130,246,0.08);
    --blueprint-faint: rgba(59,130,246,0.2);
    --blueprint-tint: rgba(59,130,246,0.03);
    --blueprint-border: rgba(59,130,246,0.3);
    --blueprint-mid-strong: rgba(129,140,248,0.7);
    --stroke: rgba(59,130,246,0.18);
    --stroke-bright: rgba(59,130,246,0.5);
    /* Acid */
    --acid: #84cc16;
    --acid-dim: rgba(132,204,22,0.2);
    --acid-dim-soft: rgba(132,204,22,0.1);
    --acid-tint: rgba(132,204,22,0.05);
    --acid-border: rgba(132,204,22,0.3);
    --acid-strong: rgba(132,204,22,0.7);
    --acid-glow: rgba(132,204,22,0.5);
    /* LaTeX / text */
    --latex-white: #F8FAFC;
    --latex-dim: rgba(248,250,252,0.55);
    --latex-faint: rgba(248,250,252,0.08);
    --latex-faint-bg: rgba(248,250,252,0.05);
    --latex-line-num: rgba(248,250,252,0.2);
    --latex-code-comment: rgba(248,250,252,0.3);
    --latex-faint-gradient: rgba(248,250,252,0.06);
    --latex-faint-gradient-bright: rgba(248,250,252,0.12);
    --latex-border: rgba(248,250,252,0.2);
    /* UI chrome */
    --highlight: rgba(255,255,255,0.15);
    --shadow: rgba(0,0,0,0.5);
    --shadow-deep: rgba(0,0,0,0.6);
    --overlay: rgba(0,0,0,0.5);
    /* Code syntax (mock editor) */
    --code-keyword: #c084fc;
    --code-function: #60a5fa;
    --code-string: #86efac;
    --code-number: #fb923c;
    --code-class: #f472b6;
    /* Panel dots (mock macOS chrome) */
    --dot-red: #ff5f57;
    --dot-yellow: #febc2e;
    --dot-green: #28c840;
    /* Typography */
    --font-head: 'Space Grotesk', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    /* Motion (ease-out-quart for natural deceleration; avoid bounce/elastic) */
    --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
    --ease-out-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--obsidian);
    color: var(--latex-white);
    font-family: var(--font-mono);
    overflow-x: hidden;
  }
  ::selection { background: var(--blueprint-glow); color: var(--latex-white); }

  /* Cursor: custom only when pointer + no reduced-motion */
  @media (prefers-reduced-motion: no-preference) and (hover: hover) {
    html, body, * { cursor: none !important; }
  }
  @media (prefers-reduced-motion: reduce), (hover: none) {
    #cursor, #cursor-ring { display: none !important; }
  }

  /* ═══════════════════════════════════════════
     SKIP LINK
  ═══════════════════════════════════════════ */
  .skip-link {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10000;
    padding: 14px 24px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    color: var(--obsidian);
    background: var(--blueprint);
    text-decoration: none;
    transform: translateY(-100%);
    transition: transform 0.2s var(--ease-out-quart);
  }
  .skip-link:focus {
    transform: translateY(0);
    outline: 2px solid var(--acid);
    outline-offset: 2px;
  }

  /* ═══════════════════════════════════════════
     FOCUS INDICATORS
  ═══════════════════════════════════════════ */
  a:focus-visible,
  button:focus-visible,
  .bento-card:focus-visible,
  .step:focus-visible,
  .canvas-tool:focus-visible,
  .magnet:focus-visible,
  .nav-drawer-links a:focus-visible,
  .nav-drawer-cta:focus-visible,
  .nav-hamburger:focus-visible {
    outline: 2px solid var(--blueprint);
    outline-offset: 2px;
  }
  .skip-link:focus-visible {
    outline: 2px solid var(--acid);
    outline-offset: 2px;
  }

  /* ═══════════════════════════════════════════
     UTILITY CLASSES
  ═══════════════════════════════════════════ */
  .text-accent {
    color: var(--acid);
    font-family: var(--font-mono);
  }
  .flex-center-wrap {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
  }
  .flex-center-wrap--sm {
    gap: 12px;
    margin-top: 20px;
  }
  .flex-1 { flex: 1; }
  .opacity-muted { opacity: 0.5; }
  .split-intro {
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 300;
    color: var(--latex-dim);
    margin-top: 20px;
    max-width: 560px;
    line-height: 1.8;
  }
  .panel-meta {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--latex-dim);
    letter-spacing: 0.1em;
  }
  .split-panel--code { background: var(--deep); }
  .btn-primary--cta {
    font-size: 14px;
    padding: 18px 48px;
  }
  .code-line-highlight .code-kw,
  .code-line-highlight .code-fn,
  .code-line-highlight .code-str,
  .code-line-highlight .code-num,
  .code-line-highlight .code-cm,
  .code-line-highlight .code-cls,
  .code-line-highlight .code-var,
  .code-line-highlight .code-punct {
    color: var(--acid);
  }

  /* ═══════════════════════════════════════════
     CUSTOM CURSOR
  ═══════════════════════════════════════════ */
  #cursor {
    position: fixed; top: 0; left: 0; z-index: 9999;
    pointer-events: none; mix-blend-mode: screen;
    transition: transform 0.08s ease;
  }
  #cursor-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--blueprint);
    box-shadow: 0 0 12px 4px var(--blueprint-glow);
    transform: translate(-50%, -50%);
  }
  #cursor-ring {
    position: fixed; top: 0; left: 0; z-index: 9998;
    pointer-events: none;
    width: 60px; height: 60px;
    border-radius: 50%;
    border: 1px solid var(--acid);
    background: var(--blueprint-dim);
    box-shadow: 0 0 20px var(--acid-dim);
    transform: translate(-50%, -50%);
    transition: all 0.18s var(--ease-out-smooth);
    opacity: 0.6;
  }

  /* ═══════════════════════════════════════════
     CANVAS SHADER BG
  ═══════════════════════════════════════════ */
  #shader-canvas {
    position: fixed; inset: 0;
    width: 100%; height: 100%;
    z-index: 0; opacity: 0.85;
    pointer-events: none;
  }

  /* ═══════════════════════════════════════════
     GRID OVERLAY
  ═══════════════════════════════════════════ */
  .grid-overlay {
    position: fixed; inset: 0; z-index: 1;
    pointer-events: none;
    background-image:
      linear-gradient(var(--blueprint-grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--blueprint-grid) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
  }
  .axis-x, .axis-y {
    position: fixed; z-index: 2; pointer-events: none;
    background: var(--blueprint-dim-subtle);
  }
  .axis-x { left: 0; right: 0; height: 1px; top: 50%; }
  .axis-y { top: 0; bottom: 0; width: 1px; left: 50%; }

  /* ═══════════════════════════════════════════
     MAIN LAYOUT
  ═══════════════════════════════════════════ */
  main { position: relative; z-index: 10; }

  /* ═══════════════════════════════════════════
     NAV
  ═══════════════════════════════════════════ */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 24px 48px;
    border-bottom: 1px solid var(--stroke);
    background: var(--obsidian-translucent);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .nav-logo {
    font-family: var(--font-head);
    font-weight: 800; font-size: 17px; letter-spacing: -0.02em;
    color: var(--latex-white);
    display: flex; align-items: center; gap: 12px;
    text-decoration: none;
  }
  .nav-logo:hover { color: var(--latex-white); }
  .nav-logo-img {
    height: 32px; width: auto; display: block;
    object-fit: contain;
  }
  .nav-logo-text {
    letter-spacing: -0.02em;
  }
  .nav-logo-badge {
    width: 28px; height: 28px; border-radius: 6px;
    background: linear-gradient(135deg, var(--blueprint) 0%, var(--blueprint-dark) 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700;
  }
  .nav-links {
    display: flex; gap: 40px; list-style: none;
    font-family: var(--font-mono); font-size: 12px;
    font-weight: 300; letter-spacing: 0.08em; text-transform: uppercase;
  }
  .nav-links a {
    color: var(--latex-dim); text-decoration: none;
    transition: color 0.2s;
    padding: 8px 0; min-height: 44px; display: flex; align-items: center;
  }
  .nav-links a:hover { color: var(--blueprint); }
  .nav-cta {
    font-family: var(--font-mono); font-size: 12px; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 12px 24px; min-height: 44px;
    border-radius: 6px;
    border: 1px solid var(--blueprint);
    background: transparent; color: var(--blueprint);
    cursor: none; text-decoration: none;
    transition: all 0.25s;
    position: relative; overflow: hidden;
  }
  .nav-cta::before {
    content: ''; position: absolute; inset: 0;
    background: var(--blueprint);
    transform: translateX(-101%);
    transition: transform 0.25s var(--ease-out-quart);
  }
  .nav-cta:hover { color: var(--obsidian); }
  .nav-cta:hover::before { transform: translateX(0); }
  .nav-cta span { position: relative; z-index: 1; }

  /* ═══════════════════════════════════════════
     HERO
  ═══════════════════════════════════════════ */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 120px 48px 80px;
    position: relative;
  }
  .hero-tag {
    font-family: var(--font-mono); font-size: 11px; font-weight: 400;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--acid); margin-bottom: 36px;
    display: flex; align-items: center; gap: 12px;
    opacity: 0; animation: fadeSlideUp 0.8s 0.3s var(--ease-out-quart) forwards;
  }
  .hero-tag::before, .hero-tag::after {
    content: ''; flex: 1; max-width: 48px; height: 1px;
    background: linear-gradient(90deg, transparent, var(--acid));
  }
  .hero-tag::after {
    background: linear-gradient(90deg, var(--acid), transparent);
  }
  .hero-headline {
    font-family: var(--font-head);
    font-size: clamp(48px, 8vw, 108px);
    font-weight: 800; line-height: 0.92;
    letter-spacing: -0.04em; text-transform: uppercase;
    color: var(--latex-white);
    max-width: 1100px;
    opacity: 0; animation: fadeSlideUp 0.9s 0.5s var(--ease-out-quart) forwards;
  }
  .hero-headline em {
    font-style: normal;
    font-weight: 600;
    color: color-mix(in srgb, var(--blueprint) 88%, var(--latex-dim));
  }
  .hero-sub {
    font-family: var(--font-mono); font-size: 14px; font-weight: 300;
    line-height: 1.8; color: var(--latex-dim);
    max-width: 560px; margin-top: 32px;
    opacity: 0; animation: fadeSlideUp 0.9s 0.7s var(--ease-out-quart) forwards;
  }
  .hero-sub code {
    font-family: var(--font-mono); font-size: 13px;
    color: var(--acid); background: var(--acid-dim);
    padding: 2px 7px; border-radius: 3px;
    border: 1px solid var(--acid-border);
  }
  .hero-actions {
    display: flex; align-items: center; gap: 20px; margin-top: 52px;
    opacity: 0; animation: fadeSlideUp 0.9s 0.9s var(--ease-out-quart) forwards;
  }
  .btn-primary {
    position: relative; font-family: var(--font-mono);
    font-size: 13px; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase; padding: 16px 38px; min-height: 48px;
    border-radius: 8px; cursor: none; text-decoration: none;
    color: var(--latex-white);
    background: linear-gradient(135deg, var(--blueprint) 0%, var(--blueprint-dark) 100%);
    border: none; overflow: hidden;
    box-shadow: 0 0 40px var(--blueprint-glow), inset 0 1px 0 var(--highlight);
    transition: all 0.3s;
  }
  .btn-primary::before {
    content: ''; position: absolute; inset: -2px; border-radius: 10px;
    background: linear-gradient(135deg, var(--blueprint), var(--acid));
    z-index: -1; opacity: 0; transition: opacity 0.3s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 60px var(--blueprint-glow); }
  .btn-primary:hover::before { opacity: 1; }
  .btn-ghost {
    font-family: var(--font-mono); font-size: 13px; font-weight: 400;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--latex-dim); background: none;
    border: 1px solid var(--stroke); padding: 16px 32px; min-height: 48px;
    border-radius: 8px; cursor: none; text-decoration: none;
    transition: all 0.25s;
    display: flex; align-items: center; gap: 10px;
  }
  .btn-ghost:hover { color: var(--latex-white); border-color: var(--latex-dim); }
  .hero-scroll-hint {
    position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    opacity: 0; animation: fadeSlideUp 0.9s 1.3s var(--ease-out-quart) forwards;
  }
  .scroll-line {
    width: 1px; height: 48px;
    background: linear-gradient(to bottom, transparent, var(--blueprint), transparent);
    animation: scrollPulse 2s var(--ease-out-quart) infinite;
  }
  .scroll-label {
    font-family: var(--font-mono); font-size: 10px; font-weight: 300;
    letter-spacing: 0.2em; text-transform: uppercase; color: var(--latex-faint);
    writing-mode: vertical-rl;
  }

  /* Hero floating math */
  .hero-math-float {
    position: absolute; font-family: var(--font-mono);
    font-size: 13px; font-weight: 200; color: var(--blueprint-faint);
    pointer-events: none; animation: floatMath 8s var(--ease-out-quart) infinite;
    white-space: nowrap;
  }
  .hero-math-float:nth-child(1) { top: 18%; left: 8%; animation-delay: 0s; }
  .hero-math-float:nth-child(2) { top: 35%; right: 6%; animation-delay: 1.5s; }
  .hero-math-float:nth-child(3) { bottom: 28%; left: 5%; animation-delay: 3s; }
  .hero-math-float:nth-child(4) { bottom: 20%; right: 9%; animation-delay: 0.8s; }
  .hero-math-float:nth-child(5) { top: 60%; left: 3%; animation-delay: 2.2s; }

  /* ═══════════════════════════════════════════
     STATS STRIP
  ═══════════════════════════════════════════ */
  .stats-strip {
    border-top: 1px solid var(--stroke);
    border-bottom: 1px solid var(--stroke);
    padding: 32px 0;
    background: linear-gradient(90deg, transparent, var(--blueprint-grid), transparent);
    overflow: hidden;
  }
  .stats-inner {
    display: flex; align-items: center; justify-content: center;
    gap: 0; max-width: 1200px; margin: 0 auto; padding: 0 48px;
  }
  .stat-item {
    flex: 1; text-align: center; padding: 0 40px;
    position: relative;
  }
  .stat-item + .stat-item::before {
    content: ''; position: absolute; left: 0; top: 50%;
    transform: translateY(-50%);
    width: 1px; height: 40px; background: var(--stroke);
  }
  .stat-num {
    font-family: var(--font-head); font-size: 42px; font-weight: 700;
    line-height: 1; letter-spacing: -0.04em;
    color: color-mix(in srgb, var(--blueprint) 88%, var(--latex-dim));
  }
  .stat-label {
    font-family: var(--font-mono); font-size: 10px; font-weight: 300;
    letter-spacing: 0.15em; text-transform: uppercase; color: var(--latex-dim);
    margin-top: 6px;
  }

  /* ═══════════════════════════════════════════
     SECTION HEADERS
  ═══════════════════════════════════════════ */
  .section-eyebrow {
    font-family: var(--font-mono); font-size: 11px; font-weight: 400;
    letter-spacing: 0.25em; text-transform: uppercase; color: var(--acid);
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px;
  }
  .section-eyebrow::after {
    content: ''; flex: 1; max-width: 60px; height: 1px;
    background: linear-gradient(90deg, var(--acid), transparent);
  }
  .section-title {
    font-family: var(--font-head); font-size: clamp(36px, 5vw, 64px);
    font-weight: 800; line-height: 0.95; letter-spacing: -0.03em;
    text-transform: uppercase; color: var(--latex-white);
  }
  .section-title em {
    font-style: normal; color: var(--blueprint);
  }

  /* ═══════════════════════════════════════════
     BENTO FEATURES
  ═══════════════════════════════════════════ */
  .features-section {
    padding: 120px 48px;
    max-width: 1400px; margin: 0 auto;
  }
  .features-header { margin-bottom: 72px; }

  .bento-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: auto;
    gap: 16px;
  }
  .bento-card {
    background: var(--surface);
    border: 1px solid var(--stroke);
    border-radius: 16px; padding: 40px;
    position: relative; overflow: hidden;
    cursor: none;
    transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
    transform-style: preserve-3d;
  }
  .bento-card::before {
    content: ''; position: absolute; inset: 0; border-radius: 16px;
    background: radial-gradient(circle at var(--mx,50%) var(--my,50%), var(--blueprint-glow-soft) 0%, transparent 60%);
    opacity: 0; transition: opacity 0.3s;
  }
  .bento-card:hover { border-color: var(--stroke-bright); transform: translateY(-4px); box-shadow: 0 24px 60px var(--shadow), 0 0 0 1px var(--stroke-bright); }
  .bento-card:hover::before { opacity: 1; }

  .bento-1 { grid-column: span 5; min-height: 340px; }
  .bento-2 { grid-column: span 7; min-height: 340px; }
  .bento-3 { grid-column: span 4; min-height: 280px; }
  .bento-4 { grid-column: span 4; min-height: 280px; }
  .bento-5 { grid-column: span 4; min-height: 280px; }

  .card-number {
    font-family: var(--font-mono); font-size: 11px; font-weight: 300;
    color: var(--blueprint); letter-spacing: 0.2em; margin-bottom: 20px;
  }
  .card-icon {
    width: 48px; height: 48px; border-radius: 12px;
    border: 1px solid var(--stroke); display: flex;
    align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 24px;
    background: var(--surface2);
    transition: all 0.3s;
  }
  .bento-card:hover .card-icon {
    border-color: var(--blueprint);
    box-shadow: 0 0 20px var(--blueprint-dim);
  }
  .card-title {
    font-family: var(--font-head); font-size: 22px; font-weight: 700;
    letter-spacing: -0.02em; color: var(--latex-white); margin-bottom: 14px;
  }
  .card-desc {
    font-family: var(--font-mono); font-size: 12px; font-weight: 300;
    line-height: 1.9; color: var(--latex-dim);
  }
  .card-tag {
    display: inline-block; margin-top: 24px;
    font-family: var(--font-mono); font-size: 10px; font-weight: 400;
    letter-spacing: 0.15em; text-transform: uppercase;
    padding: 5px 12px; border-radius: 20px;
    border: 1px solid var(--acid-dim); color: var(--acid);
    background: var(--acid-dim);
  }
  .card-tag-blue {
    margin-left: 8px;
    border-color: var(--blueprint-border);
    color: var(--blueprint);
    background: var(--blueprint-dim);
  }
  .card-tag-muted {
    border-color: var(--latex-border);
    color: var(--latex-dim);
    background: var(--latex-faint-bg);
  }
  /* Feature-specific card bg accents */
  .bento-1 .card-bg-accent {
    position: absolute; right: -60px; bottom: -60px;
    width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, var(--blueprint-dim) 0%, transparent 70%);
    pointer-events: none;
  }
  .bento-2 .card-bg-accent {
    position: absolute; top: 0; right: 0;
    width: 100%; height: 100%;
    background: linear-gradient(135deg, transparent 60%, var(--acid-tint) 100%);
    pointer-events: none;
  }

  /* Mini canvas preview inside bento-2 */
  .mini-canvas-wrap {
    margin-top: 28px; border-radius: 10px; overflow: hidden;
    border: 1px solid var(--stroke); position: relative;
    background: var(--deep); height: 120px;
    display: flex; align-items: center; justify-content: center;
  }
  .mini-canvas-dots {
    display: flex; gap: 18px; align-items: center;
  }
  .shape-morph {
    width: 48px; height: 48px;
    background: var(--blueprint-dim);
    border: 2px solid var(--blueprint);
    border-radius: 6px;
    animation: shapeMorph 3s var(--ease-out-quart) infinite;
  }
  .morph-arrow {
    font-size: 20px; color: var(--blueprint); opacity: 0.6;
    animation: arrowPulse 3s var(--ease-out-quart) infinite;
  }
  .shape-morph.target {
    border-radius: 50%;
    background: var(--acid-dim-soft);
    border-color: var(--acid);
    animation: shapeMorphTarget 3s var(--ease-out-quart) infinite;
  }

  /* Timeline mini in bento-3 */
  .mini-timeline {
    margin-top: 24px; display: flex; flex-direction: column; gap: 8px;
  }
  .tl-track {
    height: 10px; background: var(--surface2);
    border-radius: 4px; position: relative; overflow: hidden;
  }
  .tl-clip {
    position: absolute; top: 0; height: 100%;
    border-radius: 4px; animation: clipSlide 3s var(--ease-out-quart) infinite;
  }
  .tl-clip-1 { left: 5%; width: 40%; background: var(--blueprint); animation-delay: 0s; }
  .tl-clip-2 { left: 20%; width: 55%; background: var(--acid-strong); animation-delay: 0.4s; }
  .tl-clip-3 { left: 10%; width: 30%; background: var(--blueprint-mid-strong); animation-delay: 0.8s; }

  /* LaTeX mini in bento-4 */
  .latex-preview {
    margin-top: 24px; padding: 20px;
    background: var(--deep); border-radius: 10px;
    border: 1px solid var(--stroke);
    font-family: var(--font-mono); font-size: 20px; font-weight: 300;
    color: var(--latex-white); text-align: center;
    letter-spacing: 0.05em;
  }
  .latex-preview sub { font-size: 14px; }
  .latex-preview sup { font-size: 14px; }
  .latex-cursor {
    display: inline-block; width: 2px; height: 22px;
    background: var(--acid); vertical-align: middle; margin-left: 2px;
    animation: blink 1.1s step-end infinite;
  }

  /* ═══════════════════════════════════════════
     CODE vs CANVAS SECTION
  ═══════════════════════════════════════════ */
  .split-section {
    padding: 120px 48px;
    border-top: 1px solid var(--stroke);
  }
  .split-container {
    max-width: 1400px; margin: 0 auto;
  }
  .split-header { margin-bottom: 72px; }
  .split-view {
    display: grid;
    grid-template-columns: 1fr 2px 1fr;
    grid-template-rows: repeat(1, 1fr);
    gap: 0; border-radius: 20px; overflow: hidden;
    border: 1px solid var(--stroke);
    box-shadow: 0 40px 100px var(--shadow-deep);
  }
  .split-panel {
    background: var(--surface); padding: 0;
    min-height: 520px; position: relative;
    overflow: hidden;
  }
  .panel-header {
    display: flex; align-items: center; gap: 12px; padding: 16px 24px;
    border-bottom: 1px solid var(--stroke);
    background: var(--deep);
  }
  .panel-dot {
    width: 10px; height: 10px; border-radius: 50%;
  }
  .panel-dot-r { background: var(--dot-red); }
  .panel-dot-y { background: var(--dot-yellow); }
  .panel-dot-g { background: var(--dot-green); }
  .panel-title {
    font-family: var(--font-mono); font-size: 11px; font-weight: 300;
    letter-spacing: 0.15em; text-transform: uppercase; color: var(--latex-dim);
    margin-left: auto;
  }
  /* Canvas panel */
  .canvas-panel-body {
    padding: 30px; display: flex; flex-direction: column; gap: 16px;
    height: calc(100% - 49px);
  }
  .canvas-toolbar {
    display: flex; gap: 8px; align-items: center;
  }
  .canvas-tool {
    min-width: 44px; min-height: 44px;
    width: 44px; height: 44px;
    border-radius: 8px;
    border: 1px solid var(--stroke);
    background: var(--surface2);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; color: var(--latex-dim);
    transition: all 0.2s; cursor: none;
  }
  .canvas-tool.active {
    background: var(--blueprint-dim); border-color: var(--blueprint);
    color: var(--blueprint);
  }
  .canvas-stage {
    flex: 1; border-radius: 10px;
    border: 1px solid var(--stroke);
    background: repeating-linear-gradient(
      0deg, transparent, transparent 30px,
      var(--blueprint-grid) 30px, var(--blueprint-grid) 31px
    ),
    repeating-linear-gradient(
      90deg, transparent, transparent 30px,
      var(--blueprint-grid) 30px, var(--blueprint-grid) 31px
    );
    position: relative; overflow: hidden;
  }
  .canvas-obj {
    position: absolute;
    border: 1.5px solid var(--blueprint);
    background: var(--blueprint-dim);
  }
  .canvas-obj-1 {
    width: 100px; height: 70px; left: 60px; top: 40px;
    border-radius: 8px;
    animation: canvasFloat1 4s var(--ease-out-quart) infinite;
  }
  .canvas-obj-2 {
    width: 70px; height: 70px; right: 80px; top: 80px;
    border-radius: 50%;
    border-color: var(--acid);
    background: var(--acid-dim);
    animation: canvasFloat2 5s var(--ease-out-quart) infinite;
  }
  .canvas-obj-3 {
    width: 60px; height: 60px; left: 100px; bottom: 50px;
    transform: rotate(45deg);
    animation: canvasFloat3 4.5s var(--ease-out-quart) infinite;
  }
  .obj-handle {
    position: absolute; width: 8px; height: 8px;
    background: var(--blueprint); border: 1.5px solid var(--deep);
    border-radius: 2px;
  }
  .obj-handle.tl { top: -4px; left: -4px; }
  .obj-handle.tr { top: -4px; right: -4px; }
  .obj-handle.bl { bottom: -4px; left: -4px; }
  .obj-handle.br { bottom: -4px; right: -4px; }
  /* Code panel */
  .code-panel-body {
    padding: 24px;
    height: calc(100% - 49px);
    font-family: var(--font-mono); font-size: 12px; font-weight: 300;
    line-height: 1.9; overflow: hidden;
  }
  .code-line { display: flex; gap: 16px; }
  .code-content { white-space: pre; }
  .ln { color: var(--latex-line-num); min-width: 24px; user-select: none; }
  .code-kw { color: var(--code-keyword); }
  .code-fn { color: var(--code-function); }
  .code-str { color: var(--code-string); }
  .code-num { color: var(--code-number); }
  .code-cm { color: var(--latex-code-comment); }
  .code-cls { color: var(--code-class); }
  .code-var { color: var(--latex-white); }
  .code-punct { color: var(--latex-dim); }
  .live-indicator {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: var(--font-mono); font-size: 10px; font-weight: 400;
    color: var(--acid); letter-spacing: 0.1em;
  }
  .live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--acid);
    box-shadow: 0 0 8px var(--acid);
    animation: livePulse 1.5s var(--ease-out-quart) infinite;
  }
  .typing-line {
    animation: typeIn 0.5s var(--ease-out-quart) forwards;
  }

  /* Divider */
  .split-divider {
    width: 2px; background: linear-gradient(to bottom, transparent, var(--blueprint), var(--acid), transparent);
    position: relative; z-index: 1;
  }
  .split-divider::after {
    content: '⇄'; position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--surface); border: 1px solid var(--stroke-bright);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; color: var(--blueprint);
  }

  /* ═══════════════════════════════════════════
     WORKFLOW STEPS
  ═══════════════════════════════════════════ */
  .workflow-section {
    padding: 120px 48px;
    max-width: 1400px; margin: 0 auto;
  }
  .workflow-steps {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 2px; margin-top: 72px;
    border: 1px solid var(--stroke); border-radius: 16px; overflow: hidden;
  }
  .step {
    padding: 48px 36px;
    background: var(--surface);
    border-right: 1px solid var(--stroke);
    position: relative; cursor: none;
    transition: background 0.3s;
  }
  .step:last-child { border-right: none; }
  .step:hover { background: var(--surface2); }
  .step-num {
    font-family: var(--font-head); font-size: 72px; font-weight: 800;
    line-height: 1; letter-spacing: -0.04em;
    color: var(--blueprint-dim-subtle);
    margin-bottom: 20px; transition: color 0.3s;
  }
  .step:hover .step-num { color: var(--blueprint-dim-hover); }
  .step-title {
    font-family: var(--font-head); font-size: 18px; font-weight: 700;
    letter-spacing: -0.01em; color: var(--latex-white); margin-bottom: 12px;
  }
  .step-desc {
    font-family: var(--font-mono); font-size: 11px; font-weight: 300;
    line-height: 1.9; color: var(--latex-dim);
  }
  .step-connector {
    position: absolute; top: 50%; right: -1px;
    width: 2px; height: 40px; transform: translateY(-50%);
    background: linear-gradient(to bottom, transparent, var(--blueprint), transparent);
  }

  /* ═══════════════════════════════════════════
     MARQUEE
  ═══════════════════════════════════════════ */
  .marquee-section {
    border-top: 1px solid var(--stroke);
    border-bottom: 1px solid var(--stroke);
    padding: 40px 0; overflow: hidden;
    background: linear-gradient(90deg, transparent, var(--blueprint-tint), transparent);
    position: relative;
    -webkit-mask-image: linear-gradient(
      90deg,
      transparent 0%,
      black 12%,
      black 88%,
      transparent 100%
    );
    mask-image: linear-gradient(
      90deg,
      transparent 0%,
      black 12%,
      black 88%,
      transparent 100%
    );
    -webkit-mask-size: 100% 100%;
    mask-size: 100% 100%;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
  }
  .marquee-track {
    display: flex; white-space: nowrap;
    animation: none;
  }
  .marquee-track.marquee-ready {
    animation: marquee 56s linear infinite;
  }
  .marquee-track-part {
    display: flex; white-space: nowrap; flex-shrink: 0;
  }
  .marquee-item {
    font-family: var(--font-head); font-size: 80px; font-weight: 800;
    letter-spacing: -0.04em; text-transform: uppercase;
    padding: 0 48px;
    background: linear-gradient(135deg, var(--latex-faint-gradient), var(--latex-faint-gradient-bright));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    flex-shrink: 0;
  }
  .marquee-sep {
    font-family: var(--font-head); font-size: 80px; font-weight: 800;
    padding: 0 24px; color: var(--blueprint); flex-shrink: 0;
    -webkit-text-fill-color: var(--blueprint);
  }
  .marquee-item.accent {
    color: color-mix(in srgb, var(--blueprint) 88%, var(--latex-dim));
    font-weight: 700;
    -webkit-text-fill-color: currentColor;
    background: none;
    background-clip: unset;
  }

  /* ═══════════════════════════════════════════
     CTA SECTION
  ═══════════════════════════════════════════ */
  .cta-section {
    padding: 160px 48px;
    text-align: center; position: relative; overflow: hidden;
  }
  .cta-content {
    position: relative; z-index: 1;
  }
  .cta-section::before {
    content: ''; position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, var(--blueprint-glow-soft) 0%, transparent 70%);
    pointer-events: none;
  }
  .cta-title {
    font-family: var(--font-head); font-size: clamp(40px, 6vw, 80px);
    font-weight: 800; line-height: 0.95; letter-spacing: -0.04em;
    text-transform: uppercase; color: var(--latex-white);
    max-width: 900px; margin: 0 auto 48px;
  }
  .cta-title em { font-style: normal; color: var(--blueprint); }
  .cta-desc {
    font-family: var(--font-mono); font-size: 13px; font-weight: 300;
    line-height: 1.9; color: var(--latex-dim); max-width: 500px;
    margin: 0 auto 56px;
  }

  /* ═══════════════════════════════════════════
     FOOTER
  ═══════════════════════════════════════════ */
  footer {
    border-top: 1px solid var(--stroke);
    padding: 64px 48px;
    display: grid; grid-template-columns: 1fr auto 1fr;
    align-items: center; gap: 40px;
  }
  .footer-logo {
    display: inline-flex; align-items: center; gap: 10px;
    text-decoration: none; color: var(--latex-white);
    font-family: var(--font-head); font-size: 15px; font-weight: 800;
    letter-spacing: -0.02em;
  }
  .footer-logo:hover { color: var(--latex-white); opacity: 0.9; }
  .footer-logo-img {
    height: 28px; width: auto; display: block; object-fit: contain;
  }
  .footer-logo-text { letter-spacing: -0.02em; }
  .footer-left p {
    font-family: var(--font-mono); font-size: 13px; font-weight: 400;
    color: var(--latex-dim); margin-top: 12px; line-height: 1.85;
  }
  .footer-center {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }
  .footer-center p {
    font-family: var(--font-mono); font-size: 13px; font-weight: 400;
    color: var(--latex-dim); letter-spacing: 0.06em; text-align: center;
    line-height: 1.6;
  }
  .footer-links {
    display: flex; gap: 32px; list-style: none;
    justify-content: flex-end;
  }
  .footer-links a {
    font-family: var(--font-mono); font-size: 13px; font-weight: 400;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--latex-dim); text-decoration: none; transition: color 0.2s;
    padding: 12px 0; min-height: 44px; display: inline-flex; align-items: center;
  }
  .footer-links a:hover { color: var(--blueprint); }

  /* ═══════════════════════════════════════════
     SCROLL REVEAL
  ═══════════════════════════════════════════ */
  .reveal {
    opacity: 0; transform: translateY(32px);
    transition: opacity 0.9s var(--ease-out-smooth),
                transform 0.9s var(--ease-out-smooth);
  }
  .reveal.visible {
    opacity: 1; transform: translateY(0);
  }
  .reveal-delay-1 { transition-delay: 0.1s; }
  .reveal-delay-2 { transition-delay: 0.2s; }
  .reveal-delay-3 { transition-delay: 0.35s; }
  .reveal-delay-4 { transition-delay: 0.5s; }
  .reveal-delay-5 { transition-delay: 0.65s; }

  /* ═══════════════════════════════════════════
     KEYFRAMES
  ═══════════════════════════════════════════ */
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes floatMath {
    0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
    50% { transform: translateY(-20px) rotate(2deg); opacity: 0.4; }
  }
  @keyframes scrollPulse {
    0%, 100% { opacity: 0.3; transform: scaleY(1); }
    50% { opacity: 1; transform: scaleY(1.2); }
  }
  @keyframes shapeMorph {
    0%, 100% { border-radius: 6px; transform: rotate(0deg); }
    50% { border-radius: 30%; transform: rotate(20deg); }
  }
  @keyframes shapeMorphTarget {
    0%, 100% { border-radius: 50%; transform: scale(1); }
    50% { border-radius: 20%; transform: scale(1.1); }
  }
  @keyframes arrowPulse {
    0%, 100% { opacity: 0.4; transform: translateX(0); }
    50% { opacity: 0.9; transform: translateX(4px); }
  }
  @keyframes clipSlide {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  @keyframes livePulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(var(--marquee-offset, -50%)); }
  }
  @keyframes canvasFloat1 {
    0%, 100% { transform: translate(0, 0); }
    33% { transform: translate(8px, -6px); }
    66% { transform: translate(-4px, 8px); }
  }
  @keyframes canvasFloat2 {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(-10px, 6px); }
  }
  @keyframes canvasFloat3 {
    0%, 100% { transform: rotate(45deg) translate(0,0); }
    50% { transform: rotate(55deg) translate(4px, -8px); }
  }
  @keyframes codeType {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* ═══════════════════════════════════════════
     REDUCED MOTION
  ═══════════════════════════════════════════ */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    html { scroll-behavior: auto; }
    .reveal { opacity: 1; transform: none; }
    .marquee-track.marquee-ready { animation: none; }
  }

  /* ═══════════════════════════════════════════
     RESPONSIVE
  ═══════════════════════════════════════════ */
  @media (max-width: 1024px) {
    .bento-1, .bento-2 { grid-column: span 12; }
    .bento-3, .bento-4, .bento-5 { grid-column: span 6; }
    .bento-5 { grid-column: span 12; }
    .split-view { grid-template-columns: 1fr; }
    .split-divider { display: none; }
    .workflow-steps { grid-template-columns: repeat(2, 1fr); }
    footer { grid-template-columns: 1fr; text-align: center; }
    .footer-left { display: flex; flex-direction: column; align-items: center; }
    .footer-links { justify-content: center; }
  }
  @media (max-width: 768px) {
    nav { padding: 16px 24px; }
    .hero { padding: 100px 24px 60px; }
    .hero-math-float { display: none; }
    .features-section, .split-section, .workflow-section { padding: 80px 24px; }
    .stats-inner { flex-direction: column; gap: 32px; padding: 0 24px; }
    .stat-item + .stat-item::before { display: none; }
    .bento-3, .bento-4, .bento-5 { grid-column: span 12; }
    .workflow-steps { grid-template-columns: 1fr; }
    footer { padding: 48px 24px; }
    .marquee-item, .marquee-sep { font-size: clamp(40px, 12vw, 80px); }
  }
</style>
