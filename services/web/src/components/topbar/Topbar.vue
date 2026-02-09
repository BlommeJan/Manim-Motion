<template>
  <header class="h-11 bg-studio-surface border-b border-studio-border flex items-center justify-between px-4 flex-shrink-0">
    <!-- Left: Brand + Project name -->
    <div class="flex items-center gap-3">
      <h1 class="text-sm font-bold tracking-tight flex items-center gap-1.5">
        <span class="w-5 h-5 rounded bg-studio-accent flex items-center justify-center text-[10px] text-white font-black">M</span>
        <span class="text-studio-text">Manim</span>
        <span class="text-studio-text-muted font-normal">Motion</span>
      </h1>
      <div class="h-4 w-px bg-studio-border"></div>
      <input
        class="bg-transparent border-none text-sm text-studio-text focus:outline-none w-36 hover:bg-studio-border/50 px-1.5 py-0.5 rounded transition-colors"
        :value="projectName"
        @change="updateName($event.target.value)"
        @keydown.enter="$event.target.blur()"
      />
      <span v-if="isDirty" class="text-[10px] text-amber-400 font-medium">unsaved</span>
      <span v-if="projectId" class="text-[9px] text-studio-text-muted font-mono opacity-50">{{ projectId }}</span>
    </div>

    <!-- Center: View controls + Group -->
    <div class="flex items-center gap-1.5">
      <button
        class="topbar-toggle"
        :class="{ on: gridVisible }"
        @click="toggleGrid"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
        Grid
      </button>
      <button
        class="topbar-toggle"
        :class="{ on: snapEnabled }"
        @click="toggleSnap"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 3L3 21"/><path d="M21 3v7h-7"/></svg>
        Snap
      </button>

      <div class="h-4 w-px bg-studio-border mx-1"></div>

      <!-- Group / Ungroup -->
      <button
        class="topbar-toggle"
        :class="{ on: canGroup }"
        :disabled="!canGroup"
        @click="groupSelected"
        title="Group selected objects (select 2+)"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="1" width="10" height="10" rx="1"/><rect x="13" y="13" width="10" height="10" rx="1"/><path d="M11 6h2m-1-1v2m-6 4h2m-1-1v2"/></svg>
        Group
      </button>

      <span class="text-[10px] text-studio-text-muted ml-1">{{ stageW }}x{{ stageH }}</span>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-1.5">
      <button @click="newProject" class="topbar-btn">New</button>
      <button @click="loadProject" class="topbar-btn">Open</button>
      <button @click="browseServer" class="topbar-btn" title="Browse server projects">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
        Server
      </button>
      <button @click="saveProject" class="topbar-btn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
        Save
      </button>
      <button @click="saveToServer" class="topbar-btn save-server-btn" :class="{ saving: isSaving }" :disabled="isSaving" title="Save project to Docker server">
        <svg v-if="!isSaving" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin"><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83"/></svg>
        {{ isSaving ? 'Saving...' : 'Sync' }}
      </button>
      <div class="h-4 w-px bg-studio-border"></div>
      <button @click="openExport" class="topbar-btn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        Export .py
      </button>
      <button @click="openRender" class="topbar-btn render-btn" :class="{ active: isRendering }">
        <svg v-if="!isRendering" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin"><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83"/></svg>
        {{ isRendering ? 'Rendering...' : 'Render HQ' }}
      </button>
    </div>
  </header>
</template>

<script>
import { store, actions } from '../../store/project.js';
import { generateManimScript } from '../../export/manim.js';

export default {
  name: 'Topbar',

  computed: {
    projectName() { return store.project.name; },
    projectId() { return store.project.id; },
    isDirty() { return store.isDirty; },
    gridVisible() { return store.project.stage.gridVisible; },
    snapEnabled() { return store.project.stage.snapEnabled; },
    stageW() { return store.project.stage.width; },
    stageH() { return store.project.stage.height; },
    isSaving() { return store.savingToServer; },
    canGroup() { return store.selectedObjectIds.length >= 2; },
    isRendering() {
      const s = store.renderStatus;
      return s === 'uploading' || s === 'saving' || s === 'queued' || s === 'running';
    }
  },

  methods: {
    updateName(name) { store.project.name = name.trim() || 'My Animation'; store.isDirty = true; },
    toggleGrid() { actions.toggleGrid(); },
    toggleSnap() { actions.toggleSnap(); },

    groupSelected() {
      if (!this.canGroup) return;
      const group = actions.groupObjects([...store.selectedObjectIds]);
      if (group) actions.setError(null); // clear any prior error
    },

    newProject() {
      if (store.isDirty && !confirm('Discard unsaved changes?')) return;
      actions.newProject();
    },

    async loadProject() {
      if (store.isDirty && !confirm('Discard unsaved changes?')) return;
      await actions.loadFromFile();
    },

    saveProject() { actions.saveToFile(); },

    async saveToServer() {
      try {
        const ok = await actions.checkApi();
        if (!ok) {
          actions.setError('Server not available. Make sure Docker is running.');
          return;
        }
        await actions.saveToServer();
        actions.setError(null);
        // Show brief success indication
        store.error = null;
      } catch (err) {
        // Error already set in store
      }
    },

    async browseServer() {
      store.showProjectBrowser = true;
      await actions.listServerProjects();
    },

    openExport() {
      if (store.project.objects.length === 0) {
        actions.setError('Add some objects to the stage first!');
        return;
      }
      store.exportCode = generateManimScript(store.project);
      store.showExportDialog = true;
    },

    openRender() {
      if (store.project.objects.length === 0) {
        actions.setError('Add some objects to the stage first!');
        return;
      }
      store.showRenderDialog = true;
    }
  }
};
</script>

<style scoped>
.topbar-btn {
  @apply flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-studio-text-muted;
  @apply hover:text-studio-text hover:bg-studio-border transition-colors font-medium;
}
.render-btn {
  @apply bg-emerald-600 text-white hover:bg-emerald-500;
}
.render-btn.active {
  @apply bg-amber-600 text-white;
  animation: pulse-glow-amber 2s ease-in-out infinite;
}
.save-server-btn {
  @apply bg-blue-600/80 text-white hover:bg-blue-500;
}
.save-server-btn.saving {
  @apply bg-blue-600/50 cursor-wait;
}
.topbar-toggle {
  @apply flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all;
  @apply text-studio-text-muted bg-transparent hover:bg-studio-border;
}
.topbar-toggle.on {
  @apply bg-studio-accent/15 text-studio-accent;
}
.topbar-toggle:disabled {
  @apply opacity-40 cursor-not-allowed;
}

@keyframes pulse-glow-amber {
  0%, 100% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.4); }
  50% { box-shadow: 0 0 12px 3px rgba(217, 119, 6, 0.2); }
}
</style>
