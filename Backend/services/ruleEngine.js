/**
 * Rule Engine Service
 * 
 * Performs fast, rule-based code analysis without external API calls.
 * Detects common issues, anti-patterns, and style violations.
 * 
 * The rule engine is modular and extensible - new rules can be easily added.
 */

class RuleEngine {
  constructor() {
    // Initialize rule registry
    this.rules = this.initializeRules();
  }

  /**
   * Initialize all available rules
   * Each rule is a function that takes code and language, returns findings
   */
  initializeRules() {
    return {
      javascript: [
        this.detectVarUsage,
        this.detectConsoleLogs,
        this.detectLongFunctions,
        this.detectUnusedVariables,
        this.detectEvalUsage,
        this.detectInnerHTML,
        this.detectHardcodedSecrets,
        this.detectEmptyCatch,
        this.detectDoubleEquality,
        this.detectDebuggerStatements,
        this.detectTodoComments,
        this.detectNestedCallbacks,
        this.detectMagicNumbers,
        this.detectDuplicateCode,
      ],
      typescript: [
        this.detectVarUsage,
        this.detectConsoleLogs,
        this.detectLongFunctions,
        this.detectAnyType,
        this.detectHardcodedSecrets,
        this.detectEmptyCatch,
        this.detectDebuggerStatements,
        this.detectTodoComments,
        this.detectMagicNumbers,
      ],
      python: [
        this.detectPrintStatements,
        this.detectLongFunctions,
        this.detectBareExcept,
        this.detectMutableDefaults,
        this.detectHardcodedSecrets,
        this.detectTodoComments,
        this.detectMagicNumbers,
      ],
      java: [
        this.detectSystemOutPrint,
        this.detectLongMethods,
        this.detectEmptyCatch,
        this.detectHardcodedSecrets,
        this.detectTodoComments,
        this.detectMagicNumbers,
      ],
      cpp: [
        this.detectCoutStatements,
        this.detectLongFunctions,
        this.detectUsingNamespaceStd,
        this.detectHardcodedSecrets,
        this.detectTodoComments,
        this.detectMagicNumbers,
      ],
      // Generic rules for other languages
      generic: [
        this.detectLongFunctions,
        this.detectHardcodedSecrets,
        this.detectTodoComments,
        this.detectMagicNumbers,
      ],
    };
  }

  /**
   * Main analysis method
   * Runs all applicable rules against the code
   */
  async analyze(code, language) {
    const lines = code.split('\n');
    const issues = [];
    const suggestions = [];
    
    // Get rules for this language (or generic rules)
    const languageRules = this.rules[language] || this.rules.generic;
    
    // Run each rule
    for (const rule of languageRules) {
      try {
        const result = rule.call(this, code, lines, language);
        if (result) {
          if (result.issues) issues.push(...result.issues);
          if (result.suggestions) suggestions.push(...result.suggestions);
        }
      } catch (error) {
        console.error(`[Rule Engine] Rule ${rule.name} failed:`, error.message);
      }
    }
    
    // Calculate score based on issues
    const score = this.calculateScore(issues, suggestions, lines.length);
    
    return {
      issues,
      suggestions,
      score,
      ruleCount: languageRules.length,
    };
  }

