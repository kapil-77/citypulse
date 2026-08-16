/**
 * Reusable AI service — the CityPulse AI client.
 *
 * Features:
 * - Image analysis, image comparison (duplicate detection)
 * - Title generation
 * - City analyst + interactive Q&A assistant
 *
 * All AI requests are proxied through the backend (POST /api/ai) so the Groq
 * API key never ships to the browser.
 */

import type { Issue, IssueCategory, IssueSeverity } from '../../types/issue';

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

export interface CityAnalystReport {
  verdict: string;
  topProblems: string[];
  priorityIssues: string[];
  trends: string[];
  recommendations: string[];
}

export interface CityAssistantContext {
  cityName: string;
  stats: {
    total: number;
    active: number;
    resolved: number;
    critical: number;
    healthScore: number | null;
    avgActiveAgeDays: number;
  };
  categories: Record<string, number>;
  statuses: Record<string, number>;
  communityConfirmations: number;
}

export interface CityAnswer {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
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
 * Fetch an image from a URL and convert it to an ImageInput for AI.
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

const AI_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const TICK = String.fromCharCode(96);

class AiService {
  /**
   * The secret key lives on the server; the frontend only talks to our proxy,
   * so AI features are always considered configured from the client side.
   */
  isConfigured(): boolean {
    return true;
  }

  private async callAi(
    prompt: string,
    images: ImageInput[] = [],
    signal?: AbortSignal,
    maxTokens = 1024
  ): Promise<string> {
    const res = await fetch(AI_BASE + '/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        text: prompt,
        images,
        json: true,
        maxTokens,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = (data && data.error) || 'AI request failed with status ' + res.status;
      throw new Error(message);
    }

    const content = (data && data.content) || '';
    // Clean markdown code blocks if present (defensive).
    const fence = TICK + TICK + TICK;
    return content.replace(new RegExp(fence + 'json', 'g'), '').replace(new RegExp(fence, 'g'), '').trim();
  }

