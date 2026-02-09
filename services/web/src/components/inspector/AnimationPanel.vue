<template>
  <div class="animation-panel px-4 py-3 border-b border-studio-border">
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs text-studio-text-muted uppercase tracking-wider">Animations</span>
    </div>
    
    <div class="mb-4">
      <label class="block text-xs text-studio-text-muted mb-2">Entrance</label>
      <select :value="inType" @change="updateAnim('in', 'type', $event.target.value)" class="select text-sm mb-2">
        <option v-for="a in entranceAnims" :key="a.type" :value="a.type">{{ a.label }}</option>
      </select>
      <div class="flex items-center gap-2">
        <span class="text-xs text-studio-text-muted">Duration:</span>
        <input type="number" :value="inDur" @input="updateAnim('in', 'duration', parseFloat($event.target.value))" min="0.1" step="0.1" class="input text-sm w-20" />
        <span class="text-xs text-studio-text-muted">s</span>
      </div>
    </div>
    
    <div>
      <label class="block text-xs text-studio-text-muted mb-2">Exit</label>
      <select :value="outType" @change="updateAnim('out', 'type', $event.target.value)" class="select text-sm mb-2">
        <option v-for="a in exitAnims" :key="a.type" :value="a.type">{{ a.label }}</option>
      </select>
      <div class="flex items-center gap-2">
        <span class="text-xs text-studio-text-muted">Duration:</span>
        <input type="number" :value="outDur" @input="updateAnim('out', 'duration', parseFloat($event.target.value))" min="0.1" step="0.1" class="input text-sm w-20" />
        <span class="text-xs text-studio-text-muted">s</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getEntranceAnimationsForType, getExitAnimationsForType } from '../../constants/animations.js';

export default {
  name: 'AnimationPanel',
  props: { element: { type: Object, required: true } },
  computed: {
    entranceAnims() { return getEntranceAnimationsForType(this.element.type); },
    exitAnims() { return getExitAnimationsForType(this.element.type); },
    inType() { return this.element.anim?.in?.type || 'FADE_IN'; },
    inDur() { return this.element.anim?.in?.duration || 0.5; },
    outType() { return this.element.anim?.out?.type || 'FADE_OUT'; },
    outDur() { return this.element.anim?.out?.duration || 0.5; }
  },
  methods: {
    updateAnim(dir, key, val) {
      const curr = this.element.anim?.[dir] || {};
      this.$emit('update', { anim: { ...this.element.anim, [dir]: { ...curr, [key]: val } } });
    }
  }
};
</script>
