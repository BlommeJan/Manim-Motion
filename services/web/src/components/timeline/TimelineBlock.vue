<template>
  <div
    class="timeline-block absolute top-1 bottom-1 rounded cursor-pointer transition-shadow"
    :class="[
      typeClass,
      { 'ring-2 ring-white ring-offset-1 ring-offset-studio-surface': selected }
    ]"
    :style="blockStyle"
    @mousedown="startDrag"
    @click.stop="$emit('click')"
  >
    <!-- Block Content -->
    <div class="h-full px-2 flex items-center overflow-hidden">
      <span class="text-xs truncate text-white/90">
        {{ label }}
      </span>
    </div>
    
    <!-- Resize Handle Left -->
    <div 
      class="resize-handle resize-left absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize"
      @mousedown.stop="startResize('left', $event)"
    ></div>
    
    <!-- Resize Handle Right -->
    <div 
      class="resize-handle resize-right absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize"
      @mousedown.stop="startResize('right', $event)"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'TimelineBlock',
  
  props: {
    element: {
      type: Object,
      required: true
    },
    pixelsPerSecond: {
      type: Number,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      isDragging: false,
      isResizing: false,
      resizeDirection: null,
      dragStartX: 0,
      dragStartTime: 0,
      dragStartDuration: 0
    };
  },
  
  computed: {
    label() {
      if (this.element.type === 'text') {
        return this.element.content || 'Text';
      }
      return this.element.type.toUpperCase();
    },
    
    typeClass() {
      const classes = {
        'text': 'bg-indigo-600',
        'image': 'bg-emerald-600',
        'svg': 'bg-amber-600'
      };
      return classes[this.element.type] || 'bg-slate-600';
    },
    
    blockStyle() {
      const start = this.element.timing.start;
      const duration = this.element.timing.duration;
      
      return {
        left: `${start * this.pixelsPerSecond}px`,
        width: `${Math.max(20, duration * this.pixelsPerSecond)}px`
      };
    }
  },
  
  methods: {
    startDrag(e) {
      if (e.target.classList.contains('resize-handle')) return;
      
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartTime = this.element.timing.start;
      
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);
    },
    
    onDrag(e) {
      if (!this.isDragging) return;
      
      const deltaX = e.clientX - this.dragStartX;
      const deltaTime = deltaX / this.pixelsPerSecond;
      const newStart = Math.max(0, this.dragStartTime + deltaTime);
      
      this.$emit('update-timing', {
        start: Math.round(newStart * 10) / 10
      });
    },
    
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);
    },
    
    startResize(direction, e) {
      this.isResizing = true;
      this.resizeDirection = direction;
      this.dragStartX = e.clientX;
      this.dragStartTime = this.element.timing.start;
      this.dragStartDuration = this.element.timing.duration;
      
      document.addEventListener('mousemove', this.onResize);
      document.addEventListener('mouseup', this.stopResize);
    },
    
    onResize(e) {
      if (!this.isResizing) return;
      
      const deltaX = e.clientX - this.dragStartX;
      const deltaTime = deltaX / this.pixelsPerSecond;
      
      if (this.resizeDirection === 'left') {
        // Resize from left: change start and duration
        const newStart = Math.max(0, this.dragStartTime + deltaTime);
        const newDuration = Math.max(0.1, this.dragStartDuration - deltaTime);
        
        this.$emit('update-timing', {
          start: Math.round(newStart * 10) / 10,
          duration: Math.round(newDuration * 10) / 10
        });
      } else {
        // Resize from right: only change duration
        const newDuration = Math.max(0.1, this.dragStartDuration + deltaTime);
        
        this.$emit('update-timing', {
          duration: Math.round(newDuration * 10) / 10
        });
      }
    },
    
    stopResize() {
      this.isResizing = false;
      this.resizeDirection = null;
      document.removeEventListener('mousemove', this.onResize);
      document.removeEventListener('mouseup', this.stopResize);
    }
  },
  
  beforeDestroy() {
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
    document.removeEventListener('mousemove', this.onResize);
    document.removeEventListener('mouseup', this.stopResize);
  }
};
</script>

<style scoped>
.timeline-block {
  min-width: 20px;
}

.resize-handle {
  opacity: 0;
  transition: opacity 0.15s;
}

.timeline-block:hover .resize-handle {
  opacity: 1;
  background: rgba(255, 255, 255, 0.2);
}
</style>
