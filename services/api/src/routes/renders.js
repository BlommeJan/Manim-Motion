/**
 * Renders API Routes
 * 
 * Serve rendered video files.
 */

import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

/**
 * Get the latest render for a project.
 * GET /api/renders/:projectId/latest.mp4
 */
router.get('/:projectId/latest.mp4', async (req, res, next) => {
  try {
    const renderPath = path.join(
      req.dataDir,
      'renders',
      req.params.projectId,
      'latest.mp4'
    );
    
    // Check if file exists
    await fs.access(renderPath);
    
    // Get file stats for content-length
    const stats = await fs.stat(renderPath);
    
    // Set headers
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Handle range requests for video seeking
    const range = req.headers.range;
    
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunkSize = end - start + 1;
      
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${stats.size}`);
      res.setHeader('Content-Length', chunkSize);
      
      const { createReadStream } = await import('fs');
      const stream = createReadStream(renderPath, { start, end });
      stream.pipe(res);
    } else {
      res.sendFile(renderPath);
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ 
        error: 'Render not found',
        message: 'No render available for this project. Trigger a render first.'
      });
    }
    next(err);
  }
});

/**
 * List all renders for a project.
 * GET /api/renders/:projectId
 */
router.get('/:projectId', async (req, res, next) => {
  try {
    const rendersDir = path.join(req.dataDir, 'renders', req.params.projectId);
    
    try {
      await fs.access(rendersDir);
    } catch {
      return res.json({ renders: [], hasLatest: false });
    }
    
    // Check for latest.mp4
    const latestPath = path.join(rendersDir, 'latest.mp4');
    let hasLatest = false;
    let latestStats = null;
    
    try {
      latestStats = await fs.stat(latestPath);
      hasLatest = true;
    } catch {
      // No latest render
    }
    
    res.json({
      renders: hasLatest ? [{
        name: 'latest.mp4',
        size: latestStats.size,
        modifiedAt: latestStats.mtime
      }] : [],
      hasLatest
    });
  } catch (err) {
    next(err);
  }
});

export default router;
