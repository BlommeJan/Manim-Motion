/**
 * Shape Geometry Engine
 * 
 * Generates outline point arrays for each shape type.
 * Points are centered at (0, 0) and fit within the given dimensions.
 * Used for rendering and morph interpolation.
 */

const QUALITY_POINT_COUNTS = { low: 32, medium: 64, high: 128 };

/**
 * Generate outline points for a shape.
 * @param {string} type - Shape type
 * @param {number} width - Bounding width
 * @param {number} height - Bounding height
 * @param {string} quality - 'low' | 'medium' | 'high'
 * @returns {Array<{x: number, y: number}>}
 */
export function generateShapePoints(type, width, height, quality = 'medium') {
  const n = QUALITY_POINT_COUNTS[quality] || 64;
  switch (type) {
    case 'heart':     return generateHeartPoints(width, height, n);
    case 'square':    return generateSquarePoints(width, height, n);
    case 'rectangle': return generateSquarePoints(width, height, n);
    case 'circle':    return generateCirclePoints(width, height, n);
    case 'ellipse':   return generateCirclePoints(width, height, n);
    case 'dot':       return generateCirclePoints(width, height, n);
    case 'dot_grid':  return generateCirclePoints(width, height, n);
    case 'triangle':  return generateTrianglePoints(width, height, n);
    case 'star':      return generateStarPoints(width, height, n, 5, 0.4);
    case 'polygon':   return generatePolygonPoints(width, height, n, 6);
    case 'line':      return generateLinePoints(width, height, n);
    case 'arrow':     return generateArrowPoints(width, height, n);
    case 'text':      return generateSquarePoints(width, height, n);
    default:          return generateCirclePoints(width, height, n);
  }
}

/**
 * Heart shape using parametric equations.
 */
export function generateHeartPoints(width, height, numPoints) {
  const raw = [];
  for (let i = 0; i < numPoints; i++) {
    const t = (i / numPoints) * 2 * Math.PI;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    raw.push({ x, y });
  }

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of raw) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  return raw.map(p => ({
    x: ((p.x - cx) / rangeX) * width,
    y: -((p.y - cy) / rangeY) * height
  }));
}

/**
 * Square/Rectangle with points distributed evenly along perimeter.
 */
export function generateSquarePoints(width, height, numPoints) {
  const w = width;
  const h = height;
  const perimeter = 2 * w + 2 * h;
  const points = [];

  for (let i = 0; i < numPoints; i++) {
    const d = (i / numPoints) * perimeter;
    let x, y;

    if (d < w) {
      x = -w / 2 + d;
      y = -h / 2;
    } else if (d < w + h) {
      x = w / 2;
      y = -h / 2 + (d - w);
    } else if (d < 2 * w + h) {
      x = w / 2 - (d - w - h);
      y = h / 2;
    } else {
      x = -w / 2;
      y = h / 2 - (d - 2 * w - h);
    }

    points.push({ x, y });
  }
  return points;
}

/**
 * Circle / ellipse points distributed evenly by angle.
 */
export function generateCirclePoints(width, height, numPoints) {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    points.push({
      x: Math.cos(angle) * width / 2,
      y: Math.sin(angle) * height / 2
    });
  }
  return points;
}

/**
 * Equilateral triangle with points distributed along perimeter.
 */
export function generateTrianglePoints(width, height, numPoints) {
  const hw = width / 2;
  const hh = height / 2;
  // Three vertices: top-center, bottom-left, bottom-right
  const verts = [
    { x: 0, y: -hh },
    { x: hw, y: hh },
    { x: -hw, y: hh }
  ];

  // Distribute points evenly along the triangle perimeter
  const segments = [];
  let totalLen = 0;
  for (let i = 0; i < 3; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % 3];
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segments.push({ a, b, len });
    totalLen += len;
  }

  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const targetDist = (i / numPoints) * totalLen;
    let cumLen = 0;
    for (const seg of segments) {
      if (cumLen + seg.len >= targetDist || seg === segments[segments.length - 1]) {
        const frac = (targetDist - cumLen) / seg.len;
        points.push({
          x: seg.a.x + (seg.b.x - seg.a.x) * Math.max(0, Math.min(1, frac)),
          y: seg.a.y + (seg.b.y - seg.a.y) * Math.max(0, Math.min(1, frac))
        });
        break;
      }
      cumLen += seg.len;
    }
  }
  return points;
}

/**
 * Star shape with n arms and inner radius ratio.
 */
export function generateStarPoints(width, height, numPoints, arms = 5, innerRatio = 0.4) {
  const hw = width / 2;
  const hh = height / 2;
  // Generate star vertices (alternating outer and inner)
  const starVerts = [];
  for (let i = 0; i < arms * 2; i++) {
    const angle = (i / (arms * 2)) * 2 * Math.PI - Math.PI / 2;
    const r = i % 2 === 0 ? 1 : innerRatio;
    starVerts.push({
      x: Math.cos(angle) * r * hw,
      y: Math.sin(angle) * r * hh
    });
  }

  // Distribute numPoints evenly along the star perimeter
  const segments = [];
  let totalLen = 0;
  for (let i = 0; i < starVerts.length; i++) {
    const a = starVerts[i];
    const b = starVerts[(i + 1) % starVerts.length];
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segments.push({ a, b, len });
    totalLen += len;
  }

  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const targetDist = (i / numPoints) * totalLen;
    let cumLen = 0;
    for (const seg of segments) {
      if (cumLen + seg.len >= targetDist || seg === segments[segments.length - 1]) {
        const frac = Math.max(0, Math.min(1, (targetDist - cumLen) / seg.len));
        points.push({
          x: seg.a.x + (seg.b.x - seg.a.x) * frac,
          y: seg.a.y + (seg.b.y - seg.a.y) * frac
        });
        break;
      }
      cumLen += seg.len;
    }
  }
  return points;
}

/**
 * Regular polygon with n sides.
 */
export function generatePolygonPoints(width, height, numPoints, sides = 6) {
  const hw = width / 2;
  const hh = height / 2;
  // Generate polygon vertices
  const polyVerts = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * 2 * Math.PI - Math.PI / 2;
    polyVerts.push({
      x: Math.cos(angle) * hw,
      y: Math.sin(angle) * hh
    });
  }

  // Distribute numPoints evenly along the polygon perimeter
  const segments = [];
  let totalLen = 0;
  for (let i = 0; i < polyVerts.length; i++) {
    const a = polyVerts[i];
    const b = polyVerts[(i + 1) % polyVerts.length];
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segments.push({ a, b, len });
    totalLen += len;
  }

  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const targetDist = (i / numPoints) * totalLen;
    let cumLen = 0;
    for (const seg of segments) {
      if (cumLen + seg.len >= targetDist || seg === segments[segments.length - 1]) {
        const frac = Math.max(0, Math.min(1, (targetDist - cumLen) / seg.len));
        points.push({
          x: seg.a.x + (seg.b.x - seg.a.x) * frac,
          y: seg.a.y + (seg.b.y - seg.a.y) * frac
        });
        break;
      }
      cumLen += seg.len;
    }
  }
  return points;
}

/**
 * Line as a very thin shape (two parallel paths).
 */
export function generateLinePoints(width, height, numPoints) {
  const hw = width / 2;
  const thickness = 2;
  const half = numPoints / 2;
  const points = [];
  // Top edge left to right
  for (let i = 0; i < half; i++) {
    const frac = i / (half - 1);
    points.push({ x: -hw + frac * width, y: -thickness });
  }
  // Bottom edge right to left
  for (let i = 0; i < numPoints - half; i++) {
    const frac = i / (numPoints - half - 1);
    points.push({ x: hw - frac * width, y: thickness });
  }
  return points;
}

/**
 * Arrow shape (line with triangular head).
 */
export function generateArrowPoints(width, height, numPoints) {
  const hw = width / 2;
  const hh = height / 2;
  const headSize = Math.min(width * 0.3, height * 0.5);
  const shaftWidth = height * 0.15;
  const headStart = hw - headSize;

  // Arrow polygon: shaft + triangle head
  const arrowVerts = [
    { x: -hw, y: -shaftWidth },            // shaft top-left
    { x: headStart, y: -shaftWidth },       // shaft top-right
    { x: headStart, y: -hh },              // head top
    { x: hw, y: 0 },                        // head tip
    { x: headStart, y: hh },               // head bottom
    { x: headStart, y: shaftWidth },        // shaft bottom-right
    { x: -hw, y: shaftWidth }              // shaft bottom-left
  ];

  // Distribute numPoints evenly along the arrow perimeter
  const segments = [];
  let totalLen = 0;
  for (let i = 0; i < arrowVerts.length; i++) {
    const a = arrowVerts[i];
    const b = arrowVerts[(i + 1) % arrowVerts.length];
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segments.push({ a, b, len });
    totalLen += len;
  }

  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const targetDist = (i / numPoints) * totalLen;
    let cumLen = 0;
    for (const seg of segments) {
      if (cumLen + seg.len >= targetDist || seg === segments[segments.length - 1]) {
        const frac = Math.max(0, Math.min(1, (targetDist - cumLen) / seg.len));
        points.push({
          x: seg.a.x + (seg.b.x - seg.a.x) * frac,
          y: seg.a.y + (seg.b.y - seg.a.y) * frac
        });
        break;
      }
      cumLen += seg.len;
    }
  }
  return points;
}

/**
 * Generate dot grid positions (centers of dots in the grid).
 */
export function generateDotGridPositions(cols, rows, spacing) {
  const positions = [];
  const totalWidth = (cols - 1) * spacing;
  const totalHeight = (rows - 1) * spacing;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push({
        x: c * spacing - totalWidth / 2,
        y: r * spacing - totalHeight / 2
      });
    }
  }
  return positions;
}

/**
 * Flatten {x,y} array to flat [x1,y1,x2,y2,...] for Konva.
 */
export function pointsToFlat(points) {
  const flat = new Array(points.length * 2);
  for (let i = 0; i < points.length; i++) {
    flat[i * 2] = points[i].x;
    flat[i * 2 + 1] = points[i].y;
  }
  return flat;
}

/**
 * Convert flat [x1,y1,...] to {x,y} array.
 */
export function flatToPoints(flat) {
  const points = [];
  for (let i = 0; i < flat.length; i += 2) {
    points.push({ x: flat[i], y: flat[i + 1] });
  }
  return points;
}

/**
 * Compute the total arc length of a point path (closed or open).
 */
export function pathLength(points, closed = true) {
  let length = 0;
  const n = points.length;
  if (n < 2) return 0;
  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  if (closed && n > 2) {
    const dx = points[0].x - points[n - 1].x;
    const dy = points[0].y - points[n - 1].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
}

/**
 * Compute bounding box of points.
 */
export function boundingBox(points) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}

export default {
  generateShapePoints,
  generateHeartPoints,
  generateSquarePoints,
  generateCirclePoints,
  generateTrianglePoints,
  generateStarPoints,
  generatePolygonPoints,
  generateLinePoints,
  generateArrowPoints,
  generateDotGridPositions,
  pointsToFlat,
  flatToPoints,
  pathLength,
  boundingBox,
  QUALITY_POINT_COUNTS
};
