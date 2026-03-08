<template>
  <div id="cursor"><div id="cursor-dot"></div></div>
  <div id="cursor-ring"></div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

let rafId = null
let mousemoveHandler = null

onMounted(() => {
  const cursorDot = document.getElementById('cursor')
  const cursorRing = document.getElementById('cursor-ring')
  let ringX = 0, ringY = 0, dotX = 0, dotY = 0

  mousemoveHandler = e => {
    dotX = e.clientX; dotY = e.clientY
    cursorDot.style.transform = `translate(${dotX}px, ${dotY}px)`
  }
  document.addEventListener('mousemove', mousemoveHandler)

  function animateRing() {
    ringX += (dotX - ringX) * 0.12
    ringY += (dotY - ringY) * 0.12
    cursorRing.style.left = ringX + 'px'
    cursorRing.style.top = ringY + 'px'
    rafId = requestAnimationFrame(animateRing)
  }
  animateRing()
})

onUnmounted(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  if (mousemoveHandler) document.removeEventListener('mousemove', mousemoveHandler)
})
</script>
