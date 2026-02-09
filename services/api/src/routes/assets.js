/**
 * Assets API Routes
 * 
 * File upload and management for project assets.
 */

import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Allowed file types
const ALLOWED_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/svg+xml': 'svg'
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const assetsDir = path.join(req.dataDir, 'assets', req.params.projectId);
    try {
      await fs.mkdir(assetsDir, { recursive: true, mode: 0o777 });
      cb(null, assetsDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = ALLOWED_TYPES[file.mimetype] || 'bin';
    const name = `${uuidv4().split('-')[0]}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

/**
 * Upload an asset to a project.
 * POST /api/assets/:projectId
 */
router.post('/:projectId', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const projectId = req.params.projectId;
    const file = req.file;
    
    // Determine asset type
    const assetType = file.mimetype === 'image/svg+xml' ? 'svg' : 'image';
    
    // Create asset record
    const asset = {
      id: `asset_${uuidv4().split('-')[0]}`,
      type: assetType,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    };
    
    res.status(201).json(asset);
  } catch (err) {
    next(err);
  }
});

/**
 * List assets for a project.
 * GET /api/assets/:projectId
 */
router.get('/:projectId', async (req, res, next) => {
  try {
    const assetsDir = path.join(req.dataDir, 'assets', req.params.projectId);
    
    try {
      await fs.access(assetsDir);
    } catch {
      return res.json([]);
    }
    
    const files = await fs.readdir(assetsDir);
    const assets = [];
    
    for (const filename of files) {
      const filePath = path.join(assetsDir, filename);
      const stats = await fs.stat(filePath);
      
      // Determine type from extension
      const ext = path.extname(filename).toLowerCase();
      const type = ext === '.svg' ? 'svg' : 'image';
      
      assets.push({
        id: filename.split('_')[0],
        filename,
        type,
        size: stats.size
      });
    }
    
    res.json(assets);
  } catch (err) {
    next(err);
  }
});

/**
 * Get a single asset file.
 * GET /api/assets/:projectId/:filename
 */
router.get('/:projectId/:filename', async (req, res, next) => {
  try {
    const filePath = path.join(
      req.dataDir,
      'assets',
      req.params.projectId,
      req.params.filename
    );
    
    await fs.access(filePath);
    res.sendFile(filePath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'Asset not found' });
    }
    next(err);
  }
});

/**
 * Upload a base64-encoded asset.
 * POST /api/assets/:projectId/base64
 *
 * Body: { name: string, type: 'image'|'svg', data: 'data:...;base64,...' }
 */
router.post('/:projectId/base64', async (req, res, next) => {
  try {
    const { name, type, data } = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided' });

    // Parse data-URL
    const match = data.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return res.status(400).json({ error: 'Invalid data URL format' });

    const mimetype = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const safeName = (name || 'asset').replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${uuidv4().split('-')[0]}_${safeName}`;

    const assetsDir = path.join(req.dataDir, 'assets', req.params.projectId);
    await fs.mkdir(assetsDir, { recursive: true, mode: 0o777 });
    await fs.writeFile(path.join(assetsDir, filename), buffer);

    const assetType = type || (mimetype === 'image/svg+xml' ? 'svg' : 'image');

    res.status(201).json({
      id: `asset_${uuidv4().split('-')[0]}`,
      type: assetType,
      filename,
      originalName: name,
      size: buffer.length,
      mimetype
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Delete an asset.
 * DELETE /api/assets/:projectId/:filename
 */
router.delete('/:projectId/:filename', async (req, res, next) => {
  try {
    const filePath = path.join(
      req.dataDir,
      'assets',
      req.params.projectId,
      req.params.filename
    );
    
    await fs.unlink(filePath);
    res.status(204).send();
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'Asset not found' });
    }
    next(err);
  }
});

export default router;
