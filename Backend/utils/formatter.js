/**
 * Formatter Utility
 *
 * Merges rule-based and AI analysis results, deduplicates findings,
 * calculates a combined score, and shapes the final API response.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const SEVERITY_WEIGHTS = { critical: 15, high: 10, medium: 5, low: 2 };
const SEVERITY_ORDER   = { critical: 0, high: 1, medium: 2, low: 3 };
const VALID_SEVERITIES = Object.keys(SEVERITY_ORDER);

// ─── Public Exports ───────────────────────────────────────────────────────────

/**
 * Merge results from both engines into a single unified object.
 * @param {Object} ruleResults - Output from RuleEngine.analyze()
 * @param {Object} aiResults   - Output from AIEngine.analyze()
 * @param {string} _language   - Language (reserved for future use)
 */
export function mergeResults(ruleResults, aiResults, _language) {
  const allIssues      = deduplicate([...ruleResults.issues || [], ...aiResults.issues || []]);
  const allSuggestions = deduplicate([...ruleResults.suggestions || [], ...aiResults.suggestions || []]);

  const { securityWarnings, otherIssues } = splitByCategory(allIssues);

  const score   = calcCombinedScore(ruleResults.score ?? 100, aiResults.overallScore ?? 100, securityWarnings, otherIssues, allSuggestions);
  const summary = buildSummary(score, otherIssues, securityWarnings, allSuggestions, aiResults.summary);

  return {
    summary,
    overallScore:     score,
    issues:           otherIssues,
    securityWarnings,
    suggestions:      allSuggestions,
    optimizedCode:    aiResults.optimizedCode || null,
  };
}

/**
 * Shape the final JSON response sent to the client.
 */
export function formatResponse(merged) {
  return {
    summary:          merged.summary,
    overallScore:     merged.overallScore,
    issues:           merged.issues.map(formatItem),
    securityWarnings: merged.securityWarnings.map(formatItem),
    suggestions:      merged.suggestions.map(formatItem),
    optimizedCode:    merged.optimizedCode,
    reviewedAt:       new Date().toISOString(),
  };
}

/** Sort findings by severity (critical → low). */
export function sortBySeverity(items) {
  return [...items].sort((a, b) =>
    (SEVERITY_ORDER[a.severity] ?? 4) - (SEVERITY_ORDER[b.severity] ?? 4)
  );
}

/** Group findings by their category field. */
export function groupByCategory(items) {
  return items.reduce((acc, item) => {
    const cat = item.category || 'general';
    (acc[cat] = acc[cat] || []).push(item);
    return acc;
  }, {});
}

// ─── Private Helpers ──────────────────────────────────────────────────────────

/** Remove duplicate findings using normalized message as the key. */
function deduplicate(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = (item.message || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/line \d+/gi, 'line N')
      .trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Separate security issues from all other issues. */
function splitByCategory(issues) {
  const securityWarnings = [];
  const otherIssues      = [];

  for (const issue of issues) {
    if (issue.type === 'security' || issue.category === 'security') {
      securityWarnings.push(issue);
    } else {
      otherIssues.push(issue);
    }
  }

  return { securityWarnings, otherIssues };
}

/**
 * Blend the rule-engine score and AI score, then apply penalties
 * for security warnings, general issues, and suggestions.
 */
function calcCombinedScore(ruleScore, aiScore, securityWarnings, issues, suggestions) {
  // AI engine is weighted slightly higher for nuanced insights
  let score = Math.round(ruleScore * 0.4 + aiScore * 0.6);

  score -= securityWarnings.length  * 10;
  score -= Math.min(issues.length   * 3, 20);
  score -= Math.min(suggestions.length,  5);

  return Math.max(0, Math.min(100, score));
}

/** Build a human-readable summary from the findings. */
function buildSummary(score, issues, securityWarnings, suggestions, aiSummary) {
  const quality =
    score >= 90 ? 'Excellent code quality'                       :
    score >= 75 ? 'Good code quality with minor issues'          :
    score >= 60 ? 'Moderate quality — improvements recommended'  :
    score >= 40 ? 'Code quality needs significant improvement'    :
                  'Critical code quality issues detected';

  const counts = [
    issues.length          && `${issues.length} issue${issues.length > 1 ? 's' : ''}`,
    securityWarnings.length && `${securityWarnings.length} security warning${securityWarnings.length > 1 ? 's' : ''}`,
    suggestions.length     && `${suggestions.length} suggestion${suggestions.length > 1 ? 's' : ''}`,
  ].filter(Boolean);

  const finding = counts.length ? `Found ${counts.join(', ')}` : 'No issues detected';

  const parts = [quality, finding];
  if (aiSummary && aiSummary !== 'Analysis completed') parts.push(aiSummary);

  return parts.join('. ') + '.';
}

/** Normalize a single issue or suggestion for the response payload. */
function formatItem(item) {
  return {
    type:     item.type     || 'issue',
    line:     item.line     || null,
    message:  (item.message || '').trim().replace(/\s+/g, ' ').replace(/\.$/, ''),
    severity: normalizeSeverity(item.severity),
    category: item.category || 'general',
  };
}

function normalizeSeverity(severity) {
  const s = String(severity).toLowerCase();
  return VALID_SEVERITIES.includes(s) ? s : 'medium';
}
