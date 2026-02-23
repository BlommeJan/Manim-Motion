<template>
  <aside class="w-72 bg-studio-surface border-l border-studio-border flex flex-col flex-shrink-0 overflow-y-auto">
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- Object Properties -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <template v-if="obj">
      <div class="panel-header flex items-center justify-between">
        Properties
        <span class="px-1.5 py-0.5 text-[9px] rounded-md font-bold uppercase" :class="typeBadge">{{ typeLabel }}</span>
      </div>

      <!-- Name -->
      <Section label="Name">
        <input class="input input-sm" :value="obj.name" @change="u('name', $event.target.value)" />
      </Section>

      <!-- Position & Size -->
      <Section label="Position & Size">
        <div class="grid grid-cols-2 gap-1.5">
          <Num label="X" :value="obj.x" @input="u('x', $event)" />
          <Num label="Y" :value="obj.y" @input="u('y', $event)" />
          <Num label="Width" :value="obj.width" :min="1" @input="u('width', $event)" />
          <Num label="Height" :value="obj.height" :min="1" @input="u('height', $event)" />
        </div>
      </Section>

      <!-- 3x3 Alignment Grid -->
      <Section label="Align to Canvas">
        <div class="anchor-grid">
          <div v-for="(row, ri) in anchorGrid" :key="ri" class="flex gap-1">
            <button
              v-for="anchor in row"
              :key="anchor"
              class="anchor-btn"
              :title="anchor.replace('_', ' ')"
              @click="align(anchor)"
            >{{ anchorLabels[anchor] }}</button>
          </div>
        </div>
      </Section>

      <!-- Rotation -->
      <Section label="Rotation">
        <div class="flex items-center gap-2">
          <input class="input input-sm flex-1" type="number" :value="obj.rotation || 0" @change="u('rotation', Number($event.target.value))" />
          <span class="text-[10px] text-studio-text-muted">deg</span>
        </div>
      </Section>

      <!-- Colors -->
      <Section v-if="obj.type !== 'text'" label="Colors">
        <div class="space-y-1.5">
          <ColorRow label="Fill" :value="obj.fill" @input="u('fill', $event)" />
          <ColorRow label="Stroke" :value="obj.stroke" @input="u('stroke', $event)" />
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-studio-text-muted w-12">Stroke W</span>
            <input class="input input-sm w-16" type="number" min="0" step="0.5" :value="obj.strokeWidth" @change="u('strokeWidth', Number($event.target.value))" />
          </div>
        </div>
      </Section>

      <!-- Text Properties -->
      <template v-if="obj.type === 'text'">
        <Section label="Text Content">
          <textarea class="input input-sm resize-none" rows="3" :value="obj.content || ''" @input="u('content', $event.target.value)" placeholder="Enter text..."></textarea>
        </Section>
        <Section label="Text Style">
          <div class="space-y-1.5">
            <ColorRow label="Color" :value="obj.fill" @input="u('fill', $event)" />
            <div class="grid grid-cols-2 gap-1.5">
              <Num label="Font Size" :value="obj.fontSize || 48" :min="8" :max="200" @input="u('fontSize', $event)" />
              <div>
                <span class="text-[9px] text-studio-text-muted/50">Align</span>
                <div class="flex gap-0.5 mt-0.5">
                  <button 
                    class="align-btn" 
                    :class="{ active: (obj.textAlign || 'center') === 'left' }"
                    @click="u('textAlign', 'left')"
                    title="Align Left"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>
                    </svg>
                  </button>
                  <button 
                    class="align-btn" 
                    :class="{ active: (obj.textAlign || 'center') === 'center' }"
                    @click="u('textAlign', 'center')"
                    title="Align Center"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
                    </svg>
                  </button>
                  <button 
                    class="align-btn" 
                    :class="{ active: (obj.textAlign || 'center') === 'right' }"
                    @click="u('textAlign', 'right')"
                    title="Align Right"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-1.5">
              <FontSelector :value="obj.fontFamily || 'Roboto'" @input="u('fontFamily', $event)" />
              <div>
                <span class="text-[9px] text-studio-text-muted/50">Weight</span>
                <select class="select text-xs" :value="obj.fontWeight || 'normal'" @change="u('fontWeight', $event.target.value)">
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
            </div>
          </div>
        </Section>
      </template>

      <!-- Opacity -->
      <Section label="Opacity">
        <div class="flex items-center gap-2">
          <input type="range" min="0" max="1" step="0.01" class="flex-1 accent-studio-accent" :value="obj.opacity" @input="u('opacity', Number($event.target.value))" />
          <span class="text-[10px] text-studio-text-muted w-8 text-right tabular-nums">{{ Math.round((obj.opacity ?? 1) * 100) }}%</span>
        </div>
      </Section>

      <!-- Timeline presence -->
      <Section label="Timeline">
        <div class="grid grid-cols-2 gap-1.5">
          <Num label="Enter (s)" :value="obj.enterTime || 0" :min="0" :step="0.1" @input="u('enterTime', $event)" />
          <Num label="Duration (s)" :value="obj.duration || 3" :min="0.1" :step="0.1" @input="u('duration', $event)" />
        </div>
      </Section>

      <!-- Dot Grid -->
      <Section v-if="obj.type === 'dot_grid'" label="Grid Settings">
        <div class="grid grid-cols-2 gap-1.5">
          <Num label="Columns" :value="obj.gridCols || 5" :min="1" :max="20" @input="u('gridCols', $event)" />
          <Num label="Rows" :value="obj.gridRows || 5" :min="1" :max="20" @input="u('gridRows', $event)" />
          <Num label="Spacing" :value="obj.dotSpacing || 40" :min="5" @input="u('dotSpacing', $event)" />
          <Num label="Radius" :value="obj.dotRadius || 5" :min="1" @input="u('dotRadius', $event)" />
        </div>
      </Section>

      <!-- Star settings -->
      <Section v-if="obj.type === 'star'" label="Star Settings">
        <div class="grid grid-cols-2 gap-1.5">
          <Num label="Arms" :value="obj.starArms || 5" :min="3" :max="20" @input="u('starArms', $event)" />
          <Num label="Inner Ratio" :value="(obj.innerRatio || 0.4)" :min="0.1" :max="0.9" :step="0.05" @input="u('innerRatio', $event)" />
        </div>
      </Section>

      <!-- Polygon settings -->
      <Section v-if="obj.type === 'polygon'" label="Polygon Settings">
        <Num label="Sides" :value="obj.sides || 6" :min="3" :max="20" @input="u('sides', $event)" />
      </Section>

      <!-- LaTeX settings -->
      <Section v-if="obj.type === 'latex'" label="LaTeX Expression">
        <textarea class="input input-sm resize-none font-mono" rows="2" :value="obj.latex || ''" @input="u('latex', $event.target.value)" placeholder="E = mc^2"></textarea>
        <p class="text-[8px] text-studio-text-muted/40 mt-1 leading-snug">Raw LaTeX — renders as MathTex in Manim</p>
      </Section>

      <!-- Axes settings -->
      <Section v-if="obj.type === 'axes'" label="Axes Range">
        <div class="space-y-1.5">
          <div class="grid grid-cols-3 gap-1">
            <Num label="X Min" :value="(obj.xRange||[-5,5,1])[0]" :step="1" @input="uRange('xRange', 0, $event)" />
            <Num label="X Max" :value="(obj.xRange||[-5,5,1])[1]" :step="1" @input="uRange('xRange', 1, $event)" />
            <Num label="X Step" :value="(obj.xRange||[-5,5,1])[2]" :min="0.1" :step="0.5" @input="uRange('xRange', 2, $event)" />
          </div>
          <div class="grid grid-cols-3 gap-1">
            <Num label="Y Min" :value="(obj.yRange||[-3,3,1])[0]" :step="1" @input="uRange('yRange', 0, $event)" />
            <Num label="Y Max" :value="(obj.yRange||[-3,3,1])[1]" :step="1" @input="uRange('yRange', 1, $event)" />
            <Num label="Y Step" :value="(obj.yRange||[-3,3,1])[2]" :min="0.1" :step="0.5" @input="uRange('yRange', 2, $event)" />
          </div>
        </div>
      </Section>

      <!-- Z-Order -->
      <Section label="Layer Order">
        <input class="input input-sm w-16" type="number" min="0" :value="obj.zOrder || 0" @change="u('zOrder', Number($event.target.value))" />
      </Section>

      <!-- Group info -->
      <Section v-if="objGroup" label="Group">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-studio-text-muted">{{ objGroup.name }}</span>
          <button class="text-[10px] text-studio-accent hover:underline" @click="ungroup(objGroup.id)">Ungroup</button>
        </div>
      </Section>

      <!-- ═══ Entrance Animation ═══ -->
      <Section label="Entrance">
        <div class="space-y-1.5">
          <select class="select text-xs" :value="obj.enterAnim || 'fade_in'" @change="u('enterAnim', $event.target.value)">
            <option v-for="a in enterAnims" :key="a.value" :value="a.value">{{ a.icon }} {{ a.label }}</option>
          </select>
          <div v-if="obj.enterAnim && obj.enterAnim !== 'none'" class="flex items-center gap-2">
            <span class="text-[9px] text-studio-text-muted w-14">Duration</span>
            <input class="input input-sm w-16" type="number" min="0.1" max="5" step="0.1" :value="obj.enterAnimDur || 0.5" @change="u('enterAnimDur', Number($event.target.value))" />
            <span class="text-[9px] text-studio-text-muted">s</span>
          </div>
          <p class="text-[8px] text-studio-text-muted/40 leading-snug">{{ enterAnimDesc }}</p>
        </div>
      </Section>

      <!-- ═══ Exit Animation ═══ -->
      <Section label="Exit">
        <div class="space-y-1.5">
          <select class="select text-xs" :value="obj.exitAnim || 'fade_out'" @change="u('exitAnim', $event.target.value)">
            <option v-for="a in exitAnims" :key="a.value" :value="a.value">{{ a.icon }} {{ a.label }}</option>
          </select>
          <div v-if="obj.exitAnim && obj.exitAnim !== 'none'" class="flex items-center gap-2">
            <span class="text-[9px] text-studio-text-muted w-14">Duration</span>
            <input class="input input-sm w-16" type="number" min="0.1" max="5" step="0.1" :value="obj.exitAnimDur || 0.5" @change="u('exitAnimDur', Number($event.target.value))" />
            <span class="text-[9px] text-studio-text-muted">s</span>
          </div>
          <p class="text-[8px] text-studio-text-muted/40 leading-snug">{{ exitAnimDesc }}</p>
        </div>
      </Section>

      <!-- ═══ Motion (Timeline Clips) ═══ -->
      <Section label="Add Motion">
        <p class="text-[8px] text-studio-text-muted/50 mb-1.5">Create a timeline clip animation</p>
        <div class="grid grid-cols-2 gap-1">
          <button class="anim-btn move" @click="anim('move')">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            Move
          </button>
          <button class="anim-btn scale" @click="anim('scale')">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
            Scale
          </button>
          <button class="anim-btn fade" @click="anim('fade')">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10" opacity="0.5"/></svg>
            Fade
          </button>
          <button class="anim-btn rotate" @click="anim('rotate')">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M1 4v6h6M3.51 15a9 9 0 1014.85-3.36L23 8"/></svg>
            Rotate
          </button>
        </div>
      </Section>

      <div class="px-3 py-3 mt-auto">
        <button class="btn btn-danger btn-xs w-full" @click="del">Delete Object</button>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- Clip Properties -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <template v-else-if="clip">
      <div class="panel-header flex items-center justify-between">
        Animation
        <span class="px-1.5 py-0.5 text-[9px] rounded-md font-bold uppercase" :class="clipBadge">{{ clip.type }}</span>
      </div>

      <Section label="Timing">
        <div class="grid grid-cols-2 gap-1.5">
          <Num label="Start (s)" :value="clip.startTime" :min="0" :step="0.1" @input="uc('startTime', $event)" />
          <Num label="Duration (s)" :value="clip.duration" :min="0.1" :step="0.1" @input="uc('duration', $event)" />
        </div>
      </Section>

      <Section label="Easing">
        <select class="select text-xs" :value="clip.easing" @change="uc('easing', $event.target.value)">
          <option v-for="e in easings" :key="e.value" :value="e.value">{{ e.label }}</option>
        </select>
      </Section>

      <Section label="Overshoot">
        <div class="flex items-center gap-2">
          <input type="range" min="0" max="0.2" step="0.01" class="flex-1 accent-purple-500" :value="clip.overshoot || 0" @input="uc('overshoot', Number($event.target.value))" />
          <span class="text-[10px] text-studio-text-muted w-8 text-right">{{ ((clip.overshoot || 0) * 100).toFixed(0) }}%</span>
        </div>
      </Section>

      <Section v-if="clip.type === 'transform'" label="Morph Quality">
        <select class="select text-xs" :value="clip.morphQuality || 'medium'" @change="uc('morphQuality', $event.target.value)">
          <option value="low">Low (fast preview)</option>
          <option value="medium">Medium (balanced)</option>
          <option value="high">High (smooth)</option>
        </select>
      </Section>

      <Section v-if="clip.type === 'transform'" label="Objects">
        <div class="text-[10px] text-studio-text-muted space-y-0.5">
          <div>From: <strong class="text-studio-text">{{ oName(clip.sourceId) }}</strong></div>
          <div>To: <strong class="text-studio-text">{{ oName(clip.targetId) }}</strong></div>
        </div>
      </Section>

      <Section v-if="clip.type === 'move'" label="Target Position">
        <div class="grid grid-cols-2 gap-1.5">
          <Num label="X" :value="(clip.params||{}).targetX||0" @input="up('targetX', $event)" />
          <Num label="Y" :value="(clip.params||{}).targetY||0" @input="up('targetY', $event)" />
        </div>
      </Section>

      <Section v-if="clip.type === 'scale'" label="Target Scale">
        <div class="grid grid-cols-2 gap-1.5">
          <Num label="X" :value="(clip.params||{}).targetScaleX||1" :step="0.1" @input="up('targetScaleX', $event)" />
          <Num label="Y" :value="(clip.params||{}).targetScaleY||1" :step="0.1" @input="up('targetScaleY', $event)" />
        </div>
      </Section>

      <Section v-if="clip.type === 'fade'" label="Target Opacity">
        <input type="range" min="0" max="1" step="0.01" class="w-full accent-orange-500" :value="(clip.params||{}).targetOpacity||0" @input="up('targetOpacity', Number($event.target.value))" />
      </Section>

      <Section v-if="clip.type === 'rotate'" label="Target Rotation">
        <Num label="Degrees" :value="(clip.params||{}).targetRotation||360" @input="up('targetRotation', $event)" />
      </Section>

      <div class="px-3 py-3">
        <button class="btn btn-danger btn-xs w-full" @click="delClip">Delete Animation</button>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- Nothing Selected: Show background & canvas props + object list -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <template v-else>
      <div class="panel-header">Canvas</div>

      <!-- Background Properties -->
      <Section label="Background">
        <div class="space-y-1.5">
          <ColorRow label="Color" :value="stg.backgroundColor" @input="uStage('backgroundColor', $event)" />
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-studio-text-muted w-12">Opacity</span>
            <input type="range" min="0" max="1" step="0.01" class="flex-1 accent-studio-accent" :value="stg.backgroundOpacity ?? 1" @input="uStage('backgroundOpacity', Number($event.target.value))" />
            <span class="text-[10px] text-studio-text-muted w-8 text-right tabular-nums">{{ Math.round((stg.backgroundOpacity ?? 1) * 100) }}%</span>
          </div>
        </div>
      </Section>

      <!-- Grid Properties -->
      <Section label="Grid">
        <div class="space-y-1.5">
          <div class="flex items-center gap-2">
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" :checked="stg.gridVisible" @change="uStage('gridVisible', $event.target.checked)" class="accent-studio-accent" />
              <span class="text-[10px] text-studio-text-muted">Visible</span>
            </label>
          </div>
          <div class="grid grid-cols-2 gap-1.5">
            <Num label="Divisions" :value="stg.gridSize || 8" :min="2" :max="24" @input="uStage('gridSize', $event)" />
            <div>
              <span class="text-[9px] text-studio-text-muted/50">Opacity</span>
              <input class="input input-sm" type="number" min="0" max="1" step="0.02" :value="stg.gridOpacity ?? 0.12" @change="uStage('gridOpacity', Number($event.target.value))" />
            </div>
          </div>
          <ColorRow label="Grid Color" :value="stg.gridColor || '#ffffff'" @input="uStage('gridColor', $event)" />
        </div>
      </Section>

      <!-- Snap Settings -->
      <Section label="Snapping">
        <div class="space-y-1.5">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" :checked="stg.snapEnabled" @change="uStage('snapEnabled', $event.target.checked)" class="accent-studio-accent" />
            <span class="text-[10px] text-studio-text-muted">Snap enabled</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" :checked="stg.snapToGrid" @change="uStage('snapToGrid', $event.target.checked)" class="accent-studio-accent" />
            <span class="text-[10px] text-studio-text-muted">Snap to grid</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" :checked="stg.snapToCenter" @change="uStage('snapToCenter', $event.target.checked)" class="accent-studio-accent" />
            <span class="text-[10px] text-studio-text-muted">Snap to center</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" :checked="stg.snapToObjects" @change="uStage('snapToObjects', $event.target.checked)" class="accent-studio-accent" />
            <span class="text-[10px] text-studio-text-muted">Snap to objects</span>
          </label>
        </div>
      </Section>

      <!-- Stage Size -->
      <Section label="Stage Size">
        <div class="grid grid-cols-2 gap-1.5">
          <Num label="Width" :value="stg.width" :min="100" @input="uStage('width', $event)" />
          <Num label="Height" :value="stg.height" :min="100" @input="uStage('height', $event)" />
        </div>
      </Section>

      <!-- Groups list -->
      <Section v-if="groups.length > 0" label="Groups">
        <div class="space-y-1">
          <div v-for="g in groups" :key="g.id" class="flex items-center justify-between px-2 py-1.5 rounded-md bg-studio-bg/50 text-xs">
            <span class="text-studio-text-muted">{{ g.name }} ({{ g.childIds.length }})</span>
            <button class="text-[9px] text-red-400 hover:text-red-300" @click="ungroup(g.id)">Ungroup</button>
          </div>
        </div>
      </Section>

      <!-- Object list -->
      <div class="border-t border-studio-border p-3 mt-auto">
        <div class="text-[10px] text-studio-text-muted font-bold uppercase tracking-wider mb-2">Objects ({{ objs.length }})</div>
        <div class="max-h-40 overflow-y-auto space-y-0.5">
          <div v-for="o in objs" :key="o.id" class="obj-list-item" :class="{ sel: isSel(o.id) }" @click="selObj(o.id, $event)">
            <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ background: o.fill || '#666' }"></span>
            <span class="truncate flex-1">{{ o.name }}</span>
            <span class="text-[8px] text-studio-text-muted/50">{{ o.type }}</span>
          </div>
        </div>
      </div>
    </template>
  </aside>
