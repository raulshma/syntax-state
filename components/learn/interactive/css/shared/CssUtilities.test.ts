/**
 * Tests for CSS shared utilities
 */

import { describe, it, expect } from 'vitest';
import {
  parseCss,
  isValidPropertyName,
  isValidSelector,
  calculateSpecificity,
  compareSpecificity,
  formatSpecificity,
  rgbToHex,
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  isValidRgb,
  isValidHsl,
  isValidHex,
} from './index';

describe('CSS Parser Utility', () => {
  describe('parseCss', () => {
    it('should validate valid CSS', () => {
      const css = `
        .class {
          color: red;
          background: blue;
        }
      `;
      const result = parseCss(css);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect unclosed braces', () => {
      const css = `.class { color: red;`;
      const result = parseCss(css);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle empty CSS', () => {
      const result = parseCss('');
      expect(result.valid).toBe(true);
    });
  });

  describe('isValidPropertyName', () => {
    it('should validate correct property names', () => {
      expect(isValidPropertyName('color')).toBe(true);
      expect(isValidPropertyName('background-color')).toBe(true);
      expect(isValidPropertyName('font-size')).toBe(true);
    });

    it('should reject invalid property names', () => {
      expect(isValidPropertyName('Color')).toBe(false);
      expect(isValidPropertyName('123')).toBe(false);
      expect(isValidPropertyName('')).toBe(false);
    });
  });

  describe('isValidSelector', () => {
    it('should validate basic selectors', () => {
      expect(isValidSelector('.class')).toBe(true);
      expect(isValidSelector('#id')).toBe(true);
      expect(isValidSelector('div')).toBe(true);
    });

    it('should reject invalid selectors', () => {
      expect(isValidSelector('')).toBe(false);
      expect(isValidSelector('123')).toBe(false);
    });
  });
});

describe('Specificity Calculator', () => {
  describe('calculateSpecificity', () => {
    it('should calculate element selector specificity', () => {
      const spec = calculateSpecificity('div');
      expect(spec.elements).toBe(1);
      expect(spec.classes).toBe(0);
      expect(spec.ids).toBe(0);
    });

    it('should calculate class selector specificity', () => {
      const spec = calculateSpecificity('.class');
      expect(spec.classes).toBe(1);
      expect(spec.elements).toBe(0);
      expect(spec.ids).toBe(0);
    });

    it('should calculate ID selector specificity', () => {
      const spec = calculateSpecificity('#id');
      expect(spec.ids).toBe(1);
      expect(spec.classes).toBe(0);
      expect(spec.elements).toBe(0);
    });

    it('should calculate complex selector specificity', () => {
      const spec = calculateSpecificity('div.class#id');
      expect(spec.ids).toBe(1);
      expect(spec.classes).toBe(1);
      expect(spec.elements).toBe(1);
    });

    it('should handle pseudo-classes', () => {
      const spec = calculateSpecificity('a:hover');
      expect(spec.classes).toBe(1);
      expect(spec.elements).toBe(1);
    });
  });

  describe('compareSpecificity', () => {
    it('should compare specificity correctly', () => {
      const spec1 = calculateSpecificity('#id');
      const spec2 = calculateSpecificity('.class');
      expect(compareSpecificity(spec1, spec2)).toBe(1);
      expect(compareSpecificity(spec2, spec1)).toBe(-1);
    });

    it('should return 0 for equal specificity', () => {
      const spec1 = calculateSpecificity('.class1');
      const spec2 = calculateSpecificity('.class2');
      expect(compareSpecificity(spec1, spec2)).toBe(0);
    });
  });

  describe('formatSpecificity', () => {
    it('should format specificity as string', () => {
      const spec = calculateSpecificity('div.class#id');
      const formatted = formatSpecificity(spec);
      expect(formatted).toBe('0,1,1,1');
    });
  });
});

describe('Color Converter', () => {
  describe('rgbToHex', () => {
    it('should convert RGB to hex', () => {
      expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
      expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe('#00ff00');
      expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe('#0000ff');
    });

    it('should handle white and black', () => {
      expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
      expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
    });
  });

  describe('hexToRgb', () => {
    it('should convert hex to RGB', () => {
      const red = hexToRgb('#ff0000');
      expect(red).toEqual({ r: 255, g: 0, b: 0 });

      const green = hexToRgb('#00ff00');
      expect(green).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should handle 3-digit hex', () => {
      const white = hexToRgb('#fff');
      expect(white).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should return null for invalid hex', () => {
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('#gg0000')).toBeNull();
    });
  });

  describe('rgbToHsl and hslToRgb', () => {
    it('should convert RGB to HSL and back', () => {
      const rgb = { r: 255, g: 0, b: 0 };
      const hsl = rgbToHsl(rgb);
      const backToRgb = hslToRgb(hsl);
      
      expect(backToRgb.r).toBe(rgb.r);
      expect(backToRgb.g).toBe(rgb.g);
      expect(backToRgb.b).toBe(rgb.b);
    });

    it('should handle grayscale colors', () => {
      const gray = { r: 128, g: 128, b: 128 };
      const hsl = rgbToHsl(gray);
      expect(hsl.s).toBe(0); // No saturation for gray
    });
  });

  describe('validation functions', () => {
    it('should validate RGB values', () => {
      expect(isValidRgb({ r: 255, g: 0, b: 0 })).toBe(true);
      expect(isValidRgb({ r: 256, g: 0, b: 0 })).toBe(false);
      expect(isValidRgb({ r: -1, g: 0, b: 0 })).toBe(false);
    });

    it('should validate HSL values', () => {
      expect(isValidHsl({ h: 180, s: 50, l: 50 })).toBe(true);
      expect(isValidHsl({ h: 361, s: 50, l: 50 })).toBe(false);
      expect(isValidHsl({ h: 180, s: 101, l: 50 })).toBe(false);
    });

    it('should validate hex strings', () => {
      expect(isValidHex('#ff0000')).toBe(true);
      expect(isValidHex('#fff')).toBe(true);
      expect(isValidHex('ff0000')).toBe(true);
      expect(isValidHex('#gg0000')).toBe(false);
      expect(isValidHex('#ff00')).toBe(false);
    });
  });
});
