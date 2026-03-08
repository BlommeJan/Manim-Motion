<template>
  <div class="marquee-section" ref="sectionEl">
    <div class="marquee-track" id="marquee">
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
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const sectionEl = ref(null)
let enterHandler = null
let leaveHandler = null

onMounted(() => {
  const track = document.getElementById('marquee')
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
