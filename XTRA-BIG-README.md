# XTRA-BIG-README.md
## Manim Motion Editor - Complete Codebase Documentation

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Project Structure](#project-structure)
4. [Frontend (Web Service)](#frontend-web-service)
   - [Core Application](#core-application)
   - [State Management](#state-management)
   - [Animation Engine](#animation-engine)
   - [Components](#components)
   - [Export System](#export-system)
5. [Backend (API Service)](#backend-api-service)
   - [Express Server](#express-server)
   - [Route Handlers](#route-handlers)
   - [Compiler Pipeline](#compiler-pipeline)
   - [Job Queue](#job-queue)
6. [Renderer Service](#renderer-service)
7. [Docker Infrastructure](#docker-infrastructure)
8. [Data Models](#data-models)
9. [API Reference](#api-reference)
10. [Development Guide](#development-guide)

---

## Overview

**Manim Motion Editor** is a Figma-like interactive motion editor with high-quality Manim rendering via Docker. It provides a visual interface for creating mathematical animations that can be rendered into cinematic-quality videos.

### Key Features

- **Visual Stage Editor**: Black canvas with optional grid, drag-and-drop shapes, resize/rotate handles, multi-select, snapping
- **16+ Shape Types**: Rectangle, Square, Circle, Ellipse, Triangle, Star, Hexagon, Arrow, Heart, Line, Dot, 5x5 Grid, Text, Image, SVG
- **LaTeX Math Objects**: Add `MathTex` expressions (e.g. `E = mc^2`) that render natively in Manim
- **Coordinate Axes**: Configurable `Axes` with custom x/y ranges and tick steps
- **Transform Morphing**: Select two shapes and morph between them with customizable easing
- **Multi-Track Timeline**: Up to 5 tracks with draggable, resizable animation clips
- **Real-Time Preview**: 60fps playback with sub-frame interpolation
- **Animation Types**: Transform, Move, Scale, Fade, Rotate with 17 easing functions
- **Entrance/Exit Animations**: 11 entrance and 9 exit animation presets per object
- **Undo / Redo**: Full 50-state history stack (Ctrl+Z / Ctrl+Shift+Z)
- **Copy / Paste**: Duplicate objects with offset (Ctrl+C / Ctrl+V)
- **Object Grouping**: Group/ungroup objects (Ctrl+G)
- **Asset Management**: Upload PNGs, JPEGs, SVGs; drag onto stage from sidebar
- **Server Rendering**: One-click HQ render via Docker (480p to 4K) with progress tracking
- **Bidirectional Code Editing**: Toggle between visual editor and Python code view
- **Project Management**: Save/load locally (JSON) or sync to Docker server

### Tech Stack

- **Frontend**: Vue 2.7, Konva.js (canvas), Tailwind CSS, Vite
- **Backend**: Node.js 20, Express, Zod (validation), Redis
- **Renderer**: Python, Manim Community Edition
- **Infrastructure**: Docker Compose, Nginx, Alpine Linux

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
│                    http://localhost:8080                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     Nginx (Port 80)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Vue 2 SPA (Static Files)                           │   │
│  │  - Stage Canvas (Konva.js)                          │   │
│  │  - Timeline (Multi-track)                           │   │
│  │  - Properties Panel                                 │   │
│  │  - Asset Browser                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                       │                                     │
│                       │ Proxy /api/*                         │
│                       ▼                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Routes → Express (Port 3000)                   │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│    Redis     │ │  manim_motion_data │ │   Renderer   │
│  (Queue)     │ │  (Volume)    │ │   (Worker)   │
│  Port 6379   │ │  /data       │ │   (Python)   │
└──────────────┘ └──────────┘ └──────────────┘
        │              │              │
        │              │              │
        │              ▼              │
        │    /data/projects/          │
        │    /data/assets/            │
        │    /data/renders/           │
        │                             │
        └─────────────────────────────┘
                    Poll Jobs
                          │
                          ▼
                ┌──────────────────┐
                │  Manim CE        │
                │  Video Render    │
                │  -qh (1080p)     │
                └──────────────────┘
```

### Data Flow

1. **User Interaction**: User creates shapes/animations in browser
2. **State Update**: Vuex store updates project state
3. **Preview**: Animation engine renders at 60fps using Konva.js
4. **Export**: Client-side Manim code generation for preview
5. **Server Render**: 
   - Project saved to server via API
   - Compiler validates and normalizes
   - Code generator creates `scene.py`
   - Job queued in Redis
   - Worker renders with Manim
   - MP4 saved to shared volume

---

## Project Structure

```
Manim-docker/
├── docker-compose.yml              # Multi-service orchestration
├── README.md                       # Original README
├── report.md                       # Comprehensive audit report
├── assets/                         # Static assets (logos, etc.)
├── docs/                           # Screenshots, documentation
└── services/
    ├── web/                        # Vue.js frontend (SPA)
    │   ├── package.json            # Dependencies
    │   ├── vite.config.js          # Vite configuration
    │   ├── tailwind.config.js      # Tailwind CSS theme
    │   ├── postcss.config.js       # PostCSS configuration
    │   ├── index.html              # HTML entry point
    │   ├── Dockerfile              # Multi-stage build
    │   ├── nginx.conf              # Nginx reverse proxy config
    │   └── src/
    │       ├── main.js             # Vue app initialization
    │       ├── App.vue             # Root component
    │       ├── api.js              # API client
    │       ├── styles/
    │       │   └── main.css        # Global styles + Tailwind
    │       ├── store/
    │       │   └── project.js      # State, history, clipboard (~960 lines)
    │       ├── engine/
    │       │   ├── playback.js     # 60fps animation engine (493 lines)
    │       │   ├── easing.js       # 17 easing functions (193 lines)
    │       │   ├── geometry.js     # Shape point generation (422 lines)
    │       │   ├── transform.js    # Morph interpolation (200 lines)
    │       │   └── blending.js     # Multi-track blending (114 lines)
    │       ├── export/
    │       │   └── manim.js        # Python code gen/parser (757 lines)
    │       ├── constants/
    │       │   ├── anchors.js      # Anchor position constants
    │       │   └── animations.js   # Animation type definitions
    │       └── components/
    │           ├── layout/
    │           │   └── EditorLayout.vue      # 3-panel layout
    │           ├── stage/
    │           │   ├── StageCanvas.vue       # Main canvas (541 lines)
    │           │   ├── StageText.vue         # Text rendering
    │           │   ├── StageImage.vue        # Image rendering
    │           │   ├── StageSvg.vue          # SVG rendering
    │           │   └── AnchorGrid.vue        # Anchor point overlay
    │           ├── timeline/
    │           │   ├── Timeline.vue          # Timeline container (208 lines)
    │           │   ├── TimelineTrack.vue     # Track component
    │           │   ├── TimelineBlock.vue     # Object blocks
    │           │   └── TimelineClip.vue      # Animation clips
    │           ├── inspector/
    │           │   ├── Inspector.vue         # Inspector panel
    │           │   ├── LayoutPanel.vue       # Position/size controls
    │           │   ├── StylePanel.vue        # Color/opacity controls
    │           │   ├── TimingPanel.vue       # Duration/delay controls
    │           │   ├── AnimationPanel.vue    # Animation controls
    │           │   ├── PropertiesPanel.vue   # Main properties (556 lines)
    │           │   └── FontSelector.vue      # Google Fonts picker (430 lines)
    │           ├── assets/
    │           │   ├── AssetBrowser.vue      # Asset sidebar
    │           │   └── AssetUploader.vue     # Upload component
    │           └── render/
    │               └── RenderPanel.vue       # Render dialog
    │
    ├── api/                        # Node.js backend
    │   ├── package.json            # Express dependencies
    │   ├── Dockerfile              # Node 20 Alpine
    │   └── src/
    │       ├── index.js            # Express server entry
    │       ├── queue.js            # Redis queue manager
    │       ├── routes/
    │       │   ├── projects.js     # CRUD operations (243 lines)
    │       │   ├── assets.js       # File upload handlers
    │       │   ├── jobs.js         # Job status endpoints
    │       │   ├── renders.js      # Render management
    │       │   └── fonts.js        # Font proxy service (231 lines)
    │       └── compiler/
    │           ├── index.js        # Compiler orchestration
    │           ├── validator.js    # Zod schema validation
    │           ├── normalizer.js   # Data normalization
    │           └── codegen.js      # Python generator (454 lines)
    │
    └── renderer/                   # Python render worker
        ├── Dockerfile              # Manim CE base image
        └── worker.py               # Redis consumer (212 lines)
```

---

## Frontend (Web Service)

### Core Application

#### Entry Point (`services/web/src/main.js`)

```javascript
// Initializes Vue 2 application with Konva.js integration
// - Registers vue-konva components
// - Mounts App.vue to #app
```

**Key Responsibilities:**
- Vue 2.7 app initialization
- Konva.js canvas library registration
- Global style injection (Tailwind)

#### Root Component (`services/web/src/App.vue`)

The main application shell managing:
- **Keyboard Shortcuts**: Space (play/pause), V (select), H (hand), Delete, Ctrl+S, Ctrl+Z/Y (undo/redo), Ctrl+C/V (copy/paste), Ctrl+G (group)
- **Dialogs**: Export Python, Render Video, Code View
- **Global State**: Integration with Vuex store
- **Tool Modes**: Select vs Hand (pan) tool toggle

**Template Structure:**
```vue
<template>
  <div class="h-screen flex flex-col bg-gray-950 text-gray-100">
    <!-- Top Bar -->
    <TopBar />
    
    <!-- 3-Panel Layout -->
    <EditorLayout>
      <template #left>
        <Sidebar />  <!-- Shapes + Assets -->
      </template>
      
      <template #center>
        <StageCanvas />  <!-- Main editing canvas -->
        <Timeline />     <!-- Bottom timeline -->
      </template>
      
      <template #right>
        <Inspector />  <!-- Properties panel -->
      </template>
    </EditorLayout>
    
    <!-- Dialogs -->
    <ExportDialog />
    <RenderDialog />
    <CodeView />
  </div>
</template>
```

### State Management

#### Project Store (`services/web/src/store/project.js`)

Comprehensive state management with undo/redo and clipboard:

**State Structure:**
```javascript
state: {
  // Project metadata
  projectId: null,
  projectName: 'Untitled',
  isSaved: false,
  
  // Stage configuration
  stage: {
    width: 1920,
    height: 1080,
    backgroundColor: '#0f0f0f',
    showGrid: true,
    gridSize: 50,
    snapToGrid: false
  },
  
  // Scene settings
  sceneDuration: 10,  // seconds
  fps: 60,
  
  // Objects on stage (17 types)
  objects: [],
  
  // Object groups
  groups: [],  // { id, name, childIds[], margin, collapsed }
  
  // Animation tracks
  tracks: [
    { id: 'objects', name: 'Objects', clips: [] },
    { id: 'track1', name: 'Track 1', clips: [] },
    { id: 'track2', name: 'Track 2', clips: [] },
    { id: 'track3', name: 'Track 3', clips: [] },
    { id: 'track4', name: 'Track 4', clips: [] }
  ],
  
  // Assets
  assets: [],
  
  // History (undo/redo, max 50 states)
  history: { past: [], future: [] },
  
  // Clipboard (copy/paste with +20px offset)
  clipboard: [],
  
  // UI state
  selectedObjectIds: [],
  selectedClipIds: [],
  currentTime: 0,
  isPlaying: false,
  zoom: 1,
  pan: { x: 0, y: 0 },
  tool: 'select',  // 'select' | 'hand'
  
  // Playback
  playbackEngine: null
}
```

**Key Actions:**

| Action | Description |
|--------|-------------|
| `addObject(type, config)` | Adds shape/text/image/latex/axes to stage |
| `updateObject(id, props)` | Updates object properties |
| `deleteObject(id)` | Removes object and related clips |
| `selectObject(id, multi)` | Selects object(s) |
| `groupObjects()` | Groups selected objects |
| `ungroupObjects()` | Ungroups selected group |
| `createClip(type, params)` | Creates animation clip |
| `updateClip(id, props)` | Modifies clip properties |
| `deleteClip(id)` | Removes clip from timeline |
| `commitState()` | Pushes current state to history |
| `undo()` | Restores previous state |
| `redo()` | Restores next state |
| `copySelection()` | Copies selected objects to clipboard |
| `pasteSelection()` | Pastes clipboard with +20px offset |
| `setCurrentTime(time)` | Seeks to timestamp |
| `play()` / `pause()` | Playback control |
| `saveProject()` | Persists to server |
| `loadProject(id)` | Loads from server |
| `renderVideo(quality)` | Triggers server render |

**Getters:**
- `selectedObjects`: Array of currently selected objects
- `selectedClips`: Array of currently selected clips
- `getObjectById(id)`: Object lookup
- `getClipById(id)`: Clip lookup
- `activeAnimationsAt(time)`: Clips active at timestamp
- `objectAnimations(objectId)`: All clips for an object

### Animation Engine

The animation engine provides real-time 60fps preview of Manim animations in the browser.

#### Playback Controller (`services/web/src/engine/playback.js`)

**493 lines** implementing the core animation loop:

```javascript
class PlaybackEngine {
  constructor(store) {
    this.store = store;
    this.isPlaying = false;
    this.currentTime = 0;
    this.animationFrame = null;
    this.lastFrameTime = 0;
  }
  
  // Core loop at 60fps
  tick(timestamp) {
    const delta = (timestamp - this.lastFrameTime) / 1000;
    this.currentTime += delta;
    
    // Render current frame
    this.renderFrame(this.currentTime);
    
    // Schedule next frame
    this.animationFrame = requestAnimationFrame((t) => this.tick(t));
  }
  
  renderFrame(time) {
    // Get all active clips at this time
    const activeClips = this.getActiveClips(time);
    
    // Calculate each object's state
    for (const object of this.store.state.objects) {
      const state = this.calculateObjectState(object, time, activeClips);
      this.updateObjectOnStage(object.id, state);
    }
  }
}
```

**Features:**
- **60fps Rendering**: requestAnimationFrame-based loop
- **Sub-frame Interpolation**: Smooth animation between frames
- **Multi-track Blending**: Multiple simultaneous animations
- **Morph Interpolation**: Point-by-point shape interpolation
- **Pause/Resume**: Accurate timing preservation
- **Scrubbing**: Frame-perfect seeking

#### Easing Functions (`services/web/src/engine/easing.js`)

**193 lines** implementing 17 easing functions:

```javascript
export const easingFunctions = {
  // Basic
  linear: (t) => t,
  ease_in: (t) => t * t,
  ease_out: (t) => 1 - (1 - t) * (1 - t),
  ease_in_out: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  
  // Cubic
  cubic_in: (t) => t * t * t,
  cubic_out: (t) => 1 - Math.pow(1 - t, 3),
  cubic_in_out: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  
  // Quart
  quart_in: (t) => t * t * t * t,
  quart_out: (t) => 1 - Math.pow(1 - t, 4),
  quart_in_out: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  
  // Back (overshoot)
  back_in: (t, overshoot = 1.70158) => t * t * ((overshoot + 1) * t - overshoot),
  back_out: (t, overshoot = 1.70158) => --t * t * ((overshoot + 1) * t + overshoot) + 1,
  back_in_out: (t, overshoot = 1.70158) => { /* ... */ },
  
  // Elastic
  elastic_in: (t) => { /* complex spring physics */ },
  elastic_out: (t) => { /* complex spring physics */ },
  
  // Bounce
  bounce_out: (t) => { /* bouncing ball physics */ },
  bounce_in: (t) => 1 - bounce_out(1 - t),
  
  // Spring
  spring: (t) => { /* damped harmonic oscillator */ }
};
```

**Overshoot Parameter:**
Back easings accept an `overshoot` parameter (default 1.70158) controlling how much the animation overshoots before settling.

#### Geometry Generation (`services/web/src/engine/geometry.js`)

**422 lines** generating point arrays for 15 shape types:

```javascript
export const shapeGenerators = {
  // Polygon: Square, Circle, Triangle, etc.
  circle: (width, height, quality = 100) => {
    const points = [];
    for (let i = 0; i < quality; i++) {
      const angle = (i / quality) * Math.PI * 2;
      points.push({
        x: Math.cos(angle) * width / 2,
        y: Math.sin(angle) * height / 2
      });
    }
    return points;
  },
  
  // Parametric: Heart, Star, etc.
  heart: (width, height, quality = 100) => {
    const points = [];
    for (let i = 0; i < quality; i++) {
      const t = (i / quality) * Math.PI * 2;
      // Heart curve equation
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
      points.push({
        x: x * width / 32,
        y: y * height / 32
      });
    }
    return points;
  },
  
  // Grid patterns
  dot_grid: (width, height, rows = 5, cols = 5) => {
    // Generate 5x5 dot grid points
  },
  
  // Bezier curves
  bezier: (controlPoints, quality = 100) => {
    // Cubic bezier interpolation
  }
};
```

**Supported Shapes:**
1. Rectangle
2. Square
3. Circle
4. Ellipse
5. Triangle
6. Star
7. Hexagon / Polygon (N sides)
8. Arrow
9. Heart
10. Line
11. Dot
12. 5x5 Dot Grid
13. Text
14. Image
15. SVG
16. LaTeX (MathTex)
17. Coordinate Axes

**Point Resampling:**
Shapes with different point counts are resampled using linear interpolation to enable morphing between incompatible shapes.

#### Transform & Morphing (`services/web/src/engine/transform.js`)

**200 lines** handling shape interpolation:

```javascript
export function interpolatePoints(sourcePoints, targetPoints, progress, easingFn) {
  // Ensure equal point counts via resampling
  const maxPoints = Math.max(sourcePoints.length, targetPoints.length);
  const source = resamplePoints(sourcePoints, maxPoints);
  const target = resamplePoints(targetPoints, maxPoints);
  
  // Apply easing
  const t = easingFn(progress);
  
  // Interpolate each point
  return source.map((p, i) => ({
    x: p.x + (target[i].x - p.x) * t,
    y: p.y + (target[i].y - p.y) * t
  }));
}

export function interpolateColor(sourceColor, targetColor, progress, easingFn) {
  const t = easingFn(progress);
  return blendColors(sourceColor, targetColor, t);
}

export function calculateTransformState(source, target, progress, easingFn) {
  return {
    x: interpolate(source.x, target.x, progress, easingFn),
    y: interpolate(source.y, target.y, progress, easingFn),
    width: interpolate(source.width, target.width, progress, easingFn),
    height: interpolate(source.height, target.height, progress, easingFn),
    rotation: interpolateRotation(source.rotation, target.rotation, progress, easingFn),
    fill: interpolateColor(source.fill, target.fill, progress, easingFn),
    stroke: interpolateColor(source.stroke, target.stroke, progress, easingFn),
    opacity: interpolate(source.opacity, target.opacity, progress, easingFn)
  };
}
```

**Morph Quality Settings:**
- **Low**: 50 points, faster preview
- **Medium**: 100 points, balanced
- **High**: 200 points, smooth rendering
- **Ultra**: 500 points, best quality

#### Multi-track Blending (`services/web/src/engine/blending.js`)

**114 lines** combining multiple simultaneous animations:

```javascript
export function blendAnimations(object, clips, currentTime) {
  // Get all active clips for this object
  const activeClips = clips.filter(clip => 
    currentTime >= clip.startTime && 
    currentTime <= clip.startTime + clip.duration
  );
  
  if (activeClips.length === 0) {
    return getDefaultState(object);
  }
  
  if (activeClips.length === 1) {
    return applyClip(object, activeClips[0], currentTime);
  }
  
  // Multiple clips - blend them
  // Priority: Transforms > Moves > Scales > Rotates > Fades
  const sortedClips = sortByPriority(activeClips);
  
  let state = getDefaultState(object);
  for (const clip of sortedClips) {
    const clipState = applyClip(object, clip, currentTime);
    state = mergeStates(state, clipState, clip.type);
  }
  
  return state;
}
```

**Priority Order:**
1. Transform (highest priority - morphing)
2. Move
3. Scale
4. Rotate
5. Fade (lowest priority)

### Components

#### Stage Components

**StageCanvas.vue** (541 lines)

The main editing canvas using Konva.js:

```vue
<template>
  <div class="stage-container" ref="container">
    <v-stage
      :config="stageConfig"
      @mousedown="handleStageMouseDown"
      @mousemove="handleStageMouseMove"
      @mouseup="handleStageMouseUp"
      @wheel="handleWheel"
    >
      <v-layer>
        <!-- Grid -->
        <Grid v-if="showGrid" :size="gridSize" />
        
        <!-- Objects -->
        <ShapeObject
          v-for="obj in objects"
          :key="obj.id"
          :config="getObjectConfig(obj)"
          :selected="isSelected(obj.id)"
          @select="selectObject(obj.id, $event)"
          @transform="updateObjectTransform(obj.id, $event)"
        />
        
        <!-- Transformer (resize handles) -->
        <v-transformer
          v-if="selectedObjectIds.length > 0"
          :config="transformerConfig"
        />
      </v-layer>
    </v-stage>
  </div>
</template>
```

**Features:**
- Zoom and pan with mouse wheel
- Multi-select with Shift+click
- Drag to move objects
- Transform handles for resize/rotate
- Grid snapping (optional)
- Real-time animation preview

**Shape Types:**

- **StageText.vue**: Konva.Text with font loading
- **StageImage.vue**: Konva.Image with base64/asset support
- **StageSvg.vue**: Konva.Path with SVG path parsing

#### Timeline Components

**Timeline.vue** (208 lines)

Multi-track animation timeline:

```vue
<template>
  <div class="timeline">
    <!-- Header with time ruler -->
    <TimelineRuler 
      :duration="sceneDuration" 
      :scale="scale"
      @seek="setCurrentTime"
    />
    
    <!-- Tracks -->
    <div class="tracks">
      <!-- Objects track (always visible) -->
      <TimelineTrack
        name="Objects"
        :clips="objectBlocks"
        @select="selectObjectBlock"
        @move="moveObjectBlock"
      />
      
      <!-- Animation tracks -->
      <TimelineTrack
        v-for="track in animationTracks"
        :key="track.id"
        :name="track.name"
        :clips="track.clips"
        @select="selectClip"
        @move="moveClip"
        @resize="resizeClip"
      />
    </div>
    
    <!-- Playhead -->
    <Playhead :time="currentTime" :scale="scale" />
  </div>
</template>
```

**TimelineClip.vue**

Draggable, resizable animation clips:

```javascript
// Clip structure
{
  id: 'clip_123',
  type: 'transform',  // 'transform' | 'move' | 'scale' | 'fade' | 'rotate'
  startTime: 2.5,     // seconds
  duration: 1.5,      // seconds
  sourceId: 'obj_a',  // source object (for transforms)
  targetId: 'obj_b',  // target object (for transforms)
  easing: 'ease_in_out',
  overshoot: 1.70158,  // for back easing
  morphQuality: 'high',
  params: {
    // Animation-specific parameters
    x: 100, y: 100,  // for move
    scale: 2,         // for scale
    rotation: 90,     // for rotate
    opacity: 0        // for fade
  }
}
```

**Interactions:**
- Drag to change start time
- Resize edges to change duration
- Click to select and edit properties
- Right-click for context menu (delete, duplicate)

#### Inspector Components

**PropertiesPanel.vue** (556 lines)

Comprehensive object/clip editor:

```vue
<template>
  <div class="inspector">
    <!-- Object Selection Mode -->
    <div v-if="selectedObjects.length > 0">
      <LayoutPanel :objects="selectedObjects" />
      <StylePanel :objects="selectedObjects" />
      <TimingPanel :objects="selectedObjects" />
      
      <!-- Quick Animation Buttons -->
      <AnimationPanel 
        :objects="selectedObjects"
        @create="createQuickAnimation"
      />
    </div>
    
    <!-- Clip Selection Mode -->
    <div v-else-if="selectedClips.length > 0">
      <ClipProperties :clips="selectedClips" />
    </div>
    
    <!-- Empty State -->
    <div v-else>
      Select an object or clip to edit
    </div>
  </div>
</template>
```

**LayoutPanel.vue**: Position, size, rotation, anchor points
**StylePanel.vue**: Fill color, stroke color, opacity, stroke width
**TimingPanel.vue**: Enter time, duration, enter/exit animations
**AnimationPanel.vue**: Quick create Move/Scale/Fade/Rotate

**FontSelector.vue** (430 lines)

Google Fonts integration:
- Fetches font list from Google Fonts API
- Live font preview
- Search and filter
- Async font loading with WebFont.js

```javascript
async loadFont(fontFamily) {
  return new Promise((resolve, reject) => {
    WebFont.load({
      google: { families: [fontFamily] },
      active: resolve,
      inactive: reject
    });
  });
}
```

#### Asset Components

**AssetBrowser.vue / AssetSidebar.vue**

Sidebar showing:
- Built-in shapes (Rectangle, Circle, Star, Heart, Arrow, Line, etc.)
- LaTeX and Axes buttons for math/graph objects
- Uploaded images and SVGs
- Click to add objects to stage

**AssetUploader.vue**

File upload with:
- Drag-and-drop support
- Base64 encoding for immediate preview
- Server sync on render
- Supported formats: PNG, JPEG, SVG

#### Render Component

**RenderPanel.vue**

Video render dialog:
- Quality selection: Low (480p), Medium (720p), High (1080p), 4K
- Progress tracking
- Preview player for completed renders
- Download MP4 button

### Export System

#### Manim Code Generator (`services/web/src/export/manim.js`)

**757 lines** bidirectional Python code generation:

**Features:**
- **Export**: Project → Manim Python script
- **Import**: Manim Python → Project (parser)
- **Live Sync**: Real-time code view updates

**Generated Code Structure:**

```python
from manim import *

class MainScene(Scene):
    def construct(self):
        # Scene configuration
        self.camera.background_color = "#0f0f0f"
        
        # Create objects
        circle = Circle(radius=1, color=BLUE, fill_opacity=0.5)
        circle.shift(LEFT * 2)
        
        square = Square(side_length=2, color=RED, fill_opacity=0.5)
        square.shift(RIGHT * 2)
        
        # Add to scene
        self.add(circle, square)
        
        # Wait for initial delay
        self.wait(0.5)
        
        # Transform animation
        self.play(
            Transform(circle, square),
            run_time=1.5,
            rate_func=rate_functions.ease_in_out_cubic
        )
        
        # Hold final frame
        self.wait(0.5)
```

**Export Methods:**

```javascript
export const manimExport = {
  // Export project to Python code
  exportProject(project) {
    const lines = [];
    
    // Imports
    lines.push('from manim import *');
    lines.push('');
    
    // Scene class
    lines.push('class MainScene(Scene):');
    lines.push('    def construct(self):');
    
    // Background
    lines.push(`        self.camera.background_color = "${project.stage.backgroundColor}"`);
    
    // Object definitions
    for (const obj of project.objects) {
      lines.push(...this.generateObjectCode(obj));
    }
    
    // Animation sequence
    lines.push(...this.generateAnimationSequence(project));
    
    return lines.join('\n');
  },
  
  // Parse Python code back to project
  parseCode(code) {
    // AST-like parsing to extract objects and animations
    // Returns project structure
  }
};
```

**Animation Mapping:**

| Editor Animation | Manim Equivalent |
|------------------|------------------|
| Transform (morph) | `Transform(source, target)` |
| Move | `obj.animate.shift(position)` |
| Scale | `obj.animate.scale(factor)` |
| Fade In | `FadeIn(obj)` |
| Fade Out | `FadeOut(obj)` |
| Rotate | `obj.animate.rotate(angle)` |

**Easing Mapping:**

| Editor Easing | Manim Rate Function |
|---------------|---------------------|
| linear | `rate_functions.linear` |
| ease_in | `rate_functions.ease_in_cubic` |
| ease_out | `rate_functions.ease_out_cubic` |
| ease_in_out | `rate_functions.ease_in_out_cubic` |
| back_in | `rate_functions.ease_in_back` |
| elastic_out | `rate_functions.elastic_out` |
| bounce_out | `rate_functions.bounce_out` |

---

## Backend (API Service)

### Express Server (`services/api/src/index.js`)

Main entry point setting up Express with:
- CORS configuration
- JSON body parsing
- Static file serving (uploads, renders)
- Route mounting
- Error handling

```javascript
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/projects', routes.projects);
app.use('/api/assets', routes.assets);
app.use('/api/jobs', routes.jobs);
app.use('/api/renders', routes.renders);
app.use('/api/fonts', routes.fonts);

// Static files
app.use('/data', express.static(DATA_DIR));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### Route Handlers

#### Projects (`services/api/src/routes/projects.js`)

**243 lines** implementing CRUD operations:

```javascript
// GET /api/projects
router.get('/', async (req, res) => {
  const projects = await listProjects();
  res.json(projects);
});

// POST /api/projects
router.post('/', async (req, res) => {
  const project = await createProject(req.body);
  res.status(201).json(project);
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  const project = await getProject(req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  const project = await updateProject(req.params.id, req.body);
  res.json(project);
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  await deleteProject(req.params.id);
  res.status(204).send();
});

// POST /api/projects/:id/render
router.post('/:id/render', async (req, res) => {
  const { quality = 'high' } = req.body;
  
  // 1. Get project
  const project = await getProject(req.params.id);
  
  // 2. Compile to Python
  const pythonCode = await compileProject(project);
  
  // 3. Save scene.py
  await writeFile(`/data/projects/${id}/scene.py`, pythonCode);
  
  // 4. Queue render job
  const job = await queue.createJob({
    type: 'render',
    projectId: id,
    quality,
    sceneFile: `/data/projects/${id}/scene.py`
  });
  
  res.json({ jobId: job.id, status: 'queued' });
});
```

#### Assets (`services/api/src/routes/assets.js`)

File upload handling:

```javascript
// POST /api/assets/:projectId
router.post('/:projectId', upload.single('file'), async (req, res) => {
  const { projectId } = req.params;
  const file = req.file;
  
  // Save to /data/assets/{projectId}/{filename}
  const assetPath = path.join(DATA_DIR, 'assets', projectId, file.filename);
  await fs.writeFile(assetPath, file.buffer);
  
  res.json({
    id: generateId(),
    name: file.originalname,
    type: getMimeType(file.mimetype),
    filename: file.filename,
    size: file.size
  });
});

// POST /api/assets/:projectId/base64
router.post('/:projectId/base64', async (req, res) => {
  // Handle base64 encoded images from browser
  const { dataUrl, filename } = req.body;
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  
  await fs.writeFile(assetPath, buffer);
  res.json({ id, name: filename, type, filename });
});

// GET /api/assets/:projectId/:filename
router.get('/:projectId/:filename', (req, res) => {
  const filePath = path.join(DATA_DIR, 'assets', req.params.projectId, req.params.filename);
  res.sendFile(filePath);
});
```

#### Jobs (`services/api/src/routes/jobs.js`)

Job status polling:

```javascript
// GET /api/jobs/:jobId
router.get('/:jobId', async (req, res) => {
  const job = await queue.getJob(req.params.jobId);
  
  res.json({
    id: job.id,
    status: job.status,  // 'queued' | 'active' | 'completed' | 'failed'
    progress: job.progress,  // 0-100
    output: job.output,  // Render output path
    error: job.error,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt
  });
});
```

#### Fonts (`services/api/src/routes/fonts.js`)

**231 lines** Google Fonts proxy:

```javascript
// GET /api/fonts/list
router.get('/list', async (req, res) => {
  // Fetch from Google Fonts API
  const response = await fetch(
    `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=popularity`
  );
  const data = await response.json();
  
  // Cache and return filtered list
  res.json(data.items.map(font => ({
    family: font.family,
    variants: font.variants,
    subsets: font.subsets,
    category: font.category  // 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace'
  })));
});

// GET /api/fonts/css?family=...
router.get('/css', async (req, res) => {
  // Proxy font CSS with proper CORS headers
  const family = req.query.family;
  const response = await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}`);
  const css = await response.text();
  res.type('text/css').send(css);
});
```

### Compiler Pipeline

The compiler transforms project data into executable Manim Python code.

#### Compiler Entry (`services/api/src/compiler/index.js`)

Orchestrates the compilation process:

```javascript
async function compileProject(project) {
  // 1. Validate
  const validated = await validator.validate(project);
  
  // 2. Normalize
  const normalized = await normalizer.normalize(validated);
  
  // 3. Generate code
  const pythonCode = await codegen.generate(normalized);
  
  return pythonCode;
}
```

#### Validator (`services/api/src/compiler/validator.js`)

Zod schema validation:

```javascript
const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  sceneDuration: z.number().positive().max(300),  // Max 5 minutes
  
  stage: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
  }),
  
  objects: z.array(objectSchema),
  tracks: z.array(trackSchema),
  assets: z.array(assetSchema)
});

const objectSchema = z.object({
  id: z.string(),
  type: z.enum([
    'rectangle', 'square', 'circle', 'ellipse', 'triangle',
    'star', 'polygon', 'line', 'arrow', 'heart',
    'dot', 'dot_grid', 'text', 'image', 'svg_asset',
    'latex', 'axes'
  ]),
  name: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().default(0),
  fill: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  stroke: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  strokeWidth: z.number().min(0),
  opacity: z.number().min(0).max(1)
});

const clipSchema = z.object({
  id: z.string(),
  type: z.enum(['transform', 'move', 'scale', 'fade', 'rotate']),
  startTime: z.number().nonnegative(),
  duration: z.number().positive(),
  easing: z.string(),
  sourceId: z.string().optional(),
  targetId: z.string().optional()
});
```

#### Normalizer (`services/api/src/compiler/normalizer.js`)

Data transformation for code generation:

```javascript
function normalize(project) {
  return {
    ...project,
    
    // Ensure all objects have unique IDs
    objects: project.objects.map(normalizeObject),
    
    // Sort clips by start time
    tracks: project.tracks.map(track => ({
      ...track,
      clips: track.clips
        .map(normalizeClip)
        .sort((a, b) => a.startTime - b.startTime)
    })),
    
    // Convert relative paths to absolute
    assets: project.assets.map(normalizeAsset)
  };
}

function normalizeObject(obj) {
  return {
    ...obj,
    // Default values
    rotation: obj.rotation || 0,
    opacity: obj.opacity ?? 1,
    strokeWidth: obj.strokeWidth || 0,
    
    // Normalize colors to hex
    fill: normalizeColor(obj.fill),
    stroke: normalizeColor(obj.stroke)
  };
}
```

#### Code Generator (`services/api/src/compiler/codegen.js`)

**454 lines** generating Manim Python code:

```javascript
function generate(project) {
  const lines = [];
  
  // Imports
  lines.push('from manim import *');
  lines.push('');
  
  // Scene class
  lines.push('class MainScene(Scene):');
  lines.push('    def construct(self):');
  
  // Background
  lines.push(`        self.camera.background_color = "${project.stage.backgroundColor}"`);
  lines.push('');
  
  // Object creation
  const objectVars = new Map();
  for (const obj of project.objects) {
    const varName = sanitizeName(obj.name);
    objectVars.set(obj.id, varName);
    lines.push(...generateObjectCreation(obj, varName));
  }
  
  // Initial positions and add
  lines.push('');
  for (const obj of project.objects) {
    const varName = objectVars.get(obj.id);
    lines.push(...generateInitialPlacement(obj, varName));
  }
  
  // Animation timeline
  lines.push('');
  lines.push(...generateTimeline(project, objectVars));
  
  return lines.join('\n');
}

function generateObjectCreation(obj, varName) {
  switch (obj.type) {
    case 'circle':
      return [
        `        ${varName} = Circle(`,
        `            radius=${obj.width / 200},`,  // Convert pixels to Manim units
        `            color="${obj.fill}",`,
        `            fill_opacity=${obj.opacity}`,
        `        )`
      ];
      
    case 'square':
      return [
        `        ${varName} = Square(`,
        `            side_length=${obj.width / 100},`,
        `            color="${obj.fill}",`,
        `            fill_opacity=${obj.opacity}`,
        `        )`
      ];
      
    case 'text':
      return [
        `        ${varName} = Text(`,
        `            "${escapeString(obj.text)}",`,
        `            font="${obj.fontFamily}",`,
        `            font_size=${obj.fontSize},`,
        `            color="${obj.fill}",`,
        `        )`
      ];
      
    case 'image':
      return [
        `        ${varName} = ImageMobject(`,
        `            "${obj.assetPath}",`,
        `        )`,
        `        ${varName}.set_opacity(${obj.opacity})`
      ];
      
    case 'svg':
      return [
        `        ${varName} = SVGMobject(`,
        `            "${obj.assetPath}",`,
        `            fill_color="${obj.fill}",`,
        `            fill_opacity=${obj.opacity},`,
        `        )`
      ];
      
    default:
      // Custom shapes as polygons
      return generatePolygon(obj, varName);
  }
}

function generateTimeline(project, objectVars) {
  const lines = [];
  
  // Collect all clips sorted by start time
  const allClips = project.tracks
    .flatMap(t => t.clips)
    .sort((a, b) => a.startTime - b.startTime);
  
  let currentTime = 0;
  
  for (const clip of allClips) {
    // Wait until clip start time
    if (clip.startTime > currentTime) {
      const waitDuration = clip.startTime - currentTime;
      lines.push(`        self.wait(${waitDuration.toFixed(2)})`);
      currentTime = clip.startTime;
    }
    
    // Generate animation
    lines.push(...generateAnimation(clip, objectVars));
    currentTime += clip.duration;
  }
  
  return lines;
}

function generateAnimation(clip, objectVars) {
  const sourceVar = objectVars.get(clip.sourceId);
  const rateFunc = getRateFunction(clip.easing);
  
  switch (clip.type) {
    case 'transform': {
      const targetVar = objectVars.get(clip.targetId);
      return [
        `        self.play(`,
        `            Transform(${sourceVar}, ${targetVar}),`,
        `            run_time=${clip.duration.toFixed(2)},`,
        `            rate_func=${rateFunc}`,
        `        )`
      ];
    }
      
    case 'move': {
      const { x, y } = clip.params;
      // Convert pixels to Manim units (origin-centered)
      const manimX = (x - 960) / 100;  // Assuming 1920x1080
      const manimY = -(y - 540) / 100;  // Y is inverted in Manim
      return [
        `        self.play(`,
        `            ${sourceVar}.animate.shift(RIGHT * ${manimX} + UP * ${manimY}),`,
        `            run_time=${clip.duration.toFixed(2)},`,
        `            rate_func=${rateFunc}`,
        `        )`
      ];
    }
      
    case 'scale':
      return [
        `        self.play(`,
        `            ${sourceVar}.animate.scale(${clip.params.scale}),`,
        `            run_time=${clip.duration.toFixed(2)},`,
        `            rate_func=${rateFunc}`,
        `        )`
      ];
      
    case 'fade': {
      if (clip.params.opacity === 0) {
        return [
          `        self.play(`,
          `            FadeOut(${sourceVar}),`,
          `            run_time=${clip.duration.toFixed(2)},`,
          `            rate_func=${rateFunc}`,
          `        )`
        ];
      } else {
        return [
          `        self.play(`,
          `            FadeIn(${sourceVar}),`,
          `            run_time=${clip.duration.toFixed(2)},`,
          `            rate_func=${rateFunc}`,
          `        )`
        ];
      }
    }
      
    case 'rotate':
      return [
        `        self.play(`,
        `            ${sourceVar}.animate.rotate(${clip.params.rotation * Math.PI / 180}),`,
        `            run_time=${clip.duration.toFixed(2)},`,
        `            rate_func=${rateFunc}`,
        `        )`
      ];
  }
}

function getRateFunction(easing) {
  const mapping = {
    linear: 'rate_functions.linear',
    ease_in: 'rate_functions.ease_in_cubic',
    ease_out: 'rate_functions.ease_out_cubic',
    ease_in_out: 'rate_functions.ease_in_out_cubic',
    cubic_in: 'rate_functions.ease_in_cubic',
    cubic_out: 'rate_functions.ease_out_cubic',
    cubic_in_out: 'rate_functions.ease_in_out_cubic',
    quart_in: 'rate_functions.ease_in_quart',
    quart_out: 'rate_functions.ease_out_quart',
    quart_in_out: 'rate_functions.ease_in_out_quart',
    back_in: 'rate_functions.ease_in_back',
    back_out: 'rate_functions.ease_out_back',
    back_in_out: 'rate_functions.ease_in_out_back',
    elastic_in: 'rate_functions.elastic_in',
    elastic_out: 'rate_functions.elastic_out',
    bounce_out: 'rate_functions.bounce_out',
    bounce_in: 'rate_functions.bounce_in',
    spring: 'rate_functions.overshoot'  // Approximation
  };
  return mapping[easing] || 'rate_functions.linear';
}
```

### Job Queue (`services/api/src/queue.js`)

Redis-based job queue for render tasks:

```javascript
const Queue = require('bull');

const renderQueue = new Queue('renders', REDIS_URL);

// Create job
async function createRenderJob(data) {
  const job = await renderQueue.add(data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
  return job;
}

// Get job status
async function getJobStatus(jobId) {
  const job = await renderQueue.getJob(jobId);
  if (!job) return null;
  
  const state = await job.getState();
  const progress = job.progress();
  
  return {
    id: job.id,
    status: state,
    progress,
    result: job.returnvalue,
    error: job.failedReason
  };
}
```

---

## Renderer Service

### Worker (`services/renderer/worker.py`)

**212 lines** Python worker polling Redis and rendering with Manim:

```python
import os
import time
import json
import subprocess
import redis
from pathlib import Path

# Configuration
DATA_DIR = os.environ.get('DATA_DIR', '/data')
REDIS_URL = os.environ.get('REDIS_URL', 'redis://redis:6379')

# Quality settings
QUALITY_SETTINGS = {
    'low': {'flag': '-ql', 'resolution': '854x480', 'fps': 15},
    'medium': {'flag': '-qm', 'resolution': '1280x720', 'fps': 30},
    'high': {'flag': '-qh', 'resolution': '1920x1080', 'fps': 60},
    '4k': {'flag': '-qk', 'resolution': '3840x2160', 'fps': 60}
}

def connect_redis():
    """Connect to Redis with retry logic."""
    while True:
        try:
            r = redis.from_url(REDIS_URL, decode_responses=True)
            r.ping()
            print(f"Connected to Redis at {REDIS_URL}")
            return r
        except redis.ConnectionError:
            print("Redis not available, retrying in 2s...")
            time.sleep(2)

def poll_for_jobs(redis_client):
    """Poll Redis for render jobs."""
    while True:
        try:
            # BLPOP blocks until job available
            result = redis_client.blpop('render_queue', timeout=5)
            
            if result:
                _, job_json = result
                job = json.loads(job_json)
                process_job(redis_client, job)
            else:
                # No jobs, continue polling
                pass
                
        except Exception as e:
            print(f"Error polling for jobs: {e}")
            time.sleep(1)

def process_job(redis_client, job):
    """Process a single render job."""
    job_id = job['jobId']
    project_id = job['projectId']
    quality = job.get('quality', 'high')
    scene_file = job['sceneFile']
    
    print(f"Processing job {job_id}: project {project_id} at {quality} quality")
    
    # Update status
    update_job_status(redis_client, job_id, 'active', 0)
    
    try:
        # Get quality settings
        settings = QUALITY_SETTINGS.get(quality, QUALITY_SETTINGS['high'])
        
        # Run manim command
        cmd = [
            'manim',
            settings['flag'],
            '--fps', str(settings['fps']),
            '--output_file', f'{project_id}_{quality}',
            scene_file,
            'MainScene'
        ]
        
        print(f"Running: {' '.join(cmd)}")
        
        # Execute with progress monitoring
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Monitor output for progress
        for line in process.stdout:
            print(line.strip())
            
            # Parse progress (e.g., "Animation 1:  45%")
            if '%' in line:
                try:
                    progress = int(line.split('%')[0].split()[-1])
                    update_job_status(redis_client, job_id, 'active', progress)
                except:
                    pass
        
        # Wait for completion
        returncode = process.wait()
        
        if returncode != 0:
            stderr = process.stderr.read()
            raise Exception(f"Manim failed with code {returncode}: {stderr}")
        
        # Find output video
        output_dir = Path(DATA_DIR) / 'renders' / project_id
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Manim outputs to media/videos/... by default
        source_video = find_rendered_video(project_id, quality)
        target_video = output_dir / f'{quality}.mp4'
        
        # Move to final location
        os.rename(source_video, target_video)
        
        # Update job status
        update_job_status(
            redis_client, 
            job_id, 
            'completed', 
            100,
            {'output': str(target_video)}
        )
        
        print(f"Job {job_id} completed: {target_video}")
        
    except Exception as e:
        print(f"Job {job_id} failed: {e}")
        update_job_status(redis_client, job_id, 'failed', 0, {'error': str(e)})

def update_job_status(redis_client, job_id, status, progress, data=None):
    """Update job status in Redis."""
    job_data = {
        'status': status,
        'progress': progress,
        'updatedAt': time.time()
    }
    if data:
        job_data.update(data)
    
    redis_client.hset(f'job:{job_id}', mapping=job_data)

def find_rendered_video(project_id, quality):
    """Find the rendered video file."""
    # Manim outputs to media/videos/scene/quality/scene.mp4
    patterns = [
        f'/data/projects/{project_id}/media/videos/**/*.mp4',
        f'/data/media/**/*.mp4'
    ]
    
    for pattern in patterns:
        matches = list(Path('/').glob(pattern.lstrip('/')))
        if matches:
            return matches[0]
    
    raise FileNotFoundError("Rendered video not found")

if __name__ == '__main__':
    print("Starting Manim renderer worker...")
    redis_client = connect_redis()
    poll_for_jobs(redis_client)
```

### Dockerfile

```dockerfile
FROM manimcommunity/manim:stable

WORKDIR /app

# Install Python dependencies
RUN pip install redis

# Copy worker
COPY worker.py .

# Run worker
CMD ["python", "worker.py"]
```

---

## Docker Infrastructure

### Docker Compose (`docker-compose.yml`)

```yaml
services:
  # Initialize data directories
  init:
    image: alpine:3.19
    volumes:
      - manim_motion_data:/data
    command: >
      sh -c "mkdir -p /data/projects /data/assets /data/renders && 
             chmod -R 777 /data && 
             echo 'Data directories initialized'"
    restart: "no"

  # Redis job queue
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 3

  # Node.js API
  api:
    build: ./services/api
    environment:
      - NODE_ENV=development
      - DATA_DIR=/data
      - REDIS_URL=redis://redis:6379
      - PORT=3000
    volumes:
      - manim_motion_data:/data
    ports:
      - "3000:3000"
    depends_on:
      init:
        condition: service_completed_successfully
      redis:
        condition: service_healthy

  # Python render worker
  renderer:
    build: ./services/renderer
    environment:
      - DATA_DIR=/data
      - REDIS_URL=redis://redis:6379
    volumes:
      - manim_motion_data:/data
    depends_on:
      init:
        condition: service_completed_successfully
      redis:
        condition: service_healthy

  # Nginx web server + Vue SPA
  web:
    build: ./services/web
    ports:
      - "8080:80"
    depends_on:
      - api

volumes:
  manim_motion_data:
  redis_data:
```

### Web Service Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # API proxy
    location /api/ {
        proxy_pass http://api:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Handle large uploads
        client_max_body_size 50M;
    }

    # Static assets
    location /assets/ {
        proxy_pass http://api:3000/data/assets/;
    }

    location /renders/ {
        proxy_pass http://api:3000/data/renders/;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Data Models

### Project

```typescript
interface Project {
  id: string;                    // UUID
  name: string;                  // Display name
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  sceneDuration: number;         // Seconds (max 300)
  fps: number;                   // 60 default
  
  stage: {
    width: number;              // Default 1920
    height: number;             // Default 1080
    backgroundColor: string;    // Hex color
    showGrid: boolean;
    gridSize: number;           // Grid cell size
    snapToGrid: boolean;
  };
  
  objects: StageObject[];
  tracks: Track[];
  assets: Asset[];
}
```

### Stage Object

```typescript
interface StageObject {
  id: string;
  type: 'rectangle' | 'square' | 'circle' | 'ellipse' | 'triangle' |
        'star' | 'polygon' | 'line' | 'arrow' | 'heart' |
        'dot' | 'dot_grid' | 'text' | 'image' | 'svg_asset' |
        'latex' | 'axes';
  name: string;
  
  // Position (pixels, center origin)
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;  // Degrees
  
  // Style
  fill: string;      // Hex color
  stroke: string;    // Hex color
  strokeWidth: number;
  opacity: number;   // 0-1
  
  // Type-specific
  content?: string;        // For text objects
  fontFamily?: string;     // For text objects
  fontSize?: number;       // For text objects
  assetId?: string;        // For images/SVGs
  sides?: number;          // For polygon
  starArms?: number;       // For star
  innerRatio?: number;     // For star
  gridCols?: number;       // For dot_grid
  gridRows?: number;       // For dot_grid
  dotRadius?: number;      // For dot_grid
  dotSpacing?: number;     // For dot_grid
  latex?: string;          // For latex (e.g. "E = mc^2")
  xRange?: [number, number, number];  // For axes [min, max, step]
  yRange?: [number, number, number];  // For axes [min, max, step]
  
  // Z-order
  zOrder: number;
  
  // Lifecycle
  enterTime: number;       // When object appears
  duration: number;        // How long it stays
  enterAnim?: string;      // Animation type on enter
  exitAnim?: string;       // Animation type on exit
  enterAnimDur?: number;   // Entrance animation duration
  exitAnimDur?: number;    // Exit animation duration
}

interface Point {
  x: number;
  y: number;
}
```

### Animation Clip

```typescript
interface Clip {
  id: string;
  type: 'transform' | 'move' | 'scale' | 'fade' | 'rotate';
  startTime: number;       // Seconds from scene start
  duration: number;        // Animation duration
  
  // Easing
  easing: 'linear' | 'ease_in' | 'ease_out' | 'ease_in_out' |
          'cubic_in' | 'cubic_out' | 'cubic_in_out' |
          'quart_in' | 'quart_out' | 'quart_in_out' |
          'back_in' | 'back_out' | 'back_in_out' |
          'elastic_in' | 'elastic_out' |
          'bounce_in' | 'bounce_out' | 'spring';
  overshoot?: number;      // For back easing
  
  // Object references
  sourceId: string;        // Object to animate
  targetId?: string;       // For transform (morph target)
  
  // Animation parameters
  params: {
    // For 'move':
    x?: number;
    y?: number;
    
    // For 'scale':
    scale?: number;
    
    // For 'rotate':
    rotation?: number;
    
    // For 'fade':
    opacity?: number;
  };
  
  // Morph settings
  morphQuality?: 'low' | 'medium' | 'high' | 'ultra';
}
```

### Track

```typescript
interface Track {
  id: string;
  name: string;
  clips: Clip[];
}
```

### Asset

```typescript
interface Asset {
  id: string;
  name: string;
  type: 'image' | 'svg';
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  dataUrl?: string;        // Base64 for immediate preview
}
```

### Render Job

```typescript
interface RenderJob {
  id: string;
  projectId: string;
  quality: 'low' | 'medium' | 'high' | '4k';
  status: 'queued' | 'active' | 'completed' | 'failed';
  progress: number;        // 0-100
  output?: string;         // Path to MP4
  error?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## API Reference

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create new project |
| GET | `/api/projects/:id` | Get project by ID |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project + assets |
| POST | `/api/projects/:id/render` | Compile and render |

**Create Project:**
```json
POST /api/projects
{
  "name": "My Animation",
  "sceneDuration": 10
}
```

**Response:**
```json
{
  "id": "proj_abc123",
  "name": "My Animation",
  "sceneDuration": 10,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Start Render:**
```json
POST /api/projects/:id/render
{
  "quality": "high"  // low | medium | high | 4k
}
```

**Response:**
```json
{
  "jobId": "job_xyz789",
  "status": "queued"
}
```

### Assets

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/assets/:projectId` | Upload file (multipart) |
| POST | `/api/assets/:projectId/base64` | Upload base64 |
| GET | `/api/assets/:projectId/:filename` | Serve file |

**Multipart Upload:**
```bash
curl -X POST \
  -F "file=@image.png" \
  /api/assets/proj_abc123
```

**Base64 Upload:**
```json
POST /api/assets/proj_abc123/base64
{
  "filename": "image.png",
  "dataUrl": "data:image/png;base64,iVBORw0KGgo..."
}
```

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs/:jobId` | Get job status |

**Response:**
```json
{
  "id": "job_xyz789",
  "status": "active",
  "progress": 45,
  "output": null,
  "error": null,
  "createdAt": "2024-01-15T10:35:00Z",
  "updatedAt": "2024-01-15T10:36:30Z"
}
```

### Renders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/renders/:projectId/latest.mp4` | Stream latest render |
| GET | `/api/renders/:projectId/:quality.mp4` | Stream specific quality |

### Fonts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fonts/list` | Get Google Fonts list |
| GET | `/api/fonts/css?family=...` | Proxy font CSS |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:40:00Z"
}
```

---

## Development Guide

### Running Locally

**Full Stack (Docker):**
```bash
docker compose up --build
```

**Frontend Only:**
```bash
cd services/web
npm install
npm run dev
```

Access at http://localhost:5173

**Backend Only:**
```bash
cd services/api
npm install
npm run dev
```

Access at http://localhost:3000

### Environment Variables

**Web Service:**
- `VITE_API_URL` - API base URL (default: /api)

**API Service:**
- `NODE_ENV` - development | production
- `PORT` - Server port (default: 3000)
- `DATA_DIR` - Shared data volume (default: /data)
- `REDIS_URL` - Redis connection (default: redis://redis:6379)
- `GOOGLE_FONTS_API_KEY` - For font service

**Renderer Service:**
- `DATA_DIR` - Shared data volume (default: /data)
- `REDIS_URL` - Redis connection (default: redis://redis:6379)

### Adding New Shapes

1. **Add to Geometry Generator** (`services/web/src/engine/geometry.js`):
```javascript
export function generateNewShape(width, height, quality) {
  const points = [];
  // Your shape generation logic
  return points;
}
```

2. **Add to Shape Library** (`services/web/src/components/assets/AssetBrowser.vue`):
```vue
<button @click="addShape('new_shape')">
  New Shape
</button>
```

3. **Add to Code Generator** (`services/api/src/compiler/codegen.js`):
```javascript
case 'new_shape':
  return generatePolygon(obj, varName);
```

### Adding New Easing Functions

1. **Add to Easing Engine** (`services/web/src/engine/easing.js`):
```javascript
export const customEasing = (t, params = {}) => {
  // Your easing logic
  return modifiedT;
};
```

2. **Add to Easing Map** (`services/api/src/compiler/codegen.js`):
```javascript
custom_ease: 'rate_functions.custom_ease'
```

3. **Register in UI** (`services/web/src/constants/animations.js`):
```javascript
export const EASING_OPTIONS = [
  // ... existing options
  { value: 'custom_ease', label: 'Custom Ease' }
];
```

### Testing

**Unit Tests:**
```bash
cd services/web
npm test
```

**Test Coverage:**
- Easing functions
- Point resampling
- Timeline scheduling
- Clip blending
- Geometry generation

### Debugging

**View Logs:**
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f renderer
docker compose logs -f api
docker compose logs -f web
```

**Check Redis Queue:**
```bash
docker compose exec redis redis-cli
> LLEN render_queue
> LRANGE render_queue 0 -1
```

**Inspect Data Volume:**
```bash
docker run --rm -v manim_motion_manim_motion_data:/data alpine ls -la /data
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `V` | Select tool |
| `H` | Hand (pan) tool |
| `Delete` | Delete selected object/clip |
| `Escape` | Deselect all, close dialogs |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+C` | Copy selected objects |
| `Ctrl+V` | Paste copied objects |
| `Ctrl+S` | Save project |
| `Ctrl+G` | Group selected objects |
| `Shift+Click` | Multi-select |
| `Scroll` | Zoom canvas |

---

## Performance Considerations

### Frontend Optimization

- **Canvas Rendering**: Uses Konva.js with hardware acceleration
- **Animation Loop**: requestAnimationFrame with delta time
- **Point Caching**: Shape points cached until modified
- **Debounced Updates**: Store mutations batched
- **Lazy Loading**: Fonts loaded on-demand

### Backend Optimization

- **Static File Serving**: Nginx handles assets/renders
- **Redis Caching**: Font list cached for 1 hour
- **Job Queue**: Bull handles concurrent renders
- **File Streaming**: Videos streamed with proper headers

### Render Optimization

- **Quality Presets**: Appropriate settings for preview vs final
- **Parallel Processing**: Multiple render workers (scale horizontally)
- **Cleanup**: Old renders auto-deleted after 7 days

---

## Troubleshooting

### Common Issues

**Render Fails:**
- Check `docker compose logs renderer`
- Ensure scene.py is valid Python
- Verify assets exist in /data/assets/

**API Not Responding:**
- `curl http://localhost:3000/health`
- Check `docker compose ps`
- Verify Redis is running

**Assets Not Loading:**
- Check browser network tab
- Verify asset exists: `docker compose exec api ls /data/assets/`
- Check CORS headers

**Playback Stutters:**
- Reduce morph quality
- Close browser DevTools
- Use Chrome/Edge for best performance
- Lower FPS in settings

**Font Loading Fails:**
- Check Google Fonts API key
- Verify network connectivity
- Check browser console for CORS errors

---

## License

MIT

---

## Acknowledgments

- [Manim Community Edition](https://www.manim.community/) - Mathematical animation engine by 3Blue1Brown
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [Konva.js](https://konvajs.org/) - 2D canvas library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Redis](https://redis.io/) - In-memory data store
- [Docker](https://www.docker.com/) - Containerization platform

---

## File Statistics

| Component | Lines of Code | Files |
|-----------|--------------|-------|
| **Frontend (Web)** | ~5,800 | 35 |
| ├─ Core App | ~250 | 3 |
| ├─ Store | ~960 | 1 |
| ├─ Engine | ~1,400 | 5 |
| ├─ Export | ~800 | 1 |
| ├─ Components | ~2,400 | 25 |
| **Backend (API)** | ~1,700 | 12 |
| ├─ Routes | ~800 | 5 |
| ├─ Compiler | ~750 | 4 |
| **Renderer** | ~210 | 1 |
| **Documentation** | ~3,500 | 3 |
| **TOTAL** | **~11,200** | **51** |

---

*Last updated: February 21, 2026*