  async analyzeImage(image: File): Promise<ImageAnalysis> {
    try {
      const img = await fileToImageInput(image);
      const responseText = await this.callAi(SYSTEM_PROMPT, [img]);
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
      console.error('[AI] Image analysis failed:', error);
      // Fallback to defaults
      return {
        suggestedCategory: 'other',
        description: `Could not analyze image automatically. ${message === 'AI service is unavailable' ? 'Please try again later.' : 'Please describe the issue.'}`,
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
      const responseText = await this.callAi(COMPARISON_PROMPT, [image1, image2]);
      const result = JSON.parse(responseText);

      const score = Math.min(1, Math.max(0, Number(result.similarityScore) || 0));
      return {
        similarityScore: score,
        isDuplicate: Boolean(result.isDuplicate) || score > 0.6,
        reason: result.reason || 'Comparison completed',
      };
    } catch (error) {
      console.error('[AI] Image comparison failed:', error);
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




  /**
   * Generate 3-5 concise AI insights from current issues.
   * Returns human-readable strings. Falls back to statistical insights if the AI service is unavailable.
   */
  async analyzeInsights(issues: Issue[]): Promise<string[]> {
    try {
      if (issues.length === 0) {
        return this.statisticalInsights(issues);
      }

      const summary = issues.slice(0, 30).map((i) => ({
        category: i.category,
        severity: i.severity,
        status: i.status,
        address: i.address,
        description: i.description,
      }));

      const prompt = `You are a civic health analyst. Review these reported issues and return a JSON array of 3-5 concise, actionable insights as plain strings. Format: ["insight 1", "insight 2", ...]. Focus on patterns, risks, and recommendations. Only return valid JSON.

Issues: ${JSON.stringify(summary)}`;

      const responseText = await this.callAi(prompt);
      const parsed = JSON.parse(responseText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(String).slice(0, 5);
      }
      return this.statisticalInsights(issues);
    } catch {
      return this.statisticalInsights(issues);
    }
  }

  private statisticalInsights(issues: Issue[]): string[] {
    if (issues.length === 0) {
      return ['No issues reported yet. Be the first to report!'];
    }
    const insights: string[] = [];
    const categories: Record<string, number> = {};
    const severities: Record<string, number> = {};
    const unresolved = issues.filter((i) => i.status !== 'resolved' && i.status !== 'verified_resolved').length;

    for (const issue of issues) {
      const cat = String(issue.category || 'other');
      const sev = String(issue.severity || 'medium');
      categories[cat] = (categories[cat] || 0) + 1;
      severities[sev] = (severities[sev] || 0) + 1;
    }

    const topCat = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    if (topCat) insights.push(`${topCat[0]} is the most reported category with ${topCat[1]} issue(s).`);

    const crit = severities.critical || 0;
    if (crit > 0) insights.push(`${crit} critical issue(s) need immediate attention.`);

    if (unresolved > 0) insights.push(`${unresolved} of ${issues.length} issue(s) are still unresolved.`);

    if (insights.length < 3) {
      insights.push('Consider prioritizing high-severity categories for faster resolution.');
    }
    return insights.slice(0, 5);
  }
  /**
   * Generate a structured AI analyst report for a city from its actual issues.
   * Falls back to a statistical report derived only from real data when AI
   * is unavailable or the request fails. Never fabricates numbers.
   */
  async analyzeCity(
    cityName: string,
    issues: Issue[],
    signal?: AbortSignal
  ): Promise<CityAnalystReport> {
    if (issues.length === 0) {
      return this.statisticalCityAnalyst(cityName, issues);
    }

    const summary = issues.slice(0, 40).map((i) => ({
      category: i.category,
      severity: i.severity,
      status: i.status,
      address: i.address,
      title: i.title,
      ageDays: Math.max(0, Math.round((Date.now() - new Date(i.reportedAt).getTime()) / 86400000)),
    }));

    const prompt = [
      'You are a senior civic data analyst for ' + cityName + '.',
      'Analyze ONLY the provided reported issues and return valid JSON with EXACTLY these keys:',
      '{"verdict":"a short 1-2 sentence overall assessment of civic health","topProblems":["3-5 dominant civic problem categories"],"priorityIssues":["highest-priority unresolved issues"],"trends":["2-4 factual trends"],"recommendations":["3-5 actionable recommendations"]}.',
      'Base every claim strictly on the data provided.',
      'If there is little data, say so. Do not invent facts.',
      '',
      'Issues: ' + JSON.stringify(summary),
    ].join(' ');

    try {
      const responseText = await this.callAi(prompt, [], signal);
      const parsed = JSON.parse(responseText);
      return {
        verdict: String(parsed?.verdict || 'Analysis of ' + cityName + ' based on reported issues.'),
        topProblems: Array.isArray(parsed?.topProblems) ? parsed.topProblems.map(String) : [],
        priorityIssues: Array.isArray(parsed?.priorityIssues) ? parsed.priorityIssues.map(String) : [],
        trends: Array.isArray(parsed?.trends) ? parsed.trends.map(String) : [],
        recommendations: Array.isArray(parsed?.recommendations) ? parsed.recommendations.map(String) : [],
      };
    } catch {
      return this.statisticalCityAnalyst(cityName, issues);
    }
  }

  /**
   * Answer a free-form question about a city using its REAL reported issue data
   * and statistics. Returns a structured, data-grounded answer.
   */
  async askCityQuestion(
    context: CityAssistantContext,
    issues: Issue[],
    question: string,
    signal?: AbortSignal
  ): Promise<CityAnswer> {
    if (issues.length === 0) {
      return {
        summary: 'There is no reported issue data for ' + context.cityName + ' yet, so I cannot answer that.',
        keyFindings: [],
        recommendations: [],
      };
    }

    const issueSummary = issues.slice(0, 30).map((i) => ({
      category: i.category,
      severity: i.severity,
      status: i.status,
      address: i.address,
      title: i.title,
    }));

    const prompt = [
      'You are a senior civic data analyst for ' + context.cityName + '.',
      'Answer the user question using ONLY the real city data provided below.',
      'Return valid JSON exactly like: {"summary":"one short paragraph answering the question","keyFindings":["2-4 concise bullet points derived from the data"],"recommendations":["2-3 actionable recommendations for city authorities"]}.',
      'If the data does not support an answer, say so clearly. Do not invent facts.',
      '',
      'CITY STATS: ' + JSON.stringify(context.stats),
      'CATEGORY COUNTS: ' + JSON.stringify(context.categories),
      'STATUS COUNTS: ' + JSON.stringify(context.statuses),
      'COMMUNITY CONFIRMATIONS: ' + context.communityConfirmations,
      'ISSUES: ' + JSON.stringify(issueSummary),
      '',
      'USER QUESTION: ' + question,
    ].join(' ');

    const responseText = await this.callAi(prompt, [], signal);
    return this.parseCityAnswer(responseText);
  }

  private parseCityAnswer(responseText: string): CityAnswer {
    let parsed: Partial<CityAnswer> | null = null;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Salvage a JSON object from the response if it contains stray text.
      const match = responseText.match(/{[sS]*}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch { parsed = null; }
      }
    }

    const summary =
      parsed && typeof parsed.summary === 'string' && parsed.summary.trim().length > 0
        ? parsed.summary.trim()
        : '';
    const keyFindings = Array.isArray(parsed?.keyFindings)
      ? parsed.keyFindings.map(String).filter((k) => k.trim().length > 0)
      : [];
    const recommendations = Array.isArray(parsed?.recommendations)
      ? parsed.recommendations.map(String).filter((r) => r.trim().length > 0)
      : [];

    if (!summary) {
      throw new Error('I could not generate an answer from the available data.');
    }
    return { summary, keyFindings, recommendations };
  }

  /**
   * Statistical analyst report derived only from real data (used when AI is unavailable).
   */
  private statisticalCityAnalyst(cityName: string, issues: Issue[]): CityAnalystReport {
    if (issues.length === 0) {
      return {
        verdict: 'Insufficient data to analyse ' + cityName + ' yet.',
        topProblems: [],
        priorityIssues: [],
        trends: [],
        recommendations: ['Once issues are reported, an analysis will be generated.'],
      };
    }

    const cats: Record<string, number> = {};
    let active = 0;
    let resolved = 0;
    for (const i of issues) {
      cats[i.category] = (cats[i.category] || 0) + 1;
      if (i.status === 'resolved' || i.status === 'verified_resolved') resolved++;
      else active++;
    }
    const critical = issues.filter((i) => i.severity === 'critical').length;

    const topProblems = Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, n]) => cat + ' (' + n + ' report' + (n === 1 ? '' : 's') + ')');

