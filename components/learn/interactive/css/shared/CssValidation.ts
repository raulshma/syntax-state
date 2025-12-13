/**
 * CSS Validation Logic for Exercise Validation
 * Provides validation functions for CSS exercises with helpful error messages
 */

import { parseCss, extractSelectors, isValidPropertyName } from './CssParser';
import type { CssValidationResult } from '../types';

/**
 * Validation rule for CSS exercises
 */
export interface ValidationRule {
  type: 'property' | 'selector' | 'value' | 'custom';
  check: (css: string) => boolean;
  message: string;
}

/**
 * Create a validation function that checks if a specific CSS property exists
 */
export function requiresProperty(property: string, message?: string): ValidationRule {
  return {
    type: 'property',
    check: (css: string) => {
      const regex = new RegExp(`${property}\\s*:`, 'i');
      return regex.test(css);
    },
    message: message || `CSS must include the '${property}' property`,
  };
}

/**
 * Create a validation function that checks if a specific selector exists
 */
export function requiresSelector(selector: string, message?: string): ValidationRule {
  return {
    type: 'selector',
    check: (css: string) => {
      const selectors = extractSelectors(css);
      return selectors.some((s) => s.includes(selector));
    },
    message: message || `CSS must include the '${selector}' selector`,
  };
}

/**
 * Create a validation function that checks if a property has a specific value
 */
export function requiresPropertyValue(
  property: string,
  value: string | RegExp,
  message?: string
): ValidationRule {
  return {
    type: 'value',
    check: (css: string) => {
      const regex = new RegExp(`${property}\\s*:\\s*([^;]+)`, 'i');
      const match = css.match(regex);
      if (!match) return false;

      const actualValue = match[1].trim();
      if (typeof value === 'string') {
        return actualValue.toLowerCase() === value.toLowerCase();
      } else {
        return value.test(actualValue);
      }
    },
    message: message || `CSS property '${property}' must have value '${value}'`,
  };
}

/**
 * Create a custom validation function
 */
export function customValidation(
  check: (css: string) => boolean,
  message: string
): ValidationRule {
  return {
    type: 'custom',
    check,
    message,
  };
}

/**
 * Validate CSS against a set of rules
 */
export function validateCss(css: string, rules: ValidationRule[]): CssValidationResult {
  // First check for syntax errors
  const parseResult = parseCss(css);
  
  if (!parseResult.valid) {
    return {
      valid: false,
      message: 'CSS has syntax errors. Please fix them before continuing.',
      errors: parseResult.errors.map((e) => ({
        line: e.line,
        message: e.message,
      })),
    };
  }

  // Check each validation rule
  for (const rule of rules) {
    if (!rule.check(css)) {
      return {
        valid: false,
        message: rule.message,
        errors: [],
      };
    }
  }

  return {
    valid: true,
    message: 'Great job! Your CSS meets all the requirements.',
    errors: [],
  };
}

/**
 * Common validation presets for exercises
 */
export const ValidationPresets = {
  /**
   * Validate that CSS uses flexbox
   */
  flexbox: (message?: string): ValidationRule[] => [
    requiresProperty('display', message || 'Use display: flex to create a flex container'),
    customValidation(
      (css) => /display\s*:\s*flex/i.test(css),
      'The display property must be set to flex'
    ),
  ],

  /**
   * Validate that CSS uses grid
   */
  grid: (message?: string): ValidationRule[] => [
    requiresProperty('display', message || 'Use display: grid to create a grid container'),
    customValidation(
      (css) => /display\s*:\s*grid/i.test(css),
      'The display property must be set to grid'
    ),
  ],

  /**
   * Validate that CSS uses positioning
   */
  positioning: (position: 'relative' | 'absolute' | 'fixed' | 'sticky'): ValidationRule[] => [
    requiresProperty('position', `Use position: ${position} for this exercise`),
    requiresPropertyValue('position', position, `Position must be set to ${position}`),
  ],

  /**
   * Validate that CSS uses specific colors
   */
  color: (property: 'color' | 'background-color' | 'border-color'): ValidationRule[] => [
    requiresProperty(property, `Set the ${property} property`),
  ],

  /**
   * Validate that CSS uses box model properties
   */
  boxModel: (): ValidationRule[] => [
    customValidation(
      (css) => {
        const hasBoxModelProp =
          /padding/i.test(css) || /margin/i.test(css) || /border/i.test(css);
        return hasBoxModelProp;
      },
      'Use at least one box model property (padding, margin, or border)'
    ),
  ],

  /**
   * Validate that CSS uses transitions or animations
   */
  animation: (): ValidationRule[] => [
    customValidation(
      (css) => {
        return /transition/i.test(css) || /animation/i.test(css) || /@keyframes/i.test(css);
      },
      'Use transitions or animations in your CSS'
    ),
  ],

  /**
   * Validate that CSS uses transforms
   */
  transform: (): ValidationRule[] => [
    requiresProperty('transform', 'Use the transform property'),
  ],

  /**
   * Validate that CSS uses media queries
   */
  responsive: (): ValidationRule[] => [
    customValidation(
      (css) => /@media/i.test(css),
      'Use at least one media query for responsive design'
    ),
  ],
};

/**
 * Helper to create a validation function from rules
 */
export function createValidator(rules: ValidationRule[]) {
  return (css: string): CssValidationResult => validateCss(css, rules);
}

/**
 * Validate CSS for common mistakes and provide helpful suggestions
 */
export function analyzeCommonMistakes(css: string): string[] {
  const suggestions: string[] = [];

  // Check for missing units (number followed by semicolon or closing brace without unit)
  if (/:\s*\d+\s*[;}]/i.test(css)) {
    suggestions.push('💡 Remember to include units (px, em, rem, %, etc.) for numeric values');
  }

  // Check for color format consistency
  const hasHex = /#[0-9a-f]{3,6}/i.test(css);
  const hasRgb = /rgb\(/i.test(css);
  const hasHsl = /hsl\(/i.test(css);
  const colorFormats = [hasHex, hasRgb, hasHsl].filter(Boolean).length;
  
  if (colorFormats > 1) {
    suggestions.push('💡 Consider using a consistent color format throughout your CSS');
  }

  // Check for vendor prefixes
  if (/-webkit-|-moz-|-ms-|-o-/i.test(css)) {
    suggestions.push('💡 Modern browsers often don\'t need vendor prefixes for common properties');
  }

  // Check for !important
  if (/!important/i.test(css)) {
    suggestions.push('⚠️ Try to avoid using !important - it can make CSS harder to maintain');
  }

  // Check for very specific selectors
  const selectors = extractSelectors(css);
  const hasVerySpecific = selectors.some((s) => (s.match(/\s/g) || []).length > 3);
  if (hasVerySpecific) {
    suggestions.push('💡 Consider simplifying your selectors - overly specific selectors can be hard to maintain');
  }

  return suggestions;
}
