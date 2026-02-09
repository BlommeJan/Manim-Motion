<template>
  <div class="timeline-panel bg-studio-surface border-t border-studio-border flex flex-col flex-shrink-0" style="height: 230px;">
    <!-- Header bar with tabs -->
    <div class="h-10 flex items-center px-3 border-b border-studio-border flex-shrink-0 gap-2">
      <!-- Time display -->
      <div class="flex items-center gap-1.5 font-mono text-studio-text-muted">
        <span class="text-xs tabular-nums">{{ fmt(totalDuration) }}</span>
        <span class="text-[10px]">total</span>
      </div>

      <div class="flex-1"></div>

      <!-- Transform badge -->
      <button v-if="canTransform" class="transform-badge" @click="createTransform">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 3l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 21l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
        Transform A→B
      </button>

      <!-- Zoom -->
      <div class="flex items-center gap-1">
        <button class="text-studio-text-muted hover:text-studio-text text-xs px-1" @click="zoomOut">-</button>
        <span class="text-[10px] text-studio-text-muted w-10 text-center tabular-nums">{{ Math.round(pps) }}px/s</span>
        <button class="text-studio-text-muted hover:text-studio-text text-xs px-1" @click="zoomIn">+</button>
      </div>
    </div>

    <!-- ═════════ TIMELINE ═════════ -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Time ruler -->
      <div class="h-6 border-b border-studio-border/50 relative flex-shrink-0">
        <div class="absolute top-0 left-0 h-full" :style="{ width: totalW + 'px', marginLeft: labelW + 'px' }">
          <div v-for="tk in ticks" :key="tk.t" class="absolute top-0 h-full flex flex-col justify-end" :style="{ left: tk.x + 'px' }">
            <div class="w-px" :class="tk.major ? 'h-3 bg-studio-text-muted/30' : 'h-1.5 bg-studio-border'"></div>
            <span v-if="tk.major" class="text-[8px] text-studio-text-muted/60 ml-0.5 leading-none">{{ tk.label }}</span>
          </div>
        </div>
      </div>

      <!-- Object bars -->
      <div class="border-b border-studio-border/50 flex h-10 flex-shrink-0" v-if="objects.length > 0">
        <div class="flex-shrink-0 flex items-center px-2 bg-studio-bg/30 border-r border-studio-border/50 text-[10px] text-studio-text-muted font-medium" :style="{ width: labelW + 'px' }">
          Objects
        </div>
        <div class="flex-1 relative overflow-hidden">
          <div :style="{ width: totalW + 'px' }" class="h-full relative">
            <div
              v-for="obj in objects"
              :key="'bar-'+obj.id"
              class="obj-bar"
              :class="{ selected: isObjSelected(obj.id), dragging: draggingObjId === obj.id }"
              :style="objBarStyle(obj)"
              @mousedown.stop="startObjDrag(obj, $event)"
              @click.stop="selectObj(obj.id, $event)"
            >
              <div class="resize-handle left" @mousedown.stop="startObjResize(obj, 'left', $event)"></div>
              <span class="obj-bar-dot" :style="{ background: objColor(obj) }"></span>
              <span class="truncate">{{ obj.name }}</span>
              <div class="resize-handle right" @mousedown.stop="startObjResize(obj, 'right', $event)"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Animation tracks -->
      <div class="flex-1 overflow-y-auto overflow-x-hidden">
        <TimelineTrack
          v-for="track in visibleTracks"
          :key="track.id"
          :track="track"
          :pps="pps"
          :labelW="labelW"
        />
        <div v-if="totalClipCount === 0 && objects.length > 0" class="px-4 py-3 text-[10px] text-studio-text-muted/60 text-center">
          Select two objects and click "Transform" to create your first animation
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { store, actions, getters, SHAPE_COLORS } from '../../store/project.js';
import TimelineTrack from './TimelineTrack.vue';

