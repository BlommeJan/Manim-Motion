# Manim Motion Editor - Autonomous Engineering Plan

> **Agent Rules:** > 1. Complete subtasks strictly in order.
> 2. Do not "hallucinate" new files; strictly follow the file paths provided.
> 3. Verify every UI change by ensuring no visual overlap occurs (check z-indexes).

## Epic 1: Infrastructure Hardening & Security
**Context:** The current Docker setup is functional but lacks production-grade security and optimization. The renderer needs resource caps to prevent crashing the host.

- [x] **Secure Dockerfiles (Non-Root Users)**
  - [x] Update `services/web/Dockerfile` and `services/api/Dockerfile` to use `USER node` instead of running as root.
  - [x] Ensure file permissions for `/app` and `/data` are owned by the `node` user in the build stage.
  - [x] Verify the build still passes with `docker compose build`.

- [x] **Optimize Docker Compose & Resource Limits**
  - [x] Update `docker-compose.yml`: Add `deploy.resources.limits` to the `renderer` service (Limit: 2 CPUs, 4GB RAM).
  - [x] Add `healthcheck` blocks to `renderer` and `api` services (ping `/health` endpoint).
  - [x] Configure `restart_policy: on-failure` instead of `no` for resilience.

- [x] **API Security Middleware**
  - [x] Install `helmet` and `express-rate-limit` in `services/api`.
  - [x] Add rate limiting middleware to `routes/renders.js` (max 5 renders per minute per IP).
  - [x] Sanitize all incoming text fields in `routes/projects.js` to prevent NoSQL injection.

## Epic 2: Foolproof UI & UX Polish
**Context:** Inputs like Hex colors are currently raw strings, prone to user error. UI elements must not overlap.

- [ ] **Harden Style Panel Inputs**
  - [ ] Refactor `services/web/src/components/inspector/StylePanel.vue`: Replace standard `<input type="text">` for colors with a custom wrapper component.
  - [ ] Implement a strict Regex validator (`/^#[0-9A-F]{6}$/i`) that rejects invalid Hex codes instantly.
  - [ ] Add a native `<input type="color">` picker alongside the hex field for foolproof selection.

- [ ] **Fix Layout & Z-Index Layering**
  - [ ] Audit `services/web/src/styles/main.css` and `App.vue`: Define a global z-index scale (e.g., `--z-stage: 10`, `--z-overlay: 100`, `--z-modal: 1000`).
  - [ ] Apply these variables to `StageCanvas.vue`, `Inspector.vue`, and `RenderDialog.vue` to strictly prevent overlap.
  - [ ] Add `overflow: hidden` to the main `.editor-layout` container to prevent scrollbar jitter.

## Epic 3: Core Workflow (Undo/Redo & Copy/Paste)
**Context:** The editor needs standard software engineering features for state management.

- [ ] **Implement History Stack (Undo/Redo)**
  - [ ] In `store/project.js`, add `history` object with `past: []` and `future: []` arrays.
  - [ ] Create a `commitState` mutation that pushes a stringified snapshot of `objects` to `past`.
  - [ ] Implement `undo()` action: Move current state to `future`, pop from `past`.
  - [ ] Implement `redo()` action: Move current state to `past`, pop from `future`.
  - [ ] Bind `Ctrl+Z` / `Ctrl+Shift+Z` in `App.vue` to trigger these actions.

- [ ] **Implement Clipboard Logic**
  - [ ] In `store/project.js`, add `clipboard: []` to state.
  - [ ] Create `copySelection()` action: Deep clone `selectedObjects` to `clipboard`.
  - [ ] Create `pasteSelection()` action: Iterate `clipboard`, generate new UUIDs, offset `x/y` by +20px, push to `objects`.
  - [ ] Bind `Ctrl+C` / `Ctrl+V` in `App.vue`.

## Epic 4: Missing Functionality (Math & Graphs)
**Context:** Users explicitly require LaTeX and Coordinate Systems.

- [ ] **Add LaTeX Object Support**
  - [ ] Create `services/web/src/components/stage/StageMathTex.vue` using `katex` for rendering.
  - [ ] Update `services/api/src/compiler/validator.js` to allow `type: 'latex'`.
  - [ ] Update `services/api/src/compiler/codegen.js` to emit `MathTex(r"...")` for these objects.

- [ ] **Add Coordinate Axes Object**
  - [ ] Create `services/web/src/components/stage/StageAxes.vue`: Render a grid preview using HTML/SVG lines.
  - [ ] Update `codegen.js`: Map this object to `Axes(x_range=[...], y_range=[...])` in Manim.
