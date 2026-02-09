<template>
  <div class="font-selector" ref="container">
    <span class="text-[9px] text-studio-text-muted/50">Font</span>
    <div class="relative">
      <input
        ref="input"
        type="text"
        class="input input-sm w-full pr-6"
        :value="searchQuery"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
        :placeholder="value || 'Search fonts...'"
      />
      <button
        v-if="searchQuery || isOpen"
        class="absolute right-1 top-1/2 -translate-y-1/2 text-studio-text-muted hover:text-studio-text p-0.5"
        @mousedown.prevent="clearSearch"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <div v-if="!searchQuery && !isOpen" class="absolute right-1 top-1/2 -translate-y-1/2 text-studio-text-muted pointer-events-none">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
    </div>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      class="font-dropdown"
      ref="dropdown"
    >
      <!-- Category tabs -->
      <div class="category-tabs">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="category-tab"
          :class="{ active: selectedCategory === cat.id }"
          @mousedown.prevent="selectCategory(cat.id)"
        >{{ cat.label }}</button>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="font-loading">
        <span class="loading-spinner"></span>
        Loading fonts...
      </div>

      <!-- Font list -->
      <div v-else class="font-list" ref="fontList">
        <div
          v-for="(font, index) in filteredFonts"
          :key="font.family"
          class="font-item"
          :class="{ highlighted: index === highlightedIndex, selected: font.family === value }"
          @mousedown.prevent="selectFont(font.family)"
          @mouseenter="highlightedIndex = index"
        >
          <span
            class="font-preview"
            :style="{ fontFamily: `'${font.family}', ${font.category}` }"
          >{{ font.family }}</span>
          <span class="font-category">{{ font.category }}</span>
        </div>
        <div v-if="filteredFonts.length === 0 && !loading" class="font-empty">
          No fonts found
        </div>
      </div>

      <!-- Load more button -->
      <div v-if="hasMore && !loading" class="load-more">
        <button @mousedown.prevent="loadMore" class="load-more-btn">
          Load more fonts...
        </button>
      </div>
    </div>
  </div>
</template>

<script>
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : '';

export default {
  name: 'FontSelector',
  props: {
    value: {
      type: String,
      default: 'Roboto'
    }
  },

  data() {
    return {
      isOpen: false,
      searchQuery: '',
      fonts: [],
      loading: false,
      highlightedIndex: -1,
      selectedCategory: 'all',
      offset: 0,
      total: 0,
      limit: 50,
      categories: [
        { id: 'all', label: 'All' },
        { id: 'sans-serif', label: 'Sans' },
        { id: 'serif', label: 'Serif' },
        { id: 'display', label: 'Display' },
        { id: 'handwriting', label: 'Script' },
        { id: 'monospace', label: 'Mono' }
      ],
      debounceTimer: null,
      previewStylesLoaded: new Set()
    };
  },

  computed: {
    filteredFonts() {
      return this.fonts;
    },
    hasMore() {
      return this.offset + this.fonts.length < this.total;
    }
  },

  methods: {
    async fetchFonts(reset = false) {
      if (this.loading) return;

      this.loading = true;

      try {
        const params = new URLSearchParams({
          limit: this.limit,
          offset: reset ? 0 : this.offset
        });

        if (this.searchQuery) {
          params.set('search', this.searchQuery);
        }

        if (this.selectedCategory !== 'all') {
          params.set('category', this.selectedCategory);
        }

        const response = await fetch(`${API_BASE}/api/fonts?${params}`);
        const data = await response.json();

        if (reset) {
          this.fonts = data.fonts;
          this.offset = 0;
        } else {
          this.fonts = [...this.fonts, ...data.fonts];
        }

        this.total = data.total;
        this.offset = this.fonts.length;

        // Load Google Fonts preview styles for visible fonts
        this.loadPreviewStyles(data.fonts.slice(0, 20));
      } catch (error) {
        console.error('Error fetching fonts:', error);
      } finally {
        this.loading = false;
      }
    },

    loadPreviewStyles(fonts) {
      const fontsToLoad = fonts.filter(f => !this.previewStylesLoaded.has(f.family));
      if (fontsToLoad.length === 0) return;

      const families = fontsToLoad.map(f => f.family.replace(/ /g, '+')).join('|');
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      fontsToLoad.forEach(f => this.previewStylesLoaded.add(f.family));
    },

    onInput(event) {
      this.searchQuery = event.target.value;
      this.highlightedIndex = -1;

      // Debounce search
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.fetchFonts(true);
      }, 300);
    },

    onFocus() {
      this.isOpen = true;
      if (this.fonts.length === 0) {
        this.fetchFonts(true);
      }
    },

    onBlur() {
      // Delay to allow click on dropdown
      setTimeout(() => {
        this.isOpen = false;
        this.searchQuery = '';
        this.highlightedIndex = -1;
      }, 200);
    },

    onKeydown(event) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (this.highlightedIndex < this.filteredFonts.length - 1) {
            this.highlightedIndex++;
            this.scrollToHighlighted();
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (this.highlightedIndex > 0) {
            this.highlightedIndex--;
            this.scrollToHighlighted();
          }
          break;
        case 'Enter':
          event.preventDefault();
          if (this.highlightedIndex >= 0 && this.filteredFonts[this.highlightedIndex]) {
            this.selectFont(this.filteredFonts[this.highlightedIndex].family);
          }
          break;
        case 'Escape':
          event.preventDefault();
          this.isOpen = false;
          this.$refs.input.blur();
          break;
      }
    },

    scrollToHighlighted() {
      this.$nextTick(() => {
        const list = this.$refs.fontList;
        const item = list?.children[this.highlightedIndex];
        if (item) {
          item.scrollIntoView({ block: 'nearest' });
        }
      });
    },

    selectFont(family) {
      this.$emit('input', family);
      this.isOpen = false;
      this.searchQuery = '';
      this.highlightedIndex = -1;
    },

    selectCategory(category) {
      this.selectedCategory = category;
      this.highlightedIndex = -1;
      this.fetchFonts(true);
    },

    clearSearch() {
      this.searchQuery = '';
      this.highlightedIndex = -1;
      this.fetchFonts(true);
      this.$refs.input.focus();
    },

    loadMore() {
      this.fetchFonts(false);
    }
  },

  beforeDestroy() {
    clearTimeout(this.debounceTimer);
  }
};
</script>

