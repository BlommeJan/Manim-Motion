<template>
  <div class="style-panel px-4 py-3 border-b border-studio-border">
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs text-studio-text-muted uppercase tracking-wider">Style</span>
    </div>
    
    <template v-if="element.type === 'text'">
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label class="block text-xs text-studio-text-muted mb-1">Font Size</label>
          <input type="number" :value="element.style.size" @input="updateStyle('size', parseInt($event.target.value))" min="8" max="200" class="input text-sm" />
        </div>
        <div>
          <label class="block text-xs text-studio-text-muted mb-1">Color</label>
          <ColorInput 
            :value="element.style.color" 
            @change="updateStyle('color', $event)" 
          />
        </div>
      </div>
    </template>
    
    <template v-else-if="element.type === 'image'">
      <div class="mb-3">
        <label class="block text-xs text-studio-text-muted mb-1">Opacity</label>
        <div class="flex items-center gap-3">
          <input type="range" :value="element.style.opacity || 1" @input="updateStyle('opacity', parseFloat($event.target.value))" min="0" max="1" step="0.1" class="flex-1" />
          <span class="text-sm text-studio-text-muted w-12">{{ Math.round((element.style.opacity || 1) * 100) }}%</span>
        </div>
      </div>
    </template>
    
    <template v-else-if="element.type === 'svg'">
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label class="block text-xs text-studio-text-muted mb-1">Stroke</label>
          <ColorInput 
            :value="element.style.strokeColor || '#ffffff'" 
            @change="updateStyle('strokeColor', $event)" 
          />
        </div>
        <div>
          <label class="block text-xs text-studio-text-muted mb-1">Fill</label>
          <ColorInput 
            :value="element.style.fillColor || '#ffffff'" 
            @change="updateStyle('fillColor', $event)" 
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import ColorInput from './ColorInput.vue';

export default {
  name: 'StylePanel',
  components: { ColorInput },
  props: { element: { type: Object, required: true } },
  methods: {
    updateStyle(key, value) {
      this.$emit('update', { style: { ...this.element.style, [key]: value } });
    }
  }
};
</script>
