import { Router } from 'express';
import { getVerification as getVerificationService, setVerification } from '../services/verificationService.js';
import { addTimelineEvent } from '../services/timelineService.js';
import { getIssueById } from '../services/issueService.js';
import { deleteFromCloudinary } from '../services/uploadService.js';

const router = Router();

const createEmptyStats = () => ({
  confirmsExisting: 0,
  marksFixed: 0,
  communityPhotos: [],
  updates: [],
  lastVerifiedAt: new Date().toISOString(),
});

/**
 * Extract the Cloudinary public_id from a Cloudinary URL.
 * Example: https://res.cloudinary.com/cloudname/image/upload/v123456/citypulse/abc123.jpg
 * → citypulse/abc123
 * Returns null if the URL is not a Cloudinary URL.
 */
function extractPublicIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  // Match the public id portion after /upload/ (optionally /v<version>/)
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  if (!match) return null;
  return match[1];
}

/**
 * GET /api/verifications/:issueId — Get verification stats for an issue
 */
router.get('/:issueId', async (req, res, next) => {
  try {
    const stats = await getVerificationService(req.params.issueId);
    if (!stats) {
      return res.json(createEmptyStats());
    }
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/verifications/:issueId/action — Submit a community action
 * Body: { type: 'confirm' | 'mark_fixed' | 'photo' | 'comment', userId, content? }
 */
router.post('/:issueId/action', async (req, res, next) => {
  const { issueId } = req.params;
  const body = req.body || {};
  const { type, userId = 'anonymous', content } = body;

  if (!['confirm', 'mark_fixed', 'photo', 'comment'].includes(type)) {
    return res.status(400).json({ error: 'Invalid action type' });
  }

  try {
    const issue = await getIssueById(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const existing = (await getVerificationService(issueId)) || createEmptyStats();
    const timestamp = new Date().toISOString();

    let update;
    let updatedStats = { ...existing };

    switch (type) {
      case 'confirm': {
        update = {
          id: `vu-${Date.now()}`,
          type: 'confirm',
          userId,
          timestamp,
          content: 'Confirmed',
        };
        updatedStats.confirmsExisting = existing.confirmsExisting + 1;
        updatedStats.updates = [...existing.updates, update];
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
        updatedStats.marksFixed = existing.marksFixed + 1;
        updatedStats.updates = [...existing.updates, update];
        break;
      }
      case 'photo': {
        const photo = {
          id: `photo-${Date.now()}`,
          url: content,
          thumbnailUrl: content,
          // If the URL is a Cloudinary URL, extract the public_id for future cleanup
          public_id: extractPublicIdFromUrl(content),
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
        updatedStats.communityPhotos = [...existing.communityPhotos, photo];
        updatedStats.updates = [...existing.updates, update];
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
        updatedStats.updates = [...existing.updates, update];
        break;
      }
    }

    updatedStats.lastVerifiedAt = timestamp;

    // Also add a timeline event for the issue
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

    try {
      await setVerification(issueId, updatedStats);
      await addTimelineEvent(timelineEvent);
    } catch (dbErr) {
      // Rollback: if the DB save failed and this action uploaded a photo,
      // delete the image from Cloudinary to avoid orphaned files.
      if (type === 'photo' && update.content && update.content.public_id) {
        console.error('[Verifications] DB save failed, rolling back Cloudinary photo:', dbErr.message);
        await deleteFromCloudinary(update.content.public_id);
      }
      throw dbErr;
    }

    res.status(201).json(updatedStats);
  } catch (err) {
    next(err);
  }
});

export default router;