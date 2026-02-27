/**
 * Manim Python Code Generator — v4 (server-side)
 *
 * Generates a clean Manim CE scene from the normalised project JSON.
 * Mirrors the client-side generator but uses server file paths for assets.
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

function rf(e)    { return EASING_MAP[e] || 'rate_functions.smooth'; }
function rfOpt(e) { const r = rf(e); return r === 'rate_functions.smooth' ? '' : `, rate_func=${r}`; }
function vn(id)   { let n = id.replace(/[^a-zA-Z0-9_]/g, '_'); return /^[0-9]/.test(n) ? 'o_' + n : n; }
function rtOpt(d) { return Math.abs(d - 1) < 0.01 ? '' : `, run_time=${d.toFixed(1)}`; }

/** Validate and format a color value for Manim. Returns quoted hex string or null. */
function hex(h) {
  if (!h || typeof h !== 'string') return null;
  const s = h.trim();
  if (!s || s === 'transparent' || s === 'none') return null;
  // Accept valid hex colors: #RGB, #RRGGBB, #RRGGBBAA
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s)) return `"${s}"`;
  // Reject anything that isn't a proper hex color
  return null;
}

/** Ensure a numeric value is valid and positive, with a fallback. */
function safeNum(v, fallback) {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return (Number.isFinite(n) && n > 0) ? n : fallback;
}

/** Clamp opacity to [0, 1]. */
function safeOpacity(v) {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 1;
}

/** Sanitise text for Python string literals. */
function safeText(s) {
  if (!s || typeof s !== 'string') return 'Text';
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '');
}

function stageToManim(x, y, sw, sh) {
  return { x: ((x / sw) - 0.5) * 14, y: -((y / sh) - 0.5) * 8 };
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

// ── Object code ─────────────────────────────────────────────────────────────

function objectCode(obj, sw, sh, assetsPath, assetMap) {
  const n = vn(obj.id), lines = [];
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
    case 'heart': {
      const mw = (obj.width / sw * 7).toFixed(3);
      const mh = (obj.height / sh * 4).toFixed(3);
      lines.push(`${n} = ParametricFunction(`);
      lines.push(`    lambda t: np.array([np.sin(t)**3 * ${mw}, (13*np.cos(t)-5*np.cos(2*t)-2*np.cos(3*t)-np.cos(4*t))/15 * ${mh}, 0]),`);
      lines.push(`    t_range=[0, 2*PI], color=${stroke})`);
      if (hasFill)
        lines.push(`${n}.set_fill(color=${fill}, opacity=${opacity})`);
      break;
    }
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
    case 'arrow': {
      const halfLen = (obj.width / 2 / sw * 14).toFixed(3);
      const tipLen = (7 / sw * 14).toFixed(3);
      lines.push(`${n} = Arrow(start=LEFT * ${halfLen}, end=RIGHT * ${halfLen}, color=${hex(obj.fill) || '"#EF4444"'}, buff=0, tip_length=${tipLen}, stroke_width=${sw2}, max_tip_length_to_length_ratio=0.15)`);
      break;
    }
    case 'text': {
      const fontFamily = obj.fontFamily || 'Roboto';
      const fontVar = `font_${vn(obj.id)}`;
      lines.push(`# Font: ${fontFamily}`);
      lines.push(`${n} = Text("${safeText(obj.content)}", font_size=${safeNum(obj.fontSize, 48)}, color=${fill}, font="${fontFamily}")`);
      break;
    }
    case 'dot':
      lines.push(`${n} = Dot(radius=${(obj.width / 2 / sw * 7).toFixed(3)}, color=${fill})`);
      break;
    case 'dot_grid': {
      const c = safeNum(obj.gridCols, 5), r = safeNum(obj.gridRows, 5);
      const sp = safeNum(obj.dotSpacing, 40) / sw * 7;
      lines.push(`${n} = VGroup(*[Dot(radius=0.06).move_to([c*${sp.toFixed(3)}-${((c - 1) * sp / 2).toFixed(3)}, r*${sp.toFixed(3)}-${((r - 1) * sp / 2).toFixed(3)}, 0]) for r in range(${r}) for c in range(${c})])`);
      if (hasFill)
        lines.push(`${n}.set_color(${fill})`);
      break;
    }
    case 'image': {
      const asset = obj.assetId ? assetMap[obj.assetId] : null;
      const filename = asset?.filename || `${(obj.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_')}.png`;
      const filePath = `${assetsPath}/${filename}`;
      lines.push(`${n} = ImageMobject("${filePath}").scale_to_fit_width(${(obj.width / sw * 14).toFixed(3)})`);
      break;
    }
    case 'svg_asset': {
      const asset = obj.assetId ? assetMap[obj.assetId] : null;
      const filename = asset?.filename || `${(obj.name || 'asset').replace(/[^a-zA-Z0-9._-]/g, '_')}.svg`;
      const filePath = `${assetsPath}/${filename}`;
      lines.push(`${n} = SVGMobject("${filePath}").scale_to_fit_width(${(obj.width / sw * 14).toFixed(3)})`);
      break;
    }
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
      lines.push(`${n} = Circle(radius=0.5)  # unknown type: ${obj.type}`);
  }

  lines.push(`${n}.move_to([${mp.x.toFixed(3)}, ${mp.y.toFixed(3)}, 0])`);
  if (obj.rotation) lines.push(`${n}.rotate(${(obj.rotation * Math.PI / 180).toFixed(4)})`);
  return lines;
}

