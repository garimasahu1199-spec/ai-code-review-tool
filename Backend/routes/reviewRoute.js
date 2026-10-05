/**
 * Review Routes
 *
 * POST /api/review           — Full hybrid analysis (rule engine + AI)
 * POST /api/review/quick     — Rule-based analysis only (faster)
 * GET  /api/review/languages — Supported programming languages
 */

import express from 'express';
import ruleEngine from '../services/ruleEngine.js';
import aiEngine   from '../services/aiEngine.js';
import { mergeResults, formatResponse } from '../utils/formatter.js';

const router = express.Router();

// ─── Constants ────────────────────────────────────────────────────────────────

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', extensions: ['.js', '.jsx', '.mjs'] },
  { id: 'typescript', name: 'TypeScript', extensions: ['.ts', '.tsx']          },
  { id: 'python',     name: 'Python',     extensions: ['.py', '.pyw']          },
  { id: 'java',       name: 'Java',       extensions: ['.java']                },
  { id: 'cpp',        name: 'C++',        extensions: ['.cpp', '.cc', '.h']    },
  { id: 'csharp',     name: 'C#',         extensions: ['.cs']                  },
  { id: 'go',         name: 'Go',         extensions: ['.go']                  },
  { id: 'rust',       name: 'Rust',       extensions: ['.rs']                  },
  { id: 'ruby',       name: 'Ruby',       extensions: ['.rb']                  },
  { id: 'php',        name: 'PHP',        extensions: ['.php']                 },
  { id: 'swift',      name: 'Swift',      extensions: ['.swift']               },
  { id: 'kotlin',     name: 'Kotlin',     extensions: ['.kt', '.kts']          },
];

const LANGUAGE_IDS = SUPPORTED_LANGUAGES.map(l => l.id);

const MAX_CODE_LENGTH = 100_000;

// ─── Input Validation ─────────────────────────────────────────────────────────

function validateRequest(code, language) {
  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return { status: 400, error: 'A non-empty code string is required.', code: 'MISSING_CODE' };
  }
  if (code.length > MAX_CODE_LENGTH) {
    return { status: 413, error: `Code exceeds the ${MAX_CODE_LENGTH.toLocaleString()} character limit.`, code: 'CODE_TOO_LARGE' };
  }
  if (!LANGUAGE_IDS.includes(language)) {
    return { status: 400, error: `Unsupported language "${language}". Supported: ${LANGUAGE_IDS.join(', ')}.`, code: 'UNSUPPORTED_LANGUAGE' };
  }
  return null; // valid
}

// ─── POST /api/review ─────────────────────────────────────────────────────────

router.post('/review', async (req, res, next) => {
  const startTime = Date.now();

  try {
    const { code, language = 'javascript' } = req.body;
    const lang = language.toLowerCase().trim();

    const validationError = validateRequest(code, lang);
    if (validationError) {
      return res.status(validationError.status).json({ success: false, ...validationError });
    }

    console.log(`[Review] Analyzing ${lang} (${code.length} chars)…`);

    // Run both engines in parallel; never let one failure block the other
    const [ruleResult, aiResult] = await Promise.allSettled([
      ruleEngine.analyze(code, lang),
      aiEngine.analyze(code, lang),
    ]);

    const ruleAnalysis = ruleResult.status === 'fulfilled'
      ? ruleResult.value
      : (console.error('[Rule Engine]', ruleResult.reason?.message), { issues: [], suggestions: [], score: 100 });

    const aiAnalysis = aiResult.status === 'fulfilled'
      ? aiResult.value
      : (console.error('[AI Engine]', aiResult.reason?.message), {
          summary: 'AI analysis unavailable. Showing rule-based results only.',
          issues: [], suggestions: [], optimizedCode: null, overallScore: 100,
        });

    const merged    = mergeResults(ruleAnalysis, aiAnalysis, lang);
    const formatted = formatResponse(merged);

    const ms = Date.now() - startTime;
    console.log(`[Review] Done in ${ms}ms — score: ${formatted.overallScore}`);

    return res.json({
      success: true,
      data: {
        ...formatted,
        metadata: {
          processingTimeMs: ms,
          language:  lang,
          codeLength: code.length,
          lineCount:  code.split('\n').length,
          enginesUsed: {
            ruleEngine: ruleResult.status === 'fulfilled',
            aiEngine:   aiResult.status   === 'fulfilled',
          },
        },
      },
    });

  } catch (err) {
    next(err);
  }
});

// ─── POST /api/review/quick ───────────────────────────────────────────────────

router.post('/review/quick', async (req, res, next) => {
  try {
    const { code, language = 'javascript' } = req.body;
    const lang = language.toLowerCase().trim();

    const validationError = validateRequest(code, lang);
    if (validationError) {
      return res.status(validationError.status).json({ success: false, ...validationError });
    }

    const results = await ruleEngine.analyze(code, lang);

    return res.json({
      success: true,
      data: { ...results, language: lang, reviewedAt: new Date().toISOString(), quickMode: true },
    });

  } catch (err) {
    next(err);
  }
});

// ─── GET /api/review/languages ────────────────────────────────────────────────

router.get('/review/languages', (_req, res) => {
  res.json({ success: true, data: SUPPORTED_LANGUAGES });
});

export default router;
