/**
 * AI Engine Service
 *
 * Performs deep code analysis using Google Gemini AI.
 * Uses lazy initialization so the API key is read after dotenv has loaded.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Severity & Score Helpers ─────────────────────────────────────────────────

const VALID_SEVERITIES = ['critical', 'high', 'medium', 'low'];

const normalizeSeverity = (severity, fallback = 'medium') => {
  const s = String(severity).toLowerCase();
  return VALID_SEVERITIES.includes(s) ? s : fallback;
};

const validateScore = (score) => {
  const n = parseInt(score);
  return isNaN(n) ? 75 : Math.max(0, Math.min(100, n));
};

// ─── AIEngine Class ───────────────────────────────────────────────────────────

class AIEngine {
  constructor() {
    // Defer env reads until the first real call (fixes ESM hoisting issue with dotenv)
    this._ready = false;
  }

  // ─── Lazy Init ─────────────────────────────────────────────────────────────

  _init() {
    if (this._ready) return;
    this._ready = true;

    this.apiKey    = process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    this.timeout   = parseInt(process.env.REQUEST_TIMEOUT) || 30000;

    if (!this.apiKey) {
      console.warn('[AI Engine] GEMINI_API_KEY not set — AI analysis disabled.');
      return;
    }

    const genAI  = new GoogleGenerativeAI(this.apiKey);
    this.model   = genAI.getGenerativeModel({ model: this.modelName });
    console.log(`[AI Engine] Ready — model: ${this.modelName}`);
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /** Returns true if the engine is configured and ready to use. */
  isAvailable() {
    this._init();
    return !!this.apiKey;
  }

  /** Returns current engine status (for health/debug endpoints). */
  getStatus() {
    this._init();
    return { available: this.isAvailable(), model: this.modelName, timeout: this.timeout };
  }

  /**
   * Analyze code with Gemini AI.
   * @param {string} code     - Source code to review
   * @param {string} language - Programming language
   * @returns {Promise<Object>} Structured review result
   */
  async analyze(code, language) {
    this._init();

    if (!this.apiKey || !this.model) {
      throw new Error('Gemini API key not configured');
    }

    if (code.length > 8000) {
      console.warn('[AI Engine] Code truncated to 8 000 chars for analysis');
      code = this._truncate(code, 8000);
    }

    const prompt = this._buildPrompt(code, language);

    try {
      console.log(`[AI Engine] Requesting analysis (${this.modelName})…`);

      const result = await Promise.race([
        this.model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), this.timeout)
        ),
      ]);

      const text = result.response.text();
      if (!text) throw new Error('Empty response from Gemini');

      const parsed = this._parseResponse(text);
      console.log(`[AI Engine] Done — ${parsed.issues.length} issues found`);
      return parsed;

    } catch (err) {
      this._handleApiError(err);
    }
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  _handleApiError(err) {
    console.error('[AI Engine] Error:', err.message);

    if (err.message === 'TIMEOUT') {
      throw new Error('AI analysis timed out. Try a smaller code snippet.');
    }
    if (err.status === 400) throw new Error('Invalid request to Gemini API.');
    if (err.status === 403) throw new Error('Invalid or unauthorized Gemini API key.');
    if (err.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
    if (err.status >= 500) throw new Error('Gemini service temporarily unavailable.');

    throw new Error(`AI analysis failed: ${err.message}`);
  }

  _buildPrompt(code, language) {
    return `You are an expert code reviewer with 15+ years of experience.
Analyze the ${language} code below and respond ONLY with valid JSON — no markdown, no code fences.

Required JSON format:
{
  "summary": "2-3 sentence overview of code quality",
  "overallScore": <0-100>,
  "issues": [
    { "type": "issue|security|performance", "line": <number|null>, "message": "...", "severity": "critical|high|medium|low", "category": "..." }
  ],
  "suggestions": [
    { "type": "improvement|refactoring", "message": "...", "severity": "high|medium|low", "category": "..." }
  ],
  "optimizedCode": "<full improved code or null>"
}

Valid categories: security, performance, maintainability, readability, bug-risk, best-practice, error-handling

Code to review:
\`\`\`${language}
${code}
\`\`\`

Review for: security vulnerabilities, bugs, performance issues, code quality, best practices, error handling, and edge cases.`;
  }

  _parseResponse(content) {
    try {
      // Strip markdown fences if the model includes them despite instructions
      let json = content.trim()
        .replace(/^```json\n?/, '')
        .replace(/^```\n?/, '')
        .replace(/\n?```$/, '')
        .trim();

      const parsed = JSON.parse(json);

      return {
        summary:       parsed.summary || 'Analysis completed',
        overallScore:  validateScore(parsed.overallScore),
        issues:        (parsed.issues || []).map(i => this._normalizeIssue(i)),
        suggestions:   (parsed.suggestions || []).map(s => this._normalizeSuggestion(s)),
        optimizedCode: parsed.optimizedCode || null,
      };

    } catch (err) {
      console.error('[AI Engine] Failed to parse response:', err.message);
      console.error('[AI Engine] Raw (first 500 chars):', content.substring(0, 500));

      // Graceful fallback — rule engine results still returned to client
      return {
        summary:       'AI response parsing failed. Rule-based results shown.',
        overallScore:  75,
        issues:        [],
        suggestions:   [],
        optimizedCode: null,
      };
    }
  }

  _normalizeIssue(issue) {
    return {
      type:     issue.type     || 'issue',
      line:     issue.line     || null,
      message:  issue.message  || 'Unknown issue',
      severity: normalizeSeverity(issue.severity),
      category: issue.category || 'general',
      source:   'ai',
    };
  }

  _normalizeSuggestion(suggestion) {
    return {
      type:     suggestion.type     || 'suggestion',
      line:     suggestion.line     || null,
      message:  suggestion.message  || 'Unknown suggestion',
      severity: normalizeSeverity(suggestion.severity, 'low'),
      category: suggestion.category || 'improvement',
      source:   'ai',
    };
  }

  _truncate(code, maxLength) {
    const lines  = code.split('\n');
    let   result = '';

    for (const line of lines) {
      if (result.length + line.length + 1 > maxLength) {
        result += '\n// … [truncated for analysis]';
        break;
      }
      result += line + '\n';
    }

    return result;
  }
}

// ─── Singleton Export ─────────────────────────────────────────────────────────

export default new AIEngine();
