import { describe, it, expect } from 'vitest';
import {
  requiresProperty,
  requiresSelector,
  requiresPropertyValue,
  customValidation,
  validateCss,
  ValidationPresets,
  createValidator,
  analyzeCommonMistakes,
} from './CssValidation';

describe('CssValidation', () => {
  describe('requiresProperty', () => {
    it('validates that a property exists', () => {
      const rule = requiresProperty('color');
      expect(rule.check('.test { color: red; }')).toBe(true);
      expect(rule.check('.test { background: blue; }')).toBe(false);
    });

    it('is case insensitive', () => {
      const rule = requiresProperty('color');
      expect(rule.check('.test { COLOR: red; }')).toBe(true);
      expect(rule.check('.test { Color: red; }')).toBe(true);
    });
  });

  describe('requiresSelector', () => {
    it('validates that a selector exists', () => {
      const rule = requiresSelector('.test');
      // extractSelectors looks for lines ending with {
      expect(rule.check('.test {\n  color: red;\n}')).toBe(true);
      expect(rule.check('.other {\n  color: red;\n}')).toBe(false);
    });

    it('matches partial selectors', () => {
      const rule = requiresSelector('test');
      // extractSelectors looks for lines ending with {
      expect(rule.check('.test {\n  color: red;\n}')).toBe(true);
      expect(rule.check('#test {\n  color: red;\n}')).toBe(true);
    });
  });

  describe('requiresPropertyValue', () => {
    it('validates property value with string', () => {
      const rule = requiresPropertyValue('color', 'red');
      expect(rule.check('.test { color: red; }')).toBe(true);
      expect(rule.check('.test { color: blue; }')).toBe(false);
    });

    it('validates property value with regex', () => {
      const rule = requiresPropertyValue('color', /^#[0-9a-f]{6}$/i);
      expect(rule.check('.test { color: #ff0000; }')).toBe(true);
      expect(rule.check('.test { color: red; }')).toBe(false);
    });

    it('is case insensitive for string values', () => {
      const rule = requiresPropertyValue('color', 'red');
      expect(rule.check('.test { color: RED; }')).toBe(true);
      expect(rule.check('.test { color: Red; }')).toBe(true);
    });
  });

  describe('customValidation', () => {
    it('validates with custom function', () => {
      const rule = customValidation(
        (css) => css.includes('important'),
        'Must use !important'
      );
      expect(rule.check('.test { color: red !important; }')).toBe(true);
      expect(rule.check('.test { color: red; }')).toBe(false);
    });
  });

  describe('validateCss', () => {
    it('returns valid for CSS that passes all rules', () => {
      const rules = [
        requiresProperty('color'),
        requiresProperty('background'),
      ];
      const result = validateCss('.test { color: red; background: blue; }', rules);
      expect(result.valid).toBe(true);
    });

    it('returns invalid for CSS with syntax errors', () => {
      const rules = [requiresProperty('color')];
      const result = validateCss('.test { color: red', rules); // Missing closing brace
      expect(result.valid).toBe(false);
      expect(result.message).toContain('syntax errors');
    });

    it('returns invalid for CSS that fails a rule', () => {
      const rules = [requiresProperty('color')];
      const result = validateCss('.test { background: blue; }', rules);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('color');
    });

    it('returns success message when all rules pass', () => {
      const rules = [requiresProperty('color')];
      const result = validateCss('.test { color: red; }', rules);
      expect(result.valid).toBe(true);
      expect(result.message).toContain('Great job');
    });
  });

  describe('ValidationPresets', () => {
    it('flexbox preset validates display: flex', () => {
      const rules = ValidationPresets.flexbox();
      const result = validateCss('.container { display: flex; }', rules);
      expect(result.valid).toBe(true);
    });

    it('flexbox preset rejects non-flex display', () => {
      const rules = ValidationPresets.flexbox();
      const result = validateCss('.container { display: block; }', rules);
      expect(result.valid).toBe(false);
    });

    it('grid preset validates display: grid', () => {
      const rules = ValidationPresets.grid();
      const result = validateCss('.container { display: grid; }', rules);
      expect(result.valid).toBe(true);
    });

    it('positioning preset validates position value', () => {
      const rules = ValidationPresets.positioning('absolute');
      const result = validateCss('.element { position: absolute; }', rules);
      expect(result.valid).toBe(true);
    });

    it('color preset validates color property', () => {
      const rules = ValidationPresets.color('color');
      const result = validateCss('.text { color: red; }', rules);
      expect(result.valid).toBe(true);
    });

    it('boxModel preset validates box model properties', () => {
      const rules = ValidationPresets.boxModel();
      expect(validateCss('.box { padding: 10px; }', rules).valid).toBe(true);
      expect(validateCss('.box { margin: 10px; }', rules).valid).toBe(true);
      expect(validateCss('.box { border: 1px solid; }', rules).valid).toBe(true);
      expect(validateCss('.box { color: red; }', rules).valid).toBe(false);
    });

    it('animation preset validates animation properties', () => {
      const rules = ValidationPresets.animation();
      expect(validateCss('.animated { transition: all 0.3s; }', rules).valid).toBe(true);
      expect(validateCss('.animated { animation: slide 1s; }', rules).valid).toBe(true);
      expect(validateCss('@keyframes slide { }', rules).valid).toBe(true);
    });

    it('transform preset validates transform property', () => {
      const rules = ValidationPresets.transform();
      const result = validateCss('.element { transform: rotate(45deg); }', rules);
      expect(result.valid).toBe(true);
    });

    it('responsive preset validates media queries', () => {
      const rules = ValidationPresets.responsive();
      const result = validateCss('@media (max-width: 768px) { }', rules);
      expect(result.valid).toBe(true);
    });
  });

  describe('createValidator', () => {
    it('creates a reusable validator function', () => {
      const validator = createValidator([
        requiresProperty('color'),
        requiresProperty('background'),
      ]);

      expect(validator('.test { color: red; background: blue; }').valid).toBe(true);
      expect(validator('.test { color: red; }').valid).toBe(false);
    });
  });

  describe('analyzeCommonMistakes', () => {
    it('detects missing units', () => {
      // The regex looks for digits followed by semicolon or closing brace
      const suggestions = analyzeCommonMistakes('.test { width: 100; }');
      expect(suggestions.some((s) => s.includes('units'))).toBe(true);
    });

    it('detects inconsistent color formats', () => {
      const suggestions = analyzeCommonMistakes(
        '.test { color: #ff0000; background: rgb(0, 0, 255); }'
      );
      expect(suggestions.some((s) => s.includes('consistent color format'))).toBe(true);
    });

    it('detects vendor prefixes', () => {
      const suggestions = analyzeCommonMistakes('.test { -webkit-transform: rotate(45deg); }');
      expect(suggestions.some((s) => s.includes('vendor prefixes'))).toBe(true);
    });

    it('detects !important usage', () => {
      const suggestions = analyzeCommonMistakes('.test { color: red !important; }');
      expect(suggestions.some((s) => s.includes('!important'))).toBe(true);
    });

    it('detects overly specific selectors', () => {
      // extractSelectors needs lines ending with {
      const suggestions = analyzeCommonMistakes(
        'div .container .wrapper .content .text {\n  color: red;\n}'
      );
      expect(suggestions.some((s) => s.includes('simplifying your selectors'))).toBe(true);
    });

    it('returns empty array for clean CSS', () => {
      // Clean CSS with proper units and consistent colors
      const suggestions = analyzeCommonMistakes('.test {\n  color: #ff0000;\n  padding: 10px;\n  margin: 5px;\n}');
      expect(suggestions).toHaveLength(0);
    });
  });
});
