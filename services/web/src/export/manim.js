/**
 * Manim Python Code Exporter + Parser v4
 *
 * CODEGEN:  project JSON → clean Manim CE scene.py
 * PARSER:   Manim code   → project JSON (objects + clips)
 *
 * Supports: rectangle, square, circle, ellipse, triangle, star, polygon,
 *           line, arrow, heart, dot, dot_grid, text, image, svg_asset, groups
 */

// ── Helpers ─────────────────────────────────────────────────────────────────

const EASING_MAP = {
  linear: 'linear', ease_in: 'rate_functions.ease_in_sine',
  ease_out: 'rate_functions.ease_out_sine', ease_in_out: 'rate_functions.smooth',
  ease_in_cubic: 'rate_functions.ease_in_cubic', ease_out_cubic: 'rate_functions.ease_out_cubic',
  ease_in_out_cubic: 'rate_functions.smooth', ease_in_back: 'rate_functions.ease_in_back',
  ease_out_back: 'rate_functions.ease_out_back', ease_out_bounce: 'rate_functions.ease_out_bounce',
  spring: 'rate_functions.smooth'
};

const EASING_REV = {};
for (const [k, val] of Object.entries(EASING_MAP)) EASING_REV[val] = k;

function rf(e)   { return EASING_MAP[e] || 'rate_functions.smooth'; }
function rfOpt(e) { const r = rf(e); return r === 'rate_functions.smooth' ? '' : `, rate_func=${r}`; }
function v(id)   { let n = id.replace(/[^a-zA-Z0-9_]/g, '_'); return /^[0-9]/.test(n) ? 'o_' + n : n; }
function rtOpt(d) { return Math.abs(d - 1) < 0.01 ? '' : `, run_time=${d.toFixed(1)}`; }

/** Validate and format a color value for Manim. Returns quoted hex string or null. */
function hex(h) {
  if (!h || typeof h !== 'string') return null;
  const s = h.trim();
  if (!s || s === 'transparent' || s === 'none') return null;
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s)) return `"${s}"`;
  return null;
}

/** Ensure a numeric value is valid and positive, with a fallback. */
function safeNum(val, fallback) {
  const n = typeof val === 'number' ? val : parseFloat(val);
  return (Number.isFinite(n) && n > 0) ? n : fallback;
}

/** Clamp opacity to [0, 1]. */
function safeOpacity(val) {
  const n = typeof val === 'number' ? val : parseFloat(val);
  return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 1;
}

/** Sanitise text for Python string literals. */
function safeText(s) {
  if (!s || typeof s !== 'string') return 'Text';
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '');
}

function stageToManim(x, y, w, h) {
  return { x: ((x / w) - 0.5) * 14, y: -((y / h) - 0.5) * 8 };
}
function manimToStage(mx, my, w, h) {
  return { x: (mx / 14 + 0.5) * w, y: (-my / 8 + 0.5) * h };
}

/** Check if a font is a common system font (not requiring download from Google Fonts) */
function isSystemFont(fontFamily) {
  const systemFonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Georgia',
    'Courier New', 'Courier', 'Verdana', 'Tahoma', 'Trebuchet MS',
    'Impact', 'Comic Sans MS', 'Lucida Console', 'Monaco',
    'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'
  ];
  return systemFonts.some(f => f.toLowerCase() === fontFamily.toLowerCase());
}

// ── Object code (single object definition) ──────────────────────────────────