</template>

<script>
import { store, actions, getters, ENTER_ANIMS, EXIT_ANIMS } from '../../store/project.js';
import { EASING_LIST } from '../../engine/easing.js';
import { ANCHOR_GRID, ANCHOR_LABELS } from '../../constants/anchors.js';
import FontSelector from './FontSelector.vue';

const Section = {
  props: ['label'],
  template: '<div class="px-3 py-2 border-b border-studio-border/50"><label class="text-[10px] text-studio-text-muted/70 uppercase font-bold tracking-wider mb-1 block">{{ label }}</label><slot/></div>'
};

const Num = {
  props: { label: String, value: [Number, String], min: { type: Number, default: undefined }, max: { type: Number, default: undefined }, step: { type: Number, default: 1 } },
  template: '<div><span class="text-[9px] text-studio-text-muted/50">{{ label }}</span><input class="input input-sm" type="number" :value="value" :min="min" :max="max" :step="step" @change="$emit(\'input\', Number($event.target.value))" /></div>'
};

const ColorRow = {
  props: ['label', 'value'],
  template: `<div class="flex items-center gap-2"><span class="text-[10px] text-studio-text-muted w-12">{{ label }}</span><input type="color" class="color-input" :value="value || '#ffffff'" @input="$emit('input', $event.target.value)" /><input class="input input-sm flex-1" :value="value" @change="$emit('input', $event.target.value)" /></div>`
};

