<div align="center">
  <img src="assets/ManimMotionLogo.svg" alt="Manim Motion Logo" width="400">
  
  # Manim Motion Editor
  
  **A Figma-like visual animation editor powered by Manim.**  
  Build mathematical animations by dragging shapes, writing LaTeX, creating morphs, and rendering cinematic videos -- all from your browser.
</div>

<br>

<p align="center">
  <img src="https://img.shields.io/badge/docker-ready-2496ED?logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/vue-2.7-4FC08D?logo=vue.js&logoColor=white" alt="Vue">
  <img src="https://img.shields.io/badge/manim-CE-orange?logo=python&logoColor=white" alt="Manim">
  <img src="https://img.shields.io/badge/node-20-339933?logo=node.js&logoColor=white" alt="Node">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
  <img src="https://img.shields.io/badge/version-0.9.1-6B7280" alt="Version">
</p>

---

## Screenshots

*Current UI: desktop menubar, light/dark themes, and configurable canvas.*

| Light theme | Dark theme |
|-------------|------------|
| [![Light theme](docs/screenshots/light-main.png)](docs/screenshots/light-main.png) | [![Dark theme](docs/screenshots/dark-main.png)](docs/screenshots/dark-main.png) |
| *Main window (light)* | *Main window (dark)* |

| File menu (light) | File menu (dark) |
|-------------------|------------------|
| [![File menu light](docs/screenshots/light-file-menu.png)](docs/screenshots/light-file-menu.png) | [![File menu dark](docs/screenshots/dark-file-menu.png)](docs/screenshots/dark-file-menu.png) |

Screenshots are stored in `docs/screenshots/`. Replace or add PNGs there and update the paths above if you change the UI.

---

## Features

### Visual Editor
- **Drag-and-drop stage** -- Canvas with optional grid, resize/rotate handles, multi-select, snapping; background color and opacity configurable in the Properties panel (no selection)
- **Light & Dark themes** -- Toggle between warm light and sleek dark palettes via View > Theme; persists across sessions
- **Desktop-style menubar** -- File, Edit, View, Tools, Help menus with keyboard shortcuts and responsive collapse
- **16 shape types** -- Rectangle, Square, Circle, Ellipse, Triangle, Star, Polygon, Arrow, Heart, Line, Dot, Dot Grid, Text, Image, SVG, and more
- **LaTeX math objects** -- Add `MathTex` expressions (e.g. `E = mc^2`) that render natively in Manim
- **Coordinate Axes** -- Configurable `Axes` with custom x/y ranges and tick steps
- **Asset uploads** -- Import PNGs, JPEGs, and SVGs; drag onto the canvas from the sidebar

### Animation & Timeline
- **Multi-track timeline** -- Up to 5 tracks with draggable, resizable animation clips
- **Transform morphing** -- Select two shapes and morph between them with customizable easing
- **Animation types** -- Transform, Move, Scale, Fade, Rotate with 17 easing functions
- **60fps preview** -- Real-time playback with sub-frame interpolation
- **Entrance / exit animations** -- 11 entrance and 9 exit animation presets per object

### Workflow
- **Undo / Redo** -- Full history stack (Ctrl+Z / Ctrl+Shift+Z) with 50-state memory
- **Copy / Paste** -- Duplicate objects with offset (Ctrl+C / Ctrl+V)
- **Live Code view** -- Generated Manim Python with syntax highlighting; edit, apply to canvas, copy, or download `.py`
- **Server rendering** -- One-click HQ render via Docker (480p to 4K) with progress tracking
- **Project management** -- Save/load locally (JSON) or sync to Docker server

---

## Quick Start

### Full Stack with Docker (Recommended)

```bash
git clone <repository-url>
cd Manim-docker
docker compose up --build
```

Open **http://localhost:8080** in your browser. Everything works out of the box -- editor, API, render queue, and Manim renderer.

### Editor Only (No Docker)

```bash
cd services/web
npm install
npm run dev
```