    const priorityIssues = issues
      .filter((i) => i.severity === 'critical' || i.severity === 'high')
      .filter((i) => i.status !== 'resolved' && i.status !== 'verified_resolved')
      .slice(0, 5)
      .map((i) => i.title + ' — ' + i.category + ' (' + i.severity + ')');

    const trends: string[] = [];
    if (critical > 0) trends.push(critical + ' critical issue' + (critical === 1 ? '' : 's') + ' reported.');
    trends.push(active + ' issue' + (active === 1 ? '' : 's') + ' open, ' + resolved + ' resolved.');
    const top = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
    if (top) trends.push(top[0] + ' is the most-reported category (' + top[1] + ').');

    const recommendations: string[] = [];
    if (critical > 0) recommendations.push('Prioritise resolution of critical and high-severity issues.');
    if (top && top[1] >= 2) recommendations.push('Focus on the ' + top[0] + ' category, which dominates reports.');
    if (recommendations.length === 0) recommendations.push('Monitor reported issues for emerging patterns.');

    const verdict =
      active === 0
        ? 'All ' + issues.length + ' reported issue(s) in ' + cityName + ' are resolved.'
        : cityName + ' has ' + active + ' open issue(s) (' + critical + ' critical).';

    return { verdict, topProblems, priorityIssues, trends, recommendations };
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

export const aiService = new AiService();