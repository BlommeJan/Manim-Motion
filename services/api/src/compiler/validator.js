/**
 * Project JSON Validator — v2
 *
 * Validates the new project schema: stage, objects, tracks/clips, assets.
 */

import { z } from 'zod';

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const StageSchema = z.object({
  width: z.number().positive().default(1920),
  height: z.number().positive().default(1080),
  backgroundColor: z.string().default('#000000'),
  gridVisible: z.boolean().default(true),
  gridSize: z.number().default(5),
  snapEnabled: z.boolean().default(true),
  snapToGrid: z.boolean().default(true),
  snapToCenter: z.boolean().default(true)
}).passthrough().default({});

const AssetSchema = z.object({
  id: z.string().min(1),
  name: z.string().default('Asset'),
  filename: z.string().optional(),
  type: z.enum(['image', 'svg']),
  width: z.number().optional(),
  height: z.number().optional()
}).passthrough();

const ObjectSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),  // rectangle, square, circle, ellipse, triangle, star, polygon, line, arrow, heart, dot, dot_grid, text, image, svg_asset
  name: z.string().default('Object'),
  x: z.number().default(960),
  y: z.number().default(540),
  width: z.number().positive().default(120),
  height: z.number().positive().default(120),
  rotation: z.number().default(0),
  fill: z.string().default('#3b82f6'),
  stroke: z.string().default('#ffffff'),
  strokeWidth: z.number().default(2),
  opacity: z.number().min(0).max(1).default(1),
  zOrder: z.number().default(0),
  visible: z.boolean().default(true),
  enterTime: z.number().min(0).default(0),
  duration: z.number().positive().default(3),
  enterAnim: z.string().default('fade_in'),
  exitAnim: z.string().default('fade_out'),
  enterAnimDur: z.number().positive().default(0.5),
  exitAnimDur: z.number().positive().default(0.5)
}).passthrough();

const ClipSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['transform', 'move', 'scale', 'fade', 'rotate']).default('transform'),
  startTime: z.number().min(0).default(0),
  duration: z.number().positive().default(1.5),
  easing: z.string().default('ease_in_out'),
  sourceId: z.string().nullable().default(null),
  targetId: z.string().nullable().default(null),
  params: z.record(z.any()).default({}),
  overshoot: z.number().default(0),
  settle: z.number().default(1),
  morphQuality: z.string().default('medium')
}).passthrough();

const TrackSchema = z.object({
  id: z.string().min(1),
  name: z.string().default('Track'),
  clips: z.array(ClipSchema).default([])
}).passthrough();

// ─── Top-level project schema ─────────────────────────────────────────────────

const ProjectSchema = z.object({
  id: z.string().nullable().default(null),
  name: z.string().default('My Animation'),
  editorMode: z.enum(['visual', 'code']).default('visual'),
  codeSource: z.string().default(''),
  stage: StageSchema,
  assets: z.array(AssetSchema).default([]),
  objects: z.array(ObjectSchema).default([]),
  tracks: z.array(TrackSchema).default([]),
  sceneDuration: z.number().positive().default(10)
}).passthrough();

// ─── Validate ─────────────────────────────────────────────────────────────────

/**
 * Validate a project against the v2 schema.
 * @param {Object} project
 * @returns {{ valid: boolean, errors?: string[], data?: Object }}
 */
export function validateProject(project) {
  try {
    const result = ProjectSchema.safeParse(project);

    if (!result.success) {
      const errors = result.error.errors.map(err =>
        `${err.path.join('.')}: ${err.message}`
      );
      return { valid: false, errors };
    }

    const data = result.data;
    const errors = [];

    // Check clip object references
    const objectIds = new Set((data.objects || []).map(o => o.id));
    for (const track of data.tracks) {
      for (const clip of track.clips) {
        if (clip.sourceId && !objectIds.has(clip.sourceId)) {
          errors.push(`Clip ${clip.id}: references non-existent source object "${clip.sourceId}"`);
        }
        if (clip.type === 'transform' && clip.targetId && !objectIds.has(clip.targetId)) {
          errors.push(`Clip ${clip.id}: references non-existent target object "${clip.targetId}"`);
        }
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true, data };
  } catch (err) {
    return { valid: false, errors: [err.message] };
  }
}

export { ProjectSchema };
