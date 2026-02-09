<template>
  <div class="video-preview">
    <div class="relative bg-black rounded-lg overflow-hidden aspect-video">
      <video
        v-if="videoUrl"
        ref="video"
        :key="cacheBuster"
        :src="videoUrl"
        controls
        class="w-full h-full"
        @error="onError"
        @loadeddata="onLoaded"
      >
        Your browser does not support video playback.
      </video>
      
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-studio-bg">
        <span class="animate-spin text-2xl">⏳</span>
      </div>
      
      <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-studio-bg">
        <div class="text-center text-studio-text-muted">
          <div class="text-2xl mb-2">⚠️</div>
          <p class="text-xs">Failed to load video</p>
        </div>
      </div>
    </div>
    
    <div class="flex items-center justify-between mt-2">
      <span class="text-xs text-studio-text-muted">Latest Render</span>
      <a
        :href="videoUrl"
        download="render.mp4"
        class="text-xs text-studio-accent hover:text-studio-accent-hover"
      >
        ⬇ Download
      </a>
    </div>
  </div>
</template>

<script>
import api from '../../api.js';

export default {
  name: 'VideoPreview',
  
  props: {
    projectId: { type: String, required: true }
  },
  
  data() {
    return {
      loading: true,
      error: false,
      cacheBuster: Date.now()
    };
  },
  
  computed: {
    videoUrl() {
      return api.renders.getLatestUrl(this.projectId).replace(/\?t=\d+/, '') + '?t=' + this.cacheBuster;
    }
  },
  
  watch: {
    projectId() {
      // Refresh cache buster when project changes
      this.cacheBuster = Date.now();
      this.loading = true;
      this.error = false;
    }
  },
  
  methods: {
    onLoaded() {
      this.loading = false;
      this.error = false;
    },
    onError() {
      this.loading = false;
      this.error = true;
    },
    refresh() {
      // Force refresh the video with a new cache buster
      this.cacheBuster = Date.now();
      this.loading = true;
      this.error = false;
    }
  },
  
  mounted() {
    // Expose refresh method to parent
    this.$emit('ready', this.refresh);
  }
};
</script>
