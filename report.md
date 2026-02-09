# Manim Motion Editor — Comprehensive Analysis & Improvement Report

> **Date:** February 8, 2026  
> **Scope:** Full codebase audit, Manim CE capability analysis, community research  
> **Goal:** Identify every opportunity to improve, extend, and align this editor with what users actually need

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Architecture Overview](#2-current-architecture-overview)
3. [What the Editor Can Do Today](#3-what-the-editor-can-do-today)
4. [What Manim CE Can Do (That the Editor Cannot)](#4-what-manim-ce-can-do-that-the-editor-cannot)
5. [What the Community Wants](#5-what-the-community-wants)
6. [Gap Analysis: Editor vs. Manim vs. User Needs](#6-gap-analysis-editor-vs-manim-vs-user-needs)
7. [Recommended Improvements — Priority Tiers](#7-recommended-improvements--priority-tiers)
8. [UX & Design Improvements](#8-ux--design-improvements)
9. [Technical Debt & Code Quality](#9-technical-debt--code-quality)
10. [Competitive Landscape](#10-competitive-landscape)
11. [Roadmap Suggestion](#11-roadmap-suggestion)

---

## 1. Executive Summary

**Manim Motion Editor** is a Figma-like browser-based animation editor that generates Manim CE Python code and renders HQ video via Docker. It fills a massive gap in the Manim ecosystem — the community has been asking for a visual editor for years, and no existing tool provides true drag-and-drop animation creation with Manim rendering.

### Strengths
- Visually polished dark-theme UI with a professional feel
- Full Docker stack (web, API, renderer, Redis queue) — one-command setup
- Real-time 60fps preview with morph interpolation
- Bidirectional code view (generate code from canvas, parse code back to canvas)
- 15 shape types, 17 easing functions, 11 entrance + 9 exit animations
- Multi-track timeline with draggable, resizable clips
- Server-side Manim rendering with progress tracking and video download

### Key Gaps
- **No LaTeX/math support** — the #1 reason people use Manim
- **No undo/redo** — critical for any editor
- **No keyframe animation** — only clip-based; no per-property keyframes
- **No camera controls** — zoom, pan, focus animations are core Manim features
- **No graph/plot/coordinate system support** — the second most popular Manim use case
- **No audio/voiceover support** — a top community request
- **No 3D scene support** — Manim's ThreeDScene is heavily used
- **No templates or presets** — users need starting points
- **Limited text capabilities** — no LaTeX, no letter-by-letter animation, no MathTex

---

## 2. Current Architecture Overview

```
Browser (localhost:8080)
  ├── Vue 2.7 + Konva.js SPA
  │   ├── Stage Canvas — drag/drop shapes, transform handles, morph preview
  │   ├── Properties Panel — object/clip editing, colors, animations
  │   ├── Timeline — multi-track with draggable clips, playback controls
  │   ├── Asset Sidebar — shapes, images, SVGs, transform creation
  │   ├── Playback Engine — 60fps rAF loop with sub-frame interpolation
  │   └── Manim Exporter — client-side .py generation + bidirectional parser
  │
  ├── /api/ → Node.js + Express (port 3000)
  │   ├── Project CRUD (JSON on shared Docker volume)
  │   ├── Asset upload (multipart + base64)
  │   ├── Compiler pipeline: Validate (Zod) → Normalize → Codegen
  │   └── Render trigger → Redis queue
  │
  ├── Redis 7 (job queue)
  │
  └── Manim Renderer (Python worker)
      ├── Polls Redis for jobs
      ├── Runs: manim -qh scene.py MainScene
      └── Outputs MP4 to shared volume
```

### Data Model
- **Project**: id, name, stage, objects[], tracks[], assets[], groups[], sceneDuration
- **Object**: 15 types with position, size, rotation, fill, stroke, opacity, enter/exit animations, z-order
- **Clip types**: transform (morph), move, scale, fade, rotate
- **Easing**: 17 functions including elastic, bounce, spring, back variants

### File Counts
| Layer | Files | Lines (approx.) |
|-------|-------|-----------------|
| Engine (geometry, easing, transform, playback, blending) | 5 | ~1,100 |
| Export/Parser (manim.js) | 1 | ~680 |
| Store (project.js) | 1 | ~890 |
| Components (Vue SPA) | 23 | ~2,800 |
| API (routes, compiler, queue) | 8 | ~750 |
| Renderer (worker.py) | 1 | ~200 |
| **Total** | **~39** | **~6,400** |

---

## 3. What the Editor Can Do Today

### Shapes (15 types)
| Shape | Canvas Preview | Manim Codegen | Parser Support |
|-------|:---:|:---:|:---:|
| Rectangle | Yes | Yes | Yes |
| Square | Yes | Yes | Yes |
| Circle | Yes | Yes | Yes |
| Ellipse | Yes | Yes | Yes |
| Triangle | Yes | Yes | Yes |
| Star (configurable arms/ratio) | Yes | Yes | Yes |
| Polygon (configurable sides) | Yes | Yes | Yes |
| Line | Yes | Yes | No |
| Arrow | Yes | Yes | No |
| Heart (parametric) | Yes | Yes | Yes |
| Dot | Yes | Yes | Yes |
| Dot Grid (5x5 configurable) | Yes | Yes | No |
| Text (editable) | Yes | Yes | Yes |
| Image (PNG/JPEG upload) | Yes | Yes | Yes |
| SVG (vector upload) | Yes | Yes | Yes |

### Animations
- **Entrance** (11): none, fade_in, grow_in, fly_in (4 directions), draw, write, spin_in, bounce_in
- **Exit** (9): none, fade_out, shrink_out, fly_out (4 directions), uncreate, spin_out
- **Timeline clips** (5): transform/morph, move, scale, fade, rotate
- **Easing** (17): linear, quad, cubic, quart, back, elastic, bounce, spring variants

### Editor Features
- Drag-and-drop from sidebar to canvas
- Multi-select (Shift+Click)
- Transform handles (resize, rotate)
- Grid with configurable divisions, color, opacity
- Snap to grid and center
- 3x3 alignment anchor grid
- Object grouping (Ctrl+G)
- Zoom and pan
- Keyboard shortcuts (Space, V, H, Delete, Ctrl+S, Escape)
- Object list in properties panel

### Code Features
- Real-time Manim Python code generation (live code view)
- Bidirectional: edit code → apply to canvas
- Export .py download
- Copy code to clipboard

### Server Features
- Docker one-command setup
- Project CRUD via REST API
- Asset upload (multipart + base64)
- Zod-validated compile pipeline
- Redis-queued rendering (480p–4K)
- Render progress polling
- Video preview + MP4 download
- Server project browser with delete

---

## 4. What Manim CE Can Do (That the Editor Cannot)

This is the critical gap. Manim CE (v0.19.x) supports a vast range of features that the editor currently has no way to create visually:

### LaTeX & Mathematical Text
| Manim Feature | Editor Support |
|---------------|:-:|
| `MathTex` — LaTeX formula rendering | **None** |
| `Tex` — general LaTeX rendering | **None** |
| `Text` — styled text with fonts | Partial (basic only) |
| `MarkupText` — Pango markup text | **None** |
| `Title`, `BulletedList` | **None** |
| `DecimalNumber`, `Integer`, `Variable` | **None** |
| Letter-by-letter text animation (`AddTextLetterByLetter`) | **None** |
| Word-by-word text animation (`AddTextWordByWord`) | **None** |
| `TypeWithCursor` / `UntypeWithCursor` | **None** |
| Formula transformation (`TransformMatchingTex`) | **None** |

### Graphing & Coordinate Systems
| Manim Feature | Editor Support |
|---------------|:-:|
| `Axes` — 2D coordinate system | **None** |
| `NumberPlane` — grid coordinate plane | **None** |
| `NumberLine` — 1D number line | **None** |
| `PolarPlane` — polar coordinates | **None** |
| `ComplexPlane` — complex number plane | **None** |
| `BarChart` — bar graphs | **None** |
| Function plotting (`plot()`, `plot_parametric_curve()`) | **None** |
| `get_area()` — shaded regions under curves | **None** |
| Dynamic axis range animation | **None** |

### Camera & Scene Control
| Manim Feature | Editor Support |
|---------------|:-:|
| `MovingCamera` — animated camera movement | **None** |
| `MovingCameraScene` — camera pan/zoom | **None** |
| `ThreeDCamera` / `ThreeDScene` — 3D | **None** |
| Camera frame zoom to object | **None** |
| Background color animation | **None** |
| Scene sections (for Manim Editor presentations) | **None** |

### Advanced Animations
| Manim Feature | Editor Support |
|---------------|:-:|
| `AnimationGroup` — parallel animations | **None** |
| `LaggedStart` / `LaggedStartMap` — staggered animations | **None** |
| `Succession` — sequential animation chains | **None** |
| `DrawBorderThenFill` | **None** |
| `ShowPassingFlash` | **None** |
| `Indicate`, `Flash`, `Circumscribe` — attention animations | **None** |
| `MoveAlongPath` — path-based motion | **None** |
| `Wiggle`, `ApplyWave` | **None** |
| `ValueTracker` — reactive animated values | **None** |
| `always_redraw` — dynamic updating | **None** |
| `Updater` functions | **None** |

### Advanced Objects
| Manim Feature | Editor Support |
|---------------|:-:|
| `VGroup` — complex vector groups | Partial (basic groups) |
| `BraceBetweenPoints` / `Brace` | **None** |
| `ArcBetweenPoints`, `CurvedArrow` | **None** |
| `DashedLine`, `DashedVMobject` | **None** |
| `Angle`, `RightAngle` | **None** |
| `SurroundingRectangle` | **None** |
| `Table` — data tables | **None** |
| `Matrix` / `IntegerMatrix` | **None** |
| `Code` — syntax-highlighted code blocks | **None** |
| `NumberLine` with labels | **None** |

---

## 5. What the Community Wants

Based on research across GitHub Discussions, Issues, Reddit, and the broader Manim community:

### Top 10 Community Requests (Ranked by Frequency)

1. **Interactive/real-time preview** — Users are tired of write-render-review cycles. They want to see changes instantly. *The editor already addresses this, which is a huge advantage.*

2. **LaTeX/math formula support** — This is the #1 reason people use Manim. An editor without LaTeX support misses the primary audience.

3. **Voiceover/audio sync** — `manim-voiceover` is a popular plugin. Users want to sync animations to narration, add background music, and control timing via audio cues.

4. **Graph and plot creation** — Coordinate systems, function plots, and number lines are the second most common Manim use case after text/formulas.

5. **Camera animations** — Zoom to detail, pan across scenes, and focus animations are heavily used in educational content.

6. **Checkpoint/state management** — Users want to jump to any point in their animation without re-rendering from the start. The editor's timeline scrubbing partially addresses this.

7. **Template library** — Beginners want starting points. "Explain a theorem," "show a graph transformation," "introduce a formula" — pre-built scene templates would dramatically lower the barrier.

8. **Undo/redo** — Every serious editor needs this. It's conspicuously absent.

9. **Path animation / motion paths** — Moving objects along curves (Bezier, arc, custom path) rather than just point-to-point.

10. **Collaboration / sharing** — Share projects via URL, export to different formats, embed in presentations.

### Pain Points Users Report

- **Slow render cycles** — Fixed by the editor's live preview
- **Steep learning curve** — Fixed by visual drag-and-drop
- **Coordinate system confusion** — Manim's coordinate space vs. pixel space is confusing; the editor abstracts this nicely
- **Asset management** — Placing images correctly in Manim is tedious; the editor handles this well
- **Animation sequencing** — Getting timing right between multiple animations is trial-and-error; the timeline helps enormously

---

## 6. Gap Analysis: Editor vs. Manim vs. User Needs

| Capability | Manim CE | Editor | User Priority |
|-----------|:---:|:---:|:---:|
| Basic shapes (rect, circle, etc.) | Yes | Yes | Medium |
| Text with fonts | Yes | Yes | Medium |
| **LaTeX / MathTex** | Yes | **No** | **Critical** |
| **Graphs / Axes / NumberLine** | Yes | **No** | **Critical** |
| Transform morphing | Yes | Yes | High |
| Entrance/exit animations | Yes | Yes | High |
| **Camera movement** | Yes | **No** | **High** |
| **Audio / voiceover** | Plugin | **No** | **High** |
| Image/SVG assets | Yes | Yes | Medium |
| Multi-track timeline | N/A | Yes | High |
| Live preview | Partial | Yes | Critical |
| **Undo/redo** | N/A | **No** | **Critical** |
| **Keyframe animation** | N/A | **No** | **High** |
| **Path animation** | Yes | **No** | **High** |
| **Templates / presets** | No | **No** | **High** |
| **Color gradient** | Yes | **No** | **Medium** |
| **Attention animations** | Yes | **No** | **Medium** |
| **3D scenes** | Yes | **No** | **Medium** |
| **AnimationGroup / LaggedStart** | Yes | **No** | **Medium** |
| Copy/paste objects | N/A | **No** | **High** |
| Object locking | N/A | **No** | **Medium** |
| Rulers / guides | N/A | **No** | **Medium** |
| Export GIF / WebM | Manim | **No** | **Medium** |

---

## 7. Recommended Improvements — Priority Tiers

### Tier 1: Critical (Do These First)

#### 1.1 Undo/Redo System
- **Impact:** Foundational for any serious editor
- **Approach:** Command pattern with action stack; store snapshots of project state or diff-based undo
- **Scope:** Every action in `actions.*` needs to push to the undo stack
- **Effort:** Medium
- **Keyboard:** Ctrl+Z / Ctrl+Shift+Z

#### 1.2 LaTeX / MathTex Support
- **Impact:** Unlocks the #1 Manim use case
- **Approach:** 
  - Add a "LaTeX" shape type in the sidebar
  - User types LaTeX in properties panel (e.g., `E = mc^2`)
  - Client-side preview using KaTeX or MathJax (render to SVG in browser)
  - Manim codegen emits `MathTex("E = mc^2")`
  - Support `TransformMatchingTex` for formula transformations
- **Data model:** New object type `latex` with `content`, `fontSize`, `color` properties
- **Effort:** Medium-High

#### 1.3 Copy / Paste / Duplicate Objects
- **Impact:** Basic editor operation everyone expects
- **Approach:** Ctrl+C/Ctrl+V/Ctrl+D with position offset
- **Scope:** Objects, clips, and groups
- **Effort:** Low

#### 1.4 Graph / Coordinate System Support
- **Impact:** Unlocks the #2 Manim use case
- **Approach:**
  - New object types: `axes`, `number_line`, `number_plane`
  - Configurable range, labels, tick marks
  - "Add Function" button to plot `f(x)` expressions
  - Properties panel: x_range, y_range, axis labels, grid on/off
  - Manim codegen: `Axes(x_range=[-3,3], y_range=[-2,2])`, `axes.plot(lambda x: x**2)`
- **Effort:** High

#### 1.5 Improved Text Capabilities
- **Impact:** Text is in every animation
- **Additions needed:**
  - Letter-by-letter entrance animation (preview + codegen for `AddTextLetterByLetter`)
  - Word-by-word entrance animation
  - TypeWriter effect (maps to `TypeWithCursor`)
  - Multi-line text with line spacing
  - Text color per-character (rich text)
  - Inline code view for text content
- **Effort:** Medium

---

### Tier 2: High Priority

#### 2.1 Keyframe Animation System
- **Impact:** Industry standard for animation; replaces the current clip-only model
- **Approach:**
  - Per-property keyframes on the timeline (x, y, width, height, rotation, opacity, fill, etc.)
  - Diamond markers on timeline tracks
  - Bezier curve easing between keyframes (visual curve editor)
  - Auto-key mode: changes to properties auto-create keyframes at playhead position
- **Effort:** High (requires timeline refactor)

#### 2.2 Camera / Viewport Animations
- **Impact:** Core storytelling tool for educational content
- **Approach:**
  - Virtual camera object on the timeline
  - Camera zoom, pan, and focus keyframes
  - "Focus on object" action (zoom camera to selected object)
  - Manim codegen: `self.camera.frame.animate.move_to(obj).set(width=8)`
- **Preview:** Apply camera transform to the stage viewport during playback
- **Effort:** Medium-High

#### 2.3 Path Animation / Motion Paths
- **Impact:** Objects moving along curves is extremely common
- **Approach:**
  - New clip type: `path`
  - Visual path editor: click to add control points, drag Bezier handles
  - Show path as a dotted line on stage during editing
  - Manim codegen: `MoveAlongPath(obj, path)`
- **Effort:** Medium-High

#### 2.4 Audio / Voiceover Track
- **Impact:** Top community request for educational content
- **Approach:**
  - Audio track in timeline (waveform visualization)
  - Upload audio files (MP3, WAV)
  - Snap animation clips to audio markers/bookmarks
  - Manim codegen: uses `manim-voiceover` plugin or manual audio overlay
  - Optional TTS integration (API endpoint)
- **Effort:** High

#### 2.5 Template Library
- **Impact:** Dramatically lowers barrier for new users
- **Examples:**
  - "Theorem Proof" — title, statement, proof steps with sequential reveal
  - "Function Graph" — axes, function plot, area highlight
  - "Shape Transform" — two shapes with morph animation
  - "Comparison" — side-by-side objects with labels
  - "Title Card" — animated title with subtitle
  - "Number Line" — point moving along a number line
  - "Matrix Operation" — matrix multiplication visualization
- **Approach:** Pre-built project JSON files loaded from a gallery
- **Effort:** Medium

#### 2.6 Animation Composition (Parallel & Staggered)
- **Impact:** Users need simultaneous and staggered animations constantly
- **Approach:**
  - Allow overlapping clips on the same track (run in parallel)
  - "Stagger" option: automatically offset clips by a configurable delay
  - Manim codegen: `AnimationGroup()`, `LaggedStart()`, `Succession()`
- **Effort:** Medium

---

### Tier 3: Important (Quality of Life)

#### 3.1 Object Locking & Visibility Toggle
- Lock objects to prevent accidental moves
- Hide objects temporarily without deleting them
- Eye icon and lock icon in timeline object bars

#### 3.2 Rulers, Guides, and Smart Snapping
- Pixel rulers along edges (showing Manim coordinate equivalents)
- Draggable guide lines (horizontal/vertical)
- Smart snap lines between objects (alignment helpers)
- Distance indicators when dragging

#### 3.3 Color Gradient Support
- Linear and radial gradients for fills
- Gradient animation (color sweep)
- Manim codegen: `color=color_gradient([RED, BLUE], length)`

#### 3.4 Attention / Emphasis Animations
- New clip types: `indicate`, `flash`, `circumscribe`, `wiggle`
- Preview: brief scale-up + highlight
- Manim codegen: `Indicate(obj)`, `Flash(obj)`, `Circumscribe(obj)`

#### 3.5 Dashed / Styled Lines
- Dash pattern control for lines, arrows, shapes
- Line cap styles (round, butt, square)
- Manim codegen: `DashedLine()`, `DashedVMobject()`

#### 3.6 Export Format Options
- Export as GIF (via API: `manim --format gif`)
- Export as WebM
- Export as PNG sequence
- Export as Lottie JSON (for web embedding)
- Configurable FPS and resolution in export dialog

#### 3.7 Scene Sections / Chapters
- Mark points in the timeline as section boundaries
- Name each section
- Maps to Manim's `self.next_section("name")`
- Enables Manim Editor presentation export

#### 3.8 Brace, Angle, and Annotation Objects
- New shape types: `brace`, `angle`, `right_angle`, `surrounding_rectangle`
- Connects to other objects dynamically
- Very common in math education content

#### 3.9 Table / Matrix Objects
- Structured data display object
- Configurable rows, columns, cell content
- Maps to Manim's `Table`, `Matrix`, `IntegerMatrix`

---

### Tier 4: Nice to Have

#### 4.1 3D Scene Support
- ThreeDScene toggle
- 3D primitives: Sphere, Cube, Cylinder, Cone, Surface
- 3D camera controls (phi, theta, focal distance)
- Manim codegen: `ThreeDScene`, `ThreeDCamera`
- This is a massive undertaking — consider a separate editor mode

#### 4.2 Code Block Object
- Syntax-highlighted code display
- Maps to Manim's `Code` class
- Configurable language, theme, font size

#### 4.3 Real-Time Collaboration
- WebSocket-based multi-user editing
- Cursor presence indicators
- Conflict resolution

#### 4.4 Plugin System
- Allow community-contributed shape types, animations, and templates
- Plugin API for extending the sidebar and properties panel

#### 4.5 AI-Assisted Animation
- "Describe your animation" prompt
- AI generates project JSON or Manim code
- Natural language to timeline clips

---

## 8. UX & Design Improvements

### 8.1 Critical UX Fixes

| Issue | Current State | Recommended Fix |
|-------|--------------|-----------------|
| **No undo/redo** | Users can't recover from mistakes | Command pattern undo stack (Tier 1) |
| **No copy/paste** | Must recreate objects from scratch | Ctrl+C/V/D support |
| **No multi-select drag** | Can multi-select but not drag together | Group drag for multi-selection |
| **Timeline scrub precision** | Time display shows 1 decimal | Add frame-level precision, snap to clip edges |
| **No onboarding** | Empty canvas with minimal hint | Interactive tutorial overlay for first-time users |
| **Tiny click targets** | Some buttons/controls are very small (8-9px text) | Minimum 10px text, 28px touch targets |
| **No confirmation on destructive actions** | Delete object has no undo | With undo, this becomes safe; without it, add confirmation |
| **Text editing** | Must use properties panel | Double-click for inline editing on canvas |
| **Clip overlap** | No visual warning for overlapping clips | Color-code conflicts, show overlap indicator |

### 8.2 UX Enhancements

- **Contextual toolbar**: Show relevant actions near the selection (like Figma's floating toolbar)
- **Mini-map**: Small overview of the full canvas when zoomed in
- **Object search**: Find objects by name when the project gets complex
- **Keyboard shortcut cheat sheet**: `?` key to show all shortcuts
- **Drag selection box**: Click-drag on empty canvas to box-select multiple objects
- **Snapping feedback**: Show snap lines and distance while dragging
- **Animation preview thumbnail**: Hover over a clip to see a mini-preview
- **Recent colors palette**: Remember last 10 used colors
- **Numeric input scrubbing**: Click-drag on number inputs to scrub values (like After Effects)
- **Right-click context menu**: Cut, copy, paste, duplicate, group, align, bring to front/back
- **Auto-save**: Periodic auto-save to localStorage with recovery prompt

### 8.3 Accessibility
- Keyboard navigation for all panels
- Focus indicators for interactive elements
- ARIA labels on icon-only buttons
- Color contrast: ensure all text meets WCAG AA minimum (4.5:1 ratio)
- Screen reader support for the object list and timeline

---

## 9. Technical Debt & Code Quality

### 9.1 Framework Upgrade: Vue 2 → Vue 3
- **Why:** Vue 2 reached end-of-life on December 31, 2023. No security patches.
- **Impact:** The entire frontend uses Vue 2.7 + Options API
- **Recommendation:** Migrate to Vue 3 with Composition API. This also unlocks better TypeScript support and modern ecosystem tools.
- **Effort:** High but necessary for long-term maintenance

### 9.2 State Management
- **Current:** `Vue.observable()` global store — works but isn't scalable
- **Issue:** No action middleware, no devtools support, no persistence layer
- **Recommendation:** Migrate to Pinia (Vue 3) or Vuex for debugging, time-travel, and plugin support
- **Benefit:** Undo/redo becomes trivial with proper state management

### 9.3 TypeScript Migration
- **Current:** 100% JavaScript with no type annotations
- **Issue:** As the codebase grows, refactoring becomes risky without types
- **Recommendation:** Gradual TypeScript migration, starting with the engine and store
- **Effort:** Medium (can be incremental)

### 9.4 Code Duplication
- **Issue:** `services/web/src/export/manim.js` and `services/api/src/compiler/codegen.js` are nearly identical (~370 lines duplicated)
- **Recommendation:** Extract shared codegen logic into a package or shared module
- **Approach:** Create `packages/manim-codegen/` as a shared dependency, or use a build step to share code

### 9.5 Test Coverage
- **Current:** 30+ assertions in `tests/engine.test.mjs` covering easing, resampling, timeline scheduling, blending
- **Missing:** No tests for the Manim exporter/parser, no API route tests, no component tests, no E2E tests
- **Recommendation:**
  - Add exporter round-trip tests (generate → parse → compare)
  - Add API integration tests (supertest)
  - Add component tests (Vue Test Utils)
  - Add E2E tests (Playwright or Cypress)

### 9.6 Error Handling
- **Current:** Errors show as a toast at the bottom; render errors show in the dialog
- **Missing:** No error boundaries in components, no structured error logging, no Sentry-like monitoring
- **Recommendation:** Add Vue error handler, structured logging in API, optional error reporting

### 9.7 Performance Concerns
- **Playback engine:** The `computeFrame` method iterates all tracks and clips every frame. For complex projects (50+ clips), this could cause frame drops.
- **Recommendation:** Spatial/temporal indexing for clips (binary search by time range), pre-compute active clip sets when project changes
- **Points cache:** The `_pointsCache` in PlaybackEngine is never invalidated when objects resize — only object type is part of the cache key (width and height ARE included, which is good, but the cache grows unbounded)
- **Recommendation:** Add cache size limit (LRU eviction)

### 9.8 Security
- **API has no authentication** — anyone on the network can CRUD projects, upload files, trigger renders
- **No rate limiting** — render endpoint can be hammered
- **No input sanitization** for text content (XSS in SVGs, text injection in generated Python)
- **50MB upload limit** is set but no server-wide storage quota
- **Recommendation:** Add optional auth (JWT or API key), rate limit render endpoint, sanitize text content for Python codegen, add storage quotas

### 9.9 Docker / Infrastructure
- **No health check** for the renderer service
- **No resource limits** on renderer container (could consume all RAM/CPU during 4K renders)
- **No render timeout** exposed to user (hardcoded 10 minutes)
- **No horizontal scaling** — single renderer worker
- **Recommendation:** Add Docker health checks, resource limits, configurable timeout, optional multi-worker support

---

## 10. Competitive Landscape

| Tool | Type | Strengths | Weaknesses vs. This Editor |
|------|------|-----------|---------------------------|
| **Manim Editor** (official) | Post-processor | Presentation slides, section API | No visual creation, code-only |
| **Graf** | GUI for Manim | GUI for Manim creation | Limited documentation, unclear activity |
| **Motion Canvas** | TypeScript animation | LaTeX, code blocks, audio sync | No Manim output, no Python, different ecosystem |
| **Remotion** | React video framework | React components, powerful rendering | No Manim, requires React knowledge, commercial license |
| **Lottie Creator** | Web animation | Professional UI, keyframes, SVG import | No Manim, no math focus, commercial |
| **After Effects** | Desktop animation | Industry standard, plugins, expressions | Expensive, desktop-only, no Manim |
| **This Editor** | Visual Manim editor | **Only visual editor that generates real Manim code**, Docker rendering, live preview, open source | Gaps listed in this report |

### Unique Selling Points to Protect and Amplify
1. **The only visual editor that outputs real Manim Python** — this is the moat
2. **Bidirectional code view** — edit visually OR edit code, both ways
3. **One-click Docker rendering** — no local Manim install needed
4. **Free and open source** — no license restrictions

---

## 11. Roadmap Suggestion

### Phase 1: Foundation (1–2 months)
**Goal:** Make the existing editor production-ready
- [ ] Undo/redo system
- [ ] Copy/paste/duplicate
- [ ] Right-click context menu
- [ ] Auto-save to localStorage
- [ ] Box selection (drag to select)
- [ ] Inline text editing (double-click)
- [ ] Fix: snap-to-objects (declared in data model but not implemented)
- [ ] Basic onboarding overlay

### Phase 2: Math & Education (2–3 months)
**Goal:** Support the primary Manim use cases
- [ ] LaTeX / MathTex object type
- [ ] Axes / coordinate system object type
- [ ] NumberLine object type
- [ ] Function plotting (f(x) expression input)
- [ ] Letter-by-letter and word-by-word text animations
- [ ] TypeWriter entrance animation
- [ ] Brace and annotation objects
- [ ] 5-10 starter templates

### Phase 3: Pro Animation (2–3 months)
**Goal:** Unlock advanced animation workflows
- [ ] Keyframe animation system
- [ ] Camera zoom/pan/focus animations
- [ ] Path animation with Bezier curves
- [ ] Animation composition (parallel, staggered)
- [ ] Attention animations (indicate, flash, circumscribe)
- [ ] Audio track with waveform
- [ ] Scene sections / chapters

### Phase 4: Platform (ongoing)
**Goal:** Build an ecosystem
- [ ] Vue 3 migration
- [ ] TypeScript migration
- [ ] Template gallery (community-contributed)
- [ ] Shared codegen package
- [ ] Export formats (GIF, WebM, PNG sequence)
- [ ] Optional authentication
- [ ] 3D scene mode (experimental)
- [ ] AI-assisted animation generation
- [ ] Collaboration features

---

## Appendix A: Feature Comparison Matrix — Current vs. Proposed

| Category | Feature | Current | Phase |
|----------|---------|:-------:|:-----:|
| **Core Editor** | Undo/Redo | No | 1 |
| | Copy/Paste | No | 1 |
| | Right-click menu | No | 1 |
| | Auto-save | No | 1 |
| | Box selection | No | 1 |
| | Inline text editing | No | 1 |
| | Object locking | No | 3 |
| | Rulers & guides | No | 3 |
| **Math/Education** | LaTeX formulas | No | 2 |
| | Coordinate axes | No | 2 |
| | Number line | No | 2 |
| | Function plotting | No | 2 |
| | Brace/annotation | No | 2 |
| | Table/Matrix | No | 2 |
| **Animation** | Keyframes | No | 3 |
| | Camera animation | No | 3 |
| | Path animation | No | 3 |
| | Parallel/staggered | No | 3 |
| | Attention effects | No | 3 |
| | Audio track | No | 3 |
| **Export** | GIF/WebM | No | 4 |
| | Scene sections | No | 3 |
| | Lottie JSON | No | 4 |
| **Infrastructure** | Vue 3 | No | 4 |
| | TypeScript | No | 4 |
| | Authentication | No | 4 |
| | Multi-worker | No | 4 |

## Appendix B: Manim Codegen Gaps

The following Manim features are used in the codegen but have nuances that could be improved:

1. **Easing mapping is lossy** — Several editor easings map to the same Manim `rate_functions.smooth`. The editor has 17 easings but Manim has different ones. Need to expand the `EASING_MAP` to cover more Manim rate functions.

2. **No parallel animation support in codegen** — All animations are sequential (`self.play()` one at a time). Need `AnimationGroup()` support for overlapping clips.

3. **No `self.play()` with multiple animations** — Manim supports `self.play(anim1, anim2)` for simultaneous animations. The codegen only emits one animation per `self.play()`.

4. **Heart shape codegen uses ParametricFunction** — This works but produces a wireframe. Should use `SVGMobject` or a filled polygon approach for better rendering.

5. **Parser is regex-based** — The Manim code parser (`parseManimScript`) uses line-by-line regex matching. This is fragile and breaks on multi-line statements, comments, or unusual formatting. Consider using a proper AST parser or at minimum handle multi-line continuations.

6. **No `wait_until` or conditional timing** — The codegen uses fixed `self.wait()` between animations. Manim supports event-driven timing that could be useful.

---

## Appendix C: Community Quotes & Signals

> "An interactive mode where developers can run code snippets and see immediate output" — GitHub Discussion #3954

> "Automatic checkpoint creation for every line rather than just comment-marked lines" — 3b1b/manim Issue #2306

> "Dynamic axis range animation for plots and number planes" — ManimCommunity/manim Issue #3804

> "Pre-recorded audio support... easily swap and use pre-recorded audio files" — manim-voiceover Issue #100

> "Manim lacks a live preview feature, significantly hindering development workflow" — Community comparison

These quotes confirm that the editor's live preview is its strongest differentiator, and that math/LaTeX + audio are the most impactful features to add next.

---

*This report was generated from a complete codebase audit of all 39 source files (~6,400 lines), analysis of Manim CE v0.19 documentation and capabilities, and research across GitHub Discussions, Issues, community forums, and competitive tools.*
