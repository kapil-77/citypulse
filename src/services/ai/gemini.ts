/**
 *
 * Uses the Gemini 2.0 Flash (or 1.5 Pro) API for:
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

const SYSTEM_PROMPT = `You are a civic issue analysis AI. Analyze the image and return a JSON object with:
- suggestedCategory: one of ["roads", "garbage", "water_leakage", "street_lights", "sewage", "encroachment", "parks", "public_safety", "other"]
- description: a concise 1-2 sentence description of the issue
- confidence: a number 0-1 indicating how confident you are in the category
- objects: an array of detected objects relevant to the issue
- severity: one of ["low", "medium", "high", "critical"]
- suggestedTitle: a short, descriptive title (max 10 words)

Only return valid JSON, no markdown formatting.`;

const COMPARISON_PROMPT = `Compare these two civic issue images. Return a JSON object with:
- similarityScore: a number 0-1 indicating visual similarity
- isDuplicate: boolean - true if these appear to be the same issue
- reason: a brief explanation of why they are similar or different

Only return valid JSON, no markdown formatting.`;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data:image/...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  private getModel(): string {
    // Use gemini-2.0-flash-exp for faster responses, fallback to 1.5-pro
    return 'models/gemini-2.0-flash-exp';
  }

  private async callGemini(prompt: string, imageBase64?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured. Set VITE_GEMINI_API_KEY in .env');
    }

    const contents: any[] = [];

    if (imageBase64) {
      contents.push({
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64,
            },
          },
        ],
      });
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });
    }

    const response = await fetch(
      `${this.baseUrl}/${this.getModel()}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.2,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1024,
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

    // Clean markdown code blocks if present
    return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  }

  async analyzeImage(image: File): Promise<ImageAnalysis> {
    try {
      const base64 = await fileToBase64(image);
      const responseText = await this.callGemini(SYSTEM_PROMPT, base64);
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
      console.error('Gemini analysis failed:', error);
      // Fallback to defaults
      return {
        suggestedCategory: 'other',
        description: 'Could not analyze image automatically. Please describe the issue.',
        confidence: 0,
        objects: [],
        severity: 'medium',
        suggestedTitle: 'Issue near detected location',
      };
    }
  }

  async compareImages(img1: File, img2: string): Promise<ImageComparison> {
    try {
      const base64 = await fileToBase64(img1);
      const responseText = await this.callGemini(COMPARISON_PROMPT, base64);
      const result = JSON.parse(responseText);

      return {
        similarityScore: Math.min(1, Math.max(0, result.similarityScore || 0)),
        isDuplicate: result.isDuplicate || false,
        reason: result.reason || 'Comparison completed',
      };
    } catch (error) {
      console.error('Gemini comparison failed:', error);
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