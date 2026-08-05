/**
 *
 * Uses the Gemini Flash API for:
 * - Image analysis → category suggestion, severity estimation, description
 * - Image comparison → duplicate detection
 * - Title generation → auto-title from image + location
 *
 * Requires VITE_GEMINI_API_KEY in .env
 */

import type { IssueCategory, IssueSeverity } from '../../types/issue';

export interface ImageAnalysis {
  suggestedCategory: IssueCategory;
  description: string;
  confidence: number;
  objects: string[];
  severity: IssueSeverity;
  suggestedTitle: string;
}

export interface ImageComparison {
  similarityScore: number; // 0-1
  isDuplicate: boolean;
  reason: string;
}

interface ImageInput {
  mimeType: string;
  data: string; // base64, WITHOUT the data:image/...;base64, prefix
}

const SYSTEM_PROMPT = `You are a civic issue analysis AI. Analyze the image and return a JSON object with:
- suggestedCategory: one of ["roads", "garbage", "water_leakage", "street_lights", "sewage", "encroachment", "parks", "public_safety", "other"]
- description: a concise 1-2 sentence description of the issue
- confidence: a number 0-1 indicating how confident you are in the category
- objects: an array of detected objects relevant to the issue
- severity: one of ["low", "medium", "high", "critical"]
- suggestedTitle: a short, descriptive title (max 10 words)

Only return valid JSON.`;

const COMPARISON_PROMPT = `Compare these two civic issue images. Image 1 is a newly reported issue, Image 2 is an existing reported issue. Return a JSON object with:
- similarityScore: a number 0-1 indicating visual similarity
- isDuplicate: boolean - true if these appear to be the same issue
- reason: a brief explanation of why they are similar or different

Only return valid JSON.`;

/**
 * Convert a File to base64 with its actual MIME type.
 */
function fileToImageInput(file: File): Promise<ImageInput> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const commaIdx = result.indexOf(',');
      // Headers look like: data:image/png;base64,
      const header = commaIdx >= 0 ? result.slice(0, commaIdx) : '';
      const mimeMatch = header.match(/data:([^;]+);/);
      const mimeType = mimeMatch?.[1] || file.type || 'image/jpeg';
      const base64 = commaIdx >= 0 ? result.slice(commaIdx + 1) : result;
      resolve({ mimeType, data: base64 });
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Fetch an image from a URL and convert it to an ImageInput for Gemini.
 * Used when the "existing" image is a URL string (e.g. http://localhost:3001/uploads/...).
 */
async function urlToImageInput(url: string): Promise<ImageInput> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image from URL (${res.status})`);
  }
  const blob = await res.blob();
  return fileToImageInput(blob as File);
}

/**
 * Convert any image source (File or URL string) to an ImageInput.
 */
async function toImageInput(src: File | string): Promise<ImageInput> {
  if (typeof src === 'string') {
    // If it's a data URL or blob URL, handle directly; otherwise fetch the URL
    if (src.startsWith('data:')) {
      const commaIdx = src.indexOf(',');
      const header = commaIdx >= 0 ? src.slice(0, commaIdx) : '';
      const mimeMatch = header.match(/data:([^;]+);/);
      return {
        mimeType: mimeMatch?.[1] || 'image/jpeg',
        data: commaIdx >= 0 ? src.slice(commaIdx + 1) : src,
      };
    }
    if (src.startsWith('blob:')) {
      const blob = await fetch(src).then((r) => r.blob());
      return fileToImageInput(blob as File);
    }
    // Regular http(s) URL
    return urlToImageInput(src);
  }
  return fileToImageInput(src);
}

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  private getModel(): string {
    // Use the stable gemini-2.0-flash model
    return 'models/gemini-2.0-flash';
  }

  private async callGemini(prompt: string, images: ImageInput[] = []): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured. Set VITE_GEMINI_API_KEY in .env');
    }

    const parts: any[] = [{ text: prompt }];
    for (const img of images) {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.data,
        },
      });
    }

    const response = await fetch(
      `${this.baseUrl}/${this.getModel()}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.2,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Clean markdown code blocks if present (defensive; responseMimeType should handle it)
    return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  }

  async analyzeImage(image: File): Promise<ImageAnalysis> {
    try {
      const img = await fileToImageInput(image);
      const responseText = await this.callGemini(SYSTEM_PROMPT, [img]);
      const result = JSON.parse(responseText);

      return {
        suggestedCategory: this.validateCategory(result.suggestedCategory),
        description: result.description || 'No description generated',
        confidence: Math.min(1, Math.max(0, result.confidence || 0)),
        objects: Array.isArray(result.objects) ? result.objects : [],
        severity: this.validateSeverity(result.severity),
        suggestedTitle: result.suggestedTitle || 'Issue near detected location',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Gemini] Image analysis failed:', error);
      // Fallback to defaults
      return {
        suggestedCategory: 'other',
        description: `Could not analyze image automatically. ${message === 'Gemini API key not configured. Set VITE_GEMINI_API_KEY in .env' ? 'Please configure the Gemini API key.' : 'Please describe the issue.'}`,
        confidence: 0,
        objects: [],
        severity: 'medium',
        suggestedTitle: 'Issue near detected location',
      };
    }
  }

  /**
   * Compare two images.
   * @param img1 Source image for the new issue (File or URL string)
   * @param img2 Source image for the existing issue (File or URL string)
   */
  async compareImages(img1: File | string, img2: File | string): Promise<ImageComparison> {
    try {
      const [image1, image2] = await Promise.all([toImageInput(img1), toImageInput(img2)]);
      const responseText = await this.callGemini(COMPARISON_PROMPT, [image1, image2]);
      const result = JSON.parse(responseText);

      const score = Math.min(1, Math.max(0, Number(result.similarityScore) || 0));
      return {
        similarityScore: score,
        isDuplicate: Boolean(result.isDuplicate) || score > 0.6,
        reason: result.reason || 'Comparison completed',
      };
    } catch (error) {
      console.error('[Gemini] Image comparison failed:', error);
      return {
        similarityScore: 0,
        isDuplicate: false,
        reason: 'Comparison failed',
      };
    }
  }

  async suggestTitle(image: File, _location: { lat: number; lng: number }): Promise<string> {
    try {
      const analysis = await this.analyzeImage(image);
      return analysis.suggestedTitle;
    } catch {
      return 'Issue near detected location';
    }
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  private validateCategory(cat: string): IssueCategory {
    const valid: IssueCategory[] = [
      'roads', 'garbage', 'water_leakage', 'street_lights',
      'sewage', 'encroachment', 'parks', 'public_safety', 'other',
    ];
    return valid.includes(cat as IssueCategory) ? (cat as IssueCategory) : 'other';
  }

  private validateSeverity(sev: string): IssueSeverity {
    const valid: IssueSeverity[] = ['low', 'medium', 'high', 'critical'];
    return valid.includes(sev as IssueSeverity) ? (sev as IssueSeverity) : 'medium';
  }
}

export const geminiService = new GeminiService();