export default {
  name: 'PropertiesPanel',
  components: { Section, Num, ColorRow, FontSelector },

  data() {
    return {
      anchorGrid: ANCHOR_GRID,
      anchorLabels: ANCHOR_LABELS
    };
  },

  computed: {
    obj() { return getters.selectedObject(); },
    clip() { return getters.selectedClip(); },
    objs() { return store.project.objects; },
    stg() { return store.project.stage; },
    groups() { return store.project.groups || []; },
    easings() { return EASING_LIST; },
    enterAnims() { return ENTER_ANIMS; },
    exitAnims() { return EXIT_ANIMS; },
    enterAnimDesc() {
      if (!this.obj) return '';
      const a = ENTER_ANIMS.find(a => a.value === (this.obj.enterAnim || 'fade_in'));
      return a ? a.desc : '';
    },
    exitAnimDesc() {
      if (!this.obj) return '';
      const a = EXIT_ANIMS.find(a => a.value === (this.obj.exitAnim || 'fade_out'));
      return a ? a.desc : '';
    },
    objGroup() {
      if (!this.obj) return null;
      return getters.objectGroup(this.obj.id);
    },
    typeLabel() {
      if (!this.obj) return '';
      const m = { dot_grid: 'Grid', svg_asset: 'SVG', rectangle: 'Rect', latex: 'LaTeX', axes: 'Axes' };
      return m[this.obj.type] || this.obj.type;
    },
    typeBadge() {
      const m = {
        heart:'bg-pink-600 text-white', square:'bg-blue-600 text-white', rectangle:'bg-blue-600 text-white',
        circle:'bg-green-600 text-white', ellipse:'bg-cyan-600 text-white',
        triangle:'bg-amber-600 text-white', star:'bg-yellow-600 text-white', polygon:'bg-purple-600 text-white',
        line:'bg-gray-600 text-white', arrow:'bg-red-600 text-white',
        dot:'bg-gray-600 text-white', dot_grid:'bg-purple-600 text-white',
        text:'bg-pink-500 text-white', image:'bg-amber-600 text-white', svg_asset:'bg-amber-600 text-white',
        latex:'bg-purple-600 text-white', axes:'bg-emerald-600 text-white'
      };
      return m[this.obj?.type] || 'bg-gray-600 text-white';
    },
    clipBadge() {
      const m = { transform:'bg-purple-600 text-white', move:'bg-blue-600 text-white', scale:'bg-green-600 text-white', fade:'bg-orange-600 text-white', rotate:'bg-pink-600 text-white' };
      return m[this.clip?.type] || 'bg-gray-600 text-white';
    }
  },

  methods: {
    u(k, v) { if (this.obj) actions.updateObject(this.obj.id, { [k]: v }); },
    uRange(prop, idx, val) {
      if (!this.obj) return;
      const arr = [...(this.obj[prop] || (prop === 'xRange' ? [-5,5,1] : [-3,3,1]))];
      arr[idx] = val;
      actions.updateObject(this.obj.id, { [prop]: arr });
    },
    uc(k, v) { if (this.clip) actions.updateClip(this.clip.id, { [k]: v }); },
    up(k, v) { if (this.clip) actions.updateClip(this.clip.id, { params: { ...(this.clip.params||{}), [k]: v } }); },
    uStage(k, v) { actions.updateStage({ [k]: v }); },
    del() { if (this.obj) actions.deleteObject(this.obj.id); },
    delClip() { if (this.clip) actions.deleteClip(this.clip.id); },
    oName(id) { const o = getters.objectById(id); return o ? o.name : '(deleted)'; },
    isSel(id) { return store.selectedObjectIds.includes(id); },
    selObj(id, e) { actions.selectObject(id, e.shiftKey || e.ctrlKey); },
    align(anchor) { if (this.obj) actions.alignObject(this.obj.id, anchor); },
    ungroup(groupId) { actions.ungroupObjects(groupId); },
    anim(type) {
      if (!this.obj) return;
      const p = {};
      if (type === 'move') { p.targetX = this.obj.x + 200; p.targetY = this.obj.y; }
      if (type === 'scale') { p.targetScaleX = 2; p.targetScaleY = 2; }
      if (type === 'fade') { p.targetOpacity = 0; }
      if (type === 'rotate') { p.targetRotation = (this.obj.rotation || 0) + 360; }
      actions.createAnimation(type, p);
    }
  }
};
</script>

