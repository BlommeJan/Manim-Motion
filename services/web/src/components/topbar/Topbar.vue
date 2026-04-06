<template>
  <div class="menubar-root" ref="root">
    <header class="menubar-header">
      <!-- Brand: official logo from assets (public folder) -->
      <div class="menubar-brand">
        <img src="/ManimMotionLogoNoTextNoBG.svg" alt="" class="brand-logo" width="24" height="24" />
        <span class="brand-name">Manim</span>
        <span class="brand-sub">Motion</span>
      </div>

      <!-- Desktop nav -->
      <nav v-if="!collapsed" class="menubar-nav" role="menubar" ref="nav">
        <div
          v-for="(menu, mi) in menus"
          :key="menu.id"
          class="menu-anchor"
          :ref="'anchor-' + menu.id"
        >
          <button
            class="menu-label"
            :class="{ active: openMenuId === menu.id }"
            @click.stop="toggleMenu(menu.id)"
            @mouseenter="hoverMenu(menu.id)"
            @keydown="onLabelKey($event, mi)"
            tabindex="0"
            role="menuitem"
            :aria-haspopup="true"
            :aria-expanded="openMenuId === menu.id"
          >{{ menu.label }}</button>

          <!-- Dropdown -->
          <transition name="menu-pop">
            <div
              v-if="openMenuId === menu.id"
              class="menu-dropdown"
              role="menu"
              :ref="'dropdown-' + menu.id"
              @keydown="onDropdownKey($event, mi)"
            >
              <template v-for="(item, idx) in menu.items">
                <div v-if="item.type === 'separator'" :key="'s' + idx" class="menu-sep"></div>

                <!-- Submenu (e.g. Theme) -->
                <div
                  v-else-if="item.type === 'submenu'"
                  :key="item.id"
                  class="menu-sub-anchor"
                  @mouseenter="hoveredSub = item.id"
                  @mouseleave="hoveredSub = null"
                >
                  <button
                    class="menu-item"
                    :class="{ focused: focusIdx === idx }"
                    @mouseenter="focusIdx = idx"
                    role="menuitem"
                    aria-haspopup="true"
                  >
                    <span class="mi-label">{{ item.label }}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="mi-arrow"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                  <div v-if="hoveredSub === item.id" class="menu-submenu">
                    <button
                      v-for="sub in item.children"
                      :key="sub.id"
                      class="menu-item"
                      :class="{ 'radio-on': sub.active && sub.active() }"
                      @click="executeItem(sub)"
                      role="menuitemradio"
                      :aria-checked="sub.active ? sub.active() : undefined"
                    >
                      <span class="mi-radio">{{ sub.active && sub.active() ? '\u25C9' : '\u25CB' }}</span>
                      <span class="mi-label">{{ sub.label }}</span>
                    </button>
                  </div>
                </div>

                <!-- Toggle item (Grid/Snap) -->
                <button
                  v-else-if="item.type === 'toggle'"
                  :key="item.id"
                  class="menu-item"
                  :class="{ focused: focusIdx === idx }"
                  @click="executeItem(item)"
                  @mouseenter="focusIdx = idx"
                  role="menuitemcheckbox"
                  :aria-checked="item.checked ? item.checked() : false"
                >
                  <span class="mi-check">{{ item.checked && item.checked() ? '\u2713' : '' }}</span>
                  <span class="mi-label">{{ item.label }}</span>
                  <span v-if="item.shortcut" class="mi-shortcut">{{ item.shortcut }}</span>
                </button>

                <!-- Normal item -->
                <button
                  v-else
                  :key="item.id"
                  class="menu-item"
                  :class="{ disabled: item.disabled && item.disabled(), focused: focusIdx === idx }"
                  :disabled="item.disabled && item.disabled()"
                  @click="executeItem(item)"
                  @mouseenter="focusIdx = idx"
                  role="menuitem"
                >
                  <span class="mi-label">{{ item.label }}</span>
                  <span v-if="item.shortcut" class="mi-shortcut">{{ item.shortcut }}</span>
                </button>
              </template>
            </div>
          </transition>
        </div>
      </nav>

      <!-- Collapsed hamburger -->
      <div v-else class="menu-anchor" ref="collapsedAnchor">
        <button class="menu-label" :class="{ active: openMenuId === '_collapsed' }" @click.stop="toggleMenu('_collapsed')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          Menu
        </button>
        <transition name="menu-pop">
          <div v-if="openMenuId === '_collapsed'" class="menu-dropdown collapsed-dropdown" role="menu">
            <template v-for="menu in menus">
              <div :key="menu.id + '-hdr'" class="menu-group-hdr">{{ menu.label }}</div>
              <template v-for="(item, idx) in menu.items">
                <div v-if="item.type === 'separator'" :key="menu.id + 's' + idx" class="menu-sep"></div>
                <button
                  v-else-if="item.type !== 'submenu'"
                  :key="item.id"
                  class="menu-item"
                  :disabled="item.disabled && item.disabled()"
                  @click="executeItem(item)"
                  role="menuitem"
                >
                  <span v-if="item.type === 'toggle'" class="mi-check">{{ item.checked && item.checked() ? '\u2713' : '' }}</span>
                  <span class="mi-label">{{ item.label }}</span>
                  <span v-if="item.shortcut" class="mi-shortcut">{{ item.shortcut }}</span>
                </button>
              </template>
            </template>
          </div>
        </transition>
      </div>

      <!-- Center: editable project name (absolute so it stays visually centered) -->
      <div class="menubar-center">
        <span class="tb-title-label">title:</span>
        <input
          class="tb-project-input"
          :value="projectName"
          @change="updateName($event.target.value)"
          @keydown.enter="$event.target.blur()"
          placeholder="Project name"
          title="Project name"
        />
        <span v-if="isDirty" class="tb-unsaved">unsaved</span>
      </div>

      <!-- Spacer so right section stays at the end -->
      <div class="menubar-spacer"></div>

      <!-- Right: secondary controls + render button -->
      <div class="menubar-right">
        <div class="tb-divider"></div>
        <button class="tb-toggle" :class="{ on: gridVisible }" @click="toggleGrid" title="Grid">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
        </button>
        <button class="tb-toggle" :class="{ on: snapEnabled }" @click="toggleSnap" title="Snap">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 3L3 21"/><path d="M21 3v7h-7"/></svg>
        </button>
        <span class="tb-dim">{{ stageW }}&times;{{ stageH }}</span>
        <button
          class="tb-render-btn"
          :class="{ busy: isRendering }"
          :disabled="isRendering"
          @click="openRender"
          title="Render HQ via Docker"
        >
          <svg v-if="!isRendering" class="tb-play-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
          <svg v-else class="tb-render-spin tb-spinner-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke-dasharray="45 20"/></svg>
          <span class="tb-render-label">Render</span>
        </button>
      </div>
    </header>

    <!-- Backdrop to close menus on click-outside -->
    <div v-if="openMenuId" class="menubar-backdrop" @mousedown="closeMenu"></div>

    <!-- New Project dialog -->
    <transition name="menu-pop">
      <div v-if="showNewProjectDialog" class="np-overlay" @click.self="cancelNewProject">
        <div class="np-dialog">
          <h2 class="np-title">New Project</h2>

          <label class="np-label">Project Name</label>
          <input
            class="np-input"
            v-model="newProjectName"
            placeholder="My Animation"
            @keydown.enter="confirmNewProject"
            ref="npNameInput"
          />

          <label class="np-label" style="margin-top:12px;">Editor Mode</label>
          <div class="np-mode-row">
            <button
              class="np-mode-btn"
              :class="{ active: newProjectMode === 'visual' }"
              @click="newProjectMode = 'visual'"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
              <span class="np-mode-label">Visual (UI)</span>
              <span class="np-mode-desc">Drag-and-drop canvas, timeline, shapes</span>
            </button>
            <button
              class="np-mode-btn"
              :class="{ active: newProjectMode === 'code' }"
              @click="newProjectMode = 'code'"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              <span class="np-mode-label">Code Only</span>
              <span class="np-mode-desc">Full Manim power, write Python directly</span>
            </button>
          </div>

          <div class="np-actions">
            <button class="np-btn np-btn-cancel" @click="cancelNewProject">Cancel</button>
            <button class="np-btn np-btn-create" @click="confirmNewProject">Create Project</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { store, actions } from '../../store/project.js';
