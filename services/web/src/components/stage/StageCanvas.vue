<template>
  <div
    class="stage-canvas h-full flex flex-col"
    style="min-height: 0;"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <div ref="container" class="flex-1 rounded-xl overflow-hidden relative" style="min-height: 0; background: var(--studio-surface2);">
      <v-stage ref="konvaStage" :config="stageConfig" @mousedown="handleStageMouseDown" @wheel="handleWheel">
        <!-- Background layer -->
        <v-layer>
          <v-rect :config="bgConfig" />
          <!-- Grid lines -->
          <template v-if="gridVisible">
            <v-line v-for="(l, i) in gridLines" :key="'g'+i" :config="l" />
            <v-line :config="centerH" />
            <v-line :config="centerV" />
          </template>
        </v-layer>

        <!-- Objects layer -->
        <v-layer ref="objectsLayer">
          <template v-for="obj in sortedObjects">
            <!-- Rectangle / Square -->
            <v-rect v-if="(obj.type === 'square' || obj.type === 'rectangle') && isVis(obj.id)" :key="obj.id" :config="rectCfg(obj)" @mousedown="onObjDown(obj.id, $event)" @dragend="onDragEnd(obj.id, $event)" @transform="onTransform(obj.id, $event)" @transformend="onTransformEnd(obj.id, $event)" />

            <!-- Circle -->
            <v-circle v-if="obj.type === 'circle' && isVis(obj.id)" :key="obj.id" :config="circleCfg(obj)" @mousedown="onObjDown(obj.id, $event)" @dragend="onDragEnd(obj.id, $event)" @transform="onTransform(obj.id, $event)" @transformend="onTransformEnd(obj.id, $event)" />

            <!-- Ellipse -->
            <v-ellipse v-if="obj.type === 'ellipse' && isVis(obj.id)" :key="obj.id" :config="ellipseCfg(obj)" @mousedown="onObjDown(obj.id, $event)" @dragend="onDragEnd(obj.id, $event)" @transform="onTransform(obj.id, $event)" @transformend="onTransformEnd(obj.id, $event)" />

            <!-- Dot -->
            <v-circle v-if="obj.type === 'dot' && isVis(obj.id)" :key="obj.id" :config="dotCfg(obj)" @mousedown="onObjDown(obj.id, $event)" @dragend="onDragEnd(obj.id, $event)" />

            <!-- Heart -->
            <v-shape v-if="obj.type === 'heart' && isVis(obj.id)" :key="obj.id" :config="heartCfg(obj)" @mousedown="onObjDown(obj.id, $event)" @dragend="onDragEnd(obj.id, $event)" @transform="onTransform(obj.id, $event)" @transformend="onTransformEnd(obj.id, $event)" />

            <!-- Triangle -->
            <v-line v-if="obj.type === 'triangle' && isVis(obj.id)" :key="obj.id" :config="triangleCfg(obj)" @mousedown="onObjDown(obj.id, $event)" @dragend="onDragEnd(obj.id, $event)" @transform="onTransform(obj.id, $event)" @transformend="onTransformEnd(obj.id, $event)" />

            <!-- Star -->
            <v-star v-if="obj.type === 'star' && isVis(obj.id)" :key="obj.id" :config="starCfg(obj)" @mousedown="onObjDown(obj.id, $event)" @dragend="onDragEnd(obj.id, $event)" @transform="onTransform(obj.id, $event)" @transformend="onTransformEnd(obj.id, $event)" />

            <!-- Polygon (hexagon) -->
            <v-regular-polygon v-if="obj.type === 'polygon' && isVis(obj.id)" :key="obj.id" :config="polygonCfg(obj)" @mousedown="onObjDown(obj.id, $event)" @dragend="onDragEnd(obj.id, $event)" @transform="onTransform(obj.id, $event)" @transformend="onTransformEnd(obj.id, $event)" />

            <!-- Line -->
            <v-line v-if="obj.type === 'line' && isVis(obj.id)" :key="obj.id" :config="lineCfg(obj)" @mousedown="onObjDown(obj.id, $event)" @dragend="onDragEnd(obj.id, $event)" />

            <!-- Arrow -->
            <v-arrow v-if="obj.type === 'arrow' && isVis(obj.id)" :key="obj.id" :config="arrowCfg(obj)" @mousedown="onObjDown(obj.id, $event)" @dragend="onDragEnd(obj.id, $event)" @transform="onTransform(obj.id, $event)" @transformend="onTransformEnd(obj.id, $event)" />

            <!-- Dot Grid -->
            <v-group v-if="obj.type === 'dot_grid' && isVis(obj.id)" :key="obj.id" :config="groupCfg(obj)" @mousedown="onObjDown(obj.id, $event)" @dragend="onDragEnd(obj.id, $event)">
              <v-circle v-for="(d, di) in dotGridDots(obj)" :key="di" :config="d" />
            </v-group>

            <!-- Text -->
            <v-text v-if="obj.type === 'text' && isVis(obj.id)" :key="obj.id + '-' + fontLoadKey" :config="textCfg(obj)" @mousedown="onObjDown(obj.id, $event)" @dragend="onDragEnd(obj.id, $event)" @transform="onTransform(obj.id, $event)" @transformend="onTransformEnd(obj.id, $event)" @dblclick="onTextDblClick(obj.id)" />

            <!-- Image / SVG -->
            <v-image v-if="(obj.type === 'image' || obj.type === 'svg_asset') && isVis(obj.id) && imageElements[obj.assetId]" :key="obj.id" :config="imageCfg(obj)" @mousedown="onObjDown(obj.id, $event)" @dragend="onDragEnd(obj.id, $event)" @transform="onTransform(obj.id, $event)" @transformend="onTransformEnd(obj.id, $event)" />

            <!-- LaTeX -->
            <v-group v-if="obj.type === 'latex' && isVis(obj.id)" :key="obj.id" :config="groupCfg(obj)" @mousedown="onObjDown(obj.id, $event)" @dragend="onDragEnd(obj.id, $event)" @transform="onTransform(obj.id, $event)" @transformend="onTransformEnd(obj.id, $event)">
              <v-rect :config="latexBgCfg(obj)" />
              <v-text :config="latexTextCfg(obj)" />
              <v-text :config="latexBadgeCfg(obj)" />
            </v-group>

            <!-- Axes -->
            <v-group v-if="obj.type === 'axes' && isVis(obj.id)" :key="obj.id" :config="groupCfg(obj)" @mousedown="onObjDown(obj.id, $event)" @dragend="onDragEnd(obj.id, $event)" @transform="onTransform(obj.id, $event)" @transformend="onTransformEnd(obj.id, $event)">
              <v-rect :config="axesBgCfg(obj)" />
              <v-line :config="axesXLineCfg(obj)" />
              <v-line :config="axesYLineCfg(obj)" />
              <v-line :config="axesXArrowCfg(obj)" />
              <v-line :config="axesYArrowCfg(obj)" />
              <v-line v-for="(tick, ti) in axesXTicks(obj)" :key="'xt'+ti" :config="tick" />
              <v-line v-for="(tick, ti) in axesYTicks(obj)" :key="'yt'+ti" :config="tick" />
              <v-text :config="axesLabelCfg(obj, 'x')" />
              <v-text :config="axesLabelCfg(obj, 'y')" />
            </v-group>
          </template>
        </v-layer>

        <!-- Morph preview layer -->
        <v-layer>
          <v-line v-for="(m, mi) in morphShapes" :key="'m'+mi" :config="morphCfg(m)" />
        </v-layer>

        <!-- Group bounds layer -->
        <v-layer>
          <v-rect v-for="gb in groupBounds" :key="'gb-'+gb.id" :config="gb" />
        </v-layer>

        <!-- Selection transformer -->
        <v-layer>
          <v-transformer v-if="selectedObjectIds.length > 0" ref="transformer" :config="trConfig" />
        </v-layer>
      </v-stage>

      <!-- Drop zone indicator -->
      <div v-if="isDraggingOver" class="absolute inset-0 pointer-events-none border-2 border-dashed border-studio-accent/50 rounded-xl bg-studio-accent/5 flex items-center justify-center" style="z-index: var(--z-overlay);">
        <span class="text-studio-accent text-sm font-medium opacity-60">Drop to place</span>
      </div>

      <!-- Empty state -->
      <div v-if="objects.length === 0 && !isDraggingOver" class="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div class="text-center max-w-xs px-6">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-studio-accent/10 border border-studio-accent/20 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-studio-accent">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <p class="text-sm font-medium text-studio-text/50 mb-1">Empty canvas</p>
          <p class="text-xs text-studio-text-muted/40 leading-relaxed">Drag a shape from the sidebar, or click to add.</p>
        </div>
      </div>

      <!-- Zoom indicator -->
      <div class="absolute bottom-2 right-2 text-[10px] text-studio-text-muted/40 font-mono pointer-events-none select-none">
        {{ Math.round(zoomLevel * 100) }}%
      </div>
    </div>
  </div>
