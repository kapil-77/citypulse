// Groq AI service — server-side proxy for the frontend. The API key lives only here.
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const TEXT_MODEL = process.env.GROQ_TEXT_MODEL || 'openai/gpt-oss-120b';
const VISION_MODEL = process.env.GROQ_VISION_MODEL || 'qwen/qwen3.6-27b';

const MAX_TEXT_CHARS = 12000;
const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // per-image base64 payload

export function isConfigured() {
  return GROQ_API_KEY.length > 0;
}

function buildMessages(text, images) {
  if (!images || images.length === 0) {
    return [{ role: 'user', content: text }];
  }
  const parts = [{ type: 'text', text }];
  for (const img of images) {
    parts.push({
      type: 'image_url',
      image_url: { url: 'data:' + img.mimeType + ';base64,' + img.data },
    });
  }
  return [{ role: 'user', content: parts }];
}

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function generateText({ text, images = [], json = false, maxTokens = 1024 }) {
  if (!isConfigured()) {
    throw httpError('Groq API key not configured on the server.', 500);
  }
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw httpError('Missing text field in request body.', 400);
  }
  if (text.length > MAX_TEXT_CHARS) {
    throw httpError('Text is too long.', 413);
  }
  if (!Array.isArray(images) || images.length > MAX_IMAGES) {
    throw httpError('Too many images (max ' + MAX_IMAGES + ').', 400);
  }
  for (const img of images) {
    if (!img || typeof img.mimeType !== 'string' || typeof img.data !== 'string') {
      throw httpError('Invalid image payload.', 400);
    }
    if (img.data.length > MAX_IMAGE_BYTES) {
      throw httpError('Image payload too large.', 413);
    }
  }

  const model = images.length > 0 ? VISION_MODEL : TEXT_MODEL;
  const body = {
    model,
    messages: buildMessages(text, images),
    temperature: 0.2,
    max_tokens: Math.max(1, Math.min(4096, Number(maxTokens) || 1024)),
  };
  if (json) body.response_format = { type: 'json_object' };

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + GROQ_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    if (res.status === 429) {
      const retryAfter = res.headers.get('retry-after') || 'a few seconds';
      throw httpError('Rate limit reached. Please try again in ' + retryAfter + '.', 429);
    }
    let detail = '';
    try {
      const d = await res.json();
      detail = (d && d.error && d.error.message) || '';
    } catch {}
    throw httpError(detail || 'Groq API error (' + res.status + ').', res.status >= 500 ? 502 : res.status);
  }

  const data = await res.json();
  const content = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
  return { content, model: (data && data.model) || model };
}