import { generateManimScript } from '../../export/manim.js';

const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
const mod = isMac ? '\u2318' : 'Ctrl+';

export default {
  name: 'Topbar',

  data() {
    return {
      openMenuId: null,
      focusIdx: -1,
      hoveredSub: null,
      collapsed: false,
      _resizeObs: null,
      showNewProjectDialog: false,
      newProjectName: 'My Animation',
      newProjectMode: 'visual'
    };
  },

  computed: {
    projectName() { return store.project.name; },
    projectId()   { return store.project.id; },
    isDirty()     { return store.isDirty; },
    gridVisible() { return store.project.stage.gridVisible; },
    snapEnabled() { return store.project.stage.snapEnabled; },
    stageW()      { return store.project.stage.width; },
    stageH()      { return store.project.stage.height; },
    isSaving()    { return store.savingToServer; },
    canGroup()    { return store.selectedObjectIds.length >= 2; },
    currentTheme(){ return store.theme; },

    isRendering() {
      const s = store.renderStatus;
      return s === 'uploading' || s === 'saving' || s === 'queued' || s === 'running';
    },

    menus() {
      return [
        {
          id: 'file', label: 'File',
          items: [
            { id: 'f-new',    label: 'New Project',           action: () => this.newProject() },
            { id: 'f-open',   label: 'Open\u2026',            action: () => this.loadProject(),     shortcut: `${mod}O` },
            { type: 'separator' },
            { id: 'f-save',   label: 'Save',                  action: () => this.saveProject(),     shortcut: `${mod}S` },
            { id: 'f-sync',   label: 'Save to Server',        action: () => this.saveToServer(),    disabled: () => this.isSaving },
            { id: 'f-browse', label: 'Server Projects\u2026', action: () => this.browseServer() },
            { type: 'separator' },
            { id: 'f-export', label: 'Export .py',             action: () => this.openExport() },
          ]
        },
        {
          id: 'edit', label: 'Edit',
          items: [
            { id: 'e-undo',  label: 'Undo',            action: () => actions.undo(),           shortcut: `${mod}Z` },
            { id: 'e-redo',  label: 'Redo',            action: () => actions.redo(),           shortcut: isMac ? '\u21E7\u2318Z' : 'Ctrl+Y' },
            { type: 'separator' },
            { id: 'e-copy',  label: 'Copy',            action: () => actions.copySelection(),  shortcut: `${mod}C` },
            { id: 'e-paste', label: 'Paste',           action: () => actions.pasteSelection(), shortcut: `${mod}V` },
            { type: 'separator' },
            { id: 'e-group', label: 'Group Selection',  action: () => this.groupSelected(),    shortcut: `${mod}G`, disabled: () => !this.canGroup },
          ]
        },
        {
          id: 'view', label: 'View',
          items: [
            { id: 'v-grid', label: 'Grid',  type: 'toggle', action: () => this.toggleGrid(), checked: () => this.gridVisible },
            { id: 'v-snap', label: 'Snap',  type: 'toggle', action: () => this.toggleSnap(), checked: () => this.snapEnabled },
            { type: 'separator' },
            {
              id: 'v-theme', label: 'Theme', type: 'submenu',
              children: [
                { id: 'v-t-light', label: 'Light', action: () => actions.setTheme('light'), active: () => this.currentTheme === 'light' },
                { id: 'v-t-dark',  label: 'Dark',  action: () => actions.setTheme('dark'),  active: () => this.currentTheme === 'dark' },
              ]
            },
          ]
        },
        {
          id: 'tools', label: 'Tools',
          items: [
            { id: 't-render', label: 'Render HQ\u2026', action: () => this.openRender() },
          ]
        },
        {
          id: 'help', label: 'Help',
          items: [
            { id: 'h-keys',  label: 'Keyboard Shortcuts', action: () => this.showShortcuts() },
            { type: 'separator' },
            { id: 'h-about', label: 'About Manim Motion',  action: () => this.showAbout() },
          ]
        }
      ];
    }
  },

  mounted() {
    this.checkCollapse();
    this._resizeObs = new ResizeObserver(() => this.checkCollapse());
    if (this.$refs.root) this._resizeObs.observe(this.$refs.root);
    document.addEventListener('keydown', this._globalKey);
    actions.setTheme(store.theme);
  },

  beforeDestroy() {
    if (this._resizeObs) this._resizeObs.disconnect();
    document.removeEventListener('keydown', this._globalKey);
  },

  methods: {
    checkCollapse() {
      const w = this.$refs.root ? this.$refs.root.clientWidth : window.innerWidth;
      this.collapsed = w < 640;
    },

    // ── Menu interaction ──
    toggleMenu(id) {
      if (this._hoverSwitchedAt && Date.now() - this._hoverSwitchedAt < 300) return;
      if (this.openMenuId === id) { this.closeMenu(); return; }
      this.openMenuId = id;
      this.focusIdx = -1;
      this.hoveredSub = null;
    },
    hoverMenu(id) {
      if (this.openMenuId && this.openMenuId !== id) {
        this.openMenuId = id;
        this.focusIdx = -1;
        this.hoveredSub = null;
        this._hoverSwitchedAt = Date.now();
      }
    },
    closeMenu() {
      this.openMenuId = null;
      this.focusIdx = -1;
      this.hoveredSub = null;
    },
    executeItem(item) {
      if (item.disabled && item.disabled()) return;
      if (item.action) item.action();
      if (item.type !== 'toggle' && item.type !== 'submenu') this.closeMenu();
    },

    // ── Keyboard: label navigation ──
    onLabelKey(e, menuIndex) {
      const ids = this.menus.map(m => m.id);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = (menuIndex + 1) % ids.length;
        this.focusLabel(next);
        if (this.openMenuId) this.openMenuId = ids[next];
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = (menuIndex - 1 + ids.length) % ids.length;
        this.focusLabel(prev);
        if (this.openMenuId) this.openMenuId = ids[prev];
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleMenu(ids[menuIndex]);
      } else if (e.key === 'ArrowDown' && this.openMenuId) {
        e.preventDefault();
        this.focusIdx = this.nextFocusable(-1, 1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.closeMenu();
      }
    },
    focusLabel(index) {
      const id = this.menus[index]?.id;
      if (!id) return;
      this.$nextTick(() => {
        const refs = this.$refs['anchor-' + id];
        const el = refs && (Array.isArray(refs) ? refs[0] : refs);
        const btn = el?.querySelector('button');
        if (btn) btn.focus();
      });
    },

    // ── Keyboard: dropdown navigation ──
    onDropdownKey(e, menuIndex) {
      const menu = this.menus[menuIndex];
      if (!menu) return;
      const items = menu.items;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.focusIdx = this.nextFocusable(this.focusIdx, 1, items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.focusIdx = this.nextFocusable(this.focusIdx, -1, items);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (this.focusIdx >= 0 && items[this.focusIdx]) this.executeItem(items[this.focusIdx]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.closeMenu();
        this.focusLabel(menuIndex);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = (menuIndex + 1) % this.menus.length;
        this.openMenuId = this.menus[next].id;
        this.focusIdx = -1;
        this.focusLabel(next);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = (menuIndex - 1 + this.menus.length) % this.menus.length;
        this.openMenuId = this.menus[prev].id;
        this.focusIdx = -1;
        this.focusLabel(prev);
      }
    },
    nextFocusable(current, dir, items) {
      const menu = items || (this.menus.find(m => m.id === this.openMenuId)?.items) || [];
      let i = current + dir;
      while (i >= 0 && i < menu.length) {
        if (menu[i].type !== 'separator') return i;
        i += dir;
      }
      return current;
    },

    _globalKey(e) {
      if (this.openMenuId && e.key === 'Escape') {
        this.closeMenu();
        e.preventDefault();
        e.stopPropagation();
      }
    },

    // ── Actions (ported from old Topbar) ──
    updateName(name) { store.project.name = name.trim() || 'My Animation'; store.isDirty = true; },
    toggleGrid()     { actions.toggleGrid(); },
    toggleSnap()     { actions.toggleSnap(); },

    groupSelected() {
      if (!this.canGroup) return;
      actions.groupObjects([...store.selectedObjectIds]);
    },

    newProject() {
      if (store.isDirty && !confirm('Discard unsaved changes?')) return;
      this.newProjectName = 'My Animation';
      this.newProjectMode = 'visual';
      this.showNewProjectDialog = true;
    },
    confirmNewProject() {
      const name = this.newProjectName.trim() || 'My Animation';
      actions.newProject(name, this.newProjectMode);
      this.showNewProjectDialog = false;
      this.$emit('mode-changed');
    },
    cancelNewProject() {
      this.showNewProjectDialog = false;
    },
    async loadProject() {
      if (store.isDirty && !confirm('Discard unsaved changes?')) return;
      await actions.loadFromFile();
    },
    saveProject() { actions.saveToFile(); },

    async saveToServer() {
      try {
        const ok = await actions.checkApi();
        if (!ok) { actions.setError('Server not available. Make sure Docker is running.'); return; }
        await actions.saveToServer();
      } catch {}
    },
    browseServer() {
      store.showProjectBrowser = true;
      actions.listServerProjects();
    },
    openExport() {
      if (store.project.editorMode === 'code') {
        if (!store.project.codeSource || store.project.codeSource.trim().length === 0) {
          actions.setError('Write some Manim code first!'); return;
        }
        store.exportCode = store.project.codeSource;
      } else {
        if (store.project.objects.length === 0) { actions.setError('Add some objects to the stage first!'); return; }
        store.exportCode = generateManimScript(store.project);
      }
      store.showExportDialog = true;
    },
    openRender() {
      if (store.project.editorMode === 'code') {
        if (!store.project.codeSource || store.project.codeSource.trim().length === 0) {
          actions.setError('Write some Manim code first!'); return;
        }
      } else {
        if (store.project.objects.length === 0) { actions.setError('Add some objects to the stage first!'); return; }
      }
      store.showRenderDialog = true;
    },

    showShortcuts() {
      actions.setError(
        'Shortcuts: V=Select, H=Hand, Space=Play, Del=Delete, ' +
        (isMac ? '⌘' : 'Ctrl+') + 'Z=Undo, ' +
        (isMac ? '⇧⌘Z' : 'Ctrl+Y') + '=Redo, ' +
        (isMac ? '⌘' : 'Ctrl+') + 'C/V=Copy/Paste, ' +
        (isMac ? '⌘' : 'Ctrl+') + 'G=Group, ' +
        (isMac ? '⌘' : 'Ctrl+') + 'S=Save'
      );
    },
    showAbout() {
      actions.setError('Manim Motion — Visual animation editor powered by Manim');
    }
  }
};
</script>

<style scoped>
.menubar-root { position: relative; flex-shrink: 0; }

.menubar-header {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  gap: 2px;
  background: var(--studio-surface);
  border-bottom: 1px solid var(--studio-border);
  position: relative;
  z-index: 200;
}

/* ── Brand ── */
.menubar-brand {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 10px;
  flex-shrink: 0;
}
.brand-logo {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  object-fit: contain;
}
.brand-name { font-size: 13px; font-weight: 700; color: var(--studio-text); letter-spacing: -0.3px; }
.brand-sub  { font-size: 13px; font-weight: 400; color: var(--studio-text-secondary); letter-spacing: -0.3px; }

/* ── Menu labels ── */
.menubar-nav { display: flex; align-items: center; gap: 1px; }
.menu-anchor { position: relative; }

.menu-label {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--studio-text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
  display: flex;
  align-items: center;
  gap: 5px;
  outline: none;
  white-space: nowrap;
}
.menu-label:hover { background: var(--studio-border); color: var(--studio-text); }
.menu-label.active { background: var(--studio-border); color: var(--studio-text); }
.menu-label:focus-visible { box-shadow: 0 0 0 2px var(--studio-focus-ring); }

/* ── Dropdown ── */
.menu-dropdown {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  min-width: 200px;
  background: var(--studio-surface3);
  border: 1px solid var(--studio-border);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.25);
  z-index: 201;
}
.collapsed-dropdown { min-width: 240px; max-height: 70vh; overflow-y: auto; }

