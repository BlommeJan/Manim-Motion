/**
 * Project State Store — v3 + Groups + Text + Server sync
 *
 * Video-editor style data model with full API integration.
 * Objects live on the timeline with enter/exit times.
 * Clips are animations between or on objects.
 * Assets hold uploaded images/SVGs.
 * Groups are logical containers with margin/padding.
 *
 * Server actions: saveToServer, loadFromServer, renderOnServer, pollRenderJob
 */

import Vue from 'vue';
import api from '../api.js';

// ─── Defaults ────────────────────────────────────────────────────────────────

function createDefaultProject() {
  return {
    id: null,
    name: 'My Animation',
    stage: {
      width: 1920,
      height: 1080,
      backgroundColor: '#000000',
      backgroundOpacity: 1,
      backgroundImage: null,
      gridVisible: true,
      gridSize: 8,
      gridColor: '#ffffff',
      gridOpacity: 0.12,
      snapEnabled: true,
      snapToGrid: true,
      snapToCenter: true,
      snapToObjects: false
    },
    assets: [],      // { id, name, type:'image'|'svg', dataUrl, width, height, filename, serverFilename }
    objects: [],
    groups: [],       // { id, name, childIds:[], margin:10, collapsed:false }
    tracks: [
      { id: 'track_1', name: 'Track 1', clips: [] }
    ],
    sceneDuration: 10
  };
}

// ─── Reactive Store ──────────────────────────────────────────────────────────