export default {
  name: 'Timeline',
  components: { TimelineTrack },

  data() {
    return {
      pps: 80,
      labelW: 90,
      draggingObjId: null
    };
  },

  computed: {
    totalDuration() { return getters.computedDuration(); },
    objects() { return store.project.objects; },
    visibleTracks() { return getters.visibleTracks(); },
    canTransform() { return store.selectedObjectIds.length === 2; },
    totalClipCount() { let c = 0; for (const t of store.project.tracks) c += t.clips.length; return c; },
    totalW() { return this.totalDuration * this.pps + 50; },
    ticks() {
      const t = []; const iv = this.pps >= 100 ? 0.5 : 1; const miv = this.pps >= 100 ? 1 : 5;
      for (let s = 0; s <= this.totalDuration; s += iv) {
        t.push({ t: s, x: s * this.pps, major: Math.abs(s % miv) < 0.01 || Math.abs(s % miv - miv) < 0.01, label: this.fmt(s) });
      }
      return t;
    }
  },

  methods: {
    fmt(s) { const m = Math.floor(s / 60); const sec = s % 60; return m > 0 ? `${m}:${sec.toFixed(1).padStart(4, '0')}` : `${sec.toFixed(1)}s`; },

    zoomIn() { this.pps = Math.min(300, this.pps * 1.4); },
    zoomOut() { this.pps = Math.max(20, this.pps / 1.4); },

    objBarStyle(obj) {
      const enter = obj.enterTime || 0;
      const dur = obj.duration || 3;
      return { left: `${enter * this.pps}px`, width: `${Math.max(20, dur * this.pps)}px`, background: this.objColor(obj) + '20', borderColor: this.objColor(obj) + '60' };
    },
    objColor(obj) { return SHAPE_COLORS[obj.type] || '#94a3b8'; },
    isObjSelected(id) { return store.selectedObjectIds.includes(id); },
    selectObj(id, e) { actions.selectObject(id, e.shiftKey || e.ctrlKey); },

    startObjDrag(obj, e) {
      this.selectObj(obj.id, e);
      this.draggingObjId = obj.id;
      const startX = e.clientX;
      const startEnter = obj.enterTime || 0;

      const move = (ev) => {
        const dx = (ev.clientX - startX) / this.pps;
        const newEnter = Math.max(0, Math.round((startEnter + dx) * 10) / 10);
        actions.updateObject(obj.id, { enterTime: newEnter });
      };
      const up = () => {
        this.draggingObjId = null;
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    },

    startObjResize(obj, dir, e) {
      e.preventDefault();
      this.selectObj(obj.id, e);
      this.draggingObjId = obj.id;
      const startX = e.clientX;
      const startEnter = obj.enterTime || 0;
      const startDur = obj.duration || 3;

      const move = (ev) => {
        const dx = (ev.clientX - startX) / this.pps;
        if (dir === 'left') {
          const newEnter = Math.max(0, Math.round((startEnter + dx) * 10) / 10);
          const newDur = Math.max(0.1, Math.round((startDur - dx) * 10) / 10);
          actions.updateObject(obj.id, { enterTime: newEnter, duration: newDur });
        } else {
          const newDur = Math.max(0.1, Math.round((startDur + dx) * 10) / 10);
          actions.updateObject(obj.id, { duration: newDur });
        }
      };
      const up = () => {
        this.draggingObjId = null;
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    },

    createTransform() {
      const clip = actions.createTransform();
      if (clip) actions.selectClip(clip.id);
    }
  }
};
</script>

<style scoped>
.transform-badge {
  @apply flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold;
  @apply bg-purple-600 text-white hover:bg-purple-500 transition-colors;
  @apply shadow-lg shadow-purple-600/20;
}

.obj-bar {
  @apply absolute top-1 bottom-1 rounded-md border flex items-center gap-1 px-1.5 text-[9px] font-medium text-studio-text-muted;
  @apply cursor-grab hover:brightness-125 transition-all;
}
.obj-bar.dragging { @apply cursor-grabbing; }
.obj-bar.selected { @apply ring-1 ring-white/50; }
.obj-bar-dot { @apply w-1.5 h-1.5 rounded-full flex-shrink-0; }

.obj-bar .resize-handle {
  @apply absolute top-0 bottom-0 w-2 cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity z-10;
}
.obj-bar .resize-handle.left { @apply left-0; background: linear-gradient(90deg, rgba(255,255,255,0.3), transparent); }
.obj-bar .resize-handle.right { @apply right-0; background: linear-gradient(270deg, rgba(255,255,255,0.3), transparent); }
.obj-bar:hover .resize-handle { @apply opacity-50; }

</style>