function objCode(obj, sw, sh) {
  const n = v(obj.id), lines = [];
  const scale = Math.min(obj.width, obj.height) / sw * 7;
  const mp = stageToManim(obj.x, obj.y, sw, sh);

  // Helpers for this object
  const fill = hex(obj.fill) || '"#FFFFFF"';
  const stroke = hex(obj.stroke) || '"#FFFFFF"';
  const opacity = safeOpacity(obj.opacity);
  const sw2 = safeNum(obj.strokeWidth, 2);
  const hasFill = hex(obj.fill) !== null;
  const hasStroke = hex(obj.stroke) !== null;

  switch (obj.type) {
    case 'heart':
      lines.push(`${n} = ParametricFunction(`);
      lines.push(`    lambda t: np.array([16*np.sin(t)**3, 13*np.cos(t)-5*np.cos(2*t)-2*np.cos(3*t)-np.cos(4*t), 0]) * ${(obj.width / sw * 3).toFixed(3)},`);
      lines.push(`    t_range=[0, 2*PI], color=${stroke})`);
      if (hasFill)
        lines.push(`${n}.set_fill(color=${fill}, opacity=${opacity})`);
      break;
    case 'rectangle':
      lines.push(`${n} = Rectangle(width=${(obj.width / sw * 14).toFixed(3)}, height=${(obj.height / sh * 8).toFixed(3)})`);
      if (hasFill)
        lines.push(`${n}.set_fill(color=${fill}, opacity=${opacity})`);
      if (hasStroke)
        lines.push(`${n}.set_stroke(color=${stroke}, width=${sw2})`);
      break;
    case 'square':
      lines.push(`${n} = Square(side_length=${scale.toFixed(3)})`);
      if (hasFill)
        lines.push(`${n}.set_fill(color=${fill}, opacity=${opacity})`);
      if (hasStroke)
        lines.push(`${n}.set_stroke(color=${stroke}, width=${sw2})`);
      break;
    case 'circle':
      lines.push(`${n} = Circle(radius=${(scale / 2).toFixed(3)})`);
      if (hasFill)
        lines.push(`${n}.set_fill(color=${fill}, opacity=${opacity})`);
      if (hasStroke)
        lines.push(`${n}.set_stroke(color=${stroke}, width=${sw2})`);
      break;
    case 'ellipse':
      lines.push(`${n} = Ellipse(width=${(obj.width / sw * 14).toFixed(3)}, height=${(obj.height / sh * 8).toFixed(3)})`);
      if (hasFill)
        lines.push(`${n}.set_fill(color=${fill}, opacity=${opacity})`);
      if (hasStroke)
        lines.push(`${n}.set_stroke(color=${stroke}, width=${sw2})`);
      break;
    case 'triangle':
      lines.push(`${n} = Triangle().scale(${scale.toFixed(3)})`);
      if (hasFill)
        lines.push(`${n}.set_fill(color=${fill}, opacity=${opacity})`);
      if (hasStroke)
        lines.push(`${n}.set_stroke(color=${stroke}, width=${sw2})`);
      break;
    case 'star': {
      const arms = safeNum(obj.starArms, 5);
      const inner = safeNum(obj.innerRatio, 0.4);
      lines.push(`${n} = Star(n=${arms}, outer_radius=${(scale / 2).toFixed(3)}, inner_radius=${(scale / 2 * inner).toFixed(3)})`);
      if (hasFill)
        lines.push(`${n}.set_fill(color=${fill}, opacity=${opacity})`);
      if (hasStroke)
        lines.push(`${n}.set_stroke(color=${stroke}, width=${sw2})`);
      break;
    }
    case 'polygon': {
      const sides = safeNum(obj.sides, 6);
      lines.push(`${n} = RegularPolygon(n=${sides}).scale(${(scale / 2).toFixed(3)})`);
      if (hasFill)
        lines.push(`${n}.set_fill(color=${fill}, opacity=${opacity})`);
      if (hasStroke)
        lines.push(`${n}.set_stroke(color=${stroke}, width=${sw2})`);
      break;
    }
    case 'line':
      lines.push(`${n} = Line(LEFT * ${(obj.width / 2 / sw * 14).toFixed(3)}, RIGHT * ${(obj.width / 2 / sw * 14).toFixed(3)})`);
      lines.push(`${n}.set_stroke(color=${hex(obj.stroke) || hex(obj.fill) || '"#FFFFFF"'}, width=${safeNum(obj.strokeWidth, 3)})`);
      break;
    case 'arrow':
      lines.push(`${n} = Arrow(start=LEFT * ${(obj.width / 2 / sw * 14).toFixed(3)}, end=RIGHT * ${(obj.width / 2 / sw * 14).toFixed(3)}, color=${hex(obj.fill) || '"#EF4444"'})`);
      break;
    case 'text': {
      const fontFamily = obj.fontFamily || 'Roboto';
      lines.push(`# Font: ${fontFamily}`);
      lines.push(`${n} = Text("${safeText(obj.content)}", font_size=${safeNum(obj.fontSize, 48)}, color=${fill}, font="${fontFamily}")`);
      break;
    }
    case 'dot':
      lines.push(`${n} = Dot(radius=${(obj.width / 2 / sw * 7).toFixed(3)}, color=${fill})`);
      break;
    case 'dot_grid': {
      const c = safeNum(obj.gridCols, 5), r = safeNum(obj.gridRows, 5), sp = safeNum(obj.dotSpacing, 40) / sw * 7;
      lines.push(`${n} = VGroup(*[Dot(radius=0.06).move_to([c*${sp.toFixed(3)}-${((c - 1) * sp / 2).toFixed(3)}, r*${sp.toFixed(3)}-${((r - 1) * sp / 2).toFixed(3)}, 0]) for r in range(${r}) for c in range(${c})])`);
      if (hasFill)
        lines.push(`${n}.set_color(${fill})`);
      break;
    }
    case 'image':
      lines.push(`${n} = ImageMobject("${obj.name || 'image'}.png").scale_to_fit_width(${(obj.width / sw * 14).toFixed(3)})`);
      break;
    case 'svg_asset':
      lines.push(`${n} = SVGMobject("${obj.name || 'asset'}.svg").scale_to_fit_width(${(obj.width / sw * 14).toFixed(3)})`);
      break;
    case 'latex': {
      const texStr = (obj.latex || 'E = mc^2').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      lines.push(`${n} = MathTex(r"${texStr}", color=${fill})`);
      lines.push(`${n}.scale(${(scale * 2).toFixed(3)})`);
      break;
    }
    case 'axes': {
      const xr = obj.xRange || [-5, 5, 1];
      const yr = obj.yRange || [-3, 3, 1];
      lines.push(`${n} = Axes(x_range=[${xr[0]}, ${xr[1]}, ${xr[2]}], y_range=[${yr[0]}, ${yr[1]}, ${yr[2]}], x_length=${(obj.width / sw * 14).toFixed(1)}, y_length=${(obj.height / sh * 8).toFixed(1)}, tips=True)`);
      break;
    }
    default:
      lines.push(`${n} = Circle(radius=0.5)  # ${obj.type}`);
  }
  lines.push(`${n}.move_to([${mp.x.toFixed(3)}, ${mp.y.toFixed(3)}, 0])`);
  if (obj.rotation) lines.push(`${n}.rotate(${(obj.rotation * Math.PI / 180).toFixed(4)})`);
  return lines;
}

