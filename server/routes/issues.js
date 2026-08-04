import { Router } from 'express';
import { getIssues, getIssueById, addIssue, updateIssue, deleteIssue } from '../data/db.js';

const router = Router();

/**
 * GET /api/issues — Get all issues
 */
router.get('/', (_req, res) => {
  res.json(getIssues());
});

/**
 * GET /api/issues/:id — Get a single issue
 */
router.get('/:id', (req, res) => {
  const issue = getIssueById(req.params.id);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }
  res.json(issue);
});

/**
 * POST /api/issues — Create a new issue
 */
router.post('/', (req, res) => {
  const body = req.body || {};
  if (!body.title || !body.category || !body.severity || !body.location) {
    return res.status(400).json({ error: 'Missing required fields: title, category, severity, location' });
  }

  const now = new Date().toISOString();
  const issue = {
    id: body.id || `issue-${Date.now()}`,
    title: body.title,
    description: body.description || '',
    category: body.category,
    severity: body.severity,
    status: body.status || 'reported',
    location: body.location,
    address: body.address || '',
    localityId: body.localityId || 'custom-locality',
    photos: body.photos || [],
    reportedBy: body.reportedBy || null,
    reportedAt: body.reportedAt || now,
    resolvedAt: body.resolvedAt || null,
    updatedAt: now,
    verification: body.verification || undefined,
    timeline: body.timeline || undefined,
    duplicateGroupId: body.duplicateGroupId || undefined,
    duplicateOf: body.duplicateOf || undefined,
  };

  addIssue(issue);
  res.status(201).json(issue);
});

/**
 * PATCH /api/issues/:id — Update an issue
 */
router.patch('/:id', (req, res) => {
  const issue = updateIssue(req.params.id, req.body || {});
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }
  res.json(issue);
});

/**
 * DELETE /api/issues/:id — Delete an issue
 */
router.delete('/:id', (req, res) => {
  const deleted = deleteIssue(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Issue not found' });
  }
  res.status(204).end();
});

export default router;