/**
 * Projects API Routes — v2
 *
 * CRUD operations for projects using the new schema
 * (stage / objects / tracks+clips / assets / sceneDuration).
 */

import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { compileProject } from '../compiler/index.js';
import { enqueueRenderJob } from '../queue.js';

const router = Router();

function getProjectsDir(dataDir)          { return path.join(dataDir, 'projects'); }
function getProjectDir(dataDir, projectId){ return path.join(dataDir, 'projects', projectId); }

/**
 * Sanitize data to prevent NoSQL injection by removing MongoDB operators
 * (keys starting with $) from objects
 */
function sanitizeNoSQL(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeNoSQL);
  }
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip keys starting with $ to prevent NoSQL injection
      if (key.startsWith('$')) continue;
      sanitized[key] = sanitizeNoSQL(value);
    }
    return sanitized;
  }
  return obj;
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

/**
 * POST /api/projects
 * Create a new project with the v2 schema.
 */
router.post('/', async (req, res, next) => {
  try {
    // Sanitize input to prevent NoSQL injection
    const sanitizedBody = sanitizeNoSQL(req.body);
    const { name = 'My Animation', editorMode = 'visual', codeSource = '' } = sanitizedBody;
    const projectId = `proj_${uuidv4().split('-')[0]}`;

    const projectDir = getProjectDir(req.dataDir, projectId);
    await fs.mkdir(projectDir, { recursive: true, mode: 0o777 });

    const project = {
      id: projectId,
      name,
      editorMode,
      codeSource,
      stage: {
        width: 1920,
        height: 1080,
        backgroundColor: '#000000',
        gridVisible: true,
        gridSize: 5,
        snapEnabled: true,
        snapToGrid: true,
        snapToCenter: true
      },
      assets: [],
      objects: [],
      tracks: [
        { id: 'track_1', name: 'Track 1', clips: [] }
      ],
      sceneDuration: 10
    };

    await fs.writeFile(
      path.join(projectDir, 'project.json'),
      JSON.stringify(project, null, 2)
    );

    // Ensure assets directory exists
    await fs.mkdir(path.join(req.dataDir, 'assets', projectId), { recursive: true, mode: 0o777 });

    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

// ─── LIST ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/projects
 * List all projects (summary).
 */
router.get('/', async (req, res, next) => {
  try {
    const projectsDir = getProjectsDir(req.dataDir);
    await fs.mkdir(projectsDir, { recursive: true });

    const entries = await fs.readdir(projectsDir, { withFileTypes: true });
    const projects = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      try {
        const projectPath = path.join(projectsDir, entry.name, 'project.json');
        const data = await fs.readFile(projectPath, 'utf-8');
        const project = JSON.parse(data);
        const stat = await fs.stat(projectPath);
        projects.push({
          id: project.id,
          name: project.name,
          editorMode: project.editorMode || 'visual',
          objectsCount: project.objects?.length || 0,
          tracksCount: project.tracks?.length || 0,
          updatedAt: stat.mtime.toISOString()
        });
      } catch {
        // Skip invalid projects
      }
    }

    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// ─── GET ONE ──────────────────────────────────────────────────────────────────

/**
 * GET /api/projects/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const projectPath = path.join(
      getProjectDir(req.dataDir, req.params.id),
      'project.json'
    );
    const data = await fs.readFile(projectPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Project not found' });
    next(err);
  }
});

// ─── UPDATE ───────────────────────────────────────────────────────────────────

/**
 * PUT /api/projects/:id
 * Full replace of the project JSON.
 */
router.put('/:id', async (req, res, next) => {
  try {
    const projectDir = getProjectDir(req.dataDir, req.params.id);
    const projectPath = path.join(projectDir, 'project.json');

    // Ensure dir exists (handles first-save after create)
    await fs.mkdir(projectDir, { recursive: true, mode: 0o777 });

    // Sanitize input to prevent NoSQL injection
    const sanitizedBody = sanitizeNoSQL(req.body);

    // Preserve server ID
    const project = { ...sanitizedBody, id: req.params.id };

    // Strip dataUrl from assets before persisting (they can be huge)
    if (Array.isArray(project.assets)) {
      project.assets = project.assets.map(a => {
        const { dataUrl, serverFilename, ...rest } = a;
        return rest;
      });
    }

    await fs.writeFile(projectPath, JSON.stringify(project, null, 2));
    res.json(project);
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Project not found' });
    next(err);
  }
});

// ─── DELETE ───────────────────────────────────────────────────────────────────

/**
 * DELETE /api/projects/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const projectDir  = getProjectDir(req.dataDir, req.params.id);
    const assetsDir   = path.join(req.dataDir, 'assets',  req.params.id);
    const rendersDir  = path.join(req.dataDir, 'renders', req.params.id);

    await fs.rm(projectDir,  { recursive: true, force: true });
    await fs.rm(assetsDir,   { recursive: true, force: true });
    await fs.rm(rendersDir,  { recursive: true, force: true });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ─── RENDER ───────────────────────────────────────────────────────────────────

/**
 * POST /api/projects/:id/render
 * Compile the project to scene.py and enqueue a Manim render job.
 */
router.post('/:id/render', async (req, res, next) => {
  try {
    const { quality = 'medium' } = req.body;
    const projectId = req.params.id;

    // Load project
    const projectPath = path.join(
      getProjectDir(req.dataDir, projectId),
      'project.json'
    );
    const projectData = await fs.readFile(projectPath, 'utf-8');
    const project = JSON.parse(projectData);

    // Compile to Python
    const assetsPath = path.join(req.dataDir, 'assets', projectId);
    const result = compileProject(project, assetsPath);

    if (!result.success) {
      return res.status(400).json({
        error: 'Compilation failed',
        details: result.errors
      });
    }

    // Write scene.py
    const scenePath = path.join(
      getProjectDir(req.dataDir, projectId),
      'scene.py'
    );
    await fs.writeFile(scenePath, result.code);

    console.log(`[API] scene.py written for ${projectId} (${result.code.length} bytes)`);

    // Create render job
    const jobId = `job_${uuidv4().split('-')[0]}`;

    await enqueueRenderJob({
      jobId,
      projectId,
      sceneFile: `projects/${projectId}/scene.py`,
      sceneName: 'MainScene',
      quality
    });

    res.status(202).json({
      jobId,
      status: 'queued',
      message: 'Render job enqueued'
    });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Project not found' });
    next(err);
  }
});

// ─── RENDER CODE (raw Manim source) ───────────────────────────────────────────

/**
 * POST /api/projects/:id/render-code
 * Write raw user-supplied Manim code as scene.py and enqueue a render job.
 */
router.post('/:id/render-code', async (req, res, next) => {
  try {
    const { quality = 'medium', codeSource, sceneName = 'MainScene' } = req.body;
    const projectId = req.params.id;

    if (!codeSource || typeof codeSource !== 'string' || codeSource.trim().length === 0) {
      return res.status(400).json({ error: 'codeSource is required and must be non-empty' });
    }

    const projectDir = getProjectDir(req.dataDir, projectId);
    await fs.mkdir(projectDir, { recursive: true, mode: 0o777 });

    const scenePath = path.join(projectDir, 'scene.py');
    await fs.writeFile(scenePath, codeSource);

    console.log(`[API] code-mode scene.py written for ${projectId} (${codeSource.length} bytes)`);

    const jobId = `job_${uuidv4().split('-')[0]}`;

    await enqueueRenderJob({
      jobId,
      projectId,
      sceneFile: `projects/${projectId}/scene.py`,
      sceneName,
      quality
    });

    res.status(202).json({
      jobId,
      status: 'queued',
      message: 'Code render job enqueued'
    });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Project not found' });
    next(err);
  }
});

export default router;
