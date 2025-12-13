import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkNewBadges } from './index';

describe('CSS Badge Integration with checkNewBadges', () => {
  const baseStats = {
    completedLessons: 0,
    currentStreak: 0,
    totalXp: 0,
    level: 1,
    perfectQuizzes: 0,
    lessonsToday: 0,
    internetLessonsBeginnerCompleted: 0,
    internetLessonsIntermediateCompleted: 0,
    internetLessonsAdvancedCompleted: 0,
    totalInternetLessons: 6,
  };
  
  describe('CSS Selector Master Badge', () => {
    it('should award css-selector-master badge when condition is met', () => {
      const stats = {
        ...baseStats,
        cssSelectorAllLevelsCompleted: true,
      };
      
      const newBadges = checkNewBadges(stats, []);
      expect(newBadges).toContain('css-selector-master');
    });
    
    it('should not award badge if already earned', () => {
      const stats = {
        ...baseStats,
        cssSelectorAllLevelsCompleted: true,
      };
      
      const newBadges = checkNewBadges(stats, ['css-selector-master']);
      expect(newBadges).not.toContain('css-selector-master');
    });
  });
  
  describe('Layout Expert Badge', () => {
    it('should award layout-expert badge when condition is met', () => {
      const stats = {
        ...baseStats,
        cssFlexboxAndGridCompleted: true,
      };
      
      const newBadges = checkNewBadges(stats, []);
      expect(newBadges).toContain('layout-expert');
    });
    
    it('should not award badge if already earned', () => {
      const stats = {
        ...baseStats,
        cssFlexboxAndGridCompleted: true,
      };
      
      const newBadges = checkNewBadges(stats, ['layout-expert']);
      expect(newBadges).not.toContain('layout-expert');
    });
  });
  
  describe('Animation Wizard Badge', () => {
    it('should award animation-wizard badge when condition is met', () => {
      const stats = {
        ...baseStats,
        cssAnimationsAndTransformsCompleted: true,
      };
      
      const newBadges = checkNewBadges(stats, []);
      expect(newBadges).toContain('animation-wizard');
    });
    
    it('should not award badge if already earned', () => {
      const stats = {
        ...baseStats,
        cssAnimationsAndTransformsCompleted: true,
      };
      
      const newBadges = checkNewBadges(stats, ['animation-wizard']);
      expect(newBadges).not.toContain('animation-wizard');
    });
  });
  
  describe('CSS Master Badge', () => {
    it('should award css-master badge when all CSS lessons completed', () => {
      const stats = {
        ...baseStats,
        cssLessonsCompleted: 10,
        totalCssLessons: 10,
      };
      
      const newBadges = checkNewBadges(stats, []);
      expect(newBadges).toContain('css-master');
    });
    
    it('should not award badge if not all lessons completed', () => {
      const stats = {
        ...baseStats,
        cssLessonsCompleted: 8,
        totalCssLessons: 10,
      };
      
      const newBadges = checkNewBadges(stats, []);
      expect(newBadges).not.toContain('css-master');
    });
    
    it('should not award badge if already earned', () => {
      const stats = {
        ...baseStats,
        cssLessonsCompleted: 10,
        totalCssLessons: 10,
      };
      
      const newBadges = checkNewBadges(stats, ['css-master']);
      expect(newBadges).not.toContain('css-master');
    });
  });
  
  describe('Multiple CSS Badges', () => {
    it('should award multiple CSS badges at once', () => {
      const stats = {
        ...baseStats,
        cssLessonsCompleted: 10,
        totalCssLessons: 10,
        cssSelectorAllLevelsCompleted: true,
        cssFlexboxAndGridCompleted: true,
        cssAnimationsAndTransformsCompleted: true,
      };
      
      const newBadges = checkNewBadges(stats, []);
      expect(newBadges).toContain('css-master');
      expect(newBadges).toContain('css-selector-master');
      expect(newBadges).toContain('layout-expert');
      expect(newBadges).toContain('animation-wizard');
    });
    
    it('should award only new badges when some already earned', () => {
      const stats = {
        ...baseStats,
        cssLessonsCompleted: 10,
        totalCssLessons: 10,
        cssSelectorAllLevelsCompleted: true,
        cssFlexboxAndGridCompleted: true,
        cssAnimationsAndTransformsCompleted: true,
      };
      
      const newBadges = checkNewBadges(stats, ['layout-expert', 'animation-wizard']);
      expect(newBadges).toContain('css-master');
      expect(newBadges).toContain('css-selector-master');
      expect(newBadges).not.toContain('layout-expert');
      expect(newBadges).not.toContain('animation-wizard');
    });
  });
  
  describe('CSS Badges with Other Badges', () => {
    it('should award CSS badges alongside other milestone badges', () => {
      const stats = {
        ...baseStats,
        completedLessons: 1,
        level: 5,
        cssLessonsCompleted: 10,
        totalCssLessons: 10,
      };
      
      const newBadges = checkNewBadges(stats, []);
      expect(newBadges).toContain('first-steps');
      expect(newBadges).toContain('level-5');
      expect(newBadges).toContain('css-master');
    });
  });
});
