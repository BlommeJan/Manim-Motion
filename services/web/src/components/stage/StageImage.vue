<template>
  <v-group
    :config="config"
    @click="$emit('click', $event)"
    @dragend="$emit('dragend', $event)"
    @transformend="$emit('transformend', $event)"
  >
    <v-image v-if="imageLoaded" :config="imageConfig" />
    <v-rect v-else :config="placeholderConfig" />
  </v-group>
</template>

<script>
import { store } from '../../store/project.js';
import api from '../../api.js';

export default {
  name: 'StageImage',
  
  props: {
    element: {
      type: Object,
      required: true
    },
    config: {
      type: Object,
      required: true
    }
  },
  
  data() {
    return {
      image: null,
      imageLoaded: false
    };
  },
  
  computed: {
    asset() {
      return store.project.assets.find(a => a.id === this.element.assetId);
    },
    
    imageUrl() {
      if (!this.asset) return null;
      return api.assets.getUrl(store.project.id, this.asset.filename);
    },
    
    imageConfig() {
      return {
        image: this.image,
        x: -50, // Center offset
        y: -50,
        width: 100,
        height: 100,
        opacity: this.element.style?.opacity ?? 1
      };
    },
    
    placeholderConfig() {
      return {
        x: -50,
        y: -50,
        width: 100,
        height: 100,
        fill: '#2e2e3e',
        cornerRadius: 4
      };
    }
  },
  
  watch: {
    imageUrl: {
      immediate: true,
      handler(url) {
        if (url) {
          this.loadImage(url);
        }
      }
    }
  },
  
  methods: {
    loadImage(url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.image = img;
        this.imageLoaded = true;
      };
      img.onerror = () => {
        console.error('Failed to load image:', url);
        this.imageLoaded = false;
      };
      img.src = url;
    }
  }
};
</script>
