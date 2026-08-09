import { Router } from 'express';
import multer from 'multer';
import {
  uploadMultipleToCloudinary,
  deleteMultipleFromCloudinary,
} from '../services/uploadService.js';

// Use memory storage — files are buffered in memory and streamed to Cloudinary.
// This avoids writing any temporary files to disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const router = Router();

/**
 * POST /api/uploads — Upload one or more images to Cloudinary
 * Expects multipart/form-data with field name "photos" (can be multiple files)
 * Returns an array of photo objects with Cloudinary URLs.
 */
router.post('/', (req, res) => {
  upload.array('photos', 10)(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum size is 10MB per image.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Too many files. Maximum 10 images per upload.' });
      }
      return res.status(400).json({ error: err.message || 'Upload failed' });
    }

    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded. Use field name "photos".' });
    }

    let uploadedPhotos = [];
    try {
      const uploadedAt = new Date().toISOString();
      const uploadedBy = req.body?.uploadedBy || 'anonymous';
      const isBefore = req.body?.isBefore === 'false' ? false : true;

      // Upload all files to Cloudinary
      const buffers = files.map((file) => file.buffer);
      uploadedPhotos = await uploadMultipleToCloudinary(buffers, {
        uploadedBy,
        isBefore,
      });

      // Build the response photo objects
      const photos = uploadedPhotos.map((photo) => ({
        ...photo,
        uploadedAt,
      }));

      res.status(201).json({ photos });
    } catch (uploadErr) {
      // Rollback: if any upload failed, delete all successfully-uploaded images
      console.error('[Uploads] Cloudinary upload failed:', uploadErr.message);
      const publicIds = uploadedPhotos
        .filter((p) => p && p.public_id)
        .map((p) => p.public_id);
      if (publicIds.length > 0) {
        await deleteMultipleFromCloudinary(publicIds);
      }
      res.status(500).json({ error: 'Image upload failed. Please try again.' });
    }
  });
});

export default router;