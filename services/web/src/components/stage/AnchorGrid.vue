<template>
  <div class="anchor-grid">
    <div 
      v-for="(row, rowIndex) in grid" 
      :key="rowIndex" 
      class="anchor-row"
    >
      <button
        v-for="anchor in row"
        :key="anchor"
        :class="['anchor-btn', { active: value === anchor }]"
        :title="anchor"
        @click="$emit('input', anchor)"
      >
        {{ labels[anchor] }}
      </button>
    </div>
  </div>
</template>

<script>
import { ANCHOR_GRID, ANCHOR_LABELS } from '../../constants/anchors.js';

export default {
  name: 'AnchorGrid',
  
  props: {
    value: {
      type: String,
      default: 'CENTER'
    }
  },
  
  data() {
    return {
      grid: ANCHOR_GRID,
      labels: ANCHOR_LABELS
    };
  }
};
</script>

<style scoped>
.anchor-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px;
  background: var(--studio-bg, #0a0a0f);
  border-radius: 6px;
  width: fit-content;
}

.anchor-row {
  display: flex;
  gap: 2px;
}

.anchor-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--studio-surface, #12121a);
  border: 1px solid var(--studio-border, #1e1e2e);
  border-radius: 4px;
  color: var(--studio-text-muted, #64748b);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
}

.anchor-btn:hover {
  background: var(--studio-border, #1e1e2e);
  color: var(--studio-text, #e2e8f0);
}

.anchor-btn.active {
  background: var(--studio-accent, #6366f1);
  border-color: var(--studio-accent, #6366f1);
  color: white;
}
</style>