.menu-group-hdr {
  padding: 6px 10px 3px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--studio-text-muted);
}

.menu-sep { height: 1px; margin: 4px 8px; background: var(--studio-divider); }

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  color: var(--studio-text);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.08s;
  text-align: left;
  outline: none;
}
.menu-item:hover, .menu-item.focused { background: var(--studio-accent-subtle); }
.menu-item.disabled { opacity: 0.4; cursor: default; pointer-events: none; }
.menu-item:focus-visible { box-shadow: inset 0 0 0 2px var(--studio-focus-ring); }

.mi-label  { flex: 1; white-space: nowrap; }
.mi-shortcut {
  font-size: 10px;
  color: var(--studio-text-muted);
  margin-left: auto;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
}
.mi-check { width: 14px; text-align: center; font-size: 11px; color: var(--studio-accent); flex-shrink: 0; }
.mi-radio { width: 14px; text-align: center; font-size: 12px; color: var(--studio-accent); flex-shrink: 0; }
.mi-arrow { flex-shrink: 0; opacity: 0.5; }

.radio-on .mi-radio { color: var(--studio-accent); }

/* ── Submenu ── */
.menu-sub-anchor { position: relative; }
.menu-submenu {
  position: absolute;
  left: calc(100% + 2px);
  top: -4px;
  min-width: 140px;
  background: var(--studio-surface3);
  border: 1px solid var(--studio-border);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.25);
  z-index: 202;
}

