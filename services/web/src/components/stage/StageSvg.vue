<template>
  <v-group
    :config="config"
    @click="$emit('click', $event)"
    @dragend="$emit('dragend', $event)"
    @transformend="$emit('transformend', $event)"
  >
    <v-image v-if="svgLoaded" :config="svgConfig" />
    <v-group v-else>
      <v-rect :config="placeholderConfig" />
      <v-text :config="labelConfig" />
    </v-group>
  </v-group>
</template>

<script>
import { store } from '../../store/project.js';
import api from '../../api.js';

export default {
  name: 'StageSvg',
  
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
      svgImage: null,
      svgLoaded: false
    };
  },
  
  computed: {
    asset() {
      return store.project.assets.find(a => a.id === this.element.assetId);
    },
    
    svgUrl() {
      if (!this.asset) return null;
      return api.assets.getUrl(store.project.id, this.asset.filename);
    },
    
    svgConfig() {
      return {
        image: this.svgImage,
        x: -50,
        y: -50,
        width: 100,
        height: 100
      };
    },
    
    placeholderConfig() {
      return {
        x: -50,
        y: -50,
        width: 100,
        height: 100,
        fill: 'transparent',
        stroke: this.element.style?.strokeColor || '#6366f1',
        strokeWidth: 2,
        dash: [4, 4],
        cornerRadius: 4
      };
    },
    
    labelConfig() {
      return {
        text: 'SVG',
        x: -20,
        y: -10,
        fontSize: 14,
        fill: '#6366f1',
        fontFamily: 'sans-serif'
      };
    }
  },
  
  watch: {
    svgUrl: {
      immediate: true,
      handler(url) {
        if (url) {
          this.loadSvg(url);
        }
      }
    }
  },
  
  methods: {
    async loadSvg(url) {
      try {
        // Load SVG and convert to image for canvas display
        const response = await fetch(url);
        const svgText = await response.text();
        
        // Create a blob URL for the SVG
        const blob = new Blob([svgText], { type: 'image/svg+xml' });
        const blobUrl = URL.createObjectURL(blob);
        
        const img = new Image();
        img.onload = () => {
          this.svgImage = img;
          this.svgLoaded = true;
          URL.revokeObjectURL(blobUrl);
        };
        img.onerror = () => {
          console.error('Failed to load SVG:', url);
          this.svgLoaded = false;
        };
        img.src = blobUrl;
      } catch (err) {
        console.error('Failed to fetch SVG:', err);
      }
    }
  }
};
</script>