Open **http://localhost:5173**. You can edit, preview, and export Manim scripts. Server features (render, project sync) require Docker.

---

## Architecture

```
Browser (localhost:8080)
  |
  |-- Nginx (serves Vue SPA, proxies /api/)
  |
  |-- Vue 2 + Konva.js
  |     |-- Stage Canvas (shapes, grid, morphs, transformer)
  |     |-- Properties Panel (object/clip editing)
  |     |-- Timeline (multi-track, drag clips)
  |     |-- Asset Sidebar (shapes, uploads)
  |     |-- Playback Engine (60fps rAF)
  |     |-- Manim Exporter (client-side .py generation)
  |
  |-- /api/ --> Node.js + Express (port 3000)
  |     |-- Project CRUD (JSON on shared volume)
  |     |-- Asset upload (multipart + base64)
  |     |-- Compiler: validate -> normalize -> codegen (scene.py)
  |     |-- Render trigger -> Redis queue
  |
  |-- Redis (job queue)
  |
  |-- Manim Renderer (Python worker)
        |-- Polls Redis for jobs
        |-- Runs: manim -qh scene.py MainScene
        |-- Outputs MP4 to shared volume
        |-- Updates job status in Redis
```

**Shared Docker volume** (`manim_motion_data` at `/data`):
- `projects/` -- Project JSON + generated `scene.py`
- `assets/` -- Uploaded images/SVGs per project
- `renders/` -- Output MP4 files per project

---

## How It Works

### 1. Add Shapes
Click shapes in the left sidebar (including LaTeX and Axes). They appear on the stage and on the timeline.

### 2. Position and Style
Drag shapes on the canvas. Edit fill, stroke, opacity, size, rotation in the Properties panel. LaTeX objects have a formula editor; Axes objects have configurable ranges.

### 3. Create Animations
- **Transform**: Select two shapes (click + Shift+click), then click "Create Transform"
- **Quick Animate**: Select one shape, click Move/Scale/Fade/Rotate in the Properties panel

### 4. Edit Timeline
- Drag clips to change start time
- Resize clip edges to change duration
- Click clips to edit easing, overshoot, morph quality

### 5. Preview
Press **Space** to play the animation at 60fps. Scrub the timeline ruler to seek.

### 6. Render
Click **Tools > Render HQ** in the menubar. Choose quality (Low/Medium/High/4K) and click Start Render. The project is saved to the server, compiled to a Manim scene, and rendered. When done, watch the preview and download the MP4.

### 7. Live Code View
Click the **Code** tab to see the generated Manim Python with syntax highlighting. Edit the code and click **Apply to Canvas** to update the scene, or copy/download the `.py` file.

### 8. Export
Click **File > Export .py** to download a standalone `scene.py` you can run locally with `manim -qh scene.py MainScene`.

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
| `Ctrl+S` | Save to file |
| `Ctrl+G` | Group selected objects |
| `Shift+Click` | Multi-select objects |
| `Scroll` | Zoom canvas |

---

## Data Model

```
Project
 +-- id, name, sceneDuration
 +-- stage: { width, height, backgroundColor, grid*, snap* }
 +-- objects[]: { id, type, name, x, y, width, height, rotation,
 |               fill, stroke, opacity, zOrder, enterTime, duration,
 |               enterAnim, exitAnim, latex?, xRange?, yRange?, assetId? }
 +-- groups[]: { id, name, childIds[], margin, collapsed }
 +-- tracks[]: { id, name, clips[] }
 |    +-- clip: { id, type, startTime, duration, easing,
 |                sourceId, targetId?, params, overshoot, morphQuality }
 +-- assets[]: { id, name, type, filename, dataUrl?, width, height }
```

**Object types**: `rectangle`, `square`, `circle`, `ellipse`, `triangle`, `star`, `polygon`, `line`, `arrow`, `heart`, `dot`, `dot_grid`, `text`, `image`, `svg_asset`, `latex`, `axes`

