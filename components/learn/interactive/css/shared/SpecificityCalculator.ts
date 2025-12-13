/**
 * CSS Specificity Calculator
 * Calculates specificity scores for CSS selectors according to CSS specification
 * Specificity is calculated as (inline, ids, classes, elements)
 */

export interface SpecificityScore {
  inline: number;
  ids: number;
  classes: number;
  elements: number;
  total: number;
}

/**
 * Calculate the specificity of a CSS selector
 * Returns a score with breakdown by selector type
 */
export function calculateSpecificity(selector: string): SpecificityScore {
  // Initialize counters
  let ids = 0;
  let classes = 0;
  let elements = 0;
  
  // Inline styles are not part of selectors, so inline is always 0 here
  const inline = 0;

  // Remove pseudo-elements (::before, ::after, etc.) - count as elements
  const pseudoElementPattern = /::(before|after|first-line|first-letter|selection|backdrop|placeholder|marker|[a-z-]+)/gi;
  let match;
  while ((match = pseudoElementPattern.exec(selector)) !== null) {
    elements++;
  }
  
  // Remove pseudo-elements from selector for further processing
  let cleanSelector = selector.replace(pseudoElementPattern, '');

  // Count IDs (#id)
  const idPattern = /#[a-zA-Z][\w-]*/g;
  const idMatches = cleanSelector.match(idPattern);
  if (idMatches) {
    ids = idMatches.length;
  }

  // Count classes (.class), attributes ([attr]), and pseudo-classes (:hover, :not, etc.)
  // Note: :not() doesn't add to specificity itself, but its argument does
  
  // Handle :not(), :is(), :where(), :has() - extract their contents
  const functionalPseudoPattern = /:(?:not|is|has|where)\(([^)]+)\)/g;
  const functionalMatches = [...cleanSelector.matchAll(functionalPseudoPattern)];
  
  for (const match of functionalMatches) {
    const innerSelector = match[1];
    // :where() has 0 specificity, skip it
    if (match[0].startsWith(':where')) {
      continue;
    }
    // Recursively calculate specificity for inner selector
    const innerSpec = calculateSpecificity(innerSelector);
    ids += innerSpec.ids;
    classes += innerSpec.classes;
    elements += innerSpec.elements;
  }
  
  // Remove functional pseudo-classes for further processing
  cleanSelector = cleanSelector.replace(functionalPseudoPattern, '');

  // Count classes
  const classPattern = /\.[a-zA-Z][\w-]*/g;
  const classMatches = cleanSelector.match(classPattern);
  if (classMatches) {
    classes += classMatches.length;
  }

  // Count attributes
  const attrPattern = /\[[^\]]+\]/g;
  const attrMatches = cleanSelector.match(attrPattern);
  if (attrMatches) {
    classes += attrMatches.length;
  }

  // Count pseudo-classes (excluding pseudo-elements already counted)
  // Pseudo-classes start with single colon
  const pseudoClassPattern = /:[a-zA-Z][\w-]*/g;
  const pseudoClassMatches = cleanSelector.match(pseudoClassPattern);
  if (pseudoClassMatches) {
    classes += pseudoClassMatches.length;
  }

  // Count elements (type selectors)
  // Remove all the parts we've already counted
  let elementSelector = cleanSelector
    .replace(idPattern, '')
    .replace(classPattern, '')
    .replace(attrPattern, '')
    .replace(pseudoClassPattern, '')
    .replace(/[>+~\s]/g, ' ') // Replace combinators with spaces
    .trim();

  // Split by spaces and count non-empty parts
  const elementParts = elementSelector.split(/\s+/).filter(part => {
    // Filter out empty strings and universal selector (*)
    return part && part !== '*' && part.length > 0;
  });
  
  elements += elementParts.length;

  // Calculate total (using weighted sum for comparison)
  // Inline: 1000, IDs: 100, Classes: 10, Elements: 1
  const total = inline * 1000 + ids * 100 + classes * 10 + elements;

  return {
    inline,
    ids,
    classes,
    elements,
    total,
  };
}

/**
 * Compare two specificity scores
 * Returns: 1 if a > b, -1 if a < b, 0 if equal
 */
export function compareSpecificity(a: SpecificityScore, b: SpecificityScore): number {
  // Compare inline first
  if (a.inline !== b.inline) return a.inline > b.inline ? 1 : -1;
  
  // Then IDs
  if (a.ids !== b.ids) return a.ids > b.ids ? 1 : -1;
  
  // Then classes
  if (a.classes !== b.classes) return a.classes > b.classes ? 1 : -1;
  
  // Finally elements
  if (a.elements !== b.elements) return a.elements > b.elements ? 1 : -1;
  
  // Equal specificity
  return 0;
}

/**
 * Format specificity score as a string (e.g., "0,1,2,3")
 */
export function formatSpecificity(score: SpecificityScore): string {
  return `${score.inline},${score.ids},${score.classes},${score.elements}`;
}

/**
 * Sort selectors by specificity (highest first)
 */
export function sortBySpecificity(selectors: string[]): Array<{ selector: string; specificity: SpecificityScore }> {
  return selectors
    .map(selector => ({
      selector,
      specificity: calculateSpecificity(selector),
    }))
    .sort((a, b) => compareSpecificity(b.specificity, a.specificity));
}

/**
 * Get a human-readable explanation of specificity
 */
export function explainSpecificity(selector: string): string {
  const spec = calculateSpecificity(selector);
  const parts: string[] = [];

  if (spec.inline > 0) {
    parts.push(`${spec.inline} inline style${spec.inline > 1 ? 's' : ''}`);
  }
  if (spec.ids > 0) {
    parts.push(`${spec.ids} ID${spec.ids > 1 ? 's' : ''}`);
  }
  if (spec.classes > 0) {
    parts.push(`${spec.classes} class${spec.classes > 1 ? 'es' : ''}/attribute${spec.classes > 1 ? 's' : ''}/pseudo-class${spec.classes > 1 ? 'es' : ''}`);
  }
  if (spec.elements > 0) {
    parts.push(`${spec.elements} element${spec.elements > 1 ? 's' : ''}/pseudo-element${spec.elements > 1 ? 's' : ''}`);
  }

  if (parts.length === 0) {
    return 'No specificity (universal selector or empty)';
  }

  return parts.join(', ');
}
