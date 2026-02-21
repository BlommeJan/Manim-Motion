<template>
  <aside class="w-56 bg-studio-surface border-r border-studio-border flex flex-col flex-shrink-0 overflow-y-auto">
    <!-- ═══ Shapes ═══ -->
    <div class="p-3 border-b border-studio-border">
      <h3 class="section-title">Shapes</h3>
      <div class="grid grid-cols-3 gap-1.5">
        <button
          v-for="s in shapes"
          :key="s.type"
          class="shape-card group"
          draggable="true"
          @dragstart="onDragStart(s.type, $event)"
          @dragend="onDragEnd"
          @click="addShape(s.type)"
          :title="'Drag or click to add ' + s.label"
        >
          <div class="shape-icon" :style="{ color: s.color }">
            <span v-html="s.icon"></span>
          </div>
          <span class="shape-label">{{ s.label }}</span>
        </button>
      </div>
    </div>

    <!-- ═══ Text ═══ -->
    <div class="p-3 border-b border-studio-border">
      <h3 class="section-title">Text</h3>
      <button
        class="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-studio-bg hover:bg-studio-border cursor-pointer border border-transparent hover:border-studio-accent/30 transition-all text-left"
        draggable="true"
        @dragstart="onDragStart('text', $event)"
        @dragend="onDragEnd"
        @click="addShape('text')"
        title="Drag or click to add text"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2">
          <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
        </svg>
        <div>
          <span class="text-xs font-medium text-studio-text">Add Text</span>
          <span class="text-[9px] text-studio-text-muted block">Editable text block</span>
        </div>
      </button>
      <p class="text-[9px] text-amber-400/70 mt-1.5 leading-relaxed">
        Note: Text size on canvas may differ from the final render.
      </p>
    </div>

    <!-- ═══ Images (raster) ═══ -->
    <div class="p-3 border-b border-studio-border">
      <div class="flex items-center justify-between mb-2">
        <h3 class="section-title mb-0">Images</h3>
        <span v-if="imageAssets.length" class="text-[9px] text-studio-accent font-semibold bg-studio-accent/10 px-1.5 py-0.5 rounded-full">{{ imageAssets.length }}</span>
      </div>

      <label class="upload-btn mb-2 cursor-pointer">
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple class="hidden" @change="handleUploadImages" />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span>Upload PNG / JPEG</span>
      </label>

      <div v-if="imageAssets.length > 0" class="grid grid-cols-2 gap-1.5">
        <div
          v-for="asset in imageAssets"
          :key="asset.id"
          class="asset-thumb group"
          draggable="true"
          @dragstart="onDragStartAsset(asset.id, $event)"
          @dragend="onDragEnd"
          @click="addAssetToStage(asset.id)"
          :title="'Drag or click to add ' + asset.name"
        >
          <img :src="asset.dataUrl" :alt="asset.name" class="w-full h-14 object-contain rounded" />
          <span class="asset-label">{{ asset.name }}</span>
          <button class="asset-remove" @click.stop="removeAsset(asset.id)" title="Remove">&times;</button>
        </div>
      </div>
      <div v-else class="text-center py-3">
        <p class="text-[9px] text-studio-text-muted/40">Upload raster images</p>
      </div>
    </div>

    <!-- ═══ Vector Images (SVG) ═══ -->
    <div class="p-3 border-b border-studio-border">
      <div class="flex items-center justify-between mb-2">
        <h3 class="section-title mb-0">Vector Images</h3>
        <span v-if="svgAssets.length" class="text-[9px] text-emerald-400 font-semibold bg-emerald-400/10 px-1.5 py-0.5 rounded-full">{{ svgAssets.length }}</span>
      </div>

      <label class="upload-btn mb-2 cursor-pointer" style="border-color: rgba(16,185,129,0.3);">
        <input type="file" accept="image/svg+xml" multiple class="hidden" @change="handleUploadSvgs" />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span>Upload SVG</span>
      </label>

      <div v-if="svgAssets.length > 0" class="grid grid-cols-2 gap-1.5">
        <div
          v-for="asset in svgAssets"
          :key="asset.id"
          class="asset-thumb group"
          draggable="true"
          @dragstart="onDragStartAsset(asset.id, $event)"
          @dragend="onDragEnd"
          @click="addAssetToStage(asset.id)"
          :title="'Drag or click to add ' + asset.name"
        >
          <img :src="asset.dataUrl" :alt="asset.name" class="w-full h-14 object-contain rounded" />
          <span class="asset-label">{{ asset.name }}</span>
          <button class="asset-remove" @click.stop="removeAsset(asset.id)" title="Remove">&times;</button>
        </div>
      </div>
      <div v-else class="text-center py-3">
        <p class="text-[9px] text-studio-text-muted/40">Upload scalable vector graphics</p>
      </div>
    </div>

    <!-- ═══ Transform action ═══ -->
    <div class="p-3 mt-auto border-t border-studio-border">
      <button
        class="w-full btn-transform"
        :class="{ active: canTransform }"
        :disabled="!canTransform"
        @click="createTransform"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 3l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 21l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
        <span>{{ canTransform ? 'Create Transform' : 'Select 2 to morph' }}</span>
      </button>
      <p v-if="!canTransform" class="text-[8px] text-studio-text-muted/40 text-center mt-1.5 leading-relaxed">
        Click shape, then Shift+click another
      </p>
    </div>
  </aside>
