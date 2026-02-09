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
          <div class="flex items-center gap-2">
            <input type="color" :value="element.style.color" @input="updateStyle('color', $event.target.value)" class="w-8 h-8 rounded cursor-pointer" />
            <input type="text" :value="element.style.color" @input="updateStyle('color', $event.target.value)" class="input text-sm flex-1" />
          </div>
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
          <input type="color" :value="element.style.strokeColor || '#ffffff'" @input="updateStyle('strokeColor', $event.target.value)" class="w-8 h-8 rounded cursor-pointer" />
        </div>
        <div>
          <label class="block text-xs text-studio-text-muted mb-1">Fill</label>
          <input type="color" :value="element.style.fillColor || '#ffffff'" @input="updateStyle('fillColor', $event.target.value)" class="w-8 h-8 rounded cursor-pointer" />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'StylePanel',
  props: { element: { type: Object, required: true } },
  methods: {
    updateStyle(key, value) {
      this.$emit('update', { style: { ...this.element.style, [key]: value } });
    }
  }
};
</script>
