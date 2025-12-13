import { describe, it, expect } from 'vitest';
import {
  checkCssSelectorMasterBadge,
  checkLayoutExpertBadge,
  checkAnimationWizardBadge,
  checkCssMasterBadge,
  TOTAL_CSS_LESSONS,
  CSS_LESSON_IDS,
} from './index';

describe('CSS Badge Awarding Logic', () => {
  describe('CSS Selector Master Badge', () => {
    it('should award badge when selectors lesson completed at all levels', () => {
      const completedLessons = [
        { lessonId: 'css/selectors', experienceLevel: 'beginner' },
        { lessonId: 'css/selectors', experienceLevel: 'intermediate' },
        { lessonId: 'css/selectors', experienceLevel: 'advanced' },
      ];
      
      const badge = checkCssSelectorMasterBadge(completedLessons);
      expect(badge).toBe('css-selector-master');
    });
    
    it('should not award badge when only some levels completed', () => {
      const completedLessons = [
        { lessonId: 'css/selectors', experienceLevel: 'beginner' },
        { lessonId: 'css/selectors', experienceLevel: 'intermediate' },
      ];
      
      const badge = checkCssSelectorMasterBadge(completedLessons);
      expect(badge).toBeNull();
    });
    
    it('should not award badge when no levels completed', () => {
      const completedLessons: Array<{ lessonId: string; experienceLevel: string }> = [];
      
      const badge = checkCssSelectorMasterBadge(completedLessons);
      expect(badge).toBeNull();
    });
  });
  
  describe('Layout Expert Badge', () => {
    it('should award badge when both flexbox and grid completed', () => {
      const completedLessons = [
        { lessonId: 'css/flexbox', experienceLevel: 'beginner' },
        { lessonId: 'css/grid', experienceLevel: 'intermediate' },
      ];
      
      const badge = checkLayoutExpertBadge(completedLessons);
      expect(badge).toBe('layout-expert');
    });
    
    it('should not award badge when only flexbox completed', () => {
      const completedLessons = [
        { lessonId: 'css/flexbox', experienceLevel: 'beginner' },
      ];
      
      const badge = checkLayoutExpertBadge(completedLessons);
      expect(badge).toBeNull();
    });
    
    it('should not award badge when only grid completed', () => {
      const completedLessons = [
        { lessonId: 'css/grid', experienceLevel: 'advanced' },
      ];
      
      const badge = checkLayoutExpertBadge(completedLessons);
      expect(badge).toBeNull();
    });
    
    it('should award badge regardless of experience level', () => {
      const completedLessons = [
        { lessonId: 'css/flexbox', experienceLevel: 'advanced' },
        { lessonId: 'css/grid', experienceLevel: 'beginner' },
      ];
      
      const badge = checkLayoutExpertBadge(completedLessons);
      expect(badge).toBe('layout-expert');
    });
  });
  
  describe('Animation Wizard Badge', () => {
    it('should award badge when both animations and transforms completed', () => {
      const completedLessons = [
        { lessonId: 'css/animations', experienceLevel: 'beginner' },
        { lessonId: 'css/transforms', experienceLevel: 'intermediate' },
      ];
      
      const badge = checkAnimationWizardBadge(completedLessons);
      expect(badge).toBe('animation-wizard');
    });
    
    it('should not award badge when only animations completed', () => {
      const completedLessons = [
        { lessonId: 'css/animations', experienceLevel: 'beginner' },
      ];
      
      const badge = checkAnimationWizardBadge(completedLessons);
      expect(badge).toBeNull();
    });
    
    it('should not award badge when only transforms completed', () => {
      const completedLessons = [
        { lessonId: 'css/transforms', experienceLevel: 'advanced' },
      ];
      
      const badge = checkAnimationWizardBadge(completedLessons);
      expect(badge).toBeNull();
    });
  });
  
  describe('CSS Master Badge', () => {
    it('should award badge when all CSS lessons completed', () => {
      const completedLessons = CSS_LESSON_IDS.map(lessonId => ({
        lessonId,
        experienceLevel: 'beginner',
      }));
      
      const badge = checkCssMasterBadge(completedLessons);
      expect(badge).toBe('css-master');
    });
    
    it('should award badge when all lessons completed at different levels', () => {
      const completedLessons = [
        { lessonId: 'css/selectors', experienceLevel: 'beginner' },
        { lessonId: 'css/box-model', experienceLevel: 'intermediate' },
        { lessonId: 'css/positioning', experienceLevel: 'advanced' },
        { lessonId: 'css/flexbox', experienceLevel: 'beginner' },
        { lessonId: 'css/grid', experienceLevel: 'intermediate' },
        { lessonId: 'css/typography', experienceLevel: 'advanced' },
        { lessonId: 'css/colors', experienceLevel: 'beginner' },
        { lessonId: 'css/responsive-design', experienceLevel: 'intermediate' },
        { lessonId: 'css/animations', experienceLevel: 'advanced' },
        { lessonId: 'css/transforms', experienceLevel: 'beginner' },
      ];
      
      const badge = checkCssMasterBadge(completedLessons);
      expect(badge).toBe('css-master');
    });
    
    it('should not award badge when some lessons missing', () => {
      const completedLessons = [
        { lessonId: 'css/selectors', experienceLevel: 'beginner' },
        { lessonId: 'css/box-model', experienceLevel: 'intermediate' },
        { lessonId: 'css/positioning', experienceLevel: 'advanced' },
      ];
      
      const badge = checkCssMasterBadge(completedLessons);
      expect(badge).toBeNull();
    });
    
    it('should count each lesson only once even if completed at multiple levels', () => {
      const completedLessons = [
        ...CSS_LESSON_IDS.map(lessonId => ({
          lessonId,
          experienceLevel: 'beginner',
        })),
        // Add duplicate completions at other levels
        { lessonId: 'css/selectors', experienceLevel: 'intermediate' },
        { lessonId: 'css/selectors', experienceLevel: 'advanced' },
      ];
      
      const badge = checkCssMasterBadge(completedLessons);
      expect(badge).toBe('css-master');
    });
  });
  
  describe('CSS Lesson Constants', () => {
    it('should have correct total CSS lessons count', () => {
      expect(TOTAL_CSS_LESSONS).toBe(10);
    });
    
    it('should have all CSS lesson IDs defined', () => {
      expect(CSS_LESSON_IDS).toHaveLength(10);
      expect(CSS_LESSON_IDS).toContain('css/selectors');
      expect(CSS_LESSON_IDS).toContain('css/box-model');
      expect(CSS_LESSON_IDS).toContain('css/positioning');
      expect(CSS_LESSON_IDS).toContain('css/flexbox');
      expect(CSS_LESSON_IDS).toContain('css/grid');
      expect(CSS_LESSON_IDS).toContain('css/typography');
      expect(CSS_LESSON_IDS).toContain('css/colors');
      expect(CSS_LESSON_IDS).toContain('css/responsive-design');
      expect(CSS_LESSON_IDS).toContain('css/animations');
      expect(CSS_LESSON_IDS).toContain('css/transforms');
    });
  });
});