/* ── Center: editable project name (truly centered in header) ── */
.menubar-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  pointer-events: none;
}
.menubar-center .tb-title-label,
.menubar-center .tb-project-input,
.menubar-center .tb-unsaved {
  pointer-events: auto;
}

.tb-title-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--studio-text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.menubar-spacer {
  flex: 1;
  min-width: 0;
}

/* ── Right section ── */
.menubar-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.tb-toggle {
  display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 4px;
  color: var(--studio-text-muted);
  background: transparent; border: none; cursor: pointer;
  transition: all 0.1s;
}
.tb-toggle:hover { background: var(--studio-border); color: var(--studio-text); }
.tb-toggle.on { background: var(--studio-accent-subtle); color: var(--studio-accent); }

.tb-dim { font-size: 9px; color: var(--studio-text-muted); font-family: var(--font-mono, monospace); }
.tb-divider { width: 1px; height: 14px; background: var(--studio-border); }

.tb-render-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: var(--studio-success);
  border: none;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}
.tb-render-btn:hover:not(:disabled) {
  background: var(--studio-success-hover);
}
.tb-render-btn:disabled {
  opacity: 0.8;
  cursor: default;
}
.tb-render-btn.busy { background: var(--studio-text-muted); }
.tb-play-icon, .tb-spinner-icon { flex-shrink: 0; }
.tb-render-label { white-space: nowrap; }
.tb-render-spin { display: inline-block; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.tb-project-input {
  background: var(--studio-surface);
  border: 1px solid var(--studio-border);
  font-size: 13px;
  font-weight: 500;
  color: var(--studio-text);
  width: 120px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.1s, border-color 0.1s;
  outline: none;
}
.tb-project-input::placeholder {
  color: var(--studio-text-muted);
}
.tb-project-input:hover { background: var(--studio-surface2); border-color: var(--studio-border); }
.tb-project-input:focus { background: var(--studio-surface2); border-color: var(--studio-accent); box-shadow: 0 0 0 2px rgb(var(--c-accent) / 0.2); }

.tb-unsaved { font-size: 9px; font-weight: 600; color: var(--studio-warning); }

/* ── Backdrop ── */
.menubar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 199;
  background: transparent;
}

