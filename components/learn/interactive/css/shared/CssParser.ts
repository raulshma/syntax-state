/**
 * CSS Parser Utility for validation and error detection
 * Provides basic CSS syntax validation and error reporting
 */

export interface CssParseError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface CssParseResult {
  valid: boolean;
  errors: CssParseError[];
  warnings: CssParseError[];
}

/**
 * Parse and validate CSS syntax
 */
export function parseCss(css: string): CssParseResult {
  const errors: CssParseError[] = [];
  const warnings: CssParseError[] = [];
  
  if (!css || css.trim() === '') {
    return { valid: true, errors: [], warnings: [] };
  }

  const lines = css.split('\n');
  let inRule = false;
  let braceCount = 0;
  let currentSelector = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Track braces
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '{') {
        braceCount++;
        inRule = true;
      } else if (line[j] === '}') {
        braceCount--;
        inRule = false;
        if (braceCount < 0) {
          errors.push({
            line: lineNum,
            column: j + 1,
            message: 'Unexpected closing brace',
            severity: 'error',
          });
        }
      }
    }

    // Check for common syntax errors
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('/*') || trimmedLine.startsWith('//')) {
      continue;
    }

    // Check for missing semicolons in property declarations
    if (inRule && trimmedLine.includes(':') && !trimmedLine.endsWith(';') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('}')) {
      warnings.push({
        line: lineNum,
        column: line.length,
        message: 'Missing semicolon at end of declaration',
        severity: 'warning',
      });
    }

    // Check for invalid property syntax (property without colon)
    if (inRule && !trimmedLine.includes(':') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('}') && trimmedLine.length > 0) {
      errors.push({
        line: lineNum,
        column: 1,
        message: 'Invalid property declaration: missing colon',
        severity: 'error',
      });
    }

    // Check for empty selectors
    if (trimmedLine.endsWith('{') && trimmedLine.length === 1) {
      errors.push({
        line: lineNum,
        column: 1,
        message: 'Empty selector before opening brace',
        severity: 'error',
      });
    }
  }

  // Check for unclosed braces
  if (braceCount > 0) {
    errors.push({
      line: lines.length,
      column: 1,
      message: `${braceCount} unclosed brace(s)`,
      severity: 'error',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate a CSS property name
 */
export function isValidPropertyName(property: string): boolean {
  // Basic validation - property names should be lowercase with hyphens
  const propertyPattern = /^-?[a-z]+(-[a-z]+)*$/;
  return propertyPattern.test(property.trim());
}

/**
 * Validate a CSS selector
 */
export function isValidSelector(selector: string): boolean {
  try {
    // Try to use the browser's CSS.supports if available
    if (typeof CSS !== 'undefined' && CSS.supports) {
      // Test if the selector is valid by checking a dummy property
      return CSS.supports('selector(' + selector + ')');
    }
    
    // Fallback: basic validation
    const trimmed = selector.trim();
    if (!trimmed) return false;
    
    // Check for obviously invalid characters at the start
    if (/^[0-9]/.test(trimmed)) return false;
    
    // Check for balanced brackets
    const openBrackets = (trimmed.match(/\[/g) || []).length;
    const closeBrackets = (trimmed.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) return false;
    
    const openParens = (trimmed.match(/\(/g) || []).length;
    const closeParens = (trimmed.match(/\)/g) || []).length;
    if (openParens !== closeParens) return false;
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract selectors from CSS text
 */
export function extractSelectors(css: string): string[] {
  const selectors: string[] = [];
  const lines = css.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Look for lines that end with { (selector lines)
    if (trimmed.endsWith('{')) {
      const selector = trimmed.slice(0, -1).trim();
      if (selector) {
        selectors.push(selector);
      }
    }
  }
  
  return selectors;
}

/**
 * Format CSS with basic indentation
 */
export function formatCss(css: string): string {
  let formatted = '';
  let indentLevel = 0;
  const indent = '  ';
  
  const lines = css.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Decrease indent for closing braces
    if (trimmed.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    formatted += indent.repeat(indentLevel) + trimmed + '\n';
    
    // Increase indent for opening braces
    if (trimmed.endsWith('{')) {
      indentLevel++;
    }
  }
  
  return formatted;
}
