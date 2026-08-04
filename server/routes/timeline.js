import { Router } from 'express';
import { getTimeline } from '../data/db.js';

const router = Router();

/**
 * GET /api/timeline/:issueId — Get timeline events for an issue
 */
router.get('/:issueId', (req, res) => {
  res.json(getTimeline(req.params.issueId));
});

export default router;