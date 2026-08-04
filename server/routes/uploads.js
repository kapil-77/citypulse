import { Router } from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = join(__dirname, '..', 'uploads');

// Ensure upload directory exists
mkdirSync(UPLOAD_DIR, { recursive: true });

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = file.originalname.split('.').pop() || 'jpg';
    const safeExt = ext.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'jpg';
    cb(null, `photo-${Date.now()}-${Math.round(Math.random() * 1e9)}.${safeExt}`);
  },
});

const upload = multer({
  storage,
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
 * POST /api/uploads — Upload one or more images
 * Expects multipart/form-data with field name "photos" (can be multiple files)
 * Returns an array of photo objects with server URLs.
 */
router.post('/', (req, res) => {
  upload.array('photos', 10)(req, res, (err) => {
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

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const now = new Date().toISOString();

    const photos = files.map((file, i) => ({
      id: `photo-${Date.now()}-${i}`,
      url: `${baseUrl}/uploads/${file.filename}`,
      thumbnailUrl: `${baseUrl}/uploads/${file.filename}`,
      uploadedAt: now,
      uploadedBy: req.body?.uploadedBy || 'anonymous',
      isBefore: req.body?.isBefore === 'false' ? false : true,
    }));

    res.status(201).json({ photos });
  });
});

export default router;
