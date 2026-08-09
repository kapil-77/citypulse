import { Router } from 'express';
import {
  getIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
} from '../services/issueService.js';
import { deleteMultipleFromCloudinary } from '../services/uploadService.js';

const router = Router();

/**
 * GET /api/issues — Get all issues
 */
router.get('/', async (_req, res, next) => {
  try {
    const issues = await getIssues();
    res.json(issues);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/issues/:id — Get a single issue
 */
router.get('/:id', async (req, res, next) => {
  try {
    const issue = await getIssueById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json(issue);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/issues — Create a new issue
 */
router.post('/', async (req, res, next) => {
  try {
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

    const created = await createIssue(issue);
    res.status(201).json(created);
  } catch (err) {
    // Rollback: if the DB save failed after Cloudinary uploads succeeded,
    // delete the uploaded images to avoid orphaned files.
    const photos = (req.body?.photos || []).filter((p) => p && p.public_id);
    if (photos.length > 0) {
      console.error('[Issues] DB save failed, rolling back Cloudinary uploads:', err.message);
      await deleteMultipleFromCloudinary(photos.map((p) => p.public_id));
    }
    next(err);
  }
});

/**
 * PATCH /api/issues/:id — Update an issue
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const issue = await updateIssue(req.params.id, req.body || {});
    res.json(issue);
  } catch (err) {
    if (err.message && err.message.includes('does not exist')) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    next(err);
  }
});

/**
 * DELETE /api/issues/:id — Delete an issue
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await deleteIssue(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;