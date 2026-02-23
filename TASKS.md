# Manim Motion Editor - UI Theming + Menubar Restructure (Tasks)

> **Agent Rules:**
> 1. Complete subtasks strictly in order, do not skip ahead.
> 2. Do not invent new files or directories, only edit what exists unless the task explicitly says to create a file.
> 3. Do not hardcode hex colors inside components (except the canvas fill rule), use theme tokens only.
> 4. Canvas background must remain **pure black `#000000`** in all themes.
> 5. Verify every UI change visually, ensure no overlaps, clipped menus, or z-index issues.
> 6. All menu interactions must support mouse and keyboard (Esc, arrows, Enter, focus visible).

---

## Epic 0: Codebase Audit and Baseline
**Context:** Before changing UI architecture, you need a clear map of where colors and top bar actions live.

- [ ] **Inventory all color usage**
  - [ ] Locate all color definitions (global CSS, Tailwind config, theme files, inline styles, SVG fills/strokes).
  - [ ] Create a checklist of UI zones that currently use colors:
    - [ ] App shell background
    - [ ] Top bar / toolbar(s)
    - [ ] Sidebar
    - [ ] Panels / cards
    - [ ] Menus / dropdowns
    - [ ] Dialogs / modals
    - [ ] Buttons (all variants)
    - [ ] Inputs (all variants)
    - [ ] Tabs / navigation
    - [ ] Toasts / alerts
    - [ ] Canvas frame + overlays (grid, selection outlines, handles, tooltips)
  - [ ] Identify any “magic numbers” or hex values scattered through components.

- [ ] **Audit current top bar**
  - [ ] List every current top bar control/action.
  - [ ] Classify each control as:
    - [ ] “Must remain one click” (high frequency)
    - [ ] “Can move into menus” (medium/low frequency)
    - [ ] “Belongs in a secondary toolbar row” (contextual tools)
  - [ ] Capture a baseline screenshot (light and dark if they exist) to compare after refactor.

- [ ] **Confirm constraints**
  - [ ] Confirm where the canvas background is set.
  - [ ] Confirm the canvas background can be forced to `#000000` without affecting overlays.

---

## Epic 1: Menubar Architecture (Desktop-like)
**Context:** Replace the cluttered top bar with a clean menubar: File, Edit, View, Tools, Help.

- [ ] **Implement menubar layout**
  - [ ] Left section:
    - [ ] App logo/name (clickable optional, but must not open random actions)
  - [ ] Center-left section:
    - [ ] Menus: **File, Edit, View, Tools, Help**
  - [ ] Right section:
    - [ ] Keep minimal (optional status icons only), remove action clutter.

- [ ] **Create menu interaction model**
  - [ ] Mouse behavior:
    - [ ] Click menu label opens menu.
    - [ ] Click outside closes menu.
    - [ ] When a menu is open, hovering another menu label switches to that menu.
  - [ ] Keyboard behavior:
    - [ ] Tab cycles focus across menu labels.
    - [ ] Enter/Space opens focused menu.
    - [ ] Arrow keys navigate menu items.
    - [ ] Esc closes current menu.
    - [ ] Focus ring is visible and consistent with theme (uses theme focus token).

- [ ] **Dropdown placement and stacking correctness**
  - [ ] Menus must open below the menubar, aligned to their label.
  - [ ] Menus must not clip behind panels.
  - [ ] Verify z-index rules:
    - [ ] Menus above all standard UI
    - [ ] Modals above menus (if applicable)
  - [ ] Verify no overlap with canvas frame or sidebar at all viewport sizes.

- [ ] **Responsive menubar behavior**
  - [ ] For narrow widths:
    - [ ] Collapse the five labels into a single **Menu** button.
    - [ ] The Menu dropdown contains File/Edit/View/Tools/Help as nested sections or grouped blocks.
  - [ ] Verify tap targets are usable on mobile.

---

## Epic 2: Menu Contents and Action Relocation
**Context:** Move clutter into structured menus, keep the top bar clean, allow future expansion.

- [ ] **Define minimum viable menu items**
  - [ ] **File**
    - [ ] New
    - [ ] Open
    - [ ] Import
    - [ ] Save
    - [ ] Save As
    - [ ] Export
    - [ ] Preferences/Settings
  - [ ] **Edit**
    - [ ] Undo
    - [ ] Redo
    - [ ] Cut
    - [ ] Copy
    - [ ] Paste
    - [ ] Select All
  - [ ] **View**
    - [ ] Sidebar toggle (if sidebar exists)
    - [ ] Zoom In (if applicable)
    - [ ] Zoom Out (if applicable)
    - [ ] Reset Zoom (if applicable)
    - [ ] **Theme** submenu (radio items, Light/Dark)
  - [ ] **Tools**
    - [ ] Placeholder section for future tools/plugins (do not overfill now)
  - [ ] **Help**
    - [ ] Keyboard shortcuts
    - [ ] About

- [ ] **Relocate existing top bar actions**
  - [ ] Move medium/low frequency actions into File/Edit/View/Tools.
  - [ ] If some actions are truly high-frequency:
    - [ ] Create a **secondary toolbar row below the menubar** (optional).
    - [ ] Secondary toolbar must be contextual and not permanently cluttered.
    - [ ] Secondary toolbar must also use theme tokens and not hardcoded colors.

- [ ] **Final pass, usability**
  - [ ] Ensure menu labels and items are readable in both themes.
  - [ ] Ensure disabled items look disabled (not just “same text but unclickable”).

---

## Epic 3: Theme System (Token-based, extendable)
**Context:** Implement two themes (Light and Dark) for the full environment. Canvas stays black.

- [ ] **Implement theme selection**
  - [ ] Add **View → Theme** submenu.
  - [ ] Use radio items:
    - [ ] ◉ Dark
    - [ ] ○ Light
  - [ ] Ensure it’s designed to support more themes later (do not build a hardcoded toggle-only approach).

- [ ] **Theme persistence**
  - [ ] Store selected theme in local storage.
  - [ ] On app start:
    - [ ] If user preference exists, apply it immediately.
    - [ ] If not, default to **Light**.
  - [ ] Avoid theme “flash” on initial load (apply theme before paint where possible).

- [ ] **Define semantic tokens (required set)**
  - [ ] Background (app shell)
  - [ ] Surface 1 (primary panels)
  - [ ] Surface 2 (secondary panels/inputs)
  - [ ] Surface 3 (menus/popovers)
  - [ ] Text primary
  - [ ] Text secondary
  - [ ] Text muted/disabled
  - [ ] Border
  - [ ] Divider
  - [ ] Accent (primary)
  - [ ] Accent hover
  - [ ] Accent pressed
  - [ ] Accent subtle background (selected rows/chips)
  - [ ] Success
  - [ ] Success subtle background
  - [ ] Warning
  - [ ] Danger
  - [ ] Focus ring

- [ ] **Enforce token usage**
  - [ ] Replace component-level hex values with tokens.
  - [ ] Exception: canvas fill stays `#000000` everywhere.

---

## Epic 4: Apply Final Palettes (Logo-matched light and dark)
**Context:** Light theme should feel creamy and calm. Dark theme should feel GitHub-like and neutral. Use logo cyan and green as accents, not neon noise.

### Light Theme Palette (Creamy base, Cyan accent, Green success)
- [ ] **Base**
  - [ ] App background: `#F7F3E9`
  - [ ] Surface 1: `#FFFFFF`
  - [ ] Surface 2: `#F0EBDD`
  - [ ] Surface 3: `#FFFCF6`
- [ ] **Text**
  - [ ] Primary: `#1F2428`
  - [ ] Secondary: `#4E545B`
  - [ ] Muted: `#7A8087`
- [ ] **Lines**
  - [ ] Border: `#E1DCD1`
  - [ ] Divider: `#D3CEC4`
- [ ] **Accent (Logo Cyan)**
  - [ ] Accent: `#4CEEF9`
  - [ ] Hover: `#2FE6F4`
  - [ ] Pressed: `#14CFDE`
  - [ ] Subtle accent background: `#D9FBFF`
- [ ] **Success (Logo Green)**
  - [ ] Success: `#54D381`
  - [ ] Hover: `#3FCC72`
  - [ ] Pressed: `#2DBE62`
  - [ ] Subtle success background: `#DFF7EA`
- [ ] **Warning / Danger**
  - [ ] Warning: `#E6A23C`
  - [ ] Danger: `#E05252`
- [ ] **Focus ring**
  - [ ] Focus ring color uses accent (`#4CEEF9`) with restrained opacity.

### Dark Theme Palette (Neutral base, Logo surface, Cyan accent)
- [ ] **Base**
  - [ ] App background: `#0D1117`
  - [ ] Surface 1: `#16161D`
  - [ ] Surface 2: `#1E2028`
  - [ ] Surface 3: `#252836`
- [ ] **Text**
  - [ ] Primary: `#E6EDF3`
  - [ ] Secondary: `#A8B3BE`
  - [ ] Muted: `#7D8792`
- [ ] **Lines**
  - [ ] Border: `#2A2F3A`
  - [ ] Divider: `#343A46`
- [ ] **Accent (Logo Cyan)**
  - [ ] Accent: `#4CEEF9`
  - [ ] Hover: `#3DEAF6`
  - [ ] Pressed: `#22D3E2`
  - [ ] Subtle accent background: `#0B2A30`
- [ ] **Success (Logo Green)**
  - [ ] Success: `#54D381`
  - [ ] Hover: `#6BE09A`
  - [ ] Pressed: `#3ACA75`
  - [ ] Subtle success background: `#0F2A1C`
- [ ] **Warning / Danger**
  - [ ] Warning: `#F2B04C`
  - [ ] Danger: `#FF6B6B`
- [ ] **Focus ring**
  - [ ] Focus ring color uses accent (`#4CEEF9`) with restrained opacity.

---

## Epic 5: Canvas Theming Rules (Non-negotiable)
**Context:** Canvas stays black. The environment changes around it.

- [ ] **Hard lock canvas fill**
  - [ ] Canvas background is always `#000000` (no theme overrides).
- [ ] **Theme canvas UI overlays only**
  - [ ] Canvas frame uses Surface/Border tokens.
  - [ ] Selection outlines use Accent (cyan), not green.
  - [ ] Handles/interactive points follow Accent and Surface contrast rules.
  - [ ] Tooltips and context UI on canvas follow Surface 3 tokens.

---

## Epic 6: Component Coverage Checklist (Prevent “half-themed” UI)
**Context:** Most theme implementations fail because 20 percent of UI keeps old colors.

- [ ] **Menubar + menus**
  - [ ] Menu label states (idle/hover/open)
  - [ ] Menu surfaces, separators, item hover
  - [ ] Disabled states
- [ ] **Buttons**
  - [ ] Primary, secondary, ghost, destructive
  - [ ] Hover/pressed/disabled
- [ ] **Inputs**
  - [ ] Background, border, placeholder, focus ring
- [ ] **Panels**
  - [ ] Sidebar, inspector panels, dialogs
- [ ] **Tabs**
  - [ ] Active tab, hover, underline/border
- [ ] **Notifications**
  - [ ] Toasts/alerts for success, warning, danger
- [ ] **Links**
  - [ ] Standard link and hover
- [ ] **Optional polish**
  - [ ] Scrollbar styling to match themes (if supported)

---

## Epic 7: QA, Visual Validation, and Acceptance Criteria
**Context:** This is a UI refactor. It must look intentional and behave correctly.

- [ ] **No flicker**
  - [ ] Switching themes does not cause layout reflow or flash.
  - [ ] Refresh keeps the theme instantly.
- [ ] **No overlap / clipping**
  - [ ] Menus never clip off-screen.
  - [ ] Menus never hide behind canvas/sidebar.
  - [ ] Z-index is correct across menus, popovers, modals.
- [ ] **Keyboard navigation**
  - [ ] Menubar accessible via keyboard.
  - [ ] Arrow navigation works inside menus.
  - [ ] Esc closes menu.
  - [ ] Focus indicator always visible.
- [ ] **Consistency**
  - [ ] No stray hex colors left in components (except canvas fill).
  - [ ] All UI surfaces and text read clearly in both themes.
- [ ] **Deliverables**
  - [ ] Screenshot set:
    - [ ] Light theme, main screen
    - [ ] Dark theme, main screen
    - [ ] Open menus in both themes (File + View → Theme)
  - [ ] Short note of any remaining exceptions and why.

---