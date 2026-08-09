import { Router } from 'express';
import { getTimeline } from '../services/timelineService.js';

const router = Router();

/**
 * GET /api/timeline/:issueId — Get timeline events for an issue
 */
router.get('/:issueId', async (req, res, next) => {
  try {
    const events = await getTimeline(req.params.issueId);
    res.json(events);
  } catch (err) {
    next(err);
  }
});

export default router;
