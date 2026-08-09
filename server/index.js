import express from 'express';
import cors from 'cors';

import issuesRouter from './routes/issues.js';
import verificationsRouter from './routes/verifications.js';
import healthRouter from './routes/health.js';
import localitiesRouter from './routes/localities.js';
import timelineRouter from './routes/timeline.js';
import uploadsRouter from './routes/uploads.js';
import { checkDatabaseConnection } from './config/supabase.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/issues', issuesRouter);
app.use('/api/verifications', verificationsRouter);
app.use('/api/health', healthRouter);
app.use('/api/localities', localitiesRouter);
app.use('/api/timeline', timelineRouter);
app.use('/api/uploads', uploadsRouter);

// Health check with database connectivity
app.get('/api/health-check', async (_req, res) => {
  const dbConnected = await checkDatabaseConnection();
  res.json({
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'unreachable',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[Server] CityPulse API running at http://localhost:${PORT}/api`);
});