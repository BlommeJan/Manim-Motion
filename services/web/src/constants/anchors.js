/**
 * Anchor Grid Constants
 * 
 * 3x3 anchor positions for element placement.
 */

export const ANCHORS = [
  'TOP_LEFT', 'TOP', 'TOP_RIGHT',
  'LEFT', 'CENTER', 'RIGHT',
  'BOTTOM_LEFT', 'BOTTOM', 'BOTTOM_RIGHT'
];

// Grid layout for the anchor picker
export const ANCHOR_GRID = [
  ['TOP_LEFT', 'TOP', 'TOP_RIGHT'],
  ['LEFT', 'CENTER', 'RIGHT'],
  ['BOTTOM_LEFT', 'BOTTOM', 'BOTTOM_RIGHT']
];

// Display labels
export const ANCHOR_LABELS = {
  'TOP_LEFT': '↖',
  'TOP': '↑',
  'TOP_RIGHT': '↗',
  'LEFT': '←',
  'CENTER': '●',
  'RIGHT': '→',
  'BOTTOM_LEFT': '↙',
  'BOTTOM': '↓',
  'BOTTOM_RIGHT': '↘'
};

// Manim position mapping (for reference in UI)
export const ANCHOR_POSITIONS = {
  'TOP_LEFT': { x: -1, y: 1 },
  'TOP': { x: 0, y: 1 },
  'TOP_RIGHT': { x: 1, y: 1 },
  'LEFT': { x: -1, y: 0 },
  'CENTER': { x: 0, y: 0 },
  'RIGHT': { x: 1, y: 0 },
  'BOTTOM_LEFT': { x: -1, y: -1 },
  'BOTTOM': { x: 0, y: -1 },
  'BOTTOM_RIGHT': { x: 1, y: -1 }
};

/**
 * Convert anchor to stage position (for canvas preview).
 * @param {string} anchor - Anchor name
 * @param {number} stageWidth - Stage width in pixels
 * @param {number} stageHeight - Stage height in pixels
 * @param {number} padding - Edge padding
 * @returns {{ x: number, y: number }}
 */
export function anchorToStagePosition(anchor, stageWidth, stageHeight, padding = 50) {
  const pos = ANCHOR_POSITIONS[anchor] || ANCHOR_POSITIONS.CENTER;
  
  // Map -1..1 to padding..width-padding
  const x = ((pos.x + 1) / 2) * (stageWidth - padding * 2) + padding;
  const y = ((1 - pos.y) / 2) * (stageHeight - padding * 2) + padding; // Y inverted for canvas
  
  return { x, y };
}

export default {
  ANCHORS,
  ANCHOR_GRID,
  ANCHOR_LABELS,
  ANCHOR_POSITIONS,
  anchorToStagePosition
};