</template>

<script>
import { store, actions } from '../../store/project.js';

export default {
  name: 'AssetSidebar',

  data() {
    return {
      shapes: [
        { type: 'rectangle', label: 'Rect',     color: '#3b82f6', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/></svg>' },
        { type: 'square',    label: 'Square',    color: '#3b82f6', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>' },
        { type: 'circle',    label: 'Circle',    color: '#22c55e', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/></svg>' },
        { type: 'ellipse',   label: 'Ellipse',   color: '#06b6d4', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><ellipse cx="12" cy="12" rx="10" ry="6"/></svg>' },
        { type: 'triangle',  label: 'Triangle',  color: '#f59e0b', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 3 22 20 2 20"/></svg>' },
        { type: 'star',      label: 'Star',      color: '#eab308', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' },
        { type: 'polygon',   label: 'Hexagon',   color: '#8b5cf6', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/></svg>' },
        { type: 'arrow',     label: 'Arrow',     color: '#ef4444', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' },
        { type: 'heart',     label: 'Heart',     color: '#ec4899', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' },
        { type: 'line',      label: 'Line',      color: '#94a3b8', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="4" y1="20" x2="20" y2="4"/></svg>' },
        { type: 'dot',       label: 'Dot',       color: '#94a3b8', icon: '<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="currentColor"/></svg>' },
        { type: 'dot_grid',  label: '5x5 Grid',  color: '#a855f7', icon: '<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="5" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="19" cy="5" r="2" fill="currentColor"/><circle cx="5" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="19" cy="12" r="2" fill="currentColor"/><circle cx="5" cy="19" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/><circle cx="19" cy="19" r="2" fill="currentColor"/></svg>' },
        { type: 'latex',     label: 'LaTeX',     color: '#a855f7', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><text x="4" y="18" font-size="16" font-style="italic" fill="currentColor" stroke="none">fx</text></svg>' },
        { type: 'axes',      label: 'Axes',      color: '#10b981', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="20" x2="3" y2="4"/><line x1="3" y1="20" x2="20" y2="20"/><polyline points="3 4 1 6 3 4 5 6"/><polyline points="20 20 18 18 20 20 18 22"/></svg>' },
      ]
    };
  },

  computed: {
    assets() { return store.project.assets; },
    imageAssets() { return this.assets.filter(a => a.type === 'image'); },
    svgAssets() { return this.assets.filter(a => a.type === 'svg'); },
    canTransform() { return store.selectedObjectIds.length === 2; }
  },

  methods: {
    addShape(type) {
      const obj = actions.addObject(type);
      actions.selectObject(obj.id);
    },

    // ── Drag and Drop ──
    onDragStart(type, e) {
      e.dataTransfer.setData('application/x-shape-type', type);
      e.dataTransfer.effectAllowed = 'copy';
      // Create a small drag preview
      const el = document.createElement('div');
      el.style.cssText = 'width:40px;height:40px;background:rgba(99,102,241,0.3);border:2px solid #6366f1;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;color:white;pointer-events:none;position:fixed;top:-100px;';
      el.textContent = type.charAt(0).toUpperCase();
      document.body.appendChild(el);
      e.dataTransfer.setDragImage(el, 20, 20);
      setTimeout(() => document.body.removeChild(el), 0);
    },

    onDragStartAsset(assetId, e) {
      e.dataTransfer.setData('application/x-asset-id', assetId);
      e.dataTransfer.effectAllowed = 'copy';
    },

    onDragEnd() {
      // Cleanup if needed
    },

    async handleUploadImages(e) {
      const files = Array.from(e.target.files || []).filter(f => !f.type.includes('svg'));
      for (const file of files) {
        try {
          await actions.uploadAsset(file);
        } catch (err) {
          actions.setError(`Upload failed: ${err.message}`);
        }
      }
      e.target.value = '';
    },

    async handleUploadSvgs(e) {
      const files = Array.from(e.target.files || []).filter(f => f.type.includes('svg'));
      for (const file of files) {
        try {
          await actions.uploadAsset(file);
        } catch (err) {
          actions.setError(`Upload failed: ${err.message}`);
        }
      }
      e.target.value = '';
    },

    addAssetToStage(assetId) {
      const obj = actions.addImageObject(assetId);
      if (obj) actions.selectObject(obj.id);
    },

    removeAsset(id) {
      if (confirm('Remove this asset?')) {
        actions.removeAsset(id);
      }
    },

    createTransform() {
      if (!this.canTransform) return;
      const clip = actions.createTransform();
      if (clip) actions.selectClip(clip.id);
    }
  }
};
</script>

<style scoped>
.section-title {
  @apply text-[10px] font-bold uppercase tracking-widest text-studio-text-muted mb-2.5;
}

.shape-card {
  @apply flex flex-col items-center justify-center gap-0.5 p-2 rounded-lg transition-all duration-100;
  @apply bg-studio-bg hover:bg-studio-border cursor-grab active:cursor-grabbing;
  @apply border border-transparent hover:border-studio-accent/30;
}
.shape-card:active { @apply scale-95; }
.shape-icon { @apply w-8 h-8 flex items-center justify-center; }
.shape-label { @apply text-[9px] text-studio-text-muted font-medium; }

.upload-btn {
  @apply flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-studio-border;
  @apply text-[11px] text-studio-text-muted hover:text-studio-accent hover:border-studio-accent/40 transition-colors;
}

.asset-thumb {
  @apply relative bg-studio-bg rounded-lg p-1 cursor-grab border border-transparent hover:border-studio-accent/30 transition-all;
}
.asset-label { @apply block text-[9px] text-studio-text-muted truncate text-center mt-0.5; }
.asset-remove {
  @apply absolute -top-1 -right-1 w-4 h-4 rounded-full bg-studio-error text-white text-[10px] leading-none;
  @apply flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity;
}

.btn-transform {
  @apply flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all;
  @apply bg-studio-border/60 text-studio-text-muted;
}
.btn-transform.active {
  @apply bg-purple-600 text-white shadow-lg shadow-purple-600/30;
  animation: pulse-glow-purple 2s ease-in-out infinite;
}
.btn-transform:disabled { @apply opacity-40 cursor-not-allowed; }

@keyframes pulse-glow-purple {
  0%, 100% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.4); }
  50% { box-shadow: 0 0 12px 3px rgba(147, 51, 234, 0.2); }
}
</style>
