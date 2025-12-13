/**
 * Unit tests for Build Tools badge functionality
 * Validates Requirements 6.4 - Build Master badge award
 */

import { describe, it, expect } from 'vitest';
import { 
  checkBuildToolsMilestoneBadge, 
  BUILD_TOOLS_LESSON_IDS,
  TOTAL_BUILD_TOOLS_LESSONS,
  BADGES 
} from './index';

describe('Build Tools Badge', () => {
  describe('BUILD_MASTER badge definition', () => {
    it('should have correct badge properties', () => {
      expect(BADGES.BUILD_MASTER).toBeDefined();
      expect(BADGES.BUILD_MASTER.id).toBe('build-master');
      expect(BADGES.BUILD_MASTER.name).toBe('Build Master');
      expect(BADGES.BUILD_MASTER.description).toBe('Complete all Build Tools lessons (Vite, esbuild, Webpack)');
      expect(BADGES.BUILD_MASTER.icon).toBe('🔧');
      expect(BADGES.BUILD_MASTER.category).toBe('mastery');
    });
  });

  describe('checkBuildToolsMilestoneBadge', () => {
    it('should return build-master when all three lessons are completed', () => {
      const completedLessons = [
        { lessonId: 'build-tools/vite', experienceLevel: 'beginner' },
        { lessonId: 'build-tools/esbuild', experienceLevel: 'beginner' },
        { lessonId: 'build-tools/webpack-basics', experienceLevel: 'beginner' },
      ];

      const badge = checkBuildToolsMilestoneBadge(completedLessons);
      expect(badge).toBe('build-master');
    });

    it('should return null when only one lesson is completed', () => {
      const completedLessons = [
        { lessonId: 'build-tools/vite', experienceLevel: 'beginner' },
      ];

      const badge = checkBuildToolsMilestoneBadge(completedLessons);
      expect(badge).toBeNull();
    });

    it('should return null when only two lessons are completed', () => {
      const completedLessons = [
        { lessonId: 'build-tools/vite', experienceLevel: 'beginner' },
        { lessonId: 'build-tools/esbuild', experienceLevel: 'intermediate' },
      ];

      const badge = checkBuildToolsMilestoneBadge(completedLessons);
      expect(badge).toBeNull();
    });

    it('should return null when no lessons are completed', () => {
      const completedLessons: Array<{ lessonId: string; experienceLevel: string }> = [];

      const badge = checkBuildToolsMilestoneBadge(completedLessons);
      expect(badge).toBeNull();
    });

    it('should return null when other lessons are completed', () => {
      const completedLessons = [
        { lessonId: 'css/selectors', experienceLevel: 'beginner' },
        { lessonId: 'css/selectors', experienceLevel: 'intermediate' },
        { lessonId: 'css/selectors', experienceLevel: 'advanced' },
      ];

      const badge = checkBuildToolsMilestoneBadge(completedLessons);
      expect(badge).toBeNull();
    });

    it('should work with mixed lessons including build-tools', () => {
      const completedLessons = [
        { lessonId: 'css/selectors', experienceLevel: 'beginner' },
        { lessonId: 'build-tools/vite', experienceLevel: 'advanced' },
        { lessonId: 'javascript/syntax', experienceLevel: 'intermediate' },
        { lessonId: 'build-tools/esbuild', experienceLevel: 'intermediate' },
        { lessonId: 'build-tools/webpack-basics', experienceLevel: 'beginner' },
      ];

      const badge = checkBuildToolsMilestoneBadge(completedLessons);
      expect(badge).toBe('build-master');
    });

    it('should handle duplicate completions of the same lesson', () => {
      const completedLessons = [
        { lessonId: 'build-tools/vite', experienceLevel: 'beginner' },
        { lessonId: 'build-tools/vite', experienceLevel: 'intermediate' },
        { lessonId: 'build-tools/esbuild', experienceLevel: 'beginner' },
        { lessonId: 'build-tools/webpack-basics', experienceLevel: 'advanced' },
      ];

      const badge = checkBuildToolsMilestoneBadge(completedLessons);
      expect(badge).toBe('build-master');
    });

    it('should award badge regardless of experience level', () => {
      const completedLessons = [
        { lessonId: 'build-tools/vite', experienceLevel: 'advanced' },
        { lessonId: 'build-tools/esbuild', experienceLevel: 'beginner' },
        { lessonId: 'build-tools/webpack-basics', experienceLevel: 'intermediate' },
      ];

      const badge = checkBuildToolsMilestoneBadge(completedLessons);
      expect(badge).toBe('build-master');
    });
  });

  describe('BUILD_TOOLS_LESSON_IDS constant', () => {
    it('should have correct lesson IDs', () => {
      expect(BUILD_TOOLS_LESSON_IDS).toEqual([
        'build-tools/vite',
        'build-tools/esbuild',
        'build-tools/webpack-basics',
      ]);
    });

    it('should have correct total count', () => {
      expect(TOTAL_BUILD_TOOLS_LESSONS).toBe(3);
      expect(BUILD_TOOLS_LESSON_IDS.length).toBe(TOTAL_BUILD_TOOLS_LESSONS);
    });
  });
});
