<template>
  <div
    class="timeline-clip"
    :class="[typeClass, { selected: isSelected }]"
    :style="clipStyle"
    @mousedown.stop="onDown"
    @click.stop="select"
  >
    <div class="clip-inner">
      <span class="clip-icon" v-html="typeIcon"></span>
      <span class="clip-label">{{ label }}</span>
    </div>
    <div class="resize-handle left" @mousedown.stop="resize('left', $event)"></div>
    <div class="resize-handle right" @mousedown.stop="resize('right', $event)"></div>
  </div>
</template>

<script>
import { store, actions, getters } from '../../store/project.js';

const ICONS = {
  transform: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M17 3l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/></svg>',
  move: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 9l-3 3 3 3"/><path d="M9 5l3-3 3 3"/><path d="M15 19l3 3 3-3"/><path d="M19 9l3 3-3 3"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>',
  scale: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>',
  fade: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10" opacity="0.5"/></svg>',
  rotate: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1014.85-3.36L23 8"/></svg>'
};

export default {
  name: 'TimelineClip',
  props: { clip: Object, pps: Number },

  computed: {
    isSelected() { return store.selectedClipId === this.clip.id; },
    label() {
      const src = getters.objectById(this.clip.sourceId);
      const tgt = getters.objectById(this.clip.targetId);
      if (this.clip.type === 'transform' && src && tgt) return `${src.name} → ${tgt.name}`;
      const labels = { transform: 'Transform', move: 'Move', scale: 'Scale', fade: 'Fade', rotate: 'Rotate' };
      let l = labels[this.clip.type] || this.clip.type;
      if (src) l += ` · ${src.name}`;
      return l;
    },
    typeIcon() { return ICONS[this.clip.type] || ''; },
    typeClass() {
      return {
        transform: 'clip-transform', move: 'clip-move', scale: 'clip-scale', fade: 'clip-fade', rotate: 'clip-rotate'
      }[this.clip.type] || 'clip-default';
    },
    clipStyle() {
      return { left: `${this.clip.startTime * this.pps}px`, width: `${Math.max(28, this.clip.duration * this.pps)}px` };
    }
  },

  methods: {
    select() { actions.selectClip(this.clip.id); },
    onDown(e) {
      this.select();
      const sx = e.clientX, st = this.clip.startTime;
      const move = (ev) => { const dt = (ev.clientX - sx) / this.pps; actions.updateClip(this.clip.id, { startTime: Math.max(0, Math.round((st + dt) * 10) / 10) }); };
      const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    },
    resize(dir, e) {
      const sx = e.clientX, st = this.clip.startTime, sd = this.clip.duration;
      const move = (ev) => {
        const dt = (ev.clientX - sx) / this.pps;
        if (dir === 'left') {
          actions.updateClip(this.clip.id, { startTime: Math.max(0, Math.round((st + dt) * 10) / 10), duration: Math.max(0.1, Math.round((sd - dt) * 10) / 10) });
        } else {
          actions.updateClip(this.clip.id, { duration: Math.max(0.1, Math.round((sd + dt) * 10) / 10) });
        }
      };
      const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    }
  }
};
</script>

<style scoped>
.timeline-clip {
  @apply absolute top-1 bottom-1 rounded-md cursor-pointer transition-shadow overflow-hidden;
  min-width: 28px;
}
.timeline-clip.selected {
  @apply ring-2 ring-white/70 ring-offset-1 ring-offset-studio-bg;
}
.clip-inner {
  @apply h-full px-1.5 flex items-center gap-1 overflow-hidden;
}
.clip-icon { @apply flex-shrink-0 opacity-80; }
.clip-label { @apply text-[9px] font-semibold text-white/90 truncate; }

.clip-transform { background: linear-gradient(135deg, #9333ea, #6366f1); }
.clip-move { background: linear-gradient(135deg, #3b82f6, #06b6d4); }
.clip-scale { background: linear-gradient(135deg, #22c55e, #10b981); }
.clip-fade { background: linear-gradient(135deg, #f59e0b, #ef4444); }
.clip-rotate { background: linear-gradient(135deg, #ec4899, #f43f5e); }
.clip-default { background: #475569; }

.resize-handle {
  @apply absolute top-0 bottom-0 w-2 cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity;
}
.resize-handle.left { @apply left-0; background: linear-gradient(90deg, rgba(255,255,255,0.3), transparent); }
.resize-handle.right { @apply right-0; background: linear-gradient(270deg, rgba(255,255,255,0.3), transparent); }
.timeline-clip:hover .resize-handle { @apply opacity-50; }
</style>
