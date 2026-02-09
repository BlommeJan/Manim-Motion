/**
 * Project Normalizer — v2
 *
 * Applies defaults, clamps values, and prepares the new project schema
 * (stage/objects/tracks/clips/assets) for code generation.
 */

/**
 * Normalize a validated project.
 * @param {Object} project - Validated project JSON (v2 schema)
 * @returns {Object} Normalized project ready for codegen
 */
export function normalizeProject(project) {
  const norm = JSON.parse(JSON.stringify(project)); // deep clone

  // ── Stage ──
  norm.stage = {
    width: norm.stage?.width ?? 1920,
    height: norm.stage?.height ?? 1080,
    backgroundColor: norm.stage?.backgroundColor ?? '#000000',
    ...(norm.stage || {})
  };

  // ── Objects ──
  norm.objects = (norm.objects || []).map(obj => ({
    ...obj,
    x: obj.x ?? norm.stage.width / 2,
    y: obj.y ?? norm.stage.height / 2,
    width: Math.max(1, obj.width ?? 120),
    height: Math.max(1, obj.height ?? 120),
    rotation: obj.rotation ?? 0,
    opacity: clamp(obj.opacity ?? 1, 0, 1),
    enterTime: Math.max(0, obj.enterTime ?? 0),
    duration: Math.max(0.1, obj.duration ?? 3),
    enterAnim: obj.enterAnim ?? 'fade_in',
    exitAnim: obj.exitAnim ?? 'fade_out',
    enterAnimDur: Math.max(0.1, obj.enterAnimDur ?? 0.5),
    exitAnimDur: Math.max(0.1, obj.exitAnimDur ?? 0.5)
  }));

  // ── Groups ──
  norm.groups = (norm.groups || []).map(g => ({
    ...g,
    childIds: g.childIds || [],
    margin: g.margin ?? 10
  }));

  // ── Asset lookup map ──
  norm._assetMap = {};
  for (const asset of norm.assets || []) {
    norm._assetMap[asset.id] = asset;
  }

  // ── Tracks & clips ──
  norm.tracks = (norm.tracks || []).map(track => ({
    ...track,
    clips: (track.clips || []).map(clip => ({
      ...clip,
      startTime: Math.max(0, clip.startTime ?? 0),
      duration: Math.max(0.1, clip.duration ?? 1.5),
      easing: clip.easing ?? 'ease_in_out',
      params: clip.params ?? {}
    }))
  }));

  return norm;
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export { normalizeProject as default };
