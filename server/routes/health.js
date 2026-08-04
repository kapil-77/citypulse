import { Router } from 'express';
import { getIssues } from '../data/db.js';
import { computeHealthInputFromIssues, calculateHealthScore } from '../utils/healthScore.js';

const router = Router();

/**
 * Helper: filter issues by city/state name in address
 */
function filterIssuesByLocation(issues, location) {
  const lower = (location || '').toLowerCase();
  if (!lower) return issues;
  return issues.filter((issue) => {
    const address = (issue.address || '').toLowerCase();
    return address.includes(lower);
  });
}

/**
 * GET /api/health/:location — Get city/state-wise health score
 * Example: /api/health/New%20Delhi, /api/health/Gurugram
 */
router.get('/:location', (req, res) => {
  const location = req.params.location;
  const issues = getIssues();
  const locationIssues = filterIssuesByLocation(issues, location);

  const input = computeHealthInputFromIssues(locationIssues);
  const result = calculateHealthScore(input);

  res.json({
    ...result,
    location,
    issueCount: locationIssues.length,
  });
});

/**
 * GET /api/health — Get overall health across all issues
 */
router.get('/', (_req, res) => {
  const issues = getIssues();
  const input = computeHealthInputFromIssues(issues);
  const result = calculateHealthScore(input);

  res.json({
    ...result,
    location: 'ALL INDIA',
    issueCount: issues.length,
  });
});

export default router;