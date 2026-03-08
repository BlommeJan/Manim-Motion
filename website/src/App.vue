<template>
  <ShaderBackground />
  <CustomCursor />
  <NavBar />
  <main>
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

onMounted(() => {
  // ── CURSOR HOVER CLASS ────────────────────────
  const hoverEls = document.querySelectorAll('a, button, .bento-card, .step, .canvas-tool, .magnet')
  hoverEls.forEach(el => {
    const onEnter = () => document.body.classList.add('hovering')
    const onLeave = () => document.body.classList.remove('hovering')
    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    handlers.push({ target: el, type: 'mouseenter', fn: onEnter })
    handlers.push({ target: el, type: 'mouseleave', fn: onLeave })
  })

  // ── MAGNETIC BUTTONS ──────────────────────────
  document.querySelectorAll('.magnet').forEach(btn => {
    const onMove = e => {
      const r = btn.getBoundingClientRect()
      const x = e.clientX - r.left - r.width / 2
      const y = e.clientY - r.top - r.height / 2
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`
    }
    const onLeave = () => { btn.style.transform = '' }
    btn.addEventListener('mousemove', onMove)
    btn.addEventListener('mouseleave', onLeave)
    handlers.push({ target: btn, type: 'mousemove', fn: onMove })
    handlers.push({ target: btn, type: 'mouseleave', fn: onLeave })
  })

  // ── BENTO CARD MOUSE GLOW ────────────────────
  document.querySelectorAll('.bento-card').forEach(card => {
    const onMove = e => {
      const r = card.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width) * 100
      const y = ((e.clientY - r.top) / r.height) * 100
      card.style.setProperty('--mx', x + '%')
      card.style.setProperty('--my', y + '%')
    }
    card.addEventListener('mousemove', onMove)
    handlers.push({ target: card, type: 'mousemove', fn: onMove })
  })

  // ── NAV SCROLL EFFECT ─────────────────────────
  const nav = document.querySelector('nav')
  const onScroll = () => {
    if (nav) {
      nav.style.borderBottomColor = window.scrollY > 40
        ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.18)'
    }
  }
  addListener(window, 'scroll', onScroll, { passive: true })

  // ── HERO PARALLAX ─────────────────────────────
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
    --obsidian: #030305;
    --deep: #07090f;
    --surface: #0d1117;
    --surface2: #111827;
    --blueprint: #3B82F6;
    --blueprint-dim: rgba(59,130,246,0.15);
    --blueprint-glow: rgba(59,130,246,0.4);
    --latex-white: #F8FAFC;
    --latex-dim: rgba(248,250,252,0.55);
    --latex-faint: rgba(248,250,252,0.08);
    --acid: #84cc16;
    --acid-dim: rgba(132,204,22,0.2);
    --acid-glow: rgba(132,204,22,0.5);
    --stroke: rgba(59,130,246,0.18);
    --stroke-bright: rgba(59,130,246,0.5);
    --font-head: 'Space Grotesk', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--obsidian);
    color: var(--latex-white);
    font-family: var(--font-mono);
    overflow-x: hidden;
    cursor: none;
  }
  ::selection { background: var(--blueprint-glow); color: #fff; }

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
    width: 36px; height: 36px; border-radius: 50%;
    border: 1px solid var(--blueprint);
    transform: translate(-50%, -50%);
    transition: all 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    opacity: 0.6;
  }
  body.hovering #cursor-ring {
    width: 60px; height: 60px;
    background: var(--blueprint-dim);
    border-color: var(--acid);
    box-shadow: 0 0 20px var(--acid-dim);
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
      linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
  }
  .axis-x, .axis-y {
    position: fixed; z-index: 2; pointer-events: none;
    background: rgba(59,130,246,0.12);
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
    background: rgba(3,3,5,0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .nav-logo {
    font-family: var(--font-head);
    font-weight: 800; font-size: 17px; letter-spacing: -0.02em;
    color: var(--latex-white);
    display: flex; align-items: center; gap: 10px;
  }
  .nav-logo-badge {
    width: 28px; height: 28px; border-radius: 6px;
    background: linear-gradient(135deg, var(--blueprint) 0%, #1d4ed8 100%);
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
  }
  .nav-links a:hover { color: var(--blueprint); }
  .nav-cta {
    font-family: var(--font-mono); font-size: 12px; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 10px 22px; border-radius: 6px;
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
    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
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
    opacity: 0; animation: fadeSlideUp 0.8s 0.3s forwards;
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
    opacity: 0; animation: fadeSlideUp 0.9s 0.5s forwards;
  }
  .hero-headline em {
    font-style: normal;
    background: linear-gradient(135deg, var(--blueprint) 0%, #818cf8 50%, var(--acid) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-sub {
    font-family: var(--font-mono); font-size: 14px; font-weight: 300;
    line-height: 1.8; color: var(--latex-dim);
    max-width: 560px; margin-top: 32px;
    opacity: 0; animation: fadeSlideUp 0.9s 0.7s forwards;
  }
  .hero-sub code {
    font-family: var(--font-mono); font-size: 13px;
    color: var(--acid); background: var(--acid-dim);
    padding: 2px 7px; border-radius: 3px;
    border: 1px solid rgba(132,204,22,0.3);
  }
  .hero-actions {
    display: flex; align-items: center; gap: 20px; margin-top: 52px;
    opacity: 0; animation: fadeSlideUp 0.9s 0.9s forwards;
  }
  .btn-primary {
    position: relative; font-family: var(--font-mono);
    font-size: 13px; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase; padding: 16px 38px;
    border-radius: 8px; cursor: none; text-decoration: none;
    color: var(--latex-white);
    background: linear-gradient(135deg, var(--blueprint) 0%, #1d4ed8 100%);
    border: none; overflow: hidden;
    box-shadow: 0 0 40px var(--blueprint-glow), inset 0 1px 0 rgba(255,255,255,0.15);
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
    border: 1px solid var(--stroke); padding: 16px 32px;
    border-radius: 8px; cursor: none; text-decoration: none;
    transition: all 0.25s;
    display: flex; align-items: center; gap: 10px;
  }
  .btn-ghost:hover { color: var(--latex-white); border-color: var(--latex-dim); }
  .hero-scroll-hint {
    position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    opacity: 0; animation: fadeSlideUp 0.9s 1.3s forwards;
  }
  .scroll-line {
    width: 1px; height: 48px;
    background: linear-gradient(to bottom, transparent, var(--blueprint), transparent);
    animation: scrollPulse 2s ease-in-out infinite;
  }
  .scroll-label {
    font-family: var(--font-mono); font-size: 10px; font-weight: 300;
    letter-spacing: 0.2em; text-transform: uppercase; color: var(--latex-faint);
    writing-mode: vertical-rl;
  }

  /* Hero floating math */
  .hero-math-float {
    position: absolute; font-family: var(--font-mono);
    font-size: 13px; font-weight: 200; color: rgba(59,130,246,0.2);
    pointer-events: none; animation: floatMath 8s ease-in-out infinite;
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
    background: linear-gradient(90deg, transparent, rgba(59,130,246,0.04), transparent);
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
    font-family: var(--font-head); font-size: 42px; font-weight: 800;
    line-height: 1; letter-spacing: -0.04em;
    background: linear-gradient(135deg, var(--latex-white), var(--blueprint));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
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
    background: radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(59,130,246,0.08) 0%, transparent 60%);
    opacity: 0; transition: opacity 0.3s;
  }
  .bento-card:hover { border-color: var(--stroke-bright); transform: translateY(-4px); box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px var(--stroke-bright); }
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
  /* Feature-specific card bg accents */
  .bento-1 .card-bg-accent {
    position: absolute; right: -60px; bottom: -60px;
    width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .bento-2 .card-bg-accent {
    position: absolute; top: 0; right: 0;
    width: 100%; height: 100%;
    background: linear-gradient(135deg, transparent 60%, rgba(132,204,22,0.05) 100%);
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
    animation: shapeMorph 3s ease-in-out infinite;
  }
  .morph-arrow {
    font-size: 20px; color: var(--blueprint); opacity: 0.6;
    animation: arrowPulse 3s ease-in-out infinite;
  }
  .shape-morph.target {
    border-radius: 50%;
    background: rgba(132,204,22,0.1);
    border-color: var(--acid);
    animation: shapeMorphTarget 3s ease-in-out infinite;
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
    border-radius: 4px; animation: clipSlide 3s ease-in-out infinite;
  }
  .tl-clip-1 { left: 5%; width: 40%; background: var(--blueprint); animation-delay: 0s; }
  .tl-clip-2 { left: 20%; width: 55%; background: rgba(132,204,22,0.7); animation-delay: 0.4s; }
  .tl-clip-3 { left: 10%; width: 30%; background: rgba(129,140,248,0.7); animation-delay: 0.8s; }

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
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 2px; border-radius: 20px; overflow: hidden;
    border: 1px solid var(--stroke);
    box-shadow: 0 40px 100px rgba(0,0,0,0.6);
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
  .panel-dot-r { background: #ff5f57; }
  .panel-dot-y { background: #febc2e; }
  .panel-dot-g { background: #28c840; }
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
    width: 32px; height: 32px; border-radius: 6px;
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
      rgba(59,130,246,0.04) 30px, rgba(59,130,246,0.04) 31px
    ),
    repeating-linear-gradient(
      90deg, transparent, transparent 30px,
      rgba(59,130,246,0.04) 30px, rgba(59,130,246,0.04) 31px
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
    animation: canvasFloat1 4s ease-in-out infinite;
  }
  .canvas-obj-2 {
    width: 70px; height: 70px; right: 80px; top: 80px;
    border-radius: 50%;
    border-color: var(--acid);
    background: var(--acid-dim);
    animation: canvasFloat2 5s ease-in-out infinite;
  }
  .canvas-obj-3 {
    width: 60px; height: 60px; left: 100px; bottom: 50px;
    transform: rotate(45deg);
    animation: canvasFloat3 4.5s ease-in-out infinite;
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
  .ln { color: rgba(248,250,252,0.2); min-width: 24px; user-select: none; }
  .code-kw { color: #c084fc; }
  .code-fn { color: #60a5fa; }
  .code-str { color: #86efac; }
  .code-num { color: #fb923c; }
  .code-cm { color: rgba(248,250,252,0.3); }
  .code-cls { color: #f472b6; }
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
    animation: livePulse 1.5s ease-in-out infinite;
  }
  .typing-line {
    animation: typeIn 0.5s ease forwards;
  }

  /* Divider */
  .split-divider {
    width: 2px; background: linear-gradient(to bottom, transparent, var(--blueprint), var(--acid), transparent);
    position: relative;
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
    color: rgba(59,130,246,0.12);
    margin-bottom: 20px; transition: color 0.3s;
  }
  .step:hover .step-num { color: rgba(59,130,246,0.25); }
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
    background: linear-gradient(90deg, transparent, rgba(59,130,246,0.03), transparent);
    position: relative;
  }
  .marquee-track {
    display: flex; white-space: nowrap;
    animation: marquee 20s linear infinite;
  }
  .marquee-item {
    font-family: var(--font-head); font-size: 80px; font-weight: 800;
    letter-spacing: -0.04em; text-transform: uppercase;
    padding: 0 48px;
    background: linear-gradient(135deg, rgba(248,250,252,0.06), rgba(248,250,252,0.12));
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
    background: linear-gradient(135deg, var(--blueprint), var(--acid));
    -webkit-background-clip: text; background-clip: text;
  }

  /* ═══════════════════════════════════════════
     CTA SECTION
  ═══════════════════════════════════════════ */
  .cta-section {
    padding: 160px 48px;
    text-align: center; position: relative; overflow: hidden;
  }
  .cta-section::before {
    content: ''; position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%);
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
  .footer-left .nav-logo { font-size: 15px; }
  .footer-left p {
    font-family: var(--font-mono); font-size: 11px; font-weight: 300;
    color: var(--latex-faint); margin-top: 12px; line-height: 1.8;
  }
  .footer-center {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
  }
  .footer-center p {
    font-family: var(--font-mono); font-size: 10px; font-weight: 300;
    color: var(--latex-faint); letter-spacing: 0.1em; text-align: center;
  }
  .footer-links {
    display: flex; gap: 32px; list-style: none;
    justify-content: flex-end;
  }
  .footer-links a {
    font-family: var(--font-mono); font-size: 11px; font-weight: 300;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--latex-dim); text-decoration: none; transition: color 0.2s;
  }
  .footer-links a:hover { color: var(--blueprint); }

  /* ═══════════════════════════════════════════
     SCROLL REVEAL
  ═══════════════════════════════════════════ */
  .reveal {
    opacity: 0; transform: translateY(32px);
    transition: opacity 0.9s cubic-bezier(0.25,0.46,0.45,0.94),
                transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94);
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
    100% { transform: translateX(-50%); }
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
    .footer-links { justify-content: center; }
  }
  @media (max-width: 768px) {
    nav { padding: 16px 24px; }
    .nav-links { display: none; }
    .hero { padding: 100px 24px 60px; }
    .hero-math-float { display: none; }
    .features-section, .split-section, .workflow-section { padding: 80px 24px; }
    .stats-inner { flex-direction: column; gap: 32px; padding: 0 24px; }
    .stat-item + .stat-item::before { display: none; }
    .bento-3, .bento-4, .bento-5 { grid-column: span 12; }
    .workflow-steps { grid-template-columns: 1fr; }
    footer { padding: 48px 24px; }
  }
</style>