/* ── Transitions ── */
.menu-pop-enter-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.menu-pop-leave-active { transition: opacity 0.08s ease; }
.menu-pop-enter { opacity: 0; transform: translateY(-4px); }
.menu-pop-leave-to { opacity: 0; }

/* ── New Project Dialog ── */
.np-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}
.np-dialog {
  background: var(--studio-surface);
  border: 1px solid var(--studio-border);
  border-radius: 14px;
  padding: 28px 32px;
  width: 420px;
  max-width: 95vw;
  box-shadow: 0 16px 48px rgba(0,0,0,0.35);
}
.np-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--studio-text);
  margin: 0 0 18px;
}
.np-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--studio-text-muted);
  margin-bottom: 6px;
}
.np-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg);
  color: var(--studio-text);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.np-input:focus { border-color: var(--studio-accent); box-shadow: 0 0 0 2px rgb(var(--c-accent) / 0.2); }
.np-mode-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.np-mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 10px;
  border-radius: 10px;
  border: 2px solid var(--studio-border);
  background: var(--studio-bg);
  color: var(--studio-text-muted);
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}
.np-mode-btn:hover { border-color: var(--studio-accent); color: var(--studio-text); }
.np-mode-btn.active {
  border-color: var(--studio-accent);
  background: var(--studio-accent-subtle);
  color: var(--studio-accent);
}
.np-mode-label { font-size: 13px; font-weight: 600; margin-top: 4px; }
.np-mode-desc { font-size: 10px; opacity: 0.65; line-height: 1.3; }
.np-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}
.np-btn {
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.12s;
}
.np-btn-cancel {
  background: var(--studio-border);
  color: var(--studio-text-muted);
}
.np-btn-cancel:hover { background: var(--studio-border); color: var(--studio-text); }
.np-btn-create {
  background: var(--studio-accent);
  color: #fff;
}
.np-btn-create:hover { filter: brightness(1.1); }
</style>
