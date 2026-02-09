<template>
  <div class="render-panel p-4">
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs text-studio-text-muted uppercase tracking-wider">Render</span>
    </div>
    
    <!-- Quality Selector -->
    <div class="mb-3">
      <label class="block text-xs text-studio-text-muted mb-1">Quality</label>
      <select v-model="quality" class="select text-sm">
        <option v-for="q in qualityOptions" :key="q.value" :value="q.value">
          {{ q.label }}
        </option>
      </select>
    </div>
    
    <!-- Render Button -->
    <button
      @click="startRender"
      :disabled="isRendering || !hasElements"
      class="w-full btn btn-primary mb-3"
      :class="{ 'opacity-50 cursor-not-allowed': isRendering || !hasElements }"
    >
      <span v-if="isRendering" class="flex items-center justify-center gap-2">
        <span class="animate-spin">⏳</span> Rendering...
      </span>
      <span v-else>🎬 Render Video</span>
    </button>
    
    <!-- Status -->
    <div v-if="renderStatus" class="mb-3 p-3 rounded text-sm" :class="statusClass">
      <div class="flex items-center gap-2">
        <span>{{ statusIcon }}</span>
        <span class="capitalize">{{ renderStatus }}</span>
      </div>
      <div v-if="renderStatus === 'running'" class="mt-2">
        <div class="h-1 bg-black/20 rounded-full overflow-hidden">
          <div class="h-full bg-white/50 animate-pulse" style="width: 60%"></div>
        </div>
      </div>
    </div>
    
    <!-- Logs Toggle -->
    <button
      v-if="hasLogs"
      @click="showLogs = !showLogs"
      class="text-xs text-studio-text-muted hover:text-studio-text mb-2"
    >
      {{ showLogs ? '▼ Hide Logs' : '▶ Show Logs' }}
    </button>
    
    <div v-if="showLogs && hasLogs" class="mb-3 p-2 bg-studio-bg rounded text-xs font-mono max-h-32 overflow-y-auto">
      <pre class="whitespace-pre-wrap text-studio-text-muted">{{ jobLogs }}</pre>
    </div>
    
    <!-- Video Preview -->
    <VideoPreview v-if="hasRender" :project-id="projectId" :key="renderKey" />
    
    <div v-else-if="!isRendering" class="text-center text-studio-text-muted py-4">
      <div class="text-2xl mb-2 opacity-30">🎥</div>
      <p class="text-xs">No render yet</p>
    </div>
  </div>
</template>

<script>
import { store, actions } from '../../store/project.js';
import { QUALITY_PRESETS } from '../../constants/animations.js';
import VideoPreview from './VideoPreview.vue';

export default {
  name: 'RenderPanel',
  components: { VideoPreview },
  
  data() {
    return {
      quality: 'high',
      qualityOptions: QUALITY_PRESETS,
      showLogs: false,
      pollInterval: null,
      jobData: null,
      hasRender: false,
      renderKey: 0
    };
  },
  
  computed: {
    projectId() { return store.project.id; },
    hasElements() { return store.project.elements.length > 0; },
    renderStatus() { return store.renderStatus; },
    isRendering() { return ['queued', 'running'].includes(this.renderStatus); },
    
    statusClass() {
      const classes = {
        queued: 'bg-studio-warning/20 text-studio-warning',
        running: 'bg-studio-accent/20 text-studio-accent',
        completed: 'bg-studio-success/20 text-studio-success',
        failed: 'bg-studio-error/20 text-studio-error'
      };
      return classes[this.renderStatus] || 'bg-studio-border';
    },
    
    statusIcon() {
      const icons = { queued: '⏳', running: '🔄', completed: '✅', failed: '❌' };
      return icons[this.renderStatus] || '•';
    },
    
    hasLogs() { return this.jobData?.stdout || this.jobData?.stderr; },
    jobLogs() { return this.jobData?.stderr || this.jobData?.stdout || ''; }
  },
  
  watch: {
    renderStatus(status) {
      if (status === 'completed') {
        this.hasRender = true;
        this.renderKey++;
      }
    }
  },
  
  mounted() {
    this.checkExistingRender();
  },
  
  beforeDestroy() {
    this.stopPolling();
  },
  
  methods: {
    async checkExistingRender() {
      if (!this.projectId) return;
      try {
        const info = await fetch(`/api/renders/${this.projectId}`).then(r => r.json());
        this.hasRender = info.hasLatest;
      } catch { /* ignore */ }
    },
    
    async startRender() {
      if (this.isRendering || !this.hasElements) return;
      
      try {
        await actions.triggerRender(this.quality);
        this.startPolling();
      } catch (err) {
        console.error('Render failed:', err);
      }
    },
    
    startPolling() {
      this.stopPolling();
      this.pollInterval = setInterval(async () => {
        const status = await actions.pollRenderStatus();
        if (status) {
          this.jobData = status;
          if (['completed', 'failed'].includes(status.status)) {
            this.stopPolling();
          }
        }
      }, 1500);
    },
    
    stopPolling() {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
      }
    }
  }
};
</script>