<style scoped>
.anim-btn {
  @apply flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[10px] font-semibold text-white/80 transition-all hover:brightness-110 active:scale-95;
}
.anim-btn.move { background: linear-gradient(135deg, #3b82f6, #06b6d4); }
.anim-btn.scale { background: linear-gradient(135deg, #22c55e, #10b981); }
.anim-btn.fade { background: linear-gradient(135deg, #f59e0b, #ef4444); }
.anim-btn.rotate { background: linear-gradient(135deg, #ec4899, #f43f5e); }

.obj-list-item {
  @apply flex items-center gap-2 px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors;
  @apply hover:bg-studio-border;
}
.obj-list-item.sel {
  @apply bg-studio-accent/10 text-studio-accent;
}

.anchor-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px;
  background: var(--studio-bg);
  border-radius: 6px;
  width: fit-content;
}
.anchor-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--studio-surface);
  border: 1px solid var(--studio-border);
  border-radius: 4px;
  color: var(--studio-text-muted);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
}
.anchor-btn:hover {
  background: var(--studio-border);
  color: var(--studio-text);
}
.anchor-btn:active {
  background: var(--studio-accent);
  border-color: var(--studio-accent);
  color: var(--studio-text);
}

.align-btn {
  @apply flex items-center justify-center w-8 h-7 rounded-md border border-studio-border;
  @apply text-studio-text-muted hover:text-studio-text hover:bg-studio-border/50 transition-all;
}
.align-btn.active {
  @apply bg-studio-accent/20 border-studio-accent text-studio-accent;
}
</style>
