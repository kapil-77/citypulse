import { Router } from 'express';
import { getLocalities, getIssues } from '../data/db.js';

const router = Router();

/**
 * GET /api/localities — Get all localities with live issue counts
 */
router.get('/', (_req, res) => {
  const localities = getLocalities();
  const issues = getIssues();

  // Enrich with live issue counts from the issues collection
  const enriched = localities.map((loc) => {
    const locIssues = issues.filter((i) => i.localityId === loc.id);
    return {
      ...loc,
      issueCount: locIssues.length,
      unresolvedCount: locIssues.filter((i) => i.status !== 'resolved' && i.status !== 'verified_resolved').length,
    };
  });

  res.json(enriched);
});

export default router;