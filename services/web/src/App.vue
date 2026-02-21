<template>
  <div id="app" class="h-screen bg-studio-bg text-studio-text flex flex-col overflow-hidden" style="z-index: var(--z-stage);">
    <!-- Top Bar -->
    <Topbar />

    <!-- Main: Sidebar | Canvas/Code | Properties -->
    <div class="flex-1 flex overflow-hidden min-h-0">
      <AssetSidebar />
      <div class="flex-1 min-w-0 flex flex-col bg-studio-bg relative">
        <!-- Stage / Code toggle pill -->
        <div class="absolute top-2.5 right-2.5 z-20 flex items-center bg-black/50 backdrop-blur-sm rounded-lg p-0.5 border border-white/5">
          <button
            class="stage-tab-btn" :class="{ active: stageViewMode === 'canvas' }"
            @click="stageViewMode = 'canvas'"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
            Canvas
          </button>
          <button
            class="stage-tab-btn" :class="{ active: stageViewMode === 'code' }"
            @click="switchToCode"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            Code
          </button>
        </div>

        <!-- Canvas view -->
        <StageCanvas v-show="stageViewMode === 'canvas'" />

        <!-- Code view -->
        <div v-show="stageViewMode === 'code'" class="flex-1 flex flex-col overflow-hidden bg-[#08080e] rounded-xl m-0">
          <!-- Code toolbar -->
          <div class="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 flex-shrink-0">
            <span class="text-[11px] font-semibold text-studio-text-muted uppercase tracking-wider">Manim Scene</span>
            <span v-if="codeEdited" class="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-medium">edited</span>
            <div class="flex-1"></div>
            <button v-if="codeEdited" class="code-stage-btn apply-btn" @click="applyCodeToCanvas" title="Parse this code and update the canvas">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Apply to Canvas
            </button>
            <button v-if="codeEdited" class="code-stage-btn" @click="resetCode" title="Discard edits and regenerate">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
              Reset
            </button>
            <button class="code-stage-btn" @click="copyStageCode" :title="stageCopied ? 'Copied!' : 'Copy to clipboard'">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              {{ stageCopied ? 'Copied!' : 'Copy' }}
            </button>
            <button class="code-stage-btn" @click="downloadStageCode">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              .py
            </button>
          </div>
          <!-- Editable code area -->
          <textarea
            ref="codeArea"
            class="flex-1 overflow-auto m-0 px-5 py-4 text-[12px] leading-relaxed font-mono text-[#c9d1d9] code-stage-panel resize-none border-none outline-none"
            :value="stageCode"
            @input="onCodeInput"
            spellcheck="false"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
          ></textarea>
          <!-- Footer -->
          <div class="flex items-center justify-between px-4 py-2 border-t border-white/5 flex-shrink-0">
            <span v-if="parseMessage" class="text-[10px]" :class="parseMessageOk ? 'text-emerald-400' : 'text-red-400'">{{ parseMessage }}</span>
            <span v-else class="text-[10px] text-studio-text-muted/50">Edit the code, then "Apply to Canvas" to update objects</span>
            <button class="text-[10px] text-studio-accent hover:text-studio-accent/80 transition-colors" @click="stageViewMode = 'canvas'">
              ← Back to Canvas
            </button>
          </div>
        </div>
      </div>
      <PropertiesPanel />
    </div>

    <!-- Bottom Timeline -->
    <Timeline />

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- Export Dialog (client-side .py download) -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <transition name="fade">
      <div v-if="showExport" class="fixed inset-0 bg-black/60 flex items-center justify-center" style="z-index: var(--z-modal);" @click.self="closeExport">
        <div class="bg-studio-surface border border-studio-border rounded-xl w-[700px] max-h-[80vh] flex flex-col shadow-2xl">
          <div class="px-5 py-4 border-b border-studio-border flex items-center justify-between">
            <div>
              <h2 class="text-base font-semibold">Export to Manim</h2>
              <p class="text-[11px] text-studio-text-muted mt-0.5">Download a self-contained scene.py</p>
            </div>
            <button @click="closeExport" class="text-studio-text-muted hover:text-studio-text text-lg">&times;</button>
          </div>
          <div class="flex-1 overflow-y-auto p-5">
            <div class="mb-3 flex items-center gap-2">
              <button @click="downloadPy" class="btn btn-primary text-sm flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download scene.py
              </button>
              <button @click="copyCode" class="btn btn-secondary text-sm flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                {{ copied ? 'Copied!' : 'Copy Code' }}
              </button>
            </div>
            <div class="bg-studio-bg rounded-lg p-4 border border-studio-border">
              <p class="text-[10px] text-studio-text-muted mb-2 font-medium uppercase tracking-wider">Run this command:</p>
              <code class="text-sm text-studio-accent font-mono block mb-3 select-all">manim -qh scene.py MainScene</code>
              <p class="text-[10px] text-studio-text-muted mb-2 font-medium uppercase tracking-wider">Generated Python:</p>
              <pre class="text-[11px] font-mono text-studio-text-muted whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">{{ exportCode }}</pre>
            </div>
            <div v-if="hasImages" class="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p class="text-xs text-amber-400">
                <strong>Note:</strong> Your project uses images. Place the image files in the same directory as <code>scene.py</code> before rendering.
              </p>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- Server Render Dialog -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <transition name="fade">
      <div v-if="showRender" class="fixed inset-0 bg-black/60 flex items-center justify-center" style="z-index: var(--z-modal);" @click.self="closeRender">
        <div class="bg-studio-surface border border-studio-border rounded-xl w-[540px] max-h-[85vh] flex flex-col shadow-2xl">
          <!-- Header -->
          <div class="px-5 py-4 border-b border-studio-border flex items-center justify-between">
            <div>
              <h2 class="text-base font-semibold">Render with Manim</h2>
              <p class="text-[11px] text-studio-text-muted mt-0.5">High-quality render via Docker</p>
            </div>
            <button @click="closeRender" class="text-studio-text-muted hover:text-studio-text text-lg">&times;</button>
          </div>

          <div class="flex-1 overflow-y-auto p-5 space-y-4">
            <!-- Quality selector (before render starts) -->
            <div v-if="!renderStatus">
              <label class="block text-xs font-medium text-studio-text-muted mb-1.5 uppercase tracking-wider">Quality</label>
              <div class="grid grid-cols-4 gap-2">
                <button v-for="q in qualities" :key="q.value"
                  class="quality-btn"
                  :class="{ active: selectedQuality === q.value }"
                  @click="selectedQuality = q.value"
                >
                  <span class="text-xs font-semibold">{{ q.label }}</span>
                  <span class="text-[9px] text-studio-text-muted">{{ q.desc }}</span>
                </button>
              </div>
              <!-- Text size disclaimer -->
              <div v-if="hasTextElements" class="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p class="text-[10px] text-amber-400 leading-relaxed">
                  <strong>Note:</strong> Text size on the canvas preview may differ from the final rendered output.
                </p>
              </div>
              <button @click="startRender" class="mt-4 w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Start Render
              </button>
            </div>

            <!-- Progress -->
            <div v-if="renderStatus && renderStatus !== 'completed'" class="text-center py-4">
              <div class="inline-flex items-center gap-3 mb-4">
                <div class="render-spinner"></div>
                <span class="text-sm font-medium">{{ renderStatusText }}</span>
              </div>
              <div class="w-full bg-studio-bg rounded-full h-2 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500"
                  :class="renderStatus === 'failed' ? 'bg-red-500' : 'bg-studio-accent'"
                  :style="{ width: renderProgress + '%' }"
                ></div>
              </div>
              <p v-if="renderLog" class="mt-3 text-[10px] text-studio-text-muted text-left font-mono bg-studio-bg rounded p-2 max-h-32 overflow-y-auto whitespace-pre-wrap">{{ renderLog }}</p>
            </div>

            <!-- Error -->
            <div v-if="renderStatus === 'failed'" class="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p class="text-xs text-red-400 font-medium mb-1">Render Failed</p>
              <p class="text-[11px] text-red-300 whitespace-pre-wrap">{{ renderError }}</p>
              <button @click="retryRender" class="mt-3 px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors">Retry</button>
            </div>

            <!-- Success: video preview -->
            <div v-if="renderStatus === 'completed'">
              <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-3 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-emerald-400"><polyline points="20 6 9 17 4 12"/></svg>
                <span class="text-sm text-emerald-300 font-medium">Render complete!</span>
              </div>
              <video v-if="renderVideoUrl" :key="renderVideoUrl" :src="renderVideoUrl" controls class="w-full rounded-lg bg-black" autoplay></video>
              <div class="flex gap-2 mt-3">
                <a v-if="renderVideoUrl" :href="renderVideoUrl" download="render.mp4"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-studio-accent hover:bg-studio-accent-hover text-white text-sm font-medium transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download MP4
                </a>
                <button @click="resetRender" class="px-4 py-2.5 rounded-lg bg-studio-border hover:bg-studio-border/80 text-studio-text text-sm font-medium transition-colors">
                  Render Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- Server Project Browser -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <transition name="fade">
      <div v-if="showProjectBrowser" class="fixed inset-0 bg-black/60 flex items-center justify-center" style="z-index: var(--z-modal);" @click.self="closeProjectBrowser">
        <div class="bg-studio-surface border border-studio-border rounded-xl w-[500px] max-h-[70vh] flex flex-col shadow-2xl">
          <div class="px-5 py-4 border-b border-studio-border flex items-center justify-between">
            <div>
              <h2 class="text-base font-semibold">Server Projects</h2>
              <p class="text-[11px] text-studio-text-muted mt-0.5">Load a project from the Docker server</p>
            </div>
            <button @click="closeProjectBrowser" class="text-studio-text-muted hover:text-studio-text text-lg">&times;</button>
          </div>
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="serverProjects.length === 0" class="text-center py-8 text-studio-text-muted">
              <p class="text-sm mb-1">No projects on server</p>
              <p class="text-[11px]">Render a project first to create it on the server.</p>
            </div>
            <div v-else class="space-y-1.5">
              <div
                v-for="p in serverProjects" :key="p.id"
                class="w-full px-4 py-3 rounded-lg hover:bg-studio-border/60 transition-colors flex items-center justify-between group"
              >
                <div class="flex-1 cursor-pointer min-w-0" @click="openServerProject(p.id)">
                  <span class="text-sm font-medium text-studio-text">{{ p.name }}</span>
                  <span class="text-[10px] text-studio-text-muted ml-2">{{ p.objectsCount || 0 }} objects</span>
                  <span class="text-[9px] text-studio-text-muted font-mono ml-2 hidden group-hover:inline">{{ p.id }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <button
                    class="p-1.5 rounded-md text-studio-text-muted opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all"
                    @click.stop="deleteServerProject(p.id, p.name)"
                    title="Delete project"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                  <button
                    class="p-1.5 rounded-md text-studio-text-muted hover:text-studio-accent transition-colors"
                    @click="openServerProject(p.id)"
                    title="Open project"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Error Toast -->
    <transition name="slide-up">
      <div v-if="error" class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-studio-surface border border-studio-error/30 text-studio-text px-5 py-3 rounded-xl shadow-xl flex items-center gap-3" style="z-index: var(--z-overlay);">
        <span class="text-studio-error">!</span>
        <span class="text-sm">{{ error }}</span>
        <button @click="clearError" class="text-studio-text-muted hover:text-studio-text ml-2">&times;</button>
      </div>
    </transition>
  </div>
</template>

<script>
import { store, actions, getters } from './store/project.js';
import { getPlaybackEngine } from './engine/playback.js';
import { generateManimScript, downloadManimScript, parseManimScript } from './export/manim.js';
import Topbar from './components/topbar/Topbar.vue';
import AssetSidebar from './components/sidebar/AssetSidebar.vue';
import StageCanvas from './components/stage/StageCanvas.vue';
import PropertiesPanel from './components/inspector/PropertiesPanel.vue';
import Timeline from './components/timeline/Timeline.vue';

export default {
  name: 'App',
  components: { Topbar, AssetSidebar, StageCanvas, PropertiesPanel, Timeline },

  data() {
    return {
      copied: false,
      selectedQuality: 'high',
      qualities: [
        { value: 'low',        label: 'Low',        desc: '480p 15fps (fastest)' },
        { value: 'medium',     label: 'Medium',     desc: '720p 30fps' },
        { value: 'high',       label: 'High',       desc: '1080p 60fps (recommended)' },
        { value: 'production', label: 'Production', desc: '1440p 60fps (2K)' },
        { value: '4k',         label: '4K',         desc: '2160p 60fps (slowest)' }
      ],
      // Stage view toggle
      stageViewMode: 'canvas',  // 'canvas' or 'code'
      stageCode: '# Add objects to see generated Manim code',
      stageCopied: false,
      codeEdited: false,
      parseMessage: '',
      parseMessageOk: false,
      _stageCodeTimer: null,
      _parseMessageTimer: null
    };
  },

  computed: {
    store()              { return store; },
    error()              { return store.error; },
    showExport()         { return store.showExportDialog; },
    exportCode()         { return store.exportCode; },
    hasImages()          { return store.project.objects.some(o => o.type === 'image' || o.type === 'svg_asset'); },
    hasTextElements()    { return store.project.objects.some(o => o.type === 'text' || o.type === 'latex'); },
    showRender()         { return store.showRenderDialog; },
    renderStatus()       { return store.renderStatus; },
    renderError()        { return store.renderError; },
    renderVideoUrl()     { return store.renderVideoUrl; },
    renderLog()          { return store.renderLog; },
    showProjectBrowser() { return store.showProjectBrowser; },
    serverProjects()     { return store.serverProjects; },

    renderStatusText() {
      const map = {
        uploading: 'Uploading assets to server...',
        saving:    'Saving project...',
        queued:    'In render queue, waiting for worker...',
        running:   'Manim is rendering (this can take 30s-2min)...',
        failed:    'Render failed'
      };
      return map[store.renderStatus] || 'Processing...';
    },

    renderProgress() {
      const map = { uploading: 15, saving: 30, queued: 45, running: 70, completed: 100, failed: 100 };
      return map[store.renderStatus] || 0;
    }
  },

  watch: {
    'store.project.objects': {
      handler() { if (this.stageViewMode === 'code' && !this.codeEdited) this._debouncedUpdateCode(); },
      deep: true
    },
    'store.project.tracks': {
      handler() { if (this.stageViewMode === 'code' && !this.codeEdited) this._debouncedUpdateCode(); },
      deep: true
    }
  },

  mounted() {
    const engine = getPlaybackEngine();
    engine.onTimeUpdate(t => actions.setPlaybackTime(t));
    engine.onFrame(state => actions.setFrameState(state));
    window.addEventListener('keydown', this.handleKeydown);

    // Check API availability on startup
    actions.checkApi();
  },

  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeydown);
    getPlaybackEngine().destroy();
    actions._stopPollRender();
  },

  methods: {
    handleKeydown(e) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if ((e.key === 'v' || e.key === 'V') && !e.ctrlKey && !e.metaKey) { actions.setActiveTool('select'); e.preventDefault(); }
      if ((e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.metaKey) { actions.setActiveTool('hand'); e.preventDefault(); }

      if ((e.key === 'Delete' || e.key === 'Backspace') && !e.ctrlKey) {
        if (store.selectedClipId) { actions.deleteClip(store.selectedClipId); e.preventDefault(); }
        else if (store.selectedObjectIds.length > 0) {
          [...store.selectedObjectIds].forEach(id => actions.deleteObject(id));
          e.preventDefault();
        }
      }

      if (e.key === 'Escape') { actions.deselectAll(); this.closeExport(); this.closeRender(); this.closeProjectBrowser(); e.preventDefault(); }
      if (e.key === ' ') { this.togglePlayback(); e.preventDefault(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); actions.saveToFile(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') { e.preventDefault(); if (store.selectedObjectIds.length >= 2) actions.groupObjects([...store.selectedObjectIds]); }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); actions.undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) { e.preventDefault(); actions.redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); actions.redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') { e.preventDefault(); actions.copySelection(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') { e.preventDefault(); actions.pasteSelection(); }
    },

    togglePlayback() {
      const engine = getPlaybackEngine();
      if (store.playbackPlaying) {
        engine.pause();
        actions.setPlaybackPlaying(false);
      } else {
        engine.play(store.project.tracks, store.project.objects, getters.computedDuration());
        actions.setPlaybackPlaying(true);
      }
    },

    // ── Export dialog ──
    closeExport() { store.showExportDialog = false; },
    downloadPy() { downloadManimScript(store.project); },
    copyCode() {
      navigator.clipboard.writeText(store.exportCode).then(() => {
        this.copied = true;
        setTimeout(() => { this.copied = false; }, 2000);
      });
    },

    // ── Render dialog ──
    closeRender() {
      // Allow closing at any time; if still rendering, polling continues in bg
      store.showRenderDialog = false;
      // Reset status ONLY if completed or failed so user can re-open cleanly
      if (store.renderStatus === 'completed' || store.renderStatus === 'failed') {
        // keep it so user can reopen and see the video / error
      }
    },

    startRender() {
      actions.renderOnServer(this.selectedQuality);
    },

    retryRender() {
      store.renderStatus = null;
      store.renderError = null;
    },

    resetRender() {
      store.renderStatus = null;
      store.renderError = null;
      store.renderVideoUrl = null;
      store.renderLog = '';
    },

    // ── Project browser ──
    closeProjectBrowser() { store.showProjectBrowser = false; },
    async openServerProject(id) {
      if (store.isDirty && !confirm('Discard unsaved changes?')) return;
      const ok = await actions.loadFromServer(id);
      if (ok) store.showProjectBrowser = false;
    },

    async deleteServerProject(id, name) {
      if (!confirm(`Delete "${name}" from the server?\n\nThis will remove the project, its assets, and all renders. This cannot be undone.`)) return;
      try {
        await actions.deleteServerProject(id);
      } catch (err) {
        actions.setError('Delete failed: ' + err.message);
      }
    },

    // ── Stage code view ──
    switchToCode() {
      this.stageViewMode = 'code';
      this.codeEdited = false;
      this.parseMessage = '';
      this.updateStageCode();
    },
    updateStageCode() {
      try {
        this.stageCode = generateManimScript(store.project);
        this.codeEdited = false;
      } catch (err) {
        this.stageCode = '# Error generating code: ' + err.message;
      }
    },
    _debouncedUpdateCode() {
      clearTimeout(this._stageCodeTimer);
      this._stageCodeTimer = setTimeout(() => this.updateStageCode(), 300);
    },
    onCodeInput(e) {
      this.stageCode = e.target.value;
      this.codeEdited = true;
    },
    resetCode() {
      this.codeEdited = false;
      this.parseMessage = '';
      this.updateStageCode();
    },
    applyCodeToCanvas() {
      try {
        const result = parseManimScript(this.stageCode, store.project.stage.width, store.project.stage.height);

        if (result.objects.length === 0) {
          this.parseMessage = 'No objects found in code. Check your syntax.';
          this.parseMessageOk = false;
          this._clearParseMsg();
          return;
        }

        // Apply parsed data to the project
        store.project.stage.backgroundColor = result.stage.backgroundColor;
        store.project.objects = result.objects;
        store.project.tracks = result.tracks;
        actions.deselectAll();

        this.codeEdited = false;
        this.parseMessage = `Applied: ${result.objects.length} objects, ${result.tracks.reduce((s, t) => s + t.clips.length, 0)} animations`;
        this.parseMessageOk = true;
        this._clearParseMsg();

        // Switch back to canvas to see the result
        setTimeout(() => { this.stageViewMode = 'canvas'; }, 800);
      } catch (err) {
        this.parseMessage = 'Parse error: ' + err.message;
        this.parseMessageOk = false;
        this._clearParseMsg();
      }
    },
    _clearParseMsg() {
      clearTimeout(this._parseMessageTimer);
      this._parseMessageTimer = setTimeout(() => { this.parseMessage = ''; }, 4000);
    },
    copyStageCode() {
      navigator.clipboard.writeText(this.stageCode).then(() => {
        this.stageCopied = true;
        setTimeout(() => { this.stageCopied = false; }, 2000);
      });
    },
    downloadStageCode() {
      downloadManimScript(store.project);
    },

    // ── Error ──
    clearError() { actions.clearError(); }
  }
};
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all .3s ease; }
.slide-up-enter, .slide-up-leave-to { transform: translateY(20px) translateX(-50%); opacity: 0; }

.quality-btn {
  @apply flex flex-col items-center gap-0.5 p-2.5 rounded-lg border border-studio-border;
  @apply hover:border-studio-accent/40 transition-all cursor-pointer text-center;
}
.quality-btn.active {
  @apply border-studio-accent bg-studio-accent/10 text-studio-accent;
}

.render-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.15);
  border-top-color: var(--studio-accent, #6366f1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.stage-tab-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
  background: transparent;
}
.stage-tab-btn:hover { color: rgba(255,255,255,0.7); }
.stage-tab-btn.active {
  background: rgba(99,102,241,0.2);
  color: #a5b4fc;
}

.code-stage-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 500;
  color: rgba(255,255,255,0.45);
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
}
.code-stage-btn:hover {
  color: rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.15);
}
.code-stage-btn.apply-btn {
  background: rgba(16,185,129,0.15);
  border-color: rgba(16,185,129,0.3);
  color: #34d399;
}
.code-stage-btn.apply-btn:hover {
  background: rgba(16,185,129,0.25);
  border-color: rgba(16,185,129,0.5);
  color: #6ee7b7;
}

.code-stage-panel {
  tab-size: 4;
  -moz-tab-size: 4;
  background: #0d1117;
}
.code-stage-panel::selection {
  background: rgba(99,102,241,0.3);
}
</style>
