<template>
  <div class="asset-uploader">
    <div
      class="upload-zone border-2 border-dashed border-studio-border rounded-lg p-8 text-center transition-colors"
      :class="{ 'border-studio-accent bg-studio-accent/10': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
    >
      <input
        type="file"
        ref="fileInput"
        @change="onFileSelect"
        accept=".png,.jpg,.jpeg,.svg"
        multiple
        class="hidden"
      />
      
      <div v-if="!uploading">
        <div class="text-4xl mb-3 opacity-50">📤</div>
        <p class="text-sm text-studio-text-muted mb-2">Drag files here or</p>
        <button @click="$refs.fileInput.click()" class="btn btn-primary text-sm">
          Browse Files
        </button>
        <p class="text-xs text-studio-text-muted mt-3">PNG, JPG, SVG (max 50MB)</p>
      </div>
      
      <div v-else class="py-4">
        <div class="animate-spin text-3xl mb-2">⏳</div>
        <p class="text-sm">Uploading {{ uploadProgress }}...</p>
      </div>
    </div>
    
    <div v-if="error" class="mt-3 p-3 bg-studio-error/20 text-studio-error rounded text-sm">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { store } from '../../store/project.js';
import api from '../../api.js';

export default {
  name: 'AssetUploader',
  
  data() {
    return {
      isDragging: false,
      uploading: false,
      uploadProgress: '',
      error: null
    };
  },
  
  computed: {
    projectId() { return store.project.id; }
  },
  
  methods: {
    onDrop(e) {
      this.isDragging = false;
      const files = Array.from(e.dataTransfer.files);
      this.uploadFiles(files);
    },
    
    onFileSelect(e) {
      const files = Array.from(e.target.files);
      this.uploadFiles(files);
    },
    
    async uploadFiles(files) {
      if (!this.projectId || files.length === 0) return;
      
      this.uploading = true;
      this.error = null;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.uploadProgress = `${i + 1}/${files.length}`;
        
        try {
          const asset = await api.assets.upload(this.projectId, file);
          this.$emit('uploaded', asset);
        } catch (err) {
          this.error = `Failed to upload ${file.name}: ${err.message}`;
          break;
        }
      }
      
      this.uploading = false;
      if (!this.error) {
        this.$emit('close');
      }
    }
  }
};
</script>
