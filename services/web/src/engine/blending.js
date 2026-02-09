/**
 * Multi-Track Blending Engine
 * 
 * Defines how overlapping clips from different tracks combine.
 * Rule: higher track index wins per-property (last-write-wins).
 * Each clip produces property overrides for its target object(s).
 */

/**
 * Blend clip evaluation results from multiple tracks into final object states.
 * 
 * @param {Array<Object>} evaluatedClips - Array of { trackIndex, clipResult }
 *   where clipResult = { objectId, overrides: { x, y, opacity, ... }, morphState, hideIds }
 * @param {Object} baseObjects - Map of objectId -> base object state
 * @returns {{ objectOverrides: Object, morphShapes: Array, hiddenIds: Set }}
 */
export function blendClipResults(evaluatedClips, baseObjects) {
  const objectOverrides = {};
  const morphShapes = [];
  const hiddenIds = new Set();

  // Sort by track index (lower first, higher overwrites)
  const sorted = [...evaluatedClips].sort((a, b) => a.trackIndex - b.trackIndex);

  for (const { trackIndex, clipResult } of sorted) {
    if (!clipResult) continue;

    // Handle property overrides (move, scale, fade, rotate)
    if (clipResult.overrides && clipResult.objectId) {
      if (!objectOverrides[clipResult.objectId]) {
        objectOverrides[clipResult.objectId] = {};
      }
      // Higher track overwrites properties
      Object.assign(objectOverrides[clipResult.objectId], clipResult.overrides);
    }

    // Handle morph shapes (transform clips)
    if (clipResult.morphState) {
      morphShapes.push({
        ...clipResult.morphState,
        trackIndex,
        clipId: clipResult.clipId
      });
    }

    // Handle hidden object IDs (source/target during transform)
    if (clipResult.hideIds) {
      for (const id of clipResult.hideIds) {
        hiddenIds.add(id);
      }
    }
  }

  return { objectOverrides, morphShapes, hiddenIds };
}

/**
 * Apply overrides to a base object, returning a new object with merged properties.
 * Only overrides known animatable properties.
 */
export function applyOverrides(baseObj, overrides) {
  if (!overrides) return baseObj;

  return {
    ...baseObj,
    x: overrides.x !== undefined ? overrides.x : baseObj.x,
    y: overrides.y !== undefined ? overrides.y : baseObj.y,
    width: overrides.width !== undefined ? overrides.width : baseObj.width,
    height: overrides.height !== undefined ? overrides.height : baseObj.height,
    rotation: overrides.rotation !== undefined ? overrides.rotation : (baseObj.rotation || 0),
    opacity: overrides.opacity !== undefined ? overrides.opacity : (baseObj.opacity !== undefined ? baseObj.opacity : 1),
    fill: overrides.fill !== undefined ? overrides.fill : baseObj.fill,
    stroke: overrides.stroke !== undefined ? overrides.stroke : baseObj.stroke,
    scaleX: overrides.scaleX !== undefined ? overrides.scaleX : 1,
    scaleY: overrides.scaleY !== undefined ? overrides.scaleY : 1
  };
}

/**
 * Determine if a clip is active at a given time.
 * Zero-duration clips are active at exactly their start time.
 */
export function isClipActive(clip, time) {
  if (clip.duration <= 0) {
    return Math.abs(time - clip.startTime) < 1e-9;
  }
  return time >= clip.startTime && time < clip.startTime + clip.duration;
}

/**
 * Get the local progress of a clip at a given time.
 * @returns {number} Progress [0, 1], or -1 if not active
 */
export function getClipProgress(clip, time) {
  if (!isClipActive(clip, time)) return -1;
  if (clip.duration <= 0) return 1;
  return (time - clip.startTime) / clip.duration;
}

/**
 * Check if a transform clip has completed (time is past its end).
 */
export function isClipCompleted(clip, time) {
  return time >= clip.startTime + clip.duration;
}

export default {
  blendClipResults,
  applyOverrides,
  isClipActive,
  getClipProgress,
  isClipCompleted
};
