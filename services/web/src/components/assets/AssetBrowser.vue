<template>
  <div class="asset-browser h-full flex flex-col">
    <div class="panel-header flex items-center justify-between">
      <span>Assets</span>
      <button @click="showUploader = true" class="text-xs px-2 py-1 bg-studio-accent rounded hover:bg-studio-accent-hover">
        + Upload
      </button>
    </div>
    
    <div class="flex-1 overflow-y-auto p-3">
      <div v-if="assets.length === 0" class="text-center text-studio-text-muted py-8">
        <div class="text-3xl mb-2 opacity-30">📁</div>
        <p class="text-sm">No assets yet</p>
        <p class="text-xs mt-1">Upload images or SVGs</p>
      </div>
      
      <div v-else class="grid grid-cols-2 gap-2">
        <div
          v-for="asset in assets"
          :key="asset.id"
          class="asset-item relative group cursor-grab bg-studio-bg rounded-lg overflow-hidden aspect-square"
          draggable="true"
          @dragstart="onDragStart(asset, $event)"
        >
          <img 
            v-if="asset.type === 'image'"
            :src="getAssetUrl(asset)"
            :alt="asset.filename"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-studio-border">
            <span class="text-2xl">📐</span>
          </div>
          
          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
            <span class="text-xs text-white truncate flex-1">{{ asset.filename }}</span>
            <button @click.stop="deleteAsset(asset)" class="text-studio-error hover:text-red-400 ml-1">✕</button>
          </div>
          
          <div class="absolute top-1 right-1">
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-black/50 text-white uppercase">
              {{ asset.type }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Upload Modal -->
    <div v-if="showUploader" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div class="bg-studio-surface border border-studio-border rounded-lg w-96 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-medium">Upload Assets</h3>
          <button @click="showUploader = false" class="text-studio-text-muted hover:text-studio-text">✕</button>
        </div>
        
        <AssetUploader @uploaded="onAssetUploaded" @close="showUploader = false" />
      </div>
    </div>
  </div>
</template>

<script>
import { store, actions } from '../../store/project.js';
import api from '../../api.js';
import AssetUploader from './AssetUploader.vue';

export default {
  name: 'AssetBrowser',
  components: { AssetUploader },
  
  data() {
    return {
      showUploader: false,
      serverAssets: []
    };
  },
  
  computed: {
    projectId() { return store.project.id; },
    assets() { return store.project.assets || []; }
  },
  
  watch: {
    projectId: { immediate: true, handler() { this.loadAssets(); } }
  },
  
  methods: {
    async loadAssets() {
      if (!this.projectId) return;
      try {
        this.serverAssets = await api.assets.list(this.projectId);
      } catch (err) {
        console.error('Failed to load assets:', err);
      }
    },
    
    getAssetUrl(asset) {
      return api.assets.getUrl(this.projectId, asset.filename);
    },
    
    onDragStart(asset, e) {
      e.dataTransfer.setData('application/json', JSON.stringify(asset));
      e.dataTransfer.effectAllowed = 'copy';
    },
    
    async deleteAsset(asset) {
      if (!confirm('Delete this asset?')) return;
      try {
        await api.assets.delete(this.projectId, asset.filename);
        actions.removeAsset(asset.id);
        await this.loadAssets();
      } catch (err) {
        console.error('Failed to delete asset:', err);
      }
    },
    
    onAssetUploaded(asset) {
      actions.addAsset(asset);
      this.showUploader = false;
      this.loadAssets();
    }
  }
};
</script>
