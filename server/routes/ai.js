import { Router } from 'express';
import { generateText, isConfigured } from '../services/aiService.js';

const router = Router();

/**
 * POST /api/ai — Proxy text/image AI requests to Groq.
 * Body: { text, images?: [{ mimeType, data }], json?: boolean, maxTokens?: number }
 */
router.post('/', async (req, res) => {
  const body = req.body || {};
  try {
    if (!isConfigured()) {
      return res.status(500).json({ error: 'AI service is not configured on the server.' });
    }
    const result = await generateText({
      text: body.text,
      images: body.images,
      json: Boolean(body.json),
      maxTokens: body.maxTokens,
    });
    res.json({ content: result.content, model: result.model });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'AI request failed' });
  }
});

export default router;