**Clip types**: `transform` (morph A->B), `move`, `scale`, `fade`, `rotate`

**Easing functions** (17): linear, ease_in, ease_out, ease_in_out, cubic/quart variants, back variants, elastic in/out, bounce, spring

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create new project |
| `GET` | `/api/projects/:id` | Get project by ID |
| `PUT` | `/api/projects/:id` | Update project |
| `DELETE` | `/api/projects/:id` | Delete project + assets + renders |
| `POST` | `/api/projects/:id/render` | Compile + enqueue render job |
| `POST` | `/api/assets/:projectId` | Upload file (multipart) |
| `POST` | `/api/assets/:projectId/base64` | Upload base64 data URL |
| `GET` | `/api/assets/:projectId/:filename` | Serve asset file |
| `GET` | `/api/jobs/:jobId` | Poll render job status |
| `GET` | `/api/renders/:projectId/latest.mp4` | Stream latest render |
| `GET` | `/health` | Health check |

---

## Project Structure

```
Manim-docker/
+-- docker-compose.yml
+-- services/
    +-- web/                          # Vue frontend
    |   +-- src/
    |   |   +-- App.vue               # Root: dialogs, shortcuts
    |   |   +-- api.js                # API client
    |   |   +-- store/project.js      # State, history, clipboard, theme
    |   |   +-- styles/main.css       # Theme tokens, light/dark palettes
    |   |   +-- engine/               # Playback engine
    |   |   |   +-- geometry.js       # Shape point generation
    |   |   |   +-- easing.js         # 17 easing functions
    |   |   |   +-- transform.js      # Morph interpolation
    |   |   |   +-- playback.js       # rAF loop
    |   |   |   +-- blending.js       # Multi-track blending
    |   |   +-- export/manim.js       # Client-side .py generator
    |   |   +-- components/
    |   |       +-- topbar/           # Desktop menubar (File, Edit, View, Tools, Help)
    |   |       +-- sidebar/          # Shapes, assets, transform
    |   |       +-- stage/            # Konva canvas
    |   |       +-- inspector/        # Properties panel
    |   |       +-- timeline/         # Tracks, clips, playback
    |   +-- nginx.conf
    |   +-- Dockerfile
    |
    +-- api/                          # Node.js backend
    |   +-- src/
    |   |   +-- index.js              # Express server
    |   |   +-- queue.js              # Redis queue
    |   |   +-- routes/               # REST endpoints
    |   |   +-- compiler/             # Manim code generation
    |   |       +-- validator.js      # Zod schema validation
    |   |       +-- normalizer.js     # Data normalization
    |   |       +-- codegen.js        # Python code generation
    |   +-- Dockerfile
    |
    +-- renderer/                     # Manim worker
        +-- worker.py                 # Redis consumer + manim exec
        +-- Dockerfile
```

---

## Docker Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| **web** | nginx:alpine | 8080 | Vue SPA + API proxy |
| **api** | node:20-alpine | 3000 | REST API, compiler |
| **renderer** | manimcommunity/manim | -- | Render worker |
| **redis** | redis:7-alpine | 6379 | Job queue |
| **init** | alpine:3.19 | -- | Creates /data dirs |

### Security

All Docker containers run with **least-privilege non-root users**:
- **web** runs as `nginx` user (UID 1000)
- **api** runs as `node` user (UID 1000)
- File permissions set with `--chown` flags during build

**API hardening**: Helmet.js security headers, rate limiting on render endpoints (5 req/min/IP), input sanitization against injection.

### Render Quality

| Quality | Flag | Resolution | FPS |
|---------|------|------------|-----|
| Low | `-ql` | 480p | 15 |
| Medium | `-qm` | 720p | 30 |
| High | `-qh` | 1080p | 60 |
| 4K | `-qk` | 4K | 60 |

### Environment Variables

- `DATA_DIR` -- Shared volume path (default: `/data`)
- `REDIS_URL` -- Redis connection (default: `redis://redis:6379`)
- `PORT` -- API port (default: `3000`)