</template>

<script>
import { store, actions, getters } from '../../store/project.js';
import { generateDotGridPositions } from '../../engine/geometry.js';
import { applyOverrides } from '../../engine/blending.js';
import { loadFont, isFontLoaded } from '../../utils/fontLoader.js';

export default {
  name: 'StageCanvas',

  data() {
    return {
      containerWidth: 800,
      containerHeight: 500,
      panOffset: { x: 0, y: 0 },
      zoomLevel: 1,
      imageElements: {},
      isDraggingOver: false,
      fontLoadKey: 0, // Used to force re-render when fonts load
      shiftKey: false, // When true, transformer keeps aspect ratio
      // Live transform during drag (canvas px) — avoids store updates so resize/rotate stay smooth
      liveTransform: null
    };
  },

  computed: {
    objects() { return store.project.objects; },
    sortedObjects() { return [...this.objects].sort((a, b) => (a.zOrder || 0) - (b.zOrder || 0)); },
    selectedObjectIds() { return store.selectedObjectIds; },
    gridVisible() { return store.project.stage.gridVisible; },
    stg() { return store.project.stage; },
    frameState() { return store.frameState; },
    morphShapes() { return this.frameState.morphShapes || []; },

    vs() {
      const sx = this.containerWidth / this.stg.width;
      const sy = this.containerHeight / this.stg.height;
      return Math.min(sx, sy, 1) * 0.92 * this.zoomLevel;
    },
    ox() { return (this.containerWidth - this.stg.width * this.vs) / 2 + this.panOffset.x; },
    oy() { return (this.containerHeight - this.stg.height * this.vs) / 2 + this.panOffset.y; },

    stageConfig() { return { width: this.containerWidth, height: this.containerHeight }; },
    bgConfig() {
      return {
        x: this.ox, y: this.oy,
        width: this.stg.width * this.vs, height: this.stg.height * this.vs,
        fill: this.stg.backgroundColor || '#000000',
        opacity: this.stg.backgroundOpacity ?? 1,
        cornerRadius: 4,
        shadowColor: '#000', shadowBlur: 40, shadowOpacity: 0.6
      };
    },

    themeAccent() { return this.getCssVar('--studio-accent') || '#4CEEF9'; },
    themeSurface() { return this.getCssVar('--studio-text') || '#E6EDF3'; },

    gridLines() {
      const lines = [];
      const x0 = this.ox, y0 = this.oy, w = this.stg.width * this.vs, h = this.stg.height * this.vs;
      const gs = this.stg.gridSize || 8;
      const gridColor = this.stg.gridColor || '#ffffff';
      const gridOpacity = this.stg.gridOpacity ?? 0.12;
      for (let i = 1; i < gs; i++) {
        lines.push({ points: [x0 + w / gs * i, y0, x0 + w / gs * i, y0 + h], stroke: gridColor, strokeWidth: 0.5, opacity: gridOpacity, dash: [4, 8], listening: false });
        lines.push({ points: [x0, y0 + h / gs * i, x0 + w, y0 + h / gs * i], stroke: gridColor, strokeWidth: 0.5, opacity: gridOpacity, dash: [4, 8], listening: false });
      }
      return lines;
    },

    centerH() {
      const gridOpacity = this.stg.gridOpacity ?? 0.12;
      return { points: [this.ox, this.oy + this.stg.height * this.vs / 2, this.ox + this.stg.width * this.vs, this.oy + this.stg.height * this.vs / 2], stroke: this.themeAccent, strokeWidth: 0.5, opacity: gridOpacity + 0.06, dash: [8, 4], listening: false };
    },
    centerV() {
      const gridOpacity = this.stg.gridOpacity ?? 0.12;
      return { points: [this.ox + this.stg.width * this.vs / 2, this.oy, this.ox + this.stg.width * this.vs / 2, this.oy + this.stg.height * this.vs], stroke: this.themeAccent, strokeWidth: 0.5, opacity: gridOpacity + 0.06, dash: [8, 4], listening: false };
    },

    trConfig() {
      const accent = this.themeAccent;
      return {
        anchorSize: 8, anchorFill: accent, anchorStroke: '#fff', anchorStrokeWidth: 1.5,
        borderStroke: accent, borderStrokeWidth: 1.5, borderDash: [6, 4],
        rotateEnabled: true, keepRatio: this.shiftKey,
        enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        boundBoxFunc: (o, n) => (n.width < 10 || n.height < 10) ? o : n
      };
    },

    // Group bounds visualization
    groupBounds() {
      const groups = store.project.groups || [];
      const bounds = [];
      for (const group of groups) {
        if (!group.childIds || group.childIds.length === 0) continue;
        // Check if any child is selected
        const anySelected = group.childIds.some(cid => store.selectedObjectIds.includes(cid));
        if (!anySelected) continue;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const cid of group.childIds) {
          const obj = store.project.objects.find(o => o.id === cid);
          if (!obj) continue;
          minX = Math.min(minX, obj.x - obj.width / 2);
          minY = Math.min(minY, obj.y - obj.height / 2);
          maxX = Math.max(maxX, obj.x + obj.width / 2);
          maxY = Math.max(maxY, obj.y + obj.height / 2);
        }
        if (minX === Infinity) continue;

        const margin = group.margin || 10;
        const p1 = this.s2c(minX - margin, minY - margin);
        const w = (maxX - minX + margin * 2) * this.vs;
        const h = (maxY - minY + margin * 2) * this.vs;

        bounds.push({
          id: group.id,
          x: p1.x, y: p1.y, width: w, height: h,
          fill: 'transparent',
          stroke: this.themeAccent, strokeWidth: 1.5, dash: [6, 4],
          opacity: 0.5, cornerRadius: 6, listening: false
        });
      }
      return bounds;
    }
  },

  watch: {
    selectedObjectIds: { handler() { this.$nextTick(() => this.updateTransformer()); }, deep: true },
    objects: { handler() { this.$nextTick(() => this.updateTransformer()); this.loadNewImages(); this.loadNewFonts(); }, deep: true }
  },

  mounted() {
    this.updateSize();
    this._ro = new ResizeObserver(() => this.updateSize());
    this._ro.observe(this.$refs.container);
    this.loadNewImages();
    this.loadNewFonts();
    this._onKeyDown = (e) => { if (e.key === 'Shift') this.shiftKey = true; };
    this._onKeyUp = (e) => { if (e.key === 'Shift') this.shiftKey = false; };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  },
  beforeDestroy() {
    if (this._ro) this._ro.disconnect();
    if (this._onKeyDown) window.removeEventListener('keydown', this._onKeyDown);
    if (this._onKeyUp) window.removeEventListener('keyup', this._onKeyUp);
  },

  methods: {
    getCssVar(name) {
      try { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); } catch { return ''; }
    },
    updateSize() {
      if (this.$refs.container) {
        this.containerWidth = this.$refs.container.clientWidth;
        this.containerHeight = this.$refs.container.clientHeight;
      }
    },
    s2c(sx, sy) { return { x: this.ox + sx * this.vs, y: this.oy + sy * this.vs }; },
    c2s(cx, cy) { return { x: (cx - this.ox) / this.vs, y: (cy - this.oy) / this.vs }; },

    eff(obj) {
      const ov = this.frameState.objectOverrides[obj.id];
      return ov ? applyOverrides(obj, ov) : obj;
    },
    isVis(id) {
      const h = this.frameState.hiddenIds;
      if (h instanceof Set) return !h.has(id);
      return true;
    },

    loadNewImages() {
      for (const obj of this.objects) {
        if ((obj.type === 'image' || obj.type === 'svg_asset') && obj.assetId && !this.imageElements[obj.assetId]) {
          const asset = getters.assetById(obj.assetId);
          if (asset && asset.dataUrl) {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.src = asset.dataUrl;
            img.onload = () => { this.$set(this.imageElements, obj.assetId, img); };
          }
        }
      }
    },

    async loadNewFonts() {
      // Load fonts for all text objects
      for (const obj of this.objects) {
        if (obj.type === 'text' && obj.fontFamily && !isFontLoaded(obj.fontFamily)) {
          try {
            await loadFont(obj.fontFamily);
            // Force canvas to redraw after font loads
            this.fontLoadKey++;
            this.$nextTick(() => {
              // Trigger a redraw of the Konva layer
              const layer = this.$refs.objectsLayer?.getNode();
              if (layer) {
                layer.batchDraw();
              }
            });
          } catch (e) {
            console.warn('Failed to load font:', obj.fontFamily, e);
          }
        }
      }
    },

    // ── Drag and Drop from sidebar ──
    onDragOver(e) {
      this.isDraggingOver = true;
      e.dataTransfer.dropEffect = 'copy';
    },
    onDragLeave() {
      this.isDraggingOver = false;
    },
    onDrop(e) {
      this.isDraggingOver = false;
      const containerRect = this.$refs.container.getBoundingClientRect();
      const dropX = e.clientX - containerRect.left;
      const dropY = e.clientY - containerRect.top;

      // Convert screen coordinates to stage coordinates
      const stagePos = this.c2s(dropX, dropY);

      // Snap if enabled
      let sx = stagePos.x, sy = stagePos.y;
      if (store.project.stage.snapEnabled && store.project.stage.snapToGrid) {
        const gsX = store.project.stage.width / store.project.stage.gridSize;
        const gsY = store.project.stage.height / store.project.stage.gridSize;
        sx = Math.round(sx / gsX) * gsX;
        sy = Math.round(sy / gsY) * gsY;
      }
      if (store.project.stage.snapEnabled && store.project.stage.snapToCenter) {
        const cx = store.project.stage.width / 2, cy = store.project.stage.height / 2;
        if (Math.abs(sx - cx) < 30) sx = cx;
        if (Math.abs(sy - cy) < 30) sy = cy;
      }

      // Check what was dropped
      const shapeType = e.dataTransfer.getData('application/x-shape-type');
      const assetId = e.dataTransfer.getData('application/x-asset-id');

      if (shapeType) {
        const obj = actions.addObject(shapeType, Math.round(sx), Math.round(sy));
        actions.selectObject(obj.id);
      } else if (assetId) {
        const obj = actions.addImageObject(assetId, Math.round(sx), Math.round(sy));
        if (obj) actions.selectObject(obj.id);
      }
    },

    // ── Shape configs ──
    live(obj) {
      return this.liveTransform && this.liveTransform.id === obj.id ? this.liveTransform : null;
    },
    rectCfg(obj) {
      const L = this.live(obj);
      const e = this.eff(obj); const p = L ? { x: L.x, y: L.y } : this.s2c(e.x - e.width / 2, e.y - e.height / 2);
      const w = L ? L.w : e.width * this.vs, h = L ? L.h : e.height * this.vs, rot = L ? L.rotation : (e.rotation || 0);
      return { x: p.x, y: p.y, width: w, height: h, fill: e.fill, stroke: e.stroke, strokeWidth: (e.strokeWidth || 2) * this.vs / 2, opacity: e.opacity ?? 1, rotation: rot, scaleX: 1, scaleY: 1, cornerRadius: (obj.type === 'square' ? 4 : 2) * this.vs, draggable: store.activeTool === 'select', id: obj.id, name: 'stageObject', hitStrokeWidth: 10 };
    },
    circleCfg(obj) {
      const L = this.live(obj);
      const e = this.eff(obj); const p = L ? { x: L.x, y: L.y } : this.s2c(e.x, e.y); const r = L ? Math.min(L.w, L.h) / 2 : Math.min(e.width, e.height) / 2 * this.vs;
      const rot = L ? L.rotation : (e.rotation || 0);
      return { x: p.x, y: p.y, radius: r, fill: e.fill, stroke: e.stroke, strokeWidth: (e.strokeWidth || 2) * this.vs / 2, opacity: e.opacity ?? 1, rotation: rot, scaleX: 1, scaleY: 1, draggable: store.activeTool === 'select', id: obj.id, name: 'stageObject', hitStrokeWidth: 10 };
    },
    ellipseCfg(obj) {
      const L = this.live(obj);
      const e = this.eff(obj); const p = L ? { x: L.x, y: L.y } : this.s2c(e.x, e.y);
      const rx = L ? L.w / 2 : (e.width / 2) * this.vs, ry = L ? L.h / 2 : (e.height / 2) * this.vs, rot = L ? L.rotation : (e.rotation || 0);
      return { x: p.x, y: p.y, radiusX: rx, radiusY: ry, fill: e.fill, stroke: e.stroke, strokeWidth: (e.strokeWidth || 2) * this.vs / 2, opacity: e.opacity ?? 1, rotation: rot, scaleX: 1, scaleY: 1, draggable: store.activeTool === 'select', id: obj.id, name: 'stageObject', hitStrokeWidth: 10 };
    },
    dotCfg(obj) {
      const e = this.eff(obj); const p = this.s2c(e.x, e.y);
      return { x: p.x, y: p.y, radius: Math.max(4, e.width / 2 * this.vs), fill: e.fill || '#fff', opacity: e.opacity ?? 1, draggable: store.activeTool === 'select', id: obj.id, name: 'stageObject', hitStrokeWidth: 12 };
    },
    heartCfg(obj) {
      const L = this.live(obj);
      const e = this.eff(obj); const p = L ? { x: L.x, y: L.y } : this.s2c(e.x, e.y); const w = L ? L.w : e.width * this.vs; const h = L ? L.h : e.height * this.vs; const rot = L ? L.rotation : (e.rotation || 0);
      return {
        x: p.x, y: p.y, fill: e.fill, stroke: e.stroke, strokeWidth: (e.strokeWidth || 2) * this.vs / 2,
        opacity: e.opacity ?? 1, rotation: rot, scaleX: 1, scaleY: 1,
        draggable: store.activeTool === 'select', id: obj.id, name: 'stageObject', hitStrokeWidth: 10,
        sceneFunc: (ctx, shape) => {
          const hw = w / 2, hh = h / 2;
          ctx.beginPath();
          for (let i = 0; i <= 60; i++) {
            const t = (i / 60) * 2 * Math.PI;
            const px = (16 * Math.pow(Math.sin(t), 3) / 16) * hw;
            const py = -(((13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) / 15)) * hh;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath(); ctx.fillStrokeShape(shape);
        }
      };
    },
    triangleCfg(obj) {
      const L = this.live(obj);
      const e = this.eff(obj); const p = L ? { x: L.x, y: L.y } : this.s2c(e.x, e.y);
      const hw = L ? L.w / 2 : e.width / 2 * this.vs, hh = L ? L.h / 2 : e.height / 2 * this.vs, rot = L ? L.rotation : (e.rotation || 0);
      return { x: p.x, y: p.y, points: [0, -hh, hw, hh, -hw, hh], closed: true, fill: e.fill, stroke: e.stroke, strokeWidth: (e.strokeWidth || 2) * this.vs / 2, opacity: e.opacity ?? 1, rotation: rot, scaleX: 1, scaleY: 1, draggable: store.activeTool === 'select', id: obj.id, name: 'stageObject', hitStrokeWidth: 10 };
    },
    starCfg(obj) {
      const L = this.live(obj);
      const e = this.eff(obj); const p = L ? { x: L.x, y: L.y } : this.s2c(e.x, e.y);
      const outerRadius = L ? Math.min(L.w, L.h) / 2 : Math.min(e.width, e.height) / 2 * this.vs;
      const inner = (obj.innerRatio || 0.4) * outerRadius; const rot = L ? L.rotation : (e.rotation || 0);
      return { x: p.x, y: p.y, numPoints: obj.starArms || 5, innerRadius: inner, outerRadius: outerRadius, fill: e.fill, stroke: e.stroke, strokeWidth: (e.strokeWidth || 2) * this.vs / 2, opacity: e.opacity ?? 1, rotation: rot, scaleX: 1, scaleY: 1, draggable: store.activeTool === 'select', id: obj.id, name: 'stageObject', hitStrokeWidth: 10 };
    },
    polygonCfg(obj) {
      const L = this.live(obj);
      const e = this.eff(obj); const p = L ? { x: L.x, y: L.y } : this.s2c(e.x, e.y);
      const r = L ? Math.min(L.w, L.h) / 2 : Math.min(e.width, e.height) / 2 * this.vs; const rot = L ? L.rotation : (e.rotation || 0);
      return { x: p.x, y: p.y, sides: obj.sides || 6, radius: r, fill: e.fill, stroke: e.stroke, strokeWidth: (e.strokeWidth || 2) * this.vs / 2, opacity: e.opacity ?? 1, rotation: rot, scaleX: 1, scaleY: 1, draggable: store.activeTool === 'select', id: obj.id, name: 'stageObject', hitStrokeWidth: 10 };
    },
    lineCfg(obj) {
      const e = this.eff(obj); const p = this.s2c(e.x, e.y);
      const hw = e.width / 2 * this.vs;
      return { x: p.x, y: p.y, points: [-hw, 0, hw, 0], stroke: e.stroke || e.fill || '#94a3b8', strokeWidth: Math.max(2, (e.strokeWidth || 3) * this.vs / 2), opacity: e.opacity ?? 1, rotation: e.rotation || 0, draggable: store.activeTool === 'select', id: obj.id, name: 'stageObject', hitStrokeWidth: 16, lineCap: 'round' };
    },
    arrowCfg(obj) {
      const L = this.live(obj);
      const e = this.eff(obj); const p = L ? { x: L.x, y: L.y } : this.s2c(e.x, e.y);
      const hw = L ? L.w / 2 : e.width / 2 * this.vs; const rot = L ? L.rotation : (e.rotation || 0);
      return { x: p.x, y: p.y, points: [-hw, 0, hw, 0], fill: e.fill, stroke: e.stroke || e.fill || '#ef4444', strokeWidth: Math.max(2, (e.strokeWidth || 2) * this.vs / 2), opacity: e.opacity ?? 1, rotation: rot, pointerLength: 14 * this.vs / 2, pointerWidth: 12 * this.vs / 2, draggable: store.activeTool === 'select', id: obj.id, name: 'stageObject', hitStrokeWidth: 16, scaleX: 1, scaleY: 1 };
    },
    textCfg(obj) {
      const L = this.live(obj);
      const e = this.eff(obj); const p = L ? { x: L.x, y: L.y } : this.s2c(e.x, e.y);
      // Match Manim Text font_size: at 1080p, font_size N ≈ N px; scale by vs for stage→canvas
      const manimFontScale = (e.fontSize || 48) * this.vs;
      const fontFamily = e.fontFamily || 'Arial';
      const fontStyle = (e.fontWeight === 'bold' ? 'bold ' : '') + (e.fontStyle === 'italic' ? 'italic ' : '');
      const text = e.content || 'Text';
      const align = e.textAlign || 'center';
      const textWidth = this.measureTextWidth(text, manimFontScale, fontFamily, fontStyle);
      let offsetX = 0;
      if (align === 'center') offsetX = textWidth / 2;
      else if (align === 'right') offsetX = textWidth;
      const rot = L ? L.rotation : (e.rotation || 0);
      return { 
        x: p.x, y: p.y, text, fontSize: manimFontScale, fontFamily, 
        fontStyle: fontStyle.trim(), fill: e.fill || '#ffffff', opacity: e.opacity ?? 1, 
        rotation: rot, offsetX, offsetY: manimFontScale / 2, 
        draggable: store.activeTool === 'select', id: obj.id, name: 'stageObject', hitStrokeWidth: 10 
      };
    },
    measureTextWidth(text, fontSize, fontFamily, fontStyle) {
      // Use canvas context to measure text width
      if (!this._measureCanvas) {
        this._measureCanvas = document.createElement('canvas');
        this._measureCtx = this._measureCanvas.getContext('2d');
      }
      this._measureCtx.font = `${fontStyle}${fontSize}px ${fontFamily}`;
      return this._measureCtx.measureText(text).width;
    },
    groupCfg(obj) {
      const L = this.live(obj);
      const e = this.eff(obj); const p = L ? { x: L.x, y: L.y } : this.s2c(e.x, e.y);
      const rot = L ? L.rotation : (e.rotation || 0);
      return { x: p.x, y: p.y, rotation: rot, opacity: e.opacity ?? 1, scaleX: 1, scaleY: 1, draggable: store.activeTool === 'select', id: obj.id, name: 'stageObject' };
    },
    dotGridDots(obj) {
      const sp = (obj.dotSpacing || 40) * this.vs, r = Math.max(2, (obj.dotRadius || 5) * this.vs);
      return generateDotGridPositions(obj.gridCols || 5, obj.gridRows || 5, sp).map(p => ({ x: p.x, y: p.y, radius: r, fill: obj.fill || '#fff', listening: false }));
    },
    imageCfg(obj) {
      const L = this.live(obj);
      const e = this.eff(obj); const p = L ? { x: L.x, y: L.y } : this.s2c(e.x - e.width / 2, e.y - e.height / 2);
      const w = L ? L.w : e.width * this.vs, h = L ? L.h : e.height * this.vs, rot = L ? L.rotation : (e.rotation || 0);
      return {
        x: p.x, y: p.y, width: w, height: h,
        image: this.imageElements[obj.assetId], opacity: e.opacity ?? 1,
        rotation: rot, scaleX: 1, scaleY: 1,
        draggable: store.activeTool === 'select', id: obj.id, name: 'stageObject'
      };
    },
    // ── LaTeX config ──
    latexBgCfg(obj) {
      const L = this.live(obj); const w = L ? L.w : obj.width * this.vs, h = L ? L.h : obj.height * this.vs;
      return { x: -w / 2, y: -h / 2, width: w, height: h, fill: 'rgba(76,238,249,0.06)', stroke: this.themeAccent, strokeWidth: 1.5, dash: [6, 4], cornerRadius: 6, listening: false };
    },
    latexTextCfg(obj) {
      const L = this.live(obj); const w = L ? L.w : obj.width * this.vs, h = L ? L.h : obj.height * this.vs;
      return { x: -w / 2, y: -h / 2, width: w, height: h, text: obj.latex || 'E = mc^2', fontSize: Math.max(12, 18 * this.vs), fontFamily: 'serif', fontStyle: 'italic', fill: obj.fill || '#ffffff', align: 'center', verticalAlign: 'middle', padding: 8, listening: false };
    },
    latexBadgeCfg(obj) {
      const L = this.live(obj); const w = L ? L.w : obj.width * this.vs, h = L ? L.h : obj.height * this.vs;
      return { x: -w / 2 + 4, y: -h / 2 + 4, text: 'TEX', fontSize: 9, fill: this.themeAccent, fontFamily: 'monospace', fontStyle: 'bold', listening: false };
    },

    // ── Axes config ──
    axesBgCfg(obj) {
      const L = this.live(obj); const w = L ? L.w : obj.width * this.vs, h = L ? L.h : obj.height * this.vs;
      return { x: -w / 2, y: -h / 2, width: w, height: h, fill: 'rgba(16,185,129,0.04)', stroke: 'rgba(16,185,129,0.15)', strokeWidth: 1, cornerRadius: 4, listening: false };
    },
    axesXLineCfg(obj) {
      const L = this.live(obj); const w = L ? L.w : obj.width * this.vs, h = L ? L.h : obj.height * this.vs;
      return { points: [-w / 2 + 10, 0, w / 2 - 10, 0], stroke: obj.stroke || '#ffffff', strokeWidth: 1.5, listening: false };
    },
    axesYLineCfg(obj) {
      const L = this.live(obj); const h = L ? L.h : obj.height * this.vs;
      return { points: [0, h / 2 - 10, 0, -h / 2 + 10], stroke: obj.stroke || '#ffffff', strokeWidth: 1.5, listening: false };
    },
    axesXArrowCfg(obj) {
      const L = this.live(obj); const w = L ? L.w : obj.width * this.vs;
      const tip = w / 2 - 10;
      return { points: [tip - 8, -5, tip, 0, tip - 8, 5], stroke: obj.stroke || '#ffffff', strokeWidth: 1.5, listening: false };
    },
    axesYArrowCfg(obj) {
      const L = this.live(obj); const h = L ? L.h : obj.height * this.vs;
      const tip = -h / 2 + 10;
      return { points: [-5, tip + 8, 0, tip, 5, tip + 8], stroke: obj.stroke || '#ffffff', strokeWidth: 1.5, listening: false };
    },
    axesXTicks(obj) {
      const L = this.live(obj); const w = L ? L.w : obj.width * this.vs;
      const xr = obj.xRange || [-5, 5, 1];
      const ticks = [];
      const range = xr[1] - xr[0];
      const step = xr[2] || 1;
      for (let v = xr[0]; v <= xr[1]; v += step) {
        if (Math.abs(v) < 0.001) continue;
        const px = ((v - xr[0]) / range - 0.5) * (w - 20);
        ticks.push({ points: [px, -4, px, 4], stroke: obj.stroke || '#ffffff', strokeWidth: 1, listening: false });
      }
      return ticks;
    },
    axesYTicks(obj) {
      const L = this.live(obj); const h = L ? L.h : obj.height * this.vs;
      const yr = obj.yRange || [-3, 3, 1];
      const ticks = [];
      const range = yr[1] - yr[0];
      const step = yr[2] || 1;
      for (let v = yr[0]; v <= yr[1]; v += step) {
        if (Math.abs(v) < 0.001) continue;
        const py = -((v - yr[0]) / range - 0.5) * (h - 20);
        ticks.push({ points: [-4, py, 4, py], stroke: obj.stroke || '#ffffff', strokeWidth: 1, listening: false });
      }
      return ticks;
    },
    axesLabelCfg(obj, axis) {
      const L = this.live(obj); const w = L ? L.w : obj.width * this.vs, h = L ? L.h : obj.height * this.vs;
      if (axis === 'x') {
        return { x: w / 2 - 20, y: 6, text: 'x', fontSize: 12, fill: obj.stroke || '#ffffff', fontFamily: 'serif', fontStyle: 'italic', listening: false };
      }
      return { x: 6, y: -h / 2 + 12, text: 'y', fontSize: 12, fill: obj.stroke || '#ffffff', fontFamily: 'serif', fontStyle: 'italic', listening: false };
    },

    morphCfg(m) {
      if (!m || !m.flatPoints || m.flatPoints.length < 4) return { points: [], closed: true };
      const p = this.s2c(m.x, m.y);
      const sp = [];
      for (let i = 0; i < m.flatPoints.length; i += 2) { sp.push(m.flatPoints[i] * this.vs); sp.push(m.flatPoints[i + 1] * this.vs); }
      return { x: p.x, y: p.y, points: sp, closed: true, fill: m.fill || '#fff', stroke: m.stroke || '#fff', strokeWidth: (m.strokeWidth || 2) * this.vs / 2, opacity: m.opacity ?? 1, listening: false };
    },

    // ── Events ──
    handleStageMouseDown(e) {
      const t = e.target; const s = this.$refs.konvaStage?.getNode();
      if (!s) return;
      const ev = e.evt;
      const addToSel = ev && (ev.shiftKey || ev.ctrlKey || ev.metaKey);
      // Click on transformer (resize/rotate handles or border) — handle shift-click to add object underneath
      let node = t;
      while (node) {
        if (node.className === 'Transformer') {
          if (addToSel) {
            const layer = this.$refs.objectsLayer?.getNode?.();
            const pos = s.getPointerPosition?.();
            if (layer && pos) {
              const hit = layer.getIntersection?.(pos);
              if (hit && hit.name?.() === 'stageObject' && hit.id?.()) {
                actions.selectObject(hit.id(), true);
                this.$nextTick(() => this.$nextTick(() => this.updateTransformer()));
              }
            }
          }
          return;
        }
        node = node.getParent ? node.getParent() : null;
      }
      if (t === s || t.name() !== 'stageObject') {
        if (store.activeTool === 'hand') this.startPan(e);
        else actions.deselectAll();
      }
    },
    onObjDown(id, e) {
      e.cancelBubble = true;
      const ev = e.evt;
      actions.selectObject(id, ev && (ev.shiftKey || ev.ctrlKey || ev.metaKey));
      this.$nextTick(() => this.$nextTick(() => this.updateTransformer()));
    },
    onDragEnd(id, e) {
      const node = e.target; const obj = store.project.objects.find(o => o.id === id); if (!obj) return;
      let newX, newY;
      // Types that use top-left positioning (text now uses center with offsetX/offsetY)
      const tlTypes = ['square', 'rectangle', 'image', 'svg_asset'];
      if (tlTypes.includes(obj.type)) {
        const sp = this.c2s(node.x(), node.y());
        newX = sp.x + obj.width / 2; newY = sp.y + obj.height / 2;
      } else {
        const sp = this.c2s(node.x(), node.y());
        newX = sp.x; newY = sp.y;
      }
      if (store.project.stage.snapEnabled) {
        const gs = store.project.stage.width / store.project.stage.gridSize;
        const gs2 = store.project.stage.height / store.project.stage.gridSize;
        if (store.project.stage.snapToGrid) { newX = Math.round(newX / gs) * gs; newY = Math.round(newY / gs2) * gs2; }
        if (store.project.stage.snapToCenter) {
          const cx = store.project.stage.width / 2, cy = store.project.stage.height / 2;
          if (Math.abs(newX - cx) < 30) newX = cx;
          if (Math.abs(newY - cy) < 30) newY = cy;
        }
      }
      actions.updateObject(id, { x: Math.round(newX), y: Math.round(newY) });
    },
    onTransform(id, e) {
      const node = e.target;
      const obj = store.project.objects.find(o => o.id === id);
      if (!obj) return;
      const sx = node.scaleX ? node.scaleX() : 1;
      const sy = node.scaleY ? node.scaleY() : 1;
      let w, h;
      if (obj.type === 'circle') {
        const r = (node.radius ? node.radius() : 10) * sx;
        w = h = Math.max(10, r * 2);
      } else if (obj.type === 'ellipse') {
        w = Math.max(10, (node.radiusX ? node.radiusX() : 20) * 2 * sx);
        h = Math.max(10, (node.radiusY ? node.radiusY() : 20) * 2 * sy);
      } else if (this._isGroupType(obj.type)) {
        w = Math.max(20, (obj.width || 200) * this.vs * sx);
        h = Math.max(20, (obj.height || 200) * this.vs * sy);
      } else {
        w = Math.max(10, Math.abs((node.width ? node.width() : 1) * sx));
        h = Math.max(10, Math.abs((node.height ? node.height() : 1) * sy));
      }
      const rotation = node.rotation ? node.rotation() : 0;
      this.liveTransform = { id, type: obj.type, x: node.x(), y: node.y(), w, h, rotation };
    },
    onTransformEnd(id, e) {
      const node = e.target;
      const obj = store.project.objects.find(o => o.id === id);
      if (!obj) return;

      const sx = node.scaleX ? node.scaleX() : 1;
      const sy = node.scaleY ? node.scaleY() : 1;
      const tlTypes = ['square', 'rectangle', 'image', 'svg_asset'];
      let cw, ch, cx, cy;

      if (obj.type === 'circle') {
        const r = node.radius ? node.radius() : (node.width ? node.width() / 2 : 20);
        cw = r * 2;
        ch = r * 2;
        cx = node.x();
        cy = node.y();
      } else if (obj.type === 'ellipse') {
        cw = node.radiusX ? node.radiusX() * 2 : (node.width ? node.width() : 40);
        ch = node.radiusY ? node.radiusY() * 2 : (node.height ? node.height() : 40);
        cx = node.x();
        cy = node.y();
      } else if (this._isGroupType(obj.type)) {
        cw = (obj.width || 200) * this.vs * sx;
        ch = (obj.height || 200) * this.vs * sy;
        cx = node.x();
        cy = node.y();
      } else {
        cw = Math.max(10, Math.abs((node.width ? node.width() : 1) * sx));
        ch = Math.max(10, Math.abs((node.height ? node.height() : 1) * sy));
        if (tlTypes.includes(obj.type)) {
          cx = node.x() + cw / 2;
          cy = node.y() + ch / 2;
        } else {
          cx = node.x();
          cy = node.y();
        }
      }

      const stagePos = this.c2s(cx, cy);
      const newX = Math.round(stagePos.x);
      const newY = Math.round(stagePos.y);
      const newW = Math.max(20, Math.round(cw / this.vs));
      const newH = Math.max(20, Math.round(ch / this.vs));
      let rotation = node.rotation ? node.rotation() : 0;
      if (this.shiftKey) rotation = Math.round(rotation / 45) * 45;
      else rotation = Math.round(rotation * 10) / 10;

      node.scaleX(1);
      node.scaleY(1);

      actions.updateObject(id, { x: newX, y: newY, width: newW, height: newH, rotation });
      this.liveTransform = null;
    },
    _isGroupType(type) {
      return type === 'axes' || type === 'latex' || type === 'dot_grid';
    },
    onTextDblClick(id) {
      // Could implement inline editing; for now, focus the properties panel
    },
    updateTransformer() {
      const tr = this.$refs.transformer; const ol = this.$refs.objectsLayer; const ks = this.$refs.konvaStage;
      if (!tr || !ks) return;
      const t = tr.getNode(); const stage = ks.getNode(); if (!t || !stage) return;
      const layer = ol && ol.getNode ? ol.getNode() : null;
      const findNode = (id) => (layer ? layer.findOne('#' + id) : null) || stage.findOne('#' + id);
      const nodes = store.selectedObjectIds.map(findNode).filter(Boolean);
      t.nodes(nodes);
      t.getLayer().batchDraw();
    },
    startPan(e) {
      const start = { x: e.evt.clientX - this.panOffset.x, y: e.evt.clientY - this.panOffset.y };
      const onM = (ev) => { this.panOffset = { x: ev.clientX - start.x, y: ev.clientY - start.y }; };
      const onU = () => { document.removeEventListener('mousemove', onM); document.removeEventListener('mouseup', onU); };
      document.addEventListener('mousemove', onM); document.addEventListener('mouseup', onU);
    },
    handleWheel(e) {
      e.evt.preventDefault();
      const factor = e.evt.deltaY > 0 ? 0.93 : 1.07;
      this.zoomLevel = Math.max(0.15, Math.min(5, this.zoomLevel * factor));
    }
  }
};
</script>
