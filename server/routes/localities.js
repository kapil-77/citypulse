import { Router } from 'express';
import { getLocalities } from '../services/localityService.js';

const router = Router();

/**
 * GET /api/localities — Get all localities with live issue counts
 */
router.get('/', async (_req, res, next) => {
  try {
    const localities = await getLocalities();
    res.json(localities);
  } catch (err) {
    next(err);
  }
});

export default router;