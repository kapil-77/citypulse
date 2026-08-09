import { Router } from 'express';
import { getIssues } from '../services/issueService.js';
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
router.get('/:location', async (req, res, next) => {
  try {
    const location = req.params.location;
    const issues = await getIssues();
    const locationIssues = filterIssuesByLocation(issues, location);

    const input = computeHealthInputFromIssues(locationIssues);
    const result = calculateHealthScore(input);

    res.json({
      ...result,
      location,
      issueCount: locationIssues.length,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/health — Get overall health across all issues
 */
router.get('/', async (_req, res, next) => {
  try {
    const issues = await getIssues();
    const input = computeHealthInputFromIssues(issues);
    const result = calculateHealthScore(input);

    res.json({
      ...result,
      location: 'ALL INDIA',
      issueCount: issues.length,
    });
  } catch (err) {
    next(err);
  }
});

export default router;