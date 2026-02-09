<template>
  <div class="inspector h-full flex flex-col">
    <div class="panel-header">Inspector</div>
    
    <div v-if="!selectedElement" class="flex-1 flex items-center justify-center p-4">
      <div class="text-center text-studio-text-muted">
        <div class="text-3xl mb-2 opacity-30">👆</div>
        <p class="text-sm">Select an element to edit its properties</p>
      </div>
    </div>
    
    <div v-else class="flex-1 overflow-y-auto">
      <!-- Element Type Badge -->
      <div class="px-4 py-3 border-b border-studio-border">
        <div class="flex items-center gap-2">
          <span 
            class="px-2 py-0.5 text-xs rounded font-medium"
            :class="typeBadgeClass"
          >
            {{ selectedElement.type.toUpperCase() }}
          </span>
          <span class="text-sm text-studio-text-muted">{{ selectedElement.id }}</span>
        </div>
      </div>
      
      <!-- Text Content (for text elements) -->
      <div v-if="selectedElement.type === 'text'" class="px-4 py-3 border-b border-studio-border">
        <label class="block text-xs text-studio-text-muted mb-2">Content</label>
        <textarea
          :value="selectedElement.content"
          @input="updateContent($event.target.value)"
          class="input text-sm resize-none"
          rows="2"
          placeholder="Enter text..."
        ></textarea>
      </div>
      
      <!-- Layout Panel -->
      <LayoutPanel 
        :element="selectedElement"
        @update="updateElement"
      />
      
      <!-- Style Panel -->
      <StylePanel 
        :element="selectedElement"
        @update="updateElement"
      />
      
      <!-- Timing Panel -->
      <TimingPanel 
        :element="selectedElement"
        @update="updateElement"
      />
      
      <!-- Animation Panel -->
      <AnimationPanel 
        :element="selectedElement"
        @update="updateElement"
      />
      
      <!-- Delete Button -->
      <div class="px-4 py-4 border-t border-studio-border mt-auto">
        <button 
          @click="deleteElement"
          class="w-full py-2 text-sm text-studio-error bg-studio-error/10 rounded hover:bg-studio-error/20 transition-colors"
        >
          Delete Element
        </button>
      </div>
    </div>
    
    <!-- Add Element Buttons (when nothing selected) -->
    <div v-if="!selectedElement" class="p-4 border-t border-studio-border">
      <p class="text-xs text-studio-text-muted mb-3">Quick Add</p>
      <div class="flex gap-2">
        <button @click="addTextElement" class="btn btn-secondary text-xs flex-1">
          + Text
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { store, actions, getters } from '../../store/project.js';
import LayoutPanel from './LayoutPanel.vue';
import StylePanel from './StylePanel.vue';
import TimingPanel from './TimingPanel.vue';
import AnimationPanel from './AnimationPanel.vue';

export default {
  name: 'Inspector',
  
  components: {
    LayoutPanel,
    StylePanel,
    TimingPanel,
    AnimationPanel
  },
  
  computed: {
    selectedElement() {
      return getters.selectedElement();
    },
    
    typeBadgeClass() {
      if (!this.selectedElement) return '';
      const classes = {
        'text': 'bg-indigo-600 text-white',
        'image': 'bg-emerald-600 text-white',
        'svg': 'bg-amber-600 text-white'
      };
      return classes[this.selectedElement.type] || 'bg-slate-600 text-white';
    }
  },
  
  methods: {
    updateElement(updates) {
      if (!this.selectedElement) return;
      actions.updateElement(this.selectedElement.id, updates);
    },
    
    updateContent(content) {
      this.updateElement({ content });
    },
    
    deleteElement() {
      if (!this.selectedElement) return;
      if (confirm('Delete this element?')) {
        actions.deleteElement(this.selectedElement.id);
      }
    },
    
    addTextElement() {
      const element = actions.addElement({
        type: 'text',
        content: 'New Text',
        style: {
          size: 48,
          color: '#ffffff'
        }
      });
      actions.selectElement(element.id);
    }
  }
};
</script>
