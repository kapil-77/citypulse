import { Router } from 'express';
import { getVerification, setVerification, getIssues, getTimeline, setTimeline } from '../data/db.js';

const router = Router();

const createEmptyStats = () => ({
  confirmsExisting: 0,
  marksFixed: 0,
  communityPhotos: [],
  updates: [],
  lastVerifiedAt: new Date().toISOString(),
});

/**
 * GET /api/verifications/:issueId — Get verification stats for an issue
 */
router.get('/:issueId', (req, res) => {
  const stats = getVerification(req.params.issueId);
  if (!stats) {
    return res.json(createEmptyStats());
  }
  res.json(stats);
});

/**
 * POST /api/verifications/:issueId/action — Submit a community action
 * Body: { type: 'confirm' | 'mark_fixed' | 'photo' | 'comment', userId, content? }
 */
router.post('/:issueId/action', (req, res) => {
  const { issueId } = req.params;
  const body = req.body || {};
  const { type, userId = 'anonymous', content } = body;

  if (!['confirm', 'mark_fixed', 'photo', 'comment'].includes(type)) {
    return res.status(400).json({ error: 'Invalid action type' });
  }

  const issue = getIssues().find((i) => i.id === issueId);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  const existing = getVerification(issueId) || createEmptyStats();
  const timestamp = new Date().toISOString();

  let update;
  let next = { ...existing };

  switch (type) {
    case 'confirm': {
      update = {
        id: `vu-${Date.now()}`,
        type: 'confirm',
        userId,
        timestamp,
        content: 'Confirmed',
      };
      next.confirmsExisting = existing.confirmsExisting + 1;
      next.updates = [...existing.updates, update];
      break;
    }
    case 'mark_fixed': {
      update = {
        id: `vu-${Date.now()}`,
        type: 'mark_fixed',
        userId,
        timestamp,
        content: 'Marked as fixed',
      };
      next.marksFixed = existing.marksFixed + 1;
      next.updates = [...existing.updates, update];
      break;
    }
    case 'photo': {
      const photo = {
        id: `photo-${Date.now()}`,
        url: content,
        thumbnailUrl: content,
        uploadedAt: timestamp,
        uploadedBy: userId,
        isBefore: false,
      };
      update = {
        id: `vu-${Date.now()}`,
        type: 'photo',
        userId,
        timestamp,
        content: photo,
      };
      next.communityPhotos = [...existing.communityPhotos, photo];
      next.updates = [...existing.updates, update];
      break;
    }
    case 'comment': {
      update = {
        id: `vu-${Date.now()}`,
        type: 'comment',
        userId,
        timestamp,
        content: content || '',
      };
      next.updates = [...existing.updates, update];
      break;
    }
  }

  next.lastVerifiedAt = timestamp;

  // Also add a timeline event for the issue
  const timeline = getTimeline(issueId);
  const timelineEvent = {
    id: `tl-${Date.now()}`,
    issueId,
    type: update.type === 'confirm' ? 'status_change' : update.type === 'mark_fixed' ? 'resolved' : 'photo_update',
    timestamp,
    user: { id: userId, name: userId === 'anonymous' ? 'Anonymous' : userId },
    photo: update.type === 'photo' ? update.content : null,
    status: update.type === 'mark_fixed' ? 'resolved' : issue.status,
    notes: update.content,
    metadata: {},
  };
  setTimeline(issueId, [...timeline, timelineEvent]);

  setVerification(issueId, next);
  res.status(201).json(next);
});

export default router;