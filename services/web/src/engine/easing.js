/**
 * Easing Functions Library
 * 
 * All functions map t ∈ [0,1] → value (usually [0,1] but may overshoot).
 * Includes standard CSS-like easings plus animation-quality overshoot/settle.
 */

export const EASING_FUNCTIONS = {
  linear(t) {
    return t;
  },

  ease_in(t) {
    return t * t;
  },

  ease_out(t) {
    return t * (2 - t);
  },

  ease_in_out(t) {
    return t < 0.5
      ? 2 * t * t
      : -1 + (4 - 2 * t) * t;
  },

  ease_in_cubic(t) {
    return t * t * t;
  },

  ease_out_cubic(t) {
    const t1 = t - 1;
    return t1 * t1 * t1 + 1;
  },

  ease_in_out_cubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 + (t - 1) * (2 * t - 2) * (2 * t - 2);
  },

  ease_in_quart(t) {
    return t * t * t * t;
  },

  ease_out_quart(t) {
    const t1 = t - 1;
    return 1 - t1 * t1 * t1 * t1;
  },

  ease_in_out_quart(t) {
    return t < 0.5
      ? 8 * t * t * t * t
      : 1 - 8 * (t - 1) * (t - 1) * (t - 1) * (t - 1);
  },

  ease_in_back(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },

  ease_out_back(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  ease_in_out_back(t) {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },

  ease_out_elastic(t) {
    if (t === 0 || t === 1) return t;
    const c4 = (2 * Math.PI) / 3;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  ease_in_elastic(t) {
    if (t === 0 || t === 1) return t;
    const c4 = (2 * Math.PI) / 3;
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },

  ease_out_bounce(t) {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },

  spring(t) {
    // Damped spring oscillation: fast snap with single overshoot then settle
    return 1 - Math.exp(-6 * t) * Math.cos(6 * t);
  }
};

/**
 * Apply overshoot-settle easing on top of a base easing.
 * Reaches `overshoot` (e.g. 1.04) at ~70% of duration, then settles to `settle` (e.g. 1.0).
 * 
 * @param {number} t - Raw progress [0, 1]
 * @param {number} overshoot - Peak value (default 1.04)
 * @param {number} settle - Final value (default 1.0)
 * @returns {number}
 */
export function overshootSettle(t, overshoot = 1.04, settle = 1.0) {
  if (t <= 0) return 0;
  if (t >= 1) return settle;

  // Two-phase: ease to overshoot, then ease back to settle
  const peakTime = 0.7;
  if (t < peakTime) {
    const localT = t / peakTime;
    const eased = EASING_FUNCTIONS.ease_out_cubic(localT);
    return eased * overshoot;
  } else {
    const localT = (t - peakTime) / (1 - peakTime);
    const eased = EASING_FUNCTIONS.ease_in_out(localT);
    return overshoot + (settle - overshoot) * eased;
  }
}

/**
 * Get an easing function by name.
 * @param {string} name - Easing function name
 * @returns {function(number): number}
 */
export function getEasing(name) {
  return EASING_FUNCTIONS[name] || EASING_FUNCTIONS.ease_in_out;
}

/**
 * Evaluate easing at a given progress with optional overshoot.
 * @param {number} t - Progress [0, 1]
 * @param {string} easingName - Easing function name
 * @param {number} overshootAmount - If > 0, apply overshoot settle
 * @param {number} settleValue - Final settle value
 * @returns {number}
 */
export function evaluateEasing(t, easingName = 'ease_in_out', overshootAmount = 0, settleValue = 1.0) {
  const clampedT = Math.max(0, Math.min(1, t));
  const baseEased = getEasing(easingName)(clampedT);

  if (overshootAmount > 0) {
    return overshootSettle(baseEased, 1 + overshootAmount, settleValue);
  }

  return baseEased;
}

/**
 * List of all available easing names for UI display.
 */
export const EASING_LIST = [
  { value: 'linear',          label: 'Linear' },
  { value: 'ease_in',         label: 'Ease In' },
  { value: 'ease_out',        label: 'Ease Out' },
  { value: 'ease_in_out',     label: 'Ease In/Out' },
  { value: 'ease_in_cubic',   label: 'Ease In Cubic' },
  { value: 'ease_out_cubic',  label: 'Ease Out Cubic' },
  { value: 'ease_in_out_cubic', label: 'Ease In/Out Cubic' },
  { value: 'ease_in_quart',   label: 'Ease In Quart' },
  { value: 'ease_out_quart',  label: 'Ease Out Quart' },
  { value: 'ease_in_out_quart', label: 'Ease In/Out Quart' },
  { value: 'ease_in_back',    label: 'Ease In Back' },
  { value: 'ease_out_back',   label: 'Ease Out Back' },
  { value: 'ease_in_out_back', label: 'Ease In/Out Back' },
  { value: 'ease_out_elastic', label: 'Elastic Out' },
  { value: 'ease_in_elastic', label: 'Elastic In' },
  { value: 'ease_out_bounce', label: 'Bounce Out' },
  { value: 'spring',          label: 'Spring' }
];

export default {
  EASING_FUNCTIONS,
  EASING_LIST,
  getEasing,
  evaluateEasing,
  overshootSettle
};
