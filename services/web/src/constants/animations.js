/**
 * Animation Palette Constants
 * 
 * Curated animation types mapped to Manim.
 */

// Entrance animations
export const ENTRANCE_ANIMATIONS = [
  {
    type: 'FADE_IN',
    label: 'Fade In',
    appliesTo: ['text', 'image', 'svg'],
    description: 'Gradually appear'
  },
  {
    type: 'WRITE',
    label: 'Write',
    appliesTo: ['text', 'svg'],
    description: 'Draw stroke by stroke'
  },
  {
    type: 'CREATE',
    label: 'Create (Trace)',
    appliesTo: ['svg'],
    description: 'Trace the path progressively'
  },
  {
    type: 'DRAW_BORDER_THEN_FILL',
    label: 'Draw & Fill',
    appliesTo: ['svg'],
    description: 'Draw outline, then fill'
  },
  {
    type: 'SLIDE_IN_LEFT',
    label: 'Slide from Left',
    appliesTo: ['text', 'image', 'svg'],
    description: 'Enter from left edge'
  },
  {
    type: 'SLIDE_IN_RIGHT',
    label: 'Slide from Right',
    appliesTo: ['text', 'image', 'svg'],
    description: 'Enter from right edge'
  },
  {
    type: 'SLIDE_IN_UP',
    label: 'Slide from Top',
    appliesTo: ['text', 'image', 'svg'],
    description: 'Enter from top edge'
  },
  {
    type: 'SLIDE_IN_DOWN',
    label: 'Slide from Bottom',
    appliesTo: ['text', 'image', 'svg'],
    description: 'Enter from bottom edge'
  },
  {
    type: 'GROW_FROM_CENTER',
    label: 'Grow',
    appliesTo: ['text', 'image', 'svg'],
    description: 'Scale up from center'
  }
];

// Exit animations
export const EXIT_ANIMATIONS = [
  {
    type: 'FADE_OUT',
    label: 'Fade Out',
    appliesTo: ['text', 'image', 'svg'],
    description: 'Gradually disappear'
  },
  {
    type: 'UNCREATE',
    label: 'Uncreate',
    appliesTo: ['svg'],
    description: 'Reverse trace'
  },
  {
    type: 'SLIDE_OUT_LEFT',
    label: 'Slide to Left',
    appliesTo: ['text', 'image', 'svg'],
    description: 'Exit to left edge'
  },
  {
    type: 'SLIDE_OUT_RIGHT',
    label: 'Slide to Right',
    appliesTo: ['text', 'image', 'svg'],
    description: 'Exit to right edge'
  },
  {
    type: 'SLIDE_OUT_UP',
    label: 'Slide to Top',
    appliesTo: ['text', 'image', 'svg'],
    description: 'Exit to top edge'
  },
  {
    type: 'SLIDE_OUT_DOWN',
    label: 'Slide to Bottom',
    appliesTo: ['text', 'image', 'svg'],
    description: 'Exit to bottom edge'
  },
  {
    type: 'SHRINK_TO_CENTER',
    label: 'Shrink',
    appliesTo: ['text', 'image', 'svg'],
    description: 'Scale down to center'
  }
];

/**
 * Get available entrance animations for an element type.
 */
export function getEntranceAnimationsForType(elementType) {
  return ENTRANCE_ANIMATIONS.filter(a => a.appliesTo.includes(elementType));
}

/**
 * Get available exit animations for an element type.
 */
export function getExitAnimationsForType(elementType) {
  return EXIT_ANIMATIONS.filter(a => a.appliesTo.includes(elementType));
}

/**
 * Get animation by type.
 */
export function getAnimationByType(type, isEntrance = true) {
  const list = isEntrance ? ENTRANCE_ANIMATIONS : EXIT_ANIMATIONS;
  return list.find(a => a.type === type);
}

// Quality presets
export const QUALITY_PRESETS = [
  { value: 'low', label: 'Low Quality', description: '480p 15fps — Fast preview' },
  { value: 'medium', label: 'Medium Quality', description: '720p 30fps — Balanced' },
  { value: 'high', label: 'High Quality', description: '1080p 60fps — Full HD (Recommended)' },
  { value: 'production', label: 'Production Quality', description: '1440p 60fps — 2K' },
  { value: '4k', label: '4K Quality', description: '2160p 60fps — Ultra HD (Slow)' }
];

export default {
  ENTRANCE_ANIMATIONS,
  EXIT_ANIMATIONS,
  getEntranceAnimationsForType,
  getExitAnimationsForType,
  getAnimationByType,
  QUALITY_PRESETS
};
