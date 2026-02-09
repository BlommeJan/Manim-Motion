<template>
  <div class="flex border-b border-studio-border/30 h-10">
    <div class="flex-shrink-0 flex items-center px-2 bg-studio-bg/20 border-r border-studio-border/30 text-[10px] text-studio-text-muted/60" :style="{ width: labelW + 'px' }">
      {{ track.name }}
      <span v-if="track.clips.length" class="ml-auto text-[9px] text-studio-accent">{{ track.clips.length }}</span>
    </div>
    <div class="track-bg relative flex-1 overflow-hidden" @click.self="deselect">
      <div :style="{ width: totalW + 'px' }" class="h-full relative">
        <TimelineClip v-for="clip in track.clips" :key="clip.id" :clip="clip" :pps="pps" />
      </div>
    </div>
  </div>
</template>

<script>
import { actions, getters } from '../../store/project.js';
import TimelineClip from './TimelineClip.vue';

export default {
  name: 'TimelineTrack',
  components: { TimelineClip },
  props: {
    track: { type: Object, required: true },
    pps: { type: Number, required: true },
    labelW: { type: Number, required: true }
  },
  computed: {
    totalW() { return getters.computedDuration() * this.pps + 50; }
  },
  methods: {
    deselect() { actions.deselectAll(); }
  }
};
</script>

<style scoped>
.track-bg {
  background-image: repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,0.015) 79px, rgba(255,255,255,0.015) 80px);
}
</style>
