/**
 * Redis Queue Manager
 */

import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let client = null;

/**
 * Get or create Redis client.
 */
export async function getRedisClient() {
  if (!client) {
    client = createClient({ url: REDIS_URL });
    client.on('error', (err) => console.error('[Redis Error]', err));
    await client.connect();
    console.log('[Redis] Connected to', REDIS_URL);
  }
  return client;
}

/**
 * Enqueue a render job.
 * @param {Object} job - The job payload
 * @returns {string} The job ID
 */
export async function enqueueRenderJob(job) {
  const redis = await getRedisClient();
  
  // Create job record
  await redis.hSet(`render:job:${job.jobId}`, {
    status: 'queued',
    projectId: job.projectId,
    quality: job.quality || 'medium',
    createdAt: new Date().toISOString()
  });
  
  // Add to queue
  await redis.rPush('render:queue', JSON.stringify(job));
  
  return job.jobId;
}

/**
 * Get job status.
 * @param {string} jobId - The job ID
 * @returns {Object|null} Job status or null if not found
 */
export async function getJobStatus(jobId) {
  const redis = await getRedisClient();
  const job = await redis.hGetAll(`render:job:${jobId}`);
  
  if (!job || Object.keys(job).length === 0) {
    return null;
  }
  
  return job;
}