// ── Main generator ──────────────────────────────────────────────────────────

export function generatePythonCode(project, assetsPath) {
  const L = [];
  const sw = project.stage.width;
  const sh = project.stage.height;
  const assetMap = project._assetMap || {};

  // Collect unique Google Fonts used by text objects
  const usedFonts = new Set();
  for (const obj of (project.objects || [])) {
    if (obj.type === 'text' && obj.fontFamily) {
      // Only register Google Fonts (not system fonts)
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

  if (!project.objects || project.objects.length === 0) {
    L.push('        self.wait(1)');
    return L.join('\n');
  }

  // Generate font registration and scene content
  // If we have Google Fonts, wrap everything in nested RegisterFont context managers
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

  // Object definitions
  const oMap = {};
  L.push(`${indent}# Objects`);
  for (const obj of project.objects) {
    oMap[obj.id] = obj;
    objectCode(obj, sw, sh, assetsPath, assetMap).forEach(l => L.push(indent + l));
    L.push('');
  }

  // Groups
  const groups = project.groups || [];
  if (groups.length > 0) {
    L.push(`${indent}# Groups`);
    for (const g of groups) {
      if (!g.childIds || g.childIds.length === 0) continue;
      const childVars = g.childIds.map(id => vn(id)).filter(Boolean).join(', ');
      const gn = vn(g.id);
      L.push(`${indent}${gn} = VGroup(${childVars})`);
    }
    L.push('');
  }

  // Collect clips
  const clips = [];
  for (const track of project.tracks) {
    for (const clip of track.clips) clips.push(clip);
  }
  clips.sort((a, b) => a.startTime - b.startTime);

  // Determine transform relationships
  const transformSources = new Set();
  const transformTargets = new Set();
  for (const c of clips) {
    if (c.type === 'transform') {
      transformSources.add(c.sourceId);
      if (c.targetId) transformTargets.add(c.targetId);
    }
  }

  // Build animation steps
  const steps = [];

  // Enter (skip transform targets)
  for (const obj of project.objects) {
    if (transformTargets.has(obj.id)) continue;
    const t = obj.enterTime || 0;
    const n = vn(obj.id);
    const dur = obj.enterAnimDur || 0.5;
    const rt = rtOpt(dur);
    const enterAnim = obj.enterAnim || 'fade_in';

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
    const sn = vn(c.sourceId);
    const dur = c.duration;
    const rtStr = rtOpt(dur);
    const rfStr = rfOpt(c.easing);
    let code;

    switch (c.type) {
      case 'transform': {
        const tn = vn(c.targetId);
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

  // Exit (skip transform sources)
  for (const obj of project.objects) {
    if (transformSources.has(obj.id)) continue;
    let exitTime = (obj.enterTime || 0) + (obj.duration || 3);
    for (const c of clips) {
      const end = c.startTime + c.duration;
      if ((c.sourceId === obj.id || c.targetId === obj.id) && end > exitTime) exitTime = end + 0.1;
    }
    const n = vn(obj.id);
    const exitAnim = obj.exitAnim || 'none';
    const dur = obj.exitAnimDur || 0.5;
    const rt = rtOpt(dur);

    let exitCode;
    switch (exitAnim) {
      case 'none':
        continue;
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

  // Sort
  steps.sort((a, b) => a.time - b.time || a.order - b.order);

  // Emit
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

export { objectCode, EASING_MAP };
