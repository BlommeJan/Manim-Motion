<template>
  <div class="editor-layout h-full flex flex-col overflow-hidden">
    <slot name="header"></slot>
    
    <div class="flex-1 flex overflow-hidden">
      <aside class="sidebar-left">
        <slot name="sidebar-left"></slot>
      </aside>
      
      <main class="main-content flex-1 flex flex-col min-w-0">
        <div class="stage-area flex-1 min-h-0">
          <slot name="stage"></slot>
        </div>
        <div class="timeline-area">
          <slot name="timeline"></slot>
        </div>
      </main>
      
      <aside class="sidebar-right">
        <slot name="sidebar-right"></slot>
      </aside>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditorLayout'
};
</script>

<style scoped>
.sidebar-left,
.sidebar-right {
  @apply bg-studio-surface border-studio-border flex-shrink-0;
}

.sidebar-left {
  @apply w-64 border-r;
}

.sidebar-right {
  @apply w-80 border-l;
}

.timeline-area {
  @apply h-48 border-t border-studio-border flex-shrink-0;
}
</style>