<style scoped>
.font-selector {
  position: relative;
}

.font-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--studio-surface, #12121a);
  border: 1px solid var(--studio-border, #1e1e2e);
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  margin-top: 4px;
  overflow: hidden;
}

.category-tabs {
  display: flex;
  gap: 2px;
  padding: 6px;
  background: var(--studio-bg, #0a0a0f);
  border-bottom: 1px solid var(--studio-border, #1e1e2e);
  overflow-x: auto;
}

.category-tab {
  padding: 4px 8px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--studio-text-muted, #64748b);
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.category-tab:hover {
  background: var(--studio-border, #1e1e2e);
  color: var(--studio-text, #e2e8f0);
}

.category-tab.active {
  background: var(--studio-accent, #6366f1);
  color: white;
}

.font-list {
  max-height: 240px;
  overflow-y: auto;
}

.font-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  cursor: pointer;
  transition: background 0.1s;
}

.font-item:hover,
.font-item.highlighted {
  background: var(--studio-border, #1e1e2e);
}

.font-item.selected {
  background: var(--studio-accent, #6366f1);
  color: white;
}

.font-item.selected .font-category {
  color: rgba(255, 255, 255, 0.7);
}

.font-preview {
  font-size: 13px;
  color: var(--studio-text, #e2e8f0);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font-category {
  font-size: 9px;
  color: var(--studio-text-muted, #64748b);
  text-transform: capitalize;
  flex-shrink: 0;
  margin-left: 8px;
}

.font-loading,
.font-empty {
  padding: 20px;
  text-align: center;
  font-size: 11px;
  color: var(--studio-text-muted, #64748b);
}

.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid var(--studio-border, #1e1e2e);
  border-top-color: var(--studio-accent, #6366f1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.load-more {
  padding: 6px;
  border-top: 1px solid var(--studio-border, #1e1e2e);
  background: var(--studio-bg, #0a0a0f);
}

.load-more-btn {
  width: 100%;
  padding: 6px;
  font-size: 10px;
  color: var(--studio-accent, #6366f1);
  background: transparent;
  border: 1px dashed var(--studio-border, #1e1e2e);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.load-more-btn:hover {
  background: var(--studio-border, #1e1e2e);
  border-style: solid;
}
</style>