  /**
   * Calculate code quality score (0-100)
   */
  calculateScore(issues, suggestions, lineCount) {
    let score = 100;
    
    // Deduct for issues
    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical': score -= 15; break;
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
        default: score -= 3;
      }
    }
    
    // Deduct for suggestions (less weight)
    for (const suggestion of suggestions) {
      switch (suggestion.severity) {
        case 'high': score -= 3; break;
        case 'medium': score -= 2; break;
        case 'low': score -= 1; break;
      }
    }
    
    // Ensure score is within bounds
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // ==========================================
  // JAVASCRIPT / TYPESCRIPT RULES
  // ==========================================

  /**
   * Detect 'var' usage (should use let/const)
   */
  detectVarUsage(code, lines) {
    const issues = [];
    const varRegex = /^\s*var\s+/;
    
    lines.forEach((line, index) => {
      if (varRegex.test(line) && !line.trim().startsWith('//')) {
        issues.push({
          type: 'issue',
          line: index + 1,
          message: "Use 'let' or 'const' instead of 'var' for better scoping",
          severity: 'low',
          category: 'best-practice',
        });
      }
    });
    
    return issues.length > 0 ? { issues } : null;
  }

  /**
   * Detect console.log statements
   */
  detectConsoleLogs(code, lines) {
    const issues = [];
    const consoleRegex = /console\.(log|debug|info|warn|error|trace)\(/;
    
    lines.forEach((line, index) => {
      if (consoleRegex.test(line) && !line.trim().startsWith('//')) {
        issues.push({
          type: 'issue',
          line: index + 1,
          message: 'Remove console.log statements before production',
          severity: 'low',
          category: 'cleanup',
        });
      }
    });
    
    return issues.length > 0 ? { issues } : null;
  }

  /**
   * Detect long functions (>50 lines)
   */
  detectLongFunctions(code, lines, language) {
    const issues = [];
    const functionPatterns = [
      /function\s+\w+\s*\([^)]*\)\s*\{/,
      /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{/,
      /let\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{/,
      /var\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{/,
      /\w+\s*\([^)]*\)\s*\{/,
      /async\s+function\s+\w+/,
      /async\s*\([^)]*\)\s*=>/,
    ];
    
    let functionStart = -1;
    let braceCount = 0;
    let inFunction = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line starts a function
      if (!inFunction && functionPatterns.some(pattern => pattern.test(line))) {
        functionStart = i;
        inFunction = true;
        braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      } else if (inFunction) {
        braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        
        if (braceCount <= 0) {
          const functionLength = i - functionStart + 1;
          if (functionLength > 50) {
            issues.push({
              type: 'issue',
              line: functionStart + 1,
              message: `Function is ${functionLength} lines long. Consider breaking it into smaller functions (>50 lines)`,
              severity: 'medium',
              category: 'maintainability',
            });
          }
          inFunction = false;
          functionStart = -1;
        }
      }
    }
    
    return issues.length > 0 ? { issues } : null;
  }

  /**
   * Detect unused variables (basic check)
   */
  detectUnusedVariables(code, lines) {
    const issues = [];
    const declarations = [];
    
    // Find variable declarations
    const varDeclarationRegex = /(?:const|let|var)\s+(\w+)(?:\s*[=,\s]*\w*)*\s*=/g;
    let match;
    
    while ((match = varDeclarationRegex.exec(code)) !== null) {
      declarations.push({
        name: match[1],
        line: code.substring(0, match.index).split('\n').length,
      });
    }
    
    // Check if each variable is used
    declarations.forEach(({ name, line }) => {
      // Count usages (excluding declaration)
      const usageRegex = new RegExp(`\\b${name}\\b`, 'g');
      const usages = (code.match(usageRegex) || []).length;
      
      if (usages <= 1) {
        issues.push({
          type: 'suggestion',
          line: line,
          message: `Variable '${name}' appears to be unused. Consider removing it.`,
          severity: 'low',
          category: 'cleanup',
        });
      }
    });
    
    return issues.length > 0 ? { issues } : null;
  }

  /**
   * Detect eval() usage
   */
  detectEvalUsage(code, lines) {
    const issues = [];
    const evalRegex = /[^\w]eval\s*\(/;
    
    lines.forEach((line, index) => {
      if (evalRegex.test(line) && !line.trim().startsWith('//')) {
        issues.push({
          type: 'security',
          line: index + 1,
          message: 'Avoid using eval() - major security risk for code injection',
          severity: 'critical',
          category: 'security',
        });
      }
    });
    
    return issues.length > 0 ? { issues } : null;
  }

  /**
   * Detect innerHTML usage
   */
  detectInnerHTML(code, lines) {
    const issues = [];
    const innerHTMLRegex = /\.innerHTML\s*=/;
    
    lines.forEach((line, index) => {
      if (innerHTMLRegex.test(line)) {
        issues.push({
          type: 'security',
          line: index + 1,
          message: 'Use textContent or sanitize input before using innerHTML to prevent XSS',
          severity: 'high',
          category: 'security',
        });
      }
    });
    
    return issues.length > 0 ? { issues } : null;
  }

  /**
   * Detect hardcoded secrets/credentials
   */
  detectHardcodedSecrets(code, lines) {
    const issues = [];
    const secretPatterns = [
      { pattern: /password\s*[=:]\s*["'][^"']+["']/i, message: 'Possible hardcoded password detected' },
      { pattern: /api[_-]?key\s*[=:]\s*["'][^"']+["']/i, message: 'Possible hardcoded API key detected' },
      { pattern: /secret\s*[=:]\s*["'][^"']+["']/i, message: 'Possible hardcoded secret detected' },
      { pattern: /token\s*[=:]\s*["'][^"']+["']/i, message: 'Possible hardcoded token detected' },
      { pattern: /aws_access_key_id\s*[=:]\s*["'][^"']+["']/i, message: 'Possible hardcoded AWS key detected' },
      { pattern: /private[_-]?key\s*[=:]\s*["'][^"']+["']/i, message: 'Possible hardcoded private key detected' },
      { pattern: /connection[_-]?string\s*[=:]\s*["'][^"']+["']/i, message: 'Possible hardcoded connection string detected' },
    ];
    
    lines.forEach((line, index) => {
      // Skip comments
      if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) {
        return;
      }
      
      for (const { pattern, message } of secretPatterns) {
        if (pattern.test(line)) {
          // Exclude test/mock values
          const value = line.match(/["']([^"']+)["']/)?.[1] || '';
          if (value.length > 3 && !['test', 'example', 'demo', 'sample', 'placeholder'].includes(value.toLowerCase())) {
            issues.push({
              type: 'security',
              line: index + 1,
              message: `${message}. Use environment variables instead.`,
              severity: 'critical',
              category: 'security',
            });
          }
          break;
        }
      }
    });
    
    return issues.length > 0 ? { issues } : null;
  }

  /**
   * Detect empty catch blocks
   */
  detectEmptyCatch(code, lines) {
    const issues = [];
    const emptyCatchRegex = /catch\s*\([^)]*\)\s*\{\s*\}/;
    
    lines.forEach((line, index) => {
      if (emptyCatchRegex.test(line)) {
        issues.push({
          type: 'issue',
          line: index + 1,
          message: 'Empty catch block hides errors. Log or handle the exception properly.',
          severity: 'medium',
          category: 'error-handling',
        });
      }
    });
    
    return issues.length > 0 ? { issues } : null;
  }

  /**
   * Detect double equality (== instead of ===)
   */
  detectDoubleEquality(code, lines) {
    const issues = [];
    const doubleEqRegex = /[^=!]==[^=]/;
    
    lines.forEach((line, index) => {
      if (doubleEqRegex.test(line) && !line.trim().startsWith('//')) {
        issues.push({
          type: 'suggestion',
          line: index + 1,
          message: "Use triple equality (===) instead of double (==) for type-safe comparisons",
          severity: 'low',
          category: 'best-practice',
        });
      }
    });
    
    return issues.length > 0 ? { issues } : null;
  }

  /**
   * Detect debugger statements
   */
  detectDebuggerStatements(code, lines) {
    const issues = [];
    const debuggerRegex = /^\s*debugger\s*;?/;
    
    lines.forEach((line, index) => {
      if (debuggerRegex.test(line)) {
        issues.push({
          type: 'issue',
          line: index + 1,
          message: 'Remove debugger statement before production',
          severity: 'medium',
          category: 'cleanup',
        });
      }
    });
    
    return issues.length > 0 ? { issues } : null;
  }

  /**
   * Detect TODO/FIXME comments
   */
  detectTodoComments(code, lines) {
    const suggestions = [];
    const todoRegex = /\/\/\s*(TODO|FIXME|XXX|HACK)/i;
    
    lines.forEach((line, index) => {
      const match = line.match(todoRegex);
      if (match) {
        suggestions.push({
          type: 'suggestion',
          line: index + 1,
          message: `${match[1]} comment found: ${line.trim()}`,
          severity: 'low',
          category: 'maintenance',
        });
      }
    });
    
    return suggestions.length > 0 ? { suggestions } : null;
  }

  /**
   * Detect deeply nested callbacks
   */
  detectNestedCallbacks(code, lines) {
    const issues = [];
    const callbackRegex = /\}\s*\)\s*\}\s*\)\s*\}/;
    
    lines.forEach((line, index) => {
      if (callbackRegex.test(line)) {
        issues.push({
          type: 'issue',
          line: index + 1,
          message: 'Deeply nested callbacks detected (callback hell). Consider using Promises or async/await',
          severity: 'medium',
          category: 'maintainability',
        });
      }
    });
    
    return issues.length > 0 ? { issues } : null;
  }

  /**
   * Detect magic numbers
   */
  detectMagicNumbers(code, lines) {
    const suggestions = [];
    const magicNumberRegex = /[^\w.](\d{3,}|\d{1,2})(?!\s*[;,)]\s*\/\/)/;
    
    lines.forEach((line, index) => {
      if (magicNumberRegex.test(line) && !line.trim().startsWith('//')) {
        const match = line.match(/(\d{3,}|\d{1,2})/);
        if (match) {
          const num = parseInt(match[1]);
          // Exclude common numbers
          if (![0, 1, 2, 10, 100, 1000, 60, 24, 365].includes(num)) {
            suggestions.push({
              type: 'suggestion',
              line: index + 1,
              message: `Magic number ${num} detected. Consider using a named constant`,
              severity: 'low',
              category: 'maintainability',
            });
          }
        }
      }
    });
    
    return suggestions.length > 0 ? { suggestions } : null;
  }

  /**
   * Detect duplicate code blocks
   */
  detectDuplicateCode(code, lines) {
    const issues = [];
    const seen = new Map();
    
    for (let i = 0; i < lines.length - 3; i++) {
      const block = lines.slice(i, i + 3).join('\n').trim();
      
      // Skip empty or short blocks
      if (block.length < 20 || /^\s*[{}]*\s*$/.test(block)) continue;
      
      if (seen.has(block)) {
        const firstLine = seen.get(block);
        if (i - firstLine > 5) { // Not the same block
          issues.push({
            type: 'suggestion',
            line: i + 1,
            message: `Duplicate code block detected (similar to line ${firstLine + 1}). Consider extracting to a function.`,
            severity: 'low',
            category: 'maintainability',
          });
        }
      } else {
        seen.set(block, i);
      }
    }
    
    return issues.length > 0 ? { issues } : null;
  }

  /**
   * Detect TypeScript 'any' type usage
   */
  detectAnyType(code, lines) {
    const issues = [];
    const anyRegex = /:\s*any\b/;
    
    lines.forEach((line, index) => {
      if (anyRegex.test(line) && !line.trim().startsWith('//')) {
        issues.push({
          type: 'suggestion',
          line: index + 1,
          message: "Avoid using 'any' type. Use specific types or 'unknown' for better type safety",
          severity: 'low',
          category: 'type-safety',
        });
      }
    });
    
    return issues.length > 0 ? { issues } : null;
  }

  // ==========================================
  // PYTHON RULES
  // ==========================================

  detectPrintStatements(code, lines) {
    const issues = [];
    const printRegex = /^\s*print\s*\(/;
    
    lines.forEach((line, index) => {
      if (printRegex.test(line) && !line.trim().startsWith('#')) {
        issues.push({
          type: 'issue',
          line: index + 1,
          message: 'Remove print statements or use logging for production code',
          severity: 'low',
          category: 'cleanup',
        });
      }
    });
    
    return issues.length > 0 ? { issues } : null;
  }

  detectBareExcept(code, lines) {
    const issues = [];
    const bareExceptRegex = /except\s*:/;
    
    lines.forEach((line, index) => {
      if (bareExceptRegex.test(line)) {
        issues.push({
          type: 'issue',
          line: index + 1,
          message: "Avoid bare 'except:' clauses. Catch specific exceptions instead",
          severity: 'medium',
          category: 'error-handling',
        });
      }
    });
    
    return issues.length > 0 ? { issues } : null;
  }

  detectMutableDefaults(code, lines) {
    const issues = [];
    const mutableDefaultRegex = /def\s+\w+\s*\([^)]*=[]|def\s+\w+\s*\([^)]*={}[^)]*\)/;
    
    lines.forEach((line, index) => {
      if (mutableDefaultRegex.test(line)) {
        issues.push({
          type: 'issue',
          line: index + 1,
          message: 'Mutable default argument detected. Use None as default and initialize inside function',
          severity: 'medium',
          category: 'bug-risk',
        });
      }
    });
    
    return issues.length > 0 ? { issues } : null;
  }

  // ==========================================
  // JAVA RULES
  // ==========================================

  detectSystemOutPrint(code, lines) {
    const issues = [];
    const sysOutRegex = /System\.(out|err)\.(print|println)/;
    
    lines.forEach((line, index) => {
      if (sysOutRegex.test(line) && !line.trim().startsWith('//')) {
        issues.push({
          type: 'issue',
          line: index + 1,
          message: 'Use a logging framework instead of System.out.println',
          severity: 'low',
          category: 'best-practice',
        });
      }
    });
    
    return issues.length > 0 ? { issues } : null;
  }

  detectLongMethods(code, lines) {
    return this.detectLongFunctions(code, lines, 'java');
  }

  // ==========================================
  // C++ RULES
  // ==========================================

  detectCoutStatements(code, lines) {
    const issues = [];
    const coutRegex = /std::cout\s*<</;
    
    lines.forEach((line, index) => {
      if (coutRegex.test(line) && !line.trim().startsWith('//')) {
        issues.push({
          type: 'suggestion',
          line: index + 1,
          message: 'Debug output detected. Remove before production',
          severity: 'low',
          category: 'cleanup',
        });
      }
    });
    
    return issues.length > 0 ? { issues } : null;
  }

  detectUsingNamespaceStd(code, lines) {
    const issues = [];
    const usingRegex = /using\s+namespace\s+std\s*;/;
    
    lines.forEach((line, index) => {
      if (usingRegex.test(line)) {
        issues.push({
          type: 'suggestion',
          line: index + 1,
          message: "Avoid 'using namespace std' in headers. Use explicit std:: prefixes",
          severity: 'low',
          category: 'best-practice',
        });
      }
    });
    
    return issues.length > 0 ? { issues } : null;
  }
}

// Export singleton instance
const ruleEngine = new RuleEngine();
export default ruleEngine;