export const store = Vue.observable({
  project: createDefaultProject(),

  selectedObjectIds: [],
  selectedClipId: null,
  activeTool: 'select',

  // Playback
  playbackTime: 0,
  playbackPlaying: false,
  playbackLoop: true,

  // Frame state from playback engine
  frameState: {
    objectOverrides: {},
    morphShapes: [],
    hiddenIds: new Set()
  },

  // Export dialog
  showExportDialog: false,
  exportCode: '',

  // Render
  showRenderDialog: false,
  renderJobId: null,
  renderStatus: null,    // null | 'uploading' | 'saving' | 'queued' | 'running' | 'completed' | 'failed'
  renderError: null,
  renderQuality: 'high',
  renderVideoUrl: null,
  renderLog: '',

  // Server project browser
  showProjectBrowser: false,
  serverProjects: [],

  // API connectivity
  apiAvailable: null,    // null = unknown, true/false

  // UI
  isDirty: false,
  error: null,
  loading: false,
  savingToServer: false
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _counter = 0;
function uid(prefix = 'id') {
  _counter++;
  return `${prefix}_${Date.now().toString(36)}_${_counter}`;
}

let _objectAddCount = 0;
function nextPosition(stageW, stageH) {
  const positions = [
    { x: stageW * 0.35, y: stageH * 0.5 },
    { x: stageW * 0.65, y: stageH * 0.5 },
    { x: stageW * 0.5,  y: stageH * 0.35 },
    { x: stageW * 0.5,  y: stageH * 0.65 },
    { x: stageW * 0.5,  y: stageH * 0.5 },
  ];
  const pos = positions[_objectAddCount % positions.length];
  _objectAddCount++;
  return pos;
}

let _pollTimer = null;

// ─── Entrance / Exit animation types ─────────────────────────────────────────

export const ENTER_ANIMS = [
  { value: 'none',           label: 'None',             icon: '—',  desc: 'Appears instantly' },
  { value: 'fade_in',        label: 'Fade In',          icon: '◐',  desc: 'Fade from transparent' },
  { value: 'grow_in',        label: 'Grow In',          icon: '⊕',  desc: 'Scale up from zero' },
  { value: 'fly_in_left',    label: 'Fly In Left',      icon: '→',  desc: 'Slide in from left' },
  { value: 'fly_in_right',   label: 'Fly In Right',     icon: '←',  desc: 'Slide in from right' },
  { value: 'fly_in_top',     label: 'Fly In Top',       icon: '↓',  desc: 'Slide in from top' },
  { value: 'fly_in_bottom',  label: 'Fly In Bottom',    icon: '↑',  desc: 'Slide in from bottom' },
  { value: 'draw',           label: 'Draw / Create',    icon: '✎',  desc: 'Outline draws, then fills' },
  { value: 'write',          label: 'Write',            icon: '✍',  desc: 'Write effect (text/shapes)' },
  { value: 'spin_in',        label: 'Spin In',          icon: '↻',  desc: 'Rotate in while fading' },
  { value: 'bounce_in',      label: 'Bounce In',        icon: '⤴',  desc: 'Bounce into place' },
];

export const EXIT_ANIMS = [
  { value: 'none',            label: 'None',             icon: '—',  desc: 'Disappears instantly' },
  { value: 'fade_out',        label: 'Fade Out',         icon: '◑',  desc: 'Fade to transparent' },
  { value: 'shrink_out',      label: 'Shrink Out',       icon: '⊖',  desc: 'Scale down to zero' },
  { value: 'fly_out_left',    label: 'Fly Out Left',     icon: '←',  desc: 'Slide out to left' },
  { value: 'fly_out_right',   label: 'Fly Out Right',    icon: '→',  desc: 'Slide out to right' },
  { value: 'fly_out_top',     label: 'Fly Out Top',      icon: '↑',  desc: 'Slide out to top' },
  { value: 'fly_out_bottom',  label: 'Fly Out Bottom',   icon: '↓',  desc: 'Slide out to bottom' },
  { value: 'uncreate',        label: 'Uncreate',         icon: '✎',  desc: 'Reverse draw' },
  { value: 'spin_out',        label: 'Spin Out',         icon: '↻',  desc: 'Rotate out while fading' },
];

// ─── Shape palette ───────────────────────────────────────────────────────────

export const SHAPE_DEFAULTS = {
  rectangle:{ width: 160, height: 100, fill: '#3b82f6', stroke: '#fff',  strokeWidth: 2 },
  square:   { width: 120, height: 120, fill: '#3b82f6', stroke: '#fff',  strokeWidth: 2 },
  circle:   { width: 120, height: 120, fill: '#22c55e', stroke: '#fff',  strokeWidth: 2 },
  ellipse:  { width: 160, height: 100, fill: '#06b6d4', stroke: '#fff',  strokeWidth: 2 },
  triangle: { width: 120, height: 120, fill: '#f59e0b', stroke: '#fff',  strokeWidth: 2 },
  star:     { width: 120, height: 120, fill: '#eab308', stroke: '#fff',  strokeWidth: 2 },
  polygon:  { width: 120, height: 120, fill: '#8b5cf6', stroke: '#fff',  strokeWidth: 2 },
  line:     { width: 200, height: 4,   fill: '#94a3b8', stroke: '#94a3b8', strokeWidth: 3 },
  arrow:    { width: 200, height: 40,  fill: '#ef4444', stroke: '#fff',  strokeWidth: 2 },
  heart:    { width: 120, height: 120, fill: '#ec4899', stroke: '#fff',  strokeWidth: 2 },
  dot:      { width: 20,  height: 20,  fill: '#ffffff', stroke: 'transparent', strokeWidth: 0 },
  dot_grid: { width: 200, height: 200, fill: '#a855f7', stroke: 'transparent', strokeWidth: 0 },
  text:     { width: 200, height: 50,  fill: '#ffffff', stroke: 'transparent', strokeWidth: 0 },
  image:    { width: 200, height: 200, fill: 'transparent', stroke: 'transparent', strokeWidth: 0 },
  svg_asset:{ width: 200, height: 200, fill: 'transparent', stroke: 'transparent', strokeWidth: 0 }
};

export const SHAPE_COLORS = {
  rectangle: '#3b82f6', square: '#3b82f6', circle: '#22c55e', ellipse: '#06b6d4',
  triangle: '#f59e0b', star: '#eab308', polygon: '#8b5cf6',
  line: '#94a3b8', arrow: '#ef4444',
  heart: '#ec4899', dot: '#94a3b8', dot_grid: '#a855f7',
  text: '#f472b6', image: '#f59e0b', svg_asset: '#f59e0b'
};

// ─── Getters ─────────────────────────────────────────────────────────────────

export const getters = {
  selectedObjects() {
    return store.selectedObjectIds.map(id => store.project.objects.find(o => o.id === id)).filter(Boolean);
  },
  selectedObject() {
    if (store.selectedObjectIds.length !== 1) return null;
    return store.project.objects.find(o => o.id === store.selectedObjectIds[0]) || null;
  },
  selectedClip() {
    if (!store.selectedClipId) return null;
    for (const track of store.project.tracks) {
      const clip = track.clips.find(c => c.id === store.selectedClipId);
      if (clip) return clip;
    }
    return null;
  },
  objectById(id) {
    return store.project.objects.find(o => o.id === id) || null;
  },
  assetById(id) {
    return store.project.assets.find(a => a.id === id) || null;
  },
  groupById(id) {
    return (store.project.groups || []).find(g => g.id === id) || null;
  },
  objectGroup(objId) {
    return (store.project.groups || []).find(g => g.childIds && g.childIds.includes(objId)) || null;
  },
  computedDuration() {
    let maxEnd = 5;
    for (const obj of store.project.objects) {
      const end = (obj.enterTime || 0) + (obj.duration || 5);
      if (end > maxEnd) maxEnd = end;
    }
    for (const track of store.project.tracks) {
      for (const clip of track.clips) {
        const end = clip.startTime + clip.duration;
        if (end > maxEnd) maxEnd = end;
      }
    }
    return Math.max(store.project.sceneDuration, maxEnd + 1);
  },
  visibleTracks() {
    const all = store.project.tracks;
    const activeCount = all.filter(t => t.clips.length > 0).length;
    const showCount = Math.min(5, Math.max(1, activeCount + 1));
    return all.slice(0, showCount);
  },
  objectsAtTime(time) {
    return store.project.objects.filter(o => {
      const enter = o.enterTime || 0;
      const exit = enter + (o.duration || 999);
      return time >= enter && time < exit;
    });
  }
};

// ─── Actions ─────────────────────────────────────────────────────────────────

export const actions = {
  // ══════════════════════════════════════════════════════════════════════════
  // Objects
  // ══════════════════════════════════════════════════════════════════════════

  addObject(type, x, y, extraProps = {}) {
    const stage = store.project.stage;
    const d = SHAPE_DEFAULTS[type] || SHAPE_DEFAULTS.circle;
    const pos = (x !== undefined && y !== undefined)
      ? { x, y }
      : nextPosition(stage.width, stage.height);

    const lastEnd = store.project.objects.reduce((max, o) => {
      const end = (o.enterTime || 0) + (o.duration || 5);
      return end > max ? end : max;
    }, 0);

    const nameMap = {
      dot_grid: 'Dot Grid', svg_asset: 'SVG', rectangle: 'Rectangle',
      ellipse: 'Ellipse', triangle: 'Triangle', star: 'Star',
      polygon: 'Polygon', line: 'Line', arrow: 'Arrow', text: 'Text'
    };
    const displayName = nameMap[type] || (type.charAt(0).toUpperCase() + type.slice(1));

    const obj = {
      id: uid('obj'),
      type,
      name: `${displayName} ${store.project.objects.length + 1}`,
      x: Math.round(pos.x),
      y: Math.round(pos.y),
      width: d.width,
      height: d.height,
      rotation: 0,
      fill: d.fill,
      stroke: d.stroke,
      strokeWidth: d.strokeWidth,
      opacity: 1,
      zOrder: store.project.objects.length,
      visible: true,
      enterTime: store.project.objects.length === 0 ? 0 : Math.round(lastEnd * 10) / 10,
      duration: 3,
      enterAnim: 'fade_in',
      exitAnim: 'fade_out',
      enterAnimDur: 0.5,
      exitAnimDur: 0.5,
      ...(type === 'dot_grid' ? { gridCols: 5, gridRows: 5, dotRadius: 5, dotSpacing: 40 } : {}),
      ...(type === 'text' ? { content: 'Hello World', fontSize: 48, fontFamily: 'Roboto', textAlign: 'center', fontWeight: 'normal', fontStyle: 'normal' } : {}),
      ...(type === 'polygon' ? { sides: 6 } : {}),
      ...(type === 'star' ? { starArms: 5, innerRatio: 0.4 } : {}),
      ...extraProps
    };

    store.project.objects.push(obj);
    store.isDirty = true;
    return obj;
  },

  addImageObject(assetId, x, y) {
    const asset = store.project.assets.find(a => a.id === assetId);
    if (!asset) return null;

    const type = asset.type === 'svg' ? 'svg_asset' : 'image';
    const aspectRatio = (asset.width && asset.height) ? asset.width / asset.height : 1;
    const height = 200;
    const width = Math.round(height * aspectRatio);

    return actions.addObject(type, x, y, {
      name: asset.name,
      assetId: asset.id,
      width,
      height,
      naturalWidth: asset.width || width,
      naturalHeight: asset.height || height
    });
  },

  updateObject(id, updates) {
    const obj = store.project.objects.find(o => o.id === id);
    if (!obj) return;
    for (const key of Object.keys(updates)) {
      Vue.set(obj, key, updates[key]);
    }
    store.isDirty = true;
  },

  deleteObject(id) {
    const idx = store.project.objects.findIndex(o => o.id === id);
    if (idx === -1) return;
    store.project.objects.splice(idx, 1);
    const selIdx = store.selectedObjectIds.indexOf(id);
    if (selIdx !== -1) store.selectedObjectIds.splice(selIdx, 1);
    for (const track of store.project.tracks) {
      track.clips = track.clips.filter(c => c.sourceId !== id && c.targetId !== id);
    }
    // Remove from any group
    for (const group of (store.project.groups || [])) {
      const gIdx = (group.childIds || []).indexOf(id);
      if (gIdx !== -1) group.childIds.splice(gIdx, 1);
    }
    // Remove empty groups
    if (store.project.groups) {
      store.project.groups = store.project.groups.filter(g => g.childIds && g.childIds.length > 0);
    }
    store.isDirty = true;
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Groups
  // ══════════════════════════════════════════════════════════════════════════

  groupObjects(ids) {
    if (!ids || ids.length < 2) {
      actions.setError('Select at least 2 objects to group');
      return null;
    }
    // Remove these objects from existing groups
    for (const group of (store.project.groups || [])) {
      group.childIds = (group.childIds || []).filter(cid => !ids.includes(cid));
    }
    // Clean empty groups
    if (!store.project.groups) Vue.set(store.project, 'groups', []);
    store.project.groups = store.project.groups.filter(g => g.childIds && g.childIds.length > 0);

    const group = {
      id: uid('group'),
      name: `Group ${(store.project.groups || []).length + 1}`,
      childIds: [...ids],
      margin: 10,
      collapsed: false
    };
    store.project.groups.push(group);
    store.isDirty = true;
    return group;
  },

  ungroupObjects(groupId) {
    if (!store.project.groups) return;
    const idx = store.project.groups.findIndex(g => g.id === groupId);
    if (idx !== -1) {
      store.project.groups.splice(idx, 1);
      store.isDirty = true;
    }
  },

  updateGroup(groupId, updates) {
    const group = (store.project.groups || []).find(g => g.id === groupId);
    if (!group) return;
    for (const key of Object.keys(updates)) {
      Vue.set(group, key, updates[key]);
    }
    store.isDirty = true;
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Assets
  // ══════════════════════════════════════════════════════════════════════════

  async uploadAsset(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const img = new Image();
        img.onload = () => {
          const asset = {
            id: uid('asset'),
            name: file.name.replace(/\.[^.]+$/, ''),
            filename: file.name,
            type: file.type.includes('svg') ? 'svg' : 'image',
            dataUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
            serverFilename: null
          };
          store.project.assets.push(asset);
          store.isDirty = true;
          resolve(asset);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = dataUrl;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },

  removeAsset(id) {
    const idx = store.project.assets.findIndex(a => a.id === id);
    if (idx !== -1) {
      store.project.assets.splice(idx, 1);
      store.isDirty = true;
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Selection
  // ══════════════════════════════════════════════════════════════════════════

  selectObject(id, addToSelection = false) {
    if (!id) { store.selectedObjectIds = []; store.selectedClipId = null; return; }
    if (addToSelection) {
      const idx = store.selectedObjectIds.indexOf(id);
      if (idx !== -1) store.selectedObjectIds.splice(idx, 1);
      else store.selectedObjectIds.push(id);
    } else {
      store.selectedObjectIds = [id];
    }
    store.selectedClipId = null;
  },

  selectClip(clipId) {
    store.selectedClipId = clipId;
    store.selectedObjectIds = [];
  },

  deselectAll() {
    store.selectedObjectIds = [];
    store.selectedClipId = null;
  },

  setActiveTool(tool) { store.activeTool = tool; },

  // ══════════════════════════════════════════════════════════════════════════
  // Clips
  // ══════════════════════════════════════════════════════════════════════════

  addClip(trackIndex, clipData) {
    while (store.project.tracks.length <= trackIndex) {
      store.project.tracks.push({
        id: `track_${store.project.tracks.length + 1}`,
        name: `Track ${store.project.tracks.length + 1}`,
        clips: []
      });
    }
    while (store.project.tracks.length < 5) {
      store.project.tracks.push({
        id: `track_${store.project.tracks.length + 1}`,
        name: `Track ${store.project.tracks.length + 1}`,
        clips: []
      });
    }
    const clip = {
      id: uid('clip'), type: 'transform', startTime: 0, duration: 1.5,
      easing: 'ease_in_out', sourceId: null, targetId: null, params: {},
      overshoot: 0, settle: 1.0, morphQuality: 'medium', ...clipData
    };
    store.project.tracks[trackIndex].clips.push(clip);
    store.isDirty = true;
    return clip;
  },

  updateClip(clipId, updates) {
    for (const track of store.project.tracks) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) {
        for (const key of Object.keys(updates)) Vue.set(clip, key, updates[key]);
        store.isDirty = true;
        return;
      }
    }
  },

  deleteClip(clipId) {
    for (const track of store.project.tracks) {
      const idx = track.clips.findIndex(c => c.id === clipId);
      if (idx !== -1) {
        track.clips.splice(idx, 1);
        if (store.selectedClipId === clipId) store.selectedClipId = null;
        store.isDirty = true;
        return;
      }
    }
  },

  createTransform() {
    if (store.selectedObjectIds.length !== 2) {
      actions.setError('Select exactly 2 objects to create a transform');
      return null;
    }
    const [sourceId, targetId] = store.selectedObjectIds;
    const src = getters.objectById(sourceId);
    const tgt = getters.objectById(targetId);
    if (!src || !tgt) return null;

    const startTime = (src.enterTime || 0) + (src.duration || 3) - 0.5;

    let trackIndex = 0;
    for (let i = 0; i < store.project.tracks.length; i++) {
      if (store.project.tracks[i].clips.length === 0) { trackIndex = i; break; }
      trackIndex = i + 1;
    }
    trackIndex = Math.min(trackIndex, 4);

    const clip = actions.addClip(trackIndex, {
      type: 'transform', startTime: Math.max(0, startTime), duration: 1.5,
      easing: 'ease_in_out_cubic', sourceId, targetId, morphQuality: 'medium'
    });
    store.selectedClipId = clip.id;
    store.selectedObjectIds = [];
    return clip;
  },

  createAnimation(type, params = {}) {
    if (store.selectedObjectIds.length !== 1) {
      actions.setError('Select 1 object to animate');
      return null;
    }
    const sourceId = store.selectedObjectIds[0];
    const src = getters.objectById(sourceId);
    const startTime = src ? (src.enterTime || 0) : 0;

    let trackIndex = 0;
    for (let i = 0; i < store.project.tracks.length; i++) {
      if (store.project.tracks[i].clips.length === 0) { trackIndex = i; break; }
      trackIndex = i + 1;
    }
    trackIndex = Math.min(trackIndex, 4);

    const clip = actions.addClip(trackIndex, {
      type, startTime, duration: 1.0, easing: 'ease_in_out', sourceId, params
    });
    store.selectedClipId = clip.id;
    return clip;
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Alignment (3x3 grid)
  // ══════════════════════════════════════════════════════════════════════════

  alignObject(objId, anchor) {
    const obj = store.project.objects.find(o => o.id === objId);
    if (!obj) return;
    const stage = store.project.stage;
    const pad = 50;

    const positions = {
      'TOP_LEFT':     { x: pad + obj.width / 2, y: pad + obj.height / 2 },
      'TOP':          { x: stage.width / 2, y: pad + obj.height / 2 },
      'TOP_RIGHT':    { x: stage.width - pad - obj.width / 2, y: pad + obj.height / 2 },
      'LEFT':         { x: pad + obj.width / 2, y: stage.height / 2 },
      'CENTER':       { x: stage.width / 2, y: stage.height / 2 },
      'RIGHT':        { x: stage.width - pad - obj.width / 2, y: stage.height / 2 },
      'BOTTOM_LEFT':  { x: pad + obj.width / 2, y: stage.height - pad - obj.height / 2 },
      'BOTTOM':       { x: stage.width / 2, y: stage.height - pad - obj.height / 2 },
      'BOTTOM_RIGHT': { x: stage.width - pad - obj.width / 2, y: stage.height - pad - obj.height / 2 }
    };

    const pos = positions[anchor];
    if (pos) {
      actions.updateObject(objId, { x: Math.round(pos.x), y: Math.round(pos.y) });
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Playback
  // ══════════════════════════════════════════════════════════════════════════

  setPlaybackTime(t) { store.playbackTime = t; },
  setPlaybackPlaying(p) { store.playbackPlaying = p; },
  setFrameState(s) { store.frameState = s; },

  // ══════════════════════════════════════════════════════════════════════════
  // Stage
  // ══════════════════════════════════════════════════════════════════════════

  updateStage(u) { for (const k of Object.keys(u)) Vue.set(store.project.stage, k, u[k]); store.isDirty = true; },
  toggleGrid() { store.project.stage.gridVisible = !store.project.stage.gridVisible; },
  toggleSnap() { store.project.stage.snapEnabled = !store.project.stage.snapEnabled; },

  // ══════════════════════════════════════════════════════════════════════════
  // Local Project I/O  (file-based, existing behaviour)
  // ══════════════════════════════════════════════════════════════════════════

  exportJSON() { return JSON.stringify(JSON.parse(JSON.stringify(store.project)), null, 2); },

  importJSON(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.stage || !Array.isArray(data.objects)) throw new Error('Invalid project');
      if (!data.tracks) data.tracks = [{ id: 'track_1', name: 'Track 1', clips: [] }];
      if (!data.assets) data.assets = [];
      if (!data.groups) data.groups = [];
      store.project = data;
      store.selectedObjectIds = [];
      store.selectedClipId = null;
      store.isDirty = false;
      store.error = null;
      return true;
    } catch (err) {
      store.error = `Could not open project: ${err.message}`;
      return false;
    }
  },

  saveToFile() {
    const json = actions.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${store.project.name || 'project'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    store.isDirty = false;
  },

  loadFromFile() {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) { resolve(false); return; }
        const reader = new FileReader();
        reader.onload = (ev) => resolve(actions.importJSON(ev.target.result));
        reader.onerror = () => { store.error = 'Failed to read file'; resolve(false); };
        reader.readAsText(file);
      };
      input.click();
    });
  },

  newProject(name = 'My Animation') {
    store.project = createDefaultProject();
    store.project.name = name;
    store.selectedObjectIds = [];
    store.selectedClipId = null;
    store.isDirty = false;
    store.error = null;
    store.playbackTime = 0;
    store.playbackPlaying = false;
    store.frameState = { objectOverrides: {}, morphShapes: [], hiddenIds: new Set() };
    store.renderJobId = null;
    store.renderStatus = null;
    store.renderError = null;
    store.renderVideoUrl = null;
    store.renderLog = '';
    _objectAddCount = 0;
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Server Project I/O  (Docker / API)
  // ══════════════════════════════════════════════════════════════════════════

  /** Check if the API server is reachable */
  async checkApi() {
    try {
      const ok = await api.checkHealth();
      store.apiAvailable = ok;
      return ok;
    } catch {
      store.apiAvailable = false;
      return false;
    }
  },

  /**
   * Save the current project to the server (explicit action).
   * Creates the project on the server if it has no ID.
   * Uploads any assets that haven't been synced yet.
   */
  async saveToServer() {
    store.savingToServer = true;
    store.loading = true;
    try {
      // 1. Create on server if no project ID
      if (!store.project.id) {
        const created = await api.projects.create(store.project.name);
        Vue.set(store.project, 'id', created.id);
      }

      const projectId = store.project.id;

      // 2. Upload any assets that need syncing
      for (const asset of store.project.assets) {
        if (asset.dataUrl && !asset.serverFilename) {
          try {
            const result = await api.assets.uploadBase64(projectId, {
              name: asset.filename || asset.name || 'asset',
              type: asset.type,
              data: asset.dataUrl
            });
            Vue.set(asset, 'serverFilename', result.filename);
          } catch (err) {
            console.warn('[saveToServer] Asset upload failed:', asset.name, err);
          }
        }
      }

      // 3. Prepare server-safe project JSON
      const serverProject = JSON.parse(JSON.stringify(store.project));

      // Map serverFilename → filename, remove dataUrl
      for (const a of serverProject.assets) {
        if (a.serverFilename) a.filename = a.serverFilename;
        delete a.dataUrl;
        delete a.serverFilename;
      }

      // 4. Save to server
      await api.projects.update(projectId, serverProject);
      store.isDirty = false;

      return projectId;
    } catch (err) {
      store.error = `Save to server failed: ${err.message}`;
      throw err;
    } finally {
      store.loading = false;
      store.savingToServer = false;
    }
  },

  /**
   * Load a project from the server by ID.
   */
  async loadFromServer(id) {
    store.loading = true;
    try {
      const project = await api.projects.get(id);

      // For each asset, create a displayable URL
      for (const asset of project.assets || []) {
        if (asset.filename && !asset.dataUrl) {
          asset.dataUrl = api.assets.getUrl(id, asset.filename);
          asset.serverFilename = asset.filename;
        }
      }

      // Ensure groups array exists
      if (!project.groups) project.groups = [];

      store.project = project;
      store.selectedObjectIds = [];
      store.selectedClipId = null;
      store.isDirty = false;
      store.error = null;
      store.renderJobId = null;
      store.renderStatus = null;
      store.renderError = null;
      store.renderVideoUrl = null;
      return true;
    } catch (err) {
      store.error = `Load from server failed: ${err.message}`;
      return false;
    } finally {
      store.loading = false;
    }
  },

  /**
   * Fetch list of projects on the server.
   */
  async listServerProjects() {
    try {
      const list = await api.projects.list();
      store.serverProjects = list || [];
      return list;
    } catch (err) {
      store.error = `Could not list projects: ${err.message}`;
      store.serverProjects = [];
      return [];
    }
  },

  /**
   * Delete a project from the server (project + assets + renders).
   */
  async deleteServerProject(id) {
    await api.projects.delete(id);
    store.serverProjects = store.serverProjects.filter(p => p.id !== id);
    if (store.project.id === id) {
      store.project.id = null;
    }
  },

  /**
   * Full server render pipeline:
   *  1. Save project + assets to server
   *  2. Trigger render
   *  3. Start polling for status
   */
  async renderOnServer(quality = 'high') {
    store.showRenderDialog = true;
    store.renderStatus = 'uploading';
    store.renderError = null;
    store.renderVideoUrl = null;
    store.renderLog = '';
    store.renderQuality = quality;

    try {
      // 1. Save to server
      store.renderStatus = 'saving';
      const projectId = await actions.saveToServer();

      // 2. Trigger render
      store.renderStatus = 'queued';
      const result = await api.projects.render(projectId, quality);
      store.renderJobId = result.jobId;

      // 3. Start polling
      actions._startPollRender(result.jobId, projectId);

    } catch (err) {
      store.renderStatus = 'failed';
      store.renderError = err.message;
    }
  },

  /** @private Start polling a render job */
  _startPollRender(jobId, projectId) {
    actions._stopPollRender();

    _pollTimer = setInterval(async () => {
      try {
        const job = await api.jobs.get(jobId);

        if (job.status === 'running') {
          store.renderStatus = 'running';
          if (job.stdout) store.renderLog = job.stdout;
        } else if (job.status === 'completed') {
          store.renderStatus = 'completed';
          store.renderVideoUrl = api.renders.getLatestUrl(projectId);
          store.renderLog = job.stdout || '';
          actions._stopPollRender();
        } else if (job.status === 'failed') {
          store.renderStatus = 'failed';
          store.renderError = job.error || job.stderr || 'Render failed';
          store.renderLog = (job.stdout || '') + '\n' + (job.stderr || '');
          actions._stopPollRender();
        }
      } catch (err) {
        console.warn('[poll] Error:', err);
      }
    }, 2000);
  },

  /** @private Stop polling */
  _stopPollRender() {
    if (_pollTimer) {
      clearInterval(_pollTimer);
      _pollTimer = null;
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // UI helpers
  // ══════════════════════════════════════════════════════════════════════════

  clearError() { store.error = null; },
  setError(msg) {
    store.error = msg;
    setTimeout(() => { if (store.error === msg) store.error = null; }, 4000);
  }
};

export default { store, getters, actions, SHAPE_DEFAULTS, SHAPE_COLORS };
