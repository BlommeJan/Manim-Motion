/**
 * Jobs API Routes
 * 
 * Query render job status.
 */

import { Router } from 'express';
import { getJobStatus } from '../queue.js';

const router = Router();

/**
 * Get job status.
 * GET /api/jobs/:jobId
 */
router.get('/:jobId', async (req, res, next) => {
  try {
    const job = await getJobStatus(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({
      jobId: req.params.jobId,
      ...job
    });
  } catch (err) {
    next(err);
  }
});

export default router;