// ═════════════════════════════════════════════════════════════════════════════
// CODEGEN: project → Manim Python
// ═════════════════════════════════════════════════════════════════════════════

export function generateManimScript(project) {
  const L = [], sw = project.stage.width, sh = project.stage.height;

  // Collect unique Google Fonts used by text objects
  const usedFonts = new Set();
  for (const obj of (project.objects || [])) {
    if (obj.type === 'text' && obj.fontFamily) {
      const font = obj.fontFamily;
      if (font && !isSystemFont(font)) {
        usedFonts.add(font);
      }
    }
  }
  const fontsArray = Array.from(usedFonts);

  // Header
  L.push('"""');
  L.push(`Manim Studio – ${project.name}`);
  L.push('Run:  manim -qh scene.py MainScene');
  L.push('"""');
  L.push('');
  L.push('from manim import *');
  L.push('import numpy as np');
  if (fontsArray.length > 0) {
    L.push('from manim_fonts import RegisterFont');
  }
  L.push('');
  L.push('');
  L.push('class MainScene(Scene):');
  L.push('    def construct(self):');
  const bgColor = hex(project.stage.backgroundColor) || '"#000000"';
  L.push(`        self.camera.background_color = ${bgColor}`);
  L.push('');

  if (project.objects.length === 0) {
    L.push('        self.wait(1)');
    return L.join('\n');
  }

  // Generate font registration and scene content
  let indent = '        ';
  if (fontsArray.length > 0) {
    L.push(`${indent}# Register Google Fonts`);
    for (let i = 0; i < fontsArray.length; i++) {
      const font = fontsArray[i];
      const varName = `fonts_${i}`;
      L.push(`${indent}with RegisterFont("${font}") as ${varName}:`);
      indent += '    ';
    }
    L.push('');
  }

  // ── Object definitions ──
  const oMap = {};
  L.push(`${indent}# Objects`);
  for (const o of project.objects) {
    oMap[o.id] = o;
    objCode(o, sw, sh).forEach(l => L.push(indent + l));
    L.push('');
  }

  // ── Groups ──
  const groups = project.groups || [];
  if (groups.length > 0) {
    L.push(`${indent}# Groups`);
    for (const g of groups) {
      if (!g.childIds || g.childIds.length === 0) continue;
      const childVars = g.childIds.map(id => v(id)).filter(Boolean).join(', ');
      const gn = v(g.id);
      L.push(`${indent}${gn} = VGroup(${childVars})`);
    }
    L.push('');
  }

  // ── Collect clips ──
  const clips = [];
  for (const t of project.tracks) for (const c of t.clips) clips.push(c);
  clips.sort((a, b) => a.startTime - b.startTime);

  // ── Determine transform relationships ──
  const transformSources = new Set();
  const transformTargets = new Set();
  for (const c of clips) {
    if (c.type === 'transform') {
      transformSources.add(c.sourceId);
      if (c.targetId) transformTargets.add(c.targetId);
    }
  }

  // ── Build animation steps ──
  const steps = [];

  // Enter: skip objects that are transform targets
  for (const o of project.objects) {
    if (transformTargets.has(o.id)) continue;
    const t = o.enterTime || 0;
    const n = v(o.id);
    const dur = o.enterAnimDur || 0.5;
    const rt = rtOpt(dur);
    const enterAnim = o.enterAnim || 'fade_in';

    let enterCode;
    switch (enterAnim) {
      case 'none':
        enterCode = `self.add(${n})`;
        break;
      case 'fade_in':
        enterCode = `self.play(FadeIn(${n})${rt})`;
        break;
      case 'grow_in':
        enterCode = `self.play(GrowFromCenter(${n})${rt})`;
        break;
      case 'fly_in_left':
        enterCode = `self.play(FadeIn(${n}, shift=RIGHT)${rt})`;
        break;
      case 'fly_in_right':
        enterCode = `self.play(FadeIn(${n}, shift=LEFT)${rt})`;
        break;
      case 'fly_in_top':
        enterCode = `self.play(FadeIn(${n}, shift=DOWN)${rt})`;
        break;
      case 'fly_in_bottom':
        enterCode = `self.play(FadeIn(${n}, shift=UP)${rt})`;
        break;
      case 'draw':
        enterCode = `self.play(Create(${n})${rt})`;
        break;
      case 'write':
        enterCode = `self.play(Write(${n})${rt})`;
        break;
      case 'spin_in':
        enterCode = `self.play(SpinInFromNothing(${n})${rt})`;
        break;
      case 'bounce_in':
        enterCode = `self.play(GrowFromCenter(${n}, rate_func=rate_functions.ease_out_bounce)${rt})`;
        break;
      default:
        enterCode = `self.play(FadeIn(${n})${rt})`;
    }
    steps.push({ time: t, order: 0, code: enterCode, dur: enterAnim === 'none' ? 0 : dur });
  }

  // Clip animations
  for (const c of clips) {
    const sn = v(c.sourceId);
    const dur = c.duration;
    const rtStr = rtOpt(dur);
    const rfStr = rfOpt(c.easing);
    let code;

    switch (c.type) {
      case 'transform': {
        const tn = v(c.targetId);
        const srcObj = oMap[c.sourceId], tgtObj = oMap[c.targetId];
        const hasRaster = ['image', 'svg_asset'].includes(srcObj?.type) || ['image', 'svg_asset'].includes(tgtObj?.type);
        const anim = hasRaster ? 'FadeTransform' : 'ReplacementTransform';
        code = `self.play(${anim}(${sn}, ${tn})${rtStr}${rfStr})`;
        break;
      }
      case 'move': {
        const mp = stageToManim(c.params?.targetX || 0, c.params?.targetY || 0, sw, sh);
        code = `self.play(${sn}.animate.move_to([${mp.x.toFixed(2)}, ${mp.y.toFixed(2)}, 0])${rtStr}${rfStr})`;
        break;
      }
      case 'scale':
        code = `self.play(${sn}.animate.scale(${(c.params?.targetScaleX || 1).toFixed(2)})${rtStr}${rfStr})`;
        break;
      case 'fade': {
        const op = c.params?.targetOpacity ?? 0;
        code = op < 0.01
          ? `self.play(FadeOut(${sn})${rtStr}${rfStr})`
          : `self.play(${sn}.animate.set_opacity(${op.toFixed(2)})${rtStr}${rfStr})`;
        break;
      }
      case 'rotate': {
        const ang = ((c.params?.targetRotation || 360) - (oMap[c.sourceId]?.rotation || 0)) * Math.PI / 180;
        code = `self.play(Rotate(${sn}, angle=${ang.toFixed(2)})${rtStr}${rfStr})`;
        break;
      }
    }
    if (code) steps.push({ time: c.startTime, order: 1, code, dur });
  }

  // Exit: skip objects that are transform sources
  for (const o of project.objects) {
    if (transformSources.has(o.id)) continue;
    let exitTime = (o.enterTime || 0) + (o.duration || 3);
    for (const c of clips) {
      const end = c.startTime + c.duration;
      if ((c.sourceId === o.id || c.targetId === o.id) && end > exitTime) exitTime = end + 0.1;
    }
    const n = v(o.id);
    const exitAnim = o.exitAnim || 'none';
    const dur = o.exitAnimDur || 0.5;
    const rt = rtOpt(dur);

    let exitCode;
    switch (exitAnim) {
      case 'none':
        continue; // Skip entirely
      case 'fade_out':
        exitCode = `self.play(FadeOut(${n})${rt})`;
        break;
      case 'shrink_out':
        exitCode = `self.play(ShrinkToCenter(${n})${rt})`;
        break;
      case 'fly_out_left':
        exitCode = `self.play(FadeOut(${n}, shift=LEFT)${rt})`;
        break;
      case 'fly_out_right':
        exitCode = `self.play(FadeOut(${n}, shift=RIGHT)${rt})`;
        break;
      case 'fly_out_top':
        exitCode = `self.play(FadeOut(${n}, shift=UP)${rt})`;
        break;
      case 'fly_out_bottom':
        exitCode = `self.play(FadeOut(${n}, shift=DOWN)${rt})`;
        break;
      case 'uncreate':
        exitCode = `self.play(Uncreate(${n})${rt})`;
        break;
      case 'spin_out':
        exitCode = `self.play(FadeOut(${n}, shift=OUT, scale=0.5)${rt})`;
        break;
      default:
        exitCode = `self.play(FadeOut(${n})${rt})`;
    }
    steps.push({ time: exitTime, order: 2, code: exitCode, dur });
  }

  // Sort: by time, then enter → clip → exit
  steps.sort((a, b) => a.time - b.time || a.order - b.order);

  // ── Emit animation code ──
  L.push(`${indent}# Animation`);
  let t = 0;
  for (const step of steps) {
    const wait = step.time - t;
    if (wait > 0.05) L.push(`${indent}self.wait(${wait.toFixed(1)})`);
    L.push(`${indent}${step.code}`);
    t = step.time + (step.dur || 0.5);
  }

  L.push('');
  L.push(`${indent}self.wait(1)`);
  return L.join('\n');
}

