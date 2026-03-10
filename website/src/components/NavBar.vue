<template>
  <nav>
    <a href="#top" class="nav-logo" aria-label="Manim Motion — scroll to top" @click="closeMenu">
      <img src="/logo.svg" alt="Manim Motion" class="nav-logo-img" />
      <span class="nav-logo-text">Manim Motion</span>
    </a>

    <!-- Desktop nav -->
    <ul class="nav-links">
      <li><a href="#features">Features</a></li>
      <li><a href="#workflow">Workflow</a></li>
      <li><a href="#interface">Interface</a></li>
    </ul>

    <div class="nav-right">
      <a href="https://github.com/BlommeJan/Manim-Motion" target="_blank" rel="noopener noreferrer" class="nav-cta magnet"><span>Get it on GitHub</span></a>

      <!-- Mobile hamburger -->
      <button
        ref="hamburgerRef"
        type="button"
        class="nav-hamburger"
        :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        <span class="hamburger-line" :class="{ open: menuOpen }"></span>
        <span class="hamburger-line" :class="{ open: menuOpen }"></span>
        <span class="hamburger-line" :class="{ open: menuOpen }"></span>
      </button>
    </div>
  </nav>

  <!-- Mobile drawer -->
  <Transition name="drawer">
    <div v-show="menuOpen" class="nav-drawer-overlay" @click="menuOpen = false" aria-hidden="true"></div>
  </Transition>
  <Transition name="drawer-slide">
    <aside
      v-show="menuOpen"
      ref="drawerRef"
      class="nav-drawer"
      role="dialog"
      aria-label="Navigation menu"
      aria-modal="true"
      @keydown="handleDrawerKeydown"
    >
      <ul class="nav-drawer-links">
        <li><a href="#features" @click="closeMenu">Features</a></li>
        <li><a href="#workflow" @click="closeMenu">Workflow</a></li>
        <li><a href="#interface" @click="closeMenu">Interface</a></li>
      </ul>
      <a href="https://github.com/BlommeJan/Manim-Motion" target="_blank" rel="noopener noreferrer" class="nav-drawer-cta" @click="closeMenu">
        Get it on GitHub
      </a>
    </aside>
  </Transition>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

const menuOpen = ref(false)
const hamburgerRef = ref(null)
const drawerRef = ref(null)

function closeMenu() {
  menuOpen.value = false
}

function getDrawerFocusables() {
  const drawer = drawerRef.value
  if (!drawer) return []
  return Array.from(
    drawer.querySelectorAll('a[href], button:not([disabled])')
  ).filter(el => !el.hasAttribute('hidden') && el.offsetParent !== null)
}

function handleDrawerKeydown(e) {
  if (e.key !== 'Tab') return
  const focusables = getDrawerFocusables()
  if (focusables.length === 0) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault()
      last.focus()
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

// Prevent body scroll when drawer open; focus management
watch(menuOpen, async (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    await nextTick()
    const focusables = getDrawerFocusables()
    if (focusables.length > 0) focusables[0].focus()
  } else {
    hamburgerRef.value?.focus()
  }
})

// Close on escape
function onKeydown(e) {
  if (e.key === 'Escape') closeMenu()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
/* Mobile hamburger & drawer */
.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid var(--stroke);
  background: transparent;
  border-radius: 8px;
  cursor: none;
  transition: border-color 0.2s, background 0.2s;
}

.nav-hamburger:hover {
  border-color: var(--blueprint);
  background: var(--blueprint-dim);
}

.hamburger-line {
  display: block;
  width: 20px;
  height: 2px;
  margin: 0 auto;
  background: var(--latex-white);
  transition: transform 0.25s, opacity 0.25s;
}

.hamburger-line:nth-child(1).open {
  transform: translateY(4px) rotate(45deg);
}

.hamburger-line:nth-child(2).open {
  opacity: 0;
}

.hamburger-line:nth-child(3).open {
  transform: translateY(-4px) rotate(-45deg);
}

.nav-drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 199;
  background: var(--overlay);
  backdrop-filter: blur(4px);
}

.nav-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  width: min(320px, 85vw);
  padding: 80px 32px 32px;
  background: var(--surface);
  border-left: 1px solid var(--stroke);
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.nav-drawer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-drawer-links a {
  display: block;
  padding: 14px 16px;
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--latex-dim);
  text-decoration: none;
  border-radius: 8px;
  transition: color 0.2s, background 0.2s;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.nav-drawer-links a:hover {
  color: var(--blueprint);
  background: var(--blueprint-dim);
}

.nav-drawer-cta {
  margin-top: auto;
  padding: 16px 24px;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--latex-white);
  background: linear-gradient(135deg, var(--blueprint) 0%, var(--blueprint-dark) 100%);
  border: none;
  border-radius: 8px;
  text-decoration: none;
  text-align: center;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s, transform 0.2s;
}

.nav-drawer-cta:hover {
  opacity: 0.95;
  transform: translateY(-1px);
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.25s var(--ease-out-smooth);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}

@media (max-width: 767px) {
  .nav-hamburger {
    display: flex;
  }

  .nav-links {
    display: none;
  }

  .nav-cta {
    display: none;
  }
}

@media (min-width: 768px) {
  .nav-drawer-overlay,
  .nav-drawer {
    display: none !important;
  }
}
</style>
