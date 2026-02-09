/**
 * Manim Studio API Server
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import projectsRouter from './routes/projects.js';
import assetsRouter from './routes/assets.js';
import rendersRouter from './routes/renders.js';
import jobsRouter from './routes/jobs.js';
import fontsRouter from './routes/fonts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || '/data';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Inject DATA_DIR into request
app.use((req, res, next) => {
  req.dataDir = DATA_DIR;
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/projects', projectsRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/renders', rendersRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/fonts', fontsRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error('[API Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`[API] Server running on port ${PORT}`);
  console.log(`[API] Data directory: ${DATA_DIR}`);
});
