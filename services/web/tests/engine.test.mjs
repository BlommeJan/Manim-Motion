/**
 * Engine Tests
 * 
 * Run: node services/web/tests/engine.test.mjs
 * 
 * Tests cover:
 *  1. Easing functions (correct values at key points)
 *  2. Transform point resampling (correct count, path preservation)
 *  3. Timeline clip scheduling (active clips, blending)
 */

import { EASING_FUNCTIONS, getEasing, evaluateEasing, overshootSettle } from '../src/engine/easing.js';
import { generateShapePoints, generateHeartPoints, generateSquarePoints, generateCirclePoints, pathLength } from '../src/engine/geometry.js';
import { resamplePoints, interpolatePoints, interpolateColor, lerp } from '../src/engine/transform.js';
import { isClipActive, getClipProgress, blendClipResults } from '../src/engine/blending.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${message}`);
  }
}

function assertApprox(actual, expected, epsilon, message) {
  assert(Math.abs(actual - expected) < epsilon, `${message} (got ${actual}, expected ~${expected})`);
}

function section(name) {
  console.log(`\n=== ${name} ===`);
}

// ─── Test 1: Easing Functions ────────────────────────────────────────────────

section('Easing Functions');

// All easings should return 0 at t=0 and 1 at t=1 (except overshoot-based)
const standardEasings = ['linear', 'ease_in', 'ease_out', 'ease_in_out', 'ease_in_cubic', 'ease_out_cubic', 'ease_in_out_cubic'];
for (const name of standardEasings) {
  const fn = EASING_FUNCTIONS[name];
  assertApprox(fn(0), 0, 0.001, `${name}(0) should be ~0`);
  assertApprox(fn(1), 1, 0.001, `${name}(1) should be ~1`);
}

// Linear should be identity
assertApprox(EASING_FUNCTIONS.linear(0.5), 0.5, 0.001, 'linear(0.5) should be 0.5');
assertApprox(EASING_FUNCTIONS.linear(0.25), 0.25, 0.001, 'linear(0.25) should be 0.25');

// ease_in should be slow start (value < t at midpoint)
assert(EASING_FUNCTIONS.ease_in(0.5) < 0.5, 'ease_in(0.5) should be < 0.5 (slow start)');

// ease_out should be fast start (value > t at midpoint)
assert(EASING_FUNCTIONS.ease_out(0.5) > 0.5, 'ease_out(0.5) should be > 0.5 (fast start)');

// ease_in_out should be 0.5 at midpoint
assertApprox(EASING_FUNCTIONS.ease_in_out(0.5), 0.5, 0.05, 'ease_in_out(0.5) should be ~0.5');

// ease_out_back should overshoot
assert(EASING_FUNCTIONS.ease_out_back(0.7) > 1.0, 'ease_out_back(0.7) should overshoot past 1.0');

// evaluateEasing with overshoot
const overshootVal = evaluateEasing(0.5, 'ease_in_out', 0.04, 1.0);
assert(typeof overshootVal === 'number' && !isNaN(overshootVal), 'evaluateEasing with overshoot should return a number');

// overshootSettle should reach near overshoot peak at ~70%
const peakVal = overshootSettle(0.7, 1.04, 1.0);
assert(peakVal > 1.0, 'overshootSettle(0.7, 1.04) should be > 1.0');
assertApprox(overshootSettle(1.0, 1.04, 1.0), 1.0, 0.01, 'overshootSettle(1.0) should settle to 1.0');

// getEasing returns a function
assert(typeof getEasing('linear') === 'function', 'getEasing returns a function');
assert(typeof getEasing('nonexistent') === 'function', 'getEasing fallback returns ease_in_out');

// ─── Test 2: Geometry & Point Resampling ─────────────────────────────────────

section('Geometry & Transform Resampling');

// Generate shape points
const heartPts = generateHeartPoints(100, 100, 64);
assert(heartPts.length === 64, `Heart should have 64 points (got ${heartPts.length})`);

const squarePts = generateSquarePoints(100, 100, 32);
assert(squarePts.length === 32, `Square should have 32 points (got ${squarePts.length})`);

const circlePts = generateCirclePoints(100, 100, 48);
assert(circlePts.length === 48, `Circle should have 48 points (got ${circlePts.length})`);

// All points should have x and y properties
assert(heartPts.every(p => typeof p.x === 'number' && typeof p.y === 'number'), 'Heart points should have numeric x, y');
assert(squarePts.every(p => typeof p.x === 'number' && typeof p.y === 'number'), 'Square points should have numeric x, y');

// Resampling: should produce exact target count
const resampled32 = resamplePoints(heartPts, 32);
assert(resampled32.length === 32, `Resampled heart to 32 should have 32 points (got ${resampled32.length})`);

const resampled128 = resamplePoints(squarePts, 128);
assert(resampled128.length === 128, `Resampled square to 128 should have 128 points (got ${resampled128.length})`);

// Resampling should preserve approximate bounding box
function bbox(pts) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, maxX, minY, maxY };
}

const origBB = bbox(heartPts);
const resampledBB = bbox(resampled32);
assertApprox(resampledBB.minX, origBB.minX, 5, 'Resampled bounding box minX should be preserved');
assertApprox(resampledBB.maxX, origBB.maxX, 5, 'Resampled bounding box maxX should be preserved');

// Resampling with same count should produce similar points
const resampledSame = resamplePoints(circlePts, 48);
assert(resampledSame.length === 48, 'Resampled circle to same count should have 48 points');
// First point should be very close to original first point
assertApprox(resampledSame[0].x, circlePts[0].x, 1, 'Resampled same-count first point X should match');

// Edge case: single point
const singlePt = resamplePoints([{ x: 5, y: 10 }], 10);
assert(singlePt.length === 10, 'Resampling single point to 10 should produce 10 points');
assert(singlePt.every(p => p.x === 5 && p.y === 10), 'All resampled points from single source should be identical');

// Edge case: empty
const emptyPts = resamplePoints([], 10);
assert(emptyPts.length === 0, 'Resampling empty array should return empty');

// Interpolation between points
const ptsA = [{ x: 0, y: 0 }, { x: 10, y: 0 }];
const ptsB = [{ x: 0, y: 10 }, { x: 10, y: 10 }];
const interp = interpolatePoints(ptsA, ptsB, 0.5);
assertApprox(interp[0].y, 5, 0.01, 'Interpolated midpoint Y should be 5');
assertApprox(interp[1].x, 10, 0.01, 'Interpolated midpoint X should stay at 10');

// Color interpolation
const midColor = interpolateColor('#000000', '#ffffff', 0.5);
assert(midColor === '#808080' || midColor === '#7f7f7f' || midColor === '#7f8080', `Mid color should be ~gray (got ${midColor})`);

// lerp
assertApprox(lerp(0, 100, 0.5), 50, 0.01, 'lerp(0, 100, 0.5) should be 50');
assertApprox(lerp(10, 20, 0), 10, 0.01, 'lerp at t=0 should be start');
assertApprox(lerp(10, 20, 1), 20, 0.01, 'lerp at t=1 should be end');

// ─── Test 3: Timeline Scheduling ─────────────────────────────────────────────

section('Timeline Clip Scheduling');

const testClip = {
  id: 'clip_1',
  type: 'move',
  startTime: 2.0,
  duration: 3.0,
  easing: 'ease_in_out',
  sourceId: 'obj_1'
};

// isClipActive
assert(isClipActive(testClip, 2.0), 'Clip should be active at startTime');
assert(isClipActive(testClip, 3.5), 'Clip should be active at midpoint');
assert(!isClipActive(testClip, 1.9), 'Clip should NOT be active before start');
assert(!isClipActive(testClip, 5.0), 'Clip should NOT be active at exactly end (start + duration)');
assert(!isClipActive(testClip, 6.0), 'Clip should NOT be active after end');

// getClipProgress
assertApprox(getClipProgress(testClip, 2.0), 0, 0.01, 'Progress at start should be 0');
assertApprox(getClipProgress(testClip, 3.5), 0.5, 0.01, 'Progress at midpoint should be 0.5');
assertApprox(getClipProgress(testClip, 4.9), 0.966, 0.05, 'Progress near end should be ~0.97');
assert(getClipProgress(testClip, 1.0) === -1, 'Progress before start should be -1');
assert(getClipProgress(testClip, 5.5) === -1, 'Progress after end should be -1');

// Zero-duration clip
const zeroDurClip = { startTime: 1.0, duration: 0 };
assertApprox(getClipProgress(zeroDurClip, 1.0), 1, 0.01, 'Zero-duration clip progress should be 1 at start');

// blendClipResults: higher track wins
const clipResults = [
  { trackIndex: 0, clipResult: { objectId: 'obj_1', overrides: { x: 100 }, clipId: 'c1' } },
  { trackIndex: 1, clipResult: { objectId: 'obj_1', overrides: { x: 200 }, clipId: 'c2' } }
];
const blended = blendClipResults(clipResults, {});
assert(blended.objectOverrides['obj_1'].x === 200, 'Higher track (track 1) should win: x should be 200');

// Morph shapes should be collected
const morphClipResults = [
  {
    trackIndex: 0,
    clipResult: {
      clipId: 'c3',
      morphState: { points: [{ x: 0, y: 0 }], fill: '#ff0000' },
      hideIds: ['obj_a', 'obj_b']
    }
  }
];
const morphBlended = blendClipResults(morphClipResults, {});
assert(morphBlended.morphShapes.length === 1, 'Should have 1 morph shape');
assert(morphBlended.hiddenIds.has('obj_a'), 'obj_a should be hidden during morph');
assert(morphBlended.hiddenIds.has('obj_b'), 'obj_b should be hidden during morph');

// Multiple clips on different objects (independent)
const independentClips = [
  { trackIndex: 0, clipResult: { objectId: 'obj_1', overrides: { opacity: 0.5 }, clipId: 'c4' } },
  { trackIndex: 0, clipResult: { objectId: 'obj_2', overrides: { opacity: 0.8 }, clipId: 'c5' } }
];
const indBlended = blendClipResults(independentClips, {});
assertApprox(indBlended.objectOverrides['obj_1'].opacity, 0.5, 0.01, 'obj_1 opacity should be 0.5');
assertApprox(indBlended.objectOverrides['obj_2'].opacity, 0.8, 0.01, 'obj_2 opacity should be 0.8');

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All tests passed!');
  process.exit(0);
}
