<template>
  <div class="marquee-section" ref="sectionEl" aria-hidden="true">
    <div class="marquee-track" id="marquee" :class="{ 'marquee-ready': partWidthPx > 0 }" :style="trackStyle">
      <div class="marquee-track-part" ref="part1Ref">
        <span class="marquee-item">From Code to Cinema</span>
        <span class="marquee-sep">·</span>
        <span class="marquee-item accent">Math Made Visual</span>
        <span class="marquee-sep">·</span>
        <span class="marquee-item">From Code to Cinema</span>
        <span class="marquee-sep">·</span>
        <span class="marquee-item accent">Animate at the Speed of Thought</span>
        <span class="marquee-sep">·</span>
        <span class="marquee-item">From Code to Cinema</span>
        <span class="marquee-sep">·</span>
        <span class="marquee-item accent">Math Made Visual</span>
        <span class="marquee-sep">·</span>
        <span class="marquee-item">From Code to Cinema</span>
        <span class="marquee-sep">·</span>
        <span class="marquee-item accent">Animate at the Speed of Thought</span>
        <span class="marquee-sep">·</span>
      </div>
      <div class="marquee-track-part">
        <span class="marquee-item">From Code to Cinema</span>
        <span class="marquee-sep">·</span>
        <span class="marquee-item accent">Math Made Visual</span>
        <span class="marquee-sep">·</span>
        <span class="marquee-item">From Code to Cinema</span>
        <span class="marquee-sep">·</span>
        <span class="marquee-item accent">Animate at the Speed of Thought</span>
        <span class="marquee-sep">·</span>
        <span class="marquee-item">From Code to Cinema</span>
        <span class="marquee-sep">·</span>
        <span class="marquee-item accent">Math Made Visual</span>
        <span class="marquee-sep">·</span>
        <span class="marquee-item">From Code to Cinema</span>
        <span class="marquee-sep">·</span>
        <span class="marquee-item accent">Animate at the Speed of Thought</span>
        <span class="marquee-sep">·</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'

const sectionEl = ref(null)
const part1Ref = ref(null)
const partWidthPx = ref(0)
let enterHandler = null
let leaveHandler = null

const trackStyle = computed(() =>
  partWidthPx.value > 0
    ? { '--marquee-offset': `-${partWidthPx.value}px` }
    : {}
)

onMounted(() => {
  const track = document.getElementById('marquee')
  const part1 = part1Ref.value
  if (part1 && track) {
    const ro = new ResizeObserver(() => {
      partWidthPx.value = part1.offsetWidth
    })
    ro.observe(part1)
    partWidthPx.value = part1.offsetWidth
  }
  if (track && track.parentElement) {
    enterHandler = () => { track.style.animationPlayState = 'paused' }
    leaveHandler = () => { track.style.animationPlayState = 'running' }
    track.parentElement.addEventListener('mouseenter', enterHandler)
    track.parentElement.addEventListener('mouseleave', leaveHandler)
  }
})

onUnmounted(() => {
  const track = document.getElementById('marquee')
  if (track && track.parentElement) {
    if (enterHandler) track.parentElement.removeEventListener('mouseenter', enterHandler)
    if (leaveHandler) track.parentElement.removeEventListener('mouseleave', leaveHandler)
  }
})
</script>