// ═════════════════════════════════════════════════════════════════════════════
// PARSER: Manim Python → project JSON
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Parse Manim Python code back into project objects, tracks, and stage.
 */
export function parseManimScript(code, sw = 1920, sh = 1080) {
  const lines = code.split('\n').map(l => l.trim());
  const objects = [];
  const clips   = [];
  const varMap  = {};
  const objById = {};

  let bgColor = '#000000';
  let ct = 0;
  let clipIdx = 0;
  let objIdx  = 0;

  const uid = (prefix) => `${prefix}_${Date.now().toString(36)}_${(objIdx++).toString(36)}`;

  for (const line of lines) {
    let m;

    // Background
    m = line.match(/self\.camera\.background_color\s*=\s*["']([^"']+)["']/);
    if (m) { bgColor = m[1]; continue; }

    // Square
    m = line.match(/^(\w+)\s*=\s*Square\(side_length=([\d.]+)\)/);
    if (m) {
      const [, name, sl] = m;
      const size = Math.round(parseFloat(sl) / 7 * sw);
      const id = uid('obj');
      const obj = { id, type: 'square', name, x: sw / 2, y: sh / 2, width: size, height: size, fill: '#ffffff', stroke: 'transparent', strokeWidth: 2, opacity: 1, rotation: 0, enterTime: 0, duration: 10, enterAnim: 'fade_in', exitAnim: 'fade_out', zOrder: objects.length };
      objects.push(obj); varMap[name] = id; objById[id] = obj;
      continue;
    }

    // Rectangle
    m = line.match(/^(\w+)\s*=\s*Rectangle\(width=([\d.]+),\s*height=([\d.]+)\)/);
    if (m) {
      const [, name, w, h] = m;
      const id = uid('obj');
      const obj = { id, type: 'rectangle', name, x: sw / 2, y: sh / 2, width: Math.round(parseFloat(w) / 14 * sw), height: Math.round(parseFloat(h) / 8 * sh), fill: '#ffffff', stroke: 'transparent', strokeWidth: 2, opacity: 1, rotation: 0, enterTime: 0, duration: 10, enterAnim: 'fade_in', exitAnim: 'fade_out', zOrder: objects.length };
      objects.push(obj); varMap[name] = id; objById[id] = obj;
      continue;
    }

    // Circle
    m = line.match(/^(\w+)\s*=\s*Circle\(radius=([\d.]+)\)/);
    if (m) {
      const [, name, r] = m;
      const size = Math.round(parseFloat(r) * 2 / 7 * sw);
      const id = uid('obj');
      const obj = { id, type: 'circle', name, x: sw / 2, y: sh / 2, width: size, height: size, fill: '#ffffff', stroke: 'transparent', strokeWidth: 2, opacity: 1, rotation: 0, enterTime: 0, duration: 10, enterAnim: 'fade_in', exitAnim: 'fade_out', zOrder: objects.length };
      objects.push(obj); varMap[name] = id; objById[id] = obj;
      continue;
    }

    // Ellipse
    m = line.match(/^(\w+)\s*=\s*Ellipse\(width=([\d.]+),\s*height=([\d.]+)\)/);
    if (m) {
      const [, name, w, h] = m;
      const id = uid('obj');
      const obj = { id, type: 'ellipse', name, x: sw / 2, y: sh / 2, width: Math.round(parseFloat(w) / 14 * sw), height: Math.round(parseFloat(h) / 8 * sh), fill: '#ffffff', stroke: 'transparent', strokeWidth: 2, opacity: 1, rotation: 0, enterTime: 0, duration: 10, enterAnim: 'fade_in', exitAnim: 'fade_out', zOrder: objects.length };
      objects.push(obj); varMap[name] = id; objById[id] = obj;
      continue;
    }

    // Triangle
    m = line.match(/^(\w+)\s*=\s*Triangle\(\)\.scale\(([\d.]+)\)/);
    if (m) {
      const [, name, sc] = m;
      const size = Math.round(parseFloat(sc) / 7 * sw);
      const id = uid('obj');
      const obj = { id, type: 'triangle', name, x: sw / 2, y: sh / 2, width: size, height: size, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2, opacity: 1, rotation: 0, enterTime: 0, duration: 10, enterAnim: 'fade_in', exitAnim: 'fade_out', zOrder: objects.length };
      objects.push(obj); varMap[name] = id; objById[id] = obj;
      continue;
    }

    // Star
    m = line.match(/^(\w+)\s*=\s*Star\(n=(\d+),\s*outer_radius=([\d.]+),\s*inner_radius=([\d.]+)\)/);
    if (m) {
      const [, name, arms, outerR, innerR] = m;
      const size = Math.round(parseFloat(outerR) * 2 / 7 * sw);
      const id = uid('obj');
      const obj = { id, type: 'star', name, x: sw / 2, y: sh / 2, width: size, height: size, starArms: parseInt(arms), innerRatio: parseFloat(innerR) / parseFloat(outerR), fill: '#eab308', stroke: '#ffffff', strokeWidth: 2, opacity: 1, rotation: 0, enterTime: 0, duration: 10, enterAnim: 'fade_in', exitAnim: 'fade_out', zOrder: objects.length };
      objects.push(obj); varMap[name] = id; objById[id] = obj;
      continue;
    }

    // RegularPolygon
    m = line.match(/^(\w+)\s*=\s*RegularPolygon\(n=(\d+)\)\.scale\(([\d.]+)\)/);
    if (m) {
      const [, name, sides, sc] = m;
      const size = Math.round(parseFloat(sc) * 2 / 7 * sw);
      const id = uid('obj');
      const obj = { id, type: 'polygon', name, x: sw / 2, y: sh / 2, width: size, height: size, sides: parseInt(sides), fill: '#8b5cf6', stroke: '#ffffff', strokeWidth: 2, opacity: 1, rotation: 0, enterTime: 0, duration: 10, enterAnim: 'fade_in', exitAnim: 'fade_out', zOrder: objects.length };
      objects.push(obj); varMap[name] = id; objById[id] = obj;
      continue;
    }

    // Text
    m = line.match(/^(\w+)\s*=\s*Text\("([^"]*)",\s*font_size=(\d+)(?:,\s*color=["']([^"']+)["'])?\)/);
    if (m) {
      const [, name, content, fontSize, color] = m;
      const id = uid('obj');
      const obj = { id, type: 'text', name, content, fontSize: parseInt(fontSize), x: sw / 2, y: sh / 2, width: 200, height: 50, fill: color || '#ffffff', opacity: 1, rotation: 0, enterTime: 0, duration: 10, enterAnim: 'fade_in', exitAnim: 'fade_out', zOrder: objects.length };
      objects.push(obj); varMap[name] = id; objById[id] = obj;
      continue;
    }

    // Dot
    m = line.match(/^(\w+)\s*=\s*Dot\((?:radius=([\d.]+))?[^)]*(?:color=["']([^"']+)["'])?\)/);
    if (m) {
      const [, name, r, color] = m;
      const size = r ? Math.round(parseFloat(r) * 2 / 7 * sw) : 20;
      const id = uid('obj');
      const obj = { id, type: 'dot', name, x: sw / 2, y: sh / 2, width: size, height: size, fill: color || '#ffffff', opacity: 1, rotation: 0, enterTime: 0, duration: 10, enterAnim: 'fade_in', exitAnim: 'fade_out', zOrder: objects.length };
      objects.push(obj); varMap[name] = id; objById[id] = obj;
      continue;
    }

    // ParametricFunction (heart)
    m = line.match(/^(\w+)\s*=\s*ParametricFunction\(/);
    if (m) {
      const id = uid('obj');
      const obj = { id, type: 'heart', name: m[1], x: sw / 2, y: sh / 2, width: 120, height: 120, fill: '#ef4444', stroke: '#ffffff', strokeWidth: 2, opacity: 1, rotation: 0, enterTime: 0, duration: 10, enterAnim: 'fade_in', exitAnim: 'fade_out', zOrder: objects.length };
      objects.push(obj); varMap[m[1]] = id; objById[id] = obj;
      continue;
    }

    // ImageMobject
    m = line.match(/^(\w+)\s*=\s*ImageMobject\(["']([^"']+)["']\)(?:\.scale_to_fit_width\(([\d.]+)\))?/);
    if (m) {
      const [, name, path, w] = m;
      const width = w ? Math.round(parseFloat(w) / 14 * sw) : 200;
      const id = uid('obj');
      const obj = { id, type: 'image', name, x: sw / 2, y: sh / 2, width, height: Math.round(width * 0.75), fill: '#ffffff', opacity: 1, rotation: 0, enterTime: 0, duration: 10, enterAnim: 'fade_in', exitAnim: 'fade_out', zOrder: objects.length };
      objects.push(obj); varMap[name] = id; objById[id] = obj;
      continue;
    }

    // SVGMobject
    m = line.match(/^(\w+)\s*=\s*SVGMobject\(["']([^"']+)["']\)(?:\.scale_to_fit_width\(([\d.]+)\))?/);
    if (m) {
      const [, name, path, w] = m;
      const width = w ? Math.round(parseFloat(w) / 14 * sw) : 200;
      const id = uid('obj');
      const obj = { id, type: 'svg_asset', name, x: sw / 2, y: sh / 2, width, height: Math.round(width * 0.75), fill: '#ffffff', opacity: 1, rotation: 0, enterTime: 0, duration: 10, enterAnim: 'fade_in', exitAnim: 'fade_out', zOrder: objects.length };
      objects.push(obj); varMap[name] = id; objById[id] = obj;
      continue;
    }

    // MathTex (LaTeX)
    m = line.match(/^(\w+)\s*=\s*MathTex\(r?"([^"]*)"(?:,\s*color=["']([^"']+)["'])?\)/);
    if (m) {
      const [, name, latex, color] = m;
      const id = uid('obj');
      const obj = { id, type: 'latex', name, latex, x: sw / 2, y: sh / 2, width: 200, height: 80, fill: color || '#ffffff', opacity: 1, rotation: 0, enterTime: 0, duration: 10, enterAnim: 'fade_in', exitAnim: 'fade_out', zOrder: objects.length };
      objects.push(obj); varMap[name] = id; objById[id] = obj;
      continue;
    }

    // Axes
    m = line.match(/^(\w+)\s*=\s*Axes\(x_range=\[([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\],\s*y_range=\[([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\]/);
    if (m) {
      const [, name, x0, x1, xs, y0, y1, ys] = m;
      const id = uid('obj');
      const obj = { id, type: 'axes', name, x: sw / 2, y: sh / 2, width: 400, height: 300, fill: '#ffffff', stroke: '#ffffff', strokeWidth: 2, opacity: 1, rotation: 0, xRange: [parseFloat(x0), parseFloat(x1), parseFloat(xs)], yRange: [parseFloat(y0), parseFloat(y1), parseFloat(ys)], enterTime: 0, duration: 10, enterAnim: 'fade_in', exitAnim: 'fade_out', zOrder: objects.length };
      objects.push(obj); varMap[name] = id; objById[id] = obj;
      continue;
    }

    // ── Property setters ──

    m = line.match(/^(\w+)\.set_fill\(color=["']([^"']+)["'](?:,\s*opacity=([\d.]+))?\)/);
    if (m) {
      const id = varMap[m[1]];
      if (id && objById[id]) {
        objById[id].fill = m[2];
        if (m[3] !== undefined) objById[id].opacity = parseFloat(m[3]);
      }
      continue;
    }

    m = line.match(/^(\w+)\.set_stroke\(color=["']([^"']+)["'](?:,\s*width=([\d.]+))?\)/);
    if (m) {
      const id = varMap[m[1]];
      if (id && objById[id]) {
        objById[id].stroke = m[2];
        if (m[3]) objById[id].strokeWidth = parseFloat(m[3]);
      }
      continue;
    }

    m = line.match(/^(\w+)\.set_color\(["']([^"']+)["']\)/);
    if (m) {
      const id = varMap[m[1]];
      if (id && objById[id]) objById[id].fill = m[2];
      continue;
    }

    m = line.match(/^(\w+)\.move_to\(\[([-\d.]+),\s*([-\d.]+),\s*0\]\)/);
    if (m) {
      const id = varMap[m[1]];
      if (id && objById[id]) {
        const sp = manimToStage(parseFloat(m[2]), parseFloat(m[3]), sw, sh);
        objById[id].x = Math.round(sp.x);
        objById[id].y = Math.round(sp.y);
      }
      continue;
    }

    m = line.match(/^(\w+)\.rotate\(([-\d.]+)\)/);
    if (m) {
      const id = varMap[m[1]];
      if (id && objById[id]) objById[id].rotation = Math.round(parseFloat(m[2]) * 180 / Math.PI * 10) / 10;
      continue;
    }

    // ── Animations ──

    m = line.match(/^self\.wait\(([\d.]+)\)/);
    if (m) { ct += parseFloat(m[1]); continue; }

    m = line.match(/^self\.play\(FadeIn\((\w+)\)(?:,\s*run_time=([\d.]+))?\)/);
    if (m) {
      const id = varMap[m[1]];
      if (id && objById[id]) { objById[id].enterTime = ct; objById[id].enterAnim = 'fade_in'; }
      ct += parseFloat(m[2] || 0.5);
      continue;
    }

    m = line.match(/^self\.play\(Create\((\w+)\)(?:,\s*run_time=([\d.]+))?\)/);
    if (m) {
      const id = varMap[m[1]];
      if (id && objById[id]) { objById[id].enterTime = ct; objById[id].enterAnim = 'none'; }
      ct += parseFloat(m[2] || 1);
      continue;
    }

    m = line.match(/^self\.play\((?:ReplacementTransform|FadeTransform|Transform)\((\w+),\s*(\w+)\)(?:,\s*run_time=([\d.]+))?(?:,\s*rate_func=([^\s)]+))?\)/);
    if (m) {
      const srcId = varMap[m[1]], tgtId = varMap[m[2]];
      if (srcId && tgtId) {
        const dur = parseFloat(m[3] || 1);
        const easing = m[4] ? (EASING_REV[m[4]] || 'ease_in_out') : 'ease_in_out';
        clips.push({ id: `clip_${clipIdx++}`, type: 'transform', sourceId: srcId, targetId: tgtId, startTime: ct, duration: dur, easing });
        ct += dur;
      }
      continue;
    }

    m = line.match(/^self\.play\(Rotate\((\w+),\s*angle=([-\d.]+)\)(?:,\s*run_time=([\d.]+))?/);
    if (m) {
      const id = varMap[m[1]];
      if (id) {
        const dur = parseFloat(m[3] || 1);
        clips.push({ id: `clip_${clipIdx++}`, type: 'rotate', sourceId: id, startTime: ct, duration: dur, easing: 'ease_in_out', params: { targetRotation: Math.round(parseFloat(m[2]) * 180 / Math.PI) } });
        ct += dur;
      }
      continue;
    }

    m = line.match(/^self\.play\(FadeOut\((\w+)\)(?:,\s*run_time=([\d.]+))?\)/);
    if (m) {
      const id = varMap[m[1]];
      if (id && objById[id]) { objById[id].exitAnim = 'fade_out'; objById[id].duration = ct - (objById[id].enterTime || 0) + parseFloat(m[2] || 0.5); }
      ct += parseFloat(m[2] || 0.5);
      continue;
    }

    m = line.match(/^self\.play\((\w+)\.animate\.move_to\(\[([-\d.]+),\s*([-\d.]+),\s*0\]\)(?:,\s*run_time=([\d.]+))?/);
    if (m) {
      const id = varMap[m[1]];
      if (id) {
        const sp = manimToStage(parseFloat(m[2]), parseFloat(m[3]), sw, sh);
        const dur = parseFloat(m[4] || 1);
        clips.push({ id: `clip_${clipIdx++}`, type: 'move', sourceId: id, startTime: ct, duration: dur, easing: 'ease_in_out', params: { targetX: Math.round(sp.x), targetY: Math.round(sp.y) } });
        ct += dur;
      }
      continue;
    }

    m = line.match(/^self\.play\((\w+)\.animate\.scale\(([\d.]+)\)(?:,\s*run_time=([\d.]+))?/);
    if (m) {
      const id = varMap[m[1]];
      if (id) {
        const dur = parseFloat(m[3] || 1);
        clips.push({ id: `clip_${clipIdx++}`, type: 'scale', sourceId: id, startTime: ct, duration: dur, easing: 'ease_in_out', params: { targetScaleX: parseFloat(m[2]), targetScaleY: parseFloat(m[2]) } });
        ct += dur;
      }
      continue;
    }

    m = line.match(/^self\.play\((\w+)\.animate\.set_opacity\(([\d.]+)\)(?:,\s*run_time=([\d.]+))?/);
    if (m) {
      const id = varMap[m[1]];
      if (id) {
        const dur = parseFloat(m[3] || 1);
        clips.push({ id: `clip_${clipIdx++}`, type: 'fade', sourceId: id, startTime: ct, duration: dur, easing: 'ease_in_out', params: { targetOpacity: parseFloat(m[2]) } });
        ct += dur;
      }
      continue;
    }
  }

  // Finalize object durations
  for (const obj of objects) {
    if (obj.duration >= 10) obj.duration = Math.max(3, ct + 1 - (obj.enterTime || 0));
  }

  return {
    objects,
    tracks: clips.length > 0 ? [{ id: 'track_parsed', name: 'Track 1', clips }] : [],
    stage: { backgroundColor: bgColor, width: sw, height: sh }
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// DOWNLOAD helper
// ═════════════════════════════════════════════════════════════════════════════

export function downloadManimScript(project) {
  const script = generateManimScript(project);
  const blob = new Blob([script], { type: 'text/x-python' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'scene.py'; a.click();
  URL.revokeObjectURL(url);
  return script;
}

export default { generateManimScript, parseManimScript, downloadManimScript };