---

## Running Tests

```bash
cd services/web
npm test
```

30+ assertions covering easing functions, point resampling, timeline scheduling, and blending logic.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **Render fails** | Check `docker compose logs renderer` for Manim errors. Ensure all services are running: `docker compose ps` |
| **API not reachable** | Run `curl http://localhost:3000/health` -- should return `{"status":"ok"}`. Check `docker compose logs api` |
| **Images not loading** | Upload via the sidebar (stored as base64). Assets auto-sync to server on render |
| **Playback stutters** | Reduce morph quality in clip properties. Close DevTools. Use Chrome/Edge for best performance |

---

## Tech Stack

- **Frontend**: Vue 2.7, Konva.js, Tailwind CSS (with CSS-variable theming), Vite
- **Backend**: Node.js 20, Express, Multer, Zod, Redis
- **Renderer**: Python, Manim Community Edition
- **Infrastructure**: Docker Compose, Nginx, Alpine Linux

---

## Documentation

For detailed technical docs of the entire codebase, see **[XTRA-BIG-README.md](XTRA-BIG-README.md)** -- includes architecture diagrams, complete API reference, data models, file-by-file breakdown, animation engine internals, compiler pipeline details, and development guide.

---

## Changelog

### v0.9.1 (current)

- **Preview-render alignment**: Fixed Manim coordinate mapping to use official frame dimensions (14.22×8); scale-based shapes (square, circle, star, polygon, etc.) now match final render
- **Properties panel**: Size params now match preview — symmetric shapes show single "Size", line/arrow show "Length", text omits width/height
- **Favicon**: Fixed path so favicon loads correctly at `/ManimMotionLogoNoTextNoBG.svg`

### v0.9.0

- **Display-render parity**: Fixed heart scale in Manim codegen — was ~7× too large; now matches the canvas preview by normalizing x/y independently
- **Arrow rendering**: Added `buff=0`, proportional `tip_length`, and `stroke_width` to Manim Arrow output so rendered arrows match the canvas preview
- **Label consistency**: Renamed "5x5 Grid" / "5x5 Dot Grid" to "Dot Grid", "Hexagon" to "Polygon", "Rect" to "Rectangle" across all UI components
- **Docker dev workflow**: Added API source bind mount with `node --watch` auto-reload; added `web-dev` service (Vite HMR) via `docker compose --profile dev up`; Vite proxy target configurable via `VITE_API_TARGET`
- **Interface audit**: Unified type labels in PropertiesPanel, Toolbar, and AssetSidebar; added Polygon mapping to type badge

### v0.8.0

- **Docker & UI**: Updated Docker configuration; enhanced UI theming (light/dark themes, menubar)

### v0.7.0

- **Documentation**: Enhanced README and documentation with new features and updates

### v0.6.0

- **Style panel**: Hardened inputs with validated color picker
- **API security**: Implemented security middleware (Helmet, rate limiting, input sanitization)

### v0.5.0

- **Infrastructure**: Optimized Docker Compose with resource limits and health checks

### v0.4.0

- **Security**: Implemented non-root Docker containers for web and API services

### v0.3.0

- **Documentation**: Added XTRA-BIG-README.md with architecture diagrams, API reference, data models, and development guide

### v0.2.0

- **Initial features**: Core editor, shapes, timeline, Manim export, Docker stack

### v0.1.0

- **Project bootstrap**: Vue frontend, Node.js API, Manim renderer, Redis queue

### v0.0.0

- **Initial commit**: Project scaffold and GitHub backup

## License

MIT

---

## Acknowledgments

- [Manim Community Edition](https://www.manim.community/) -- Mathematical animation engine
- [Vue.js](https://vuejs.org/) -- Progressive JavaScript framework
- [Konva.js](https://konvajs.org/) -- 2D canvas library
- [Tailwind CSS](https://tailwindcss.com/) -- Utility-first CSS
