/**
 * Integration tests for gamification actions with CSS lessons
 * Validates Requirements 4.1, 4.5 - Progress persistence to database
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { markSectionCompleteAction, getLessonProgressAction } from './gamification';
import type { ExperienceLevel } from '@/lib/db/schemas/lesson-progress';

// Mock the auth module
vi.mock('@/lib/auth/get-user', () => ({
  getAuthUserId: vi.fn(() => Promise.resolve('test-clerk-id')),
}));

// Mock the user repository
vi.mock('@/lib/db/repositories/user-repository', () => ({
  userRepository: {
    findByClerkId: vi.fn(() => Promise.resolve({
      _id: 'test-user-id',
      clerkId: 'test-clerk-id',
      email: 'test@example.com',
    })),
  },
}));

// Mock the gamification repository
vi.mock('@/lib/db/repositories/gamification-repository', () => ({
  markSectionComplete: vi.fn(),
  getLessonProgress: vi.fn(),
  completeLesson: vi.fn(),
  resetLesson: vi.fn(),
  findByUserId: vi.fn(),
  recordQuizAnswer: vi.fn(),
}));

describe('Gamification Actions - CSS Lessons Progress Tracking', () => {
  let mockMarkSectionComplete: ReturnType<typeof vi.fn>;
  let mockGetLessonProgress: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Get the mocked functions
    const repo = await import('@/lib/db/repositories/gamification-repository');
    mockMarkSectionComplete = vi.mocked(repo.markSectionComplete);
    mockGetLessonProgress = vi.mocked(repo.getLessonProgress);
  });

  describe('Requirements 4.1: Section Completion Persistence', () => {
    it('should persist section completion to database', async () => {
      const lessonId = 'css/selectors';
      const sectionId = 'introduction';
      const level: ExperienceLevel = 'beginner';
      const timestamp = new Date();

      mockMarkSectionComplete.mockResolvedValue({
        success: true,
        timestamp,
      });

      const result = await markSectionCompleteAction(lessonId, sectionId, level);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        timestamp,
        sectionId,
      });

      expect(mockMarkSectionComplete).toHaveBeenCalledWith(
        'test-user-id',
        lessonId,
        sectionId,
        level
      );
    });

    it('should retry on failure with exponential backoff', async () => {
      const lessonId = 'css/box-model';
      const sectionId = 'basic-concepts';
      const level: ExperienceLevel = 'intermediate';

      // Fail twice, then succeed
      mockMarkSectionComplete
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          success: true,
          timestamp: new Date(),
        });

      const result = await markSectionCompleteAction(lessonId, sectionId, level, 3);

      expect(result.success).toBe(true);
      expect(mockMarkSectionComplete).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const lessonId = 'css/flexbox';
      const sectionId = 'flex-properties';
      const level: ExperienceLevel = 'advanced';

      mockMarkSectionComplete.mockRejectedValue(new Error('Persistent error'));

      const result = await markSectionCompleteAction(lessonId, sectionId, level, 3);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockMarkSectionComplete).toHaveBeenCalledTimes(3);
    });

    it('should handle auth errors gracefully', async () => {
      // Mock user repository to return null (user not found)
      const { userRepository } = await import('@/lib/db/repositories/user-repository');
      vi.mocked(userRepository.findByClerkId).mockResolvedValueOnce(null);

      const result = await markSectionCompleteAction('css/grid', 'grid-basics', 'beginner');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('AUTH_ERROR');
    });
  });

  describe('Requirements 4.5: Progress Restoration', () => {
    it('should retrieve saved progress for a lesson', async () => {
      const lessonId = 'css/selectors';
      const level: ExperienceLevel = 'beginner';
      const mockProgress = {
        sectionsCompleted: [
          { sectionId: 'introduction', completedAt: new Date() },
          { sectionId: 'basic-selectors', completedAt: new Date() },
          { sectionId: 'combinators', completedAt: new Date() },
        ],
        quizAnswers: [
          { questionId: 'q1', isCorrect: true },
          { questionId: 'q2', isCorrect: false },
        ],
        isCompleted: false,
      };

      mockGetLessonProgress.mockResolvedValue(mockProgress);

      const result = await getLessonProgressAction(lessonId, level);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        sectionsCompleted: ['introduction', 'basic-selectors', 'combinators'],
        quizAnswers: mockProgress.quizAnswers,
        isCompleted: false,
      });

      expect(mockGetLessonProgress).toHaveBeenCalledWith(
        'test-user-id',
        lessonId,
        level
      );
    });

    it('should return null for lessons with no progress', async () => {
      mockGetLessonProgress.mockResolvedValue(null);

      const result = await getLessonProgressAction('css/animations', 'beginner');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle database errors when retrieving progress', async () => {
      mockGetLessonProgress.mockRejectedValue(new Error('Database error'));

      const result = await getLessonProgressAction('css/transforms', 'intermediate');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DATABASE_ERROR');
    });
  });

  describe('CSS Lessons Specific Scenarios', () => {
    it('should track progress for all CSS lesson topics', async () => {
      const cssLessons = [
        'css/selectors',
        'css/box-model',
        'css/positioning',
        'css/flexbox',
        'css/grid',
        'css/typography',
        'css/colors',
        'css/responsive-design',
        'css/animations',
        'css/transforms',
      ];

      for (const lessonId of cssLessons) {
        mockMarkSectionComplete.mockResolvedValue({
          success: true,
          timestamp: new Date(),
        });

        const result = await markSectionCompleteAction(
          lessonId,
          'test-section',
          'beginner'
        );

        expect(result.success).toBe(true);
      }

      expect(mockMarkSectionComplete).toHaveBeenCalledTimes(cssLessons.length);
    });

    it('should track progress separately for each experience level', async () => {
      const lessonId = 'css/selectors';
      const sectionId = 'introduction';
      const levels: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];

      for (const level of levels) {
        mockMarkSectionComplete.mockResolvedValue({
          success: true,
          timestamp: new Date(),
        });

        const result = await markSectionCompleteAction(lessonId, sectionId, level);

        expect(result.success).toBe(true);
        expect(mockMarkSectionComplete).toHaveBeenCalledWith(
          'test-user-id',
          lessonId,
          sectionId,
          level
        );
      }

      expect(mockMarkSectionComplete).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple sections in a single lesson', async () => {
      const lessonId = 'css/selectors';
      const level: ExperienceLevel = 'beginner';
      const sections = [
        'introduction',
        'basic-selectors',
        'combinators',
        'pseudo-classes',
        'attribute-selectors',
        'specificity',
        'summary',
      ];

      for (const sectionId of sections) {
        mockMarkSectionComplete.mockResolvedValue({
          success: true,
          timestamp: new Date(),
        });

        const result = await markSectionCompleteAction(lessonId, sectionId, level);
        expect(result.success).toBe(true);
      }

      expect(mockMarkSectionComplete).toHaveBeenCalledTimes(sections.length);
    });

    it('should preserve progress when switching between levels', async () => {
      const lessonId = 'css/flexbox';

      // Complete sections at beginner level
      mockGetLessonProgress.mockResolvedValueOnce({
        sectionsCompleted: [
          { sectionId: 'intro', completedAt: new Date() },
          { sectionId: 'basics', completedAt: new Date() },
        ],
        quizAnswers: [],
        isCompleted: false,
      });

      const beginnerProgress = await getLessonProgressAction(lessonId, 'beginner');
      expect(beginnerProgress.data?.sectionsCompleted).toHaveLength(2);

      // Switch to intermediate - should have different progress
      mockGetLessonProgress.mockResolvedValueOnce({
        sectionsCompleted: [
          { sectionId: 'intro', completedAt: new Date() },
        ],
        quizAnswers: [],
        isCompleted: false,
      });

      const intermediateProgress = await getLessonProgressAction(lessonId, 'intermediate');
      expect(intermediateProgress.data?.sectionsCompleted).toHaveLength(1);

      // Switch back to beginner - original progress should be preserved
      mockGetLessonProgress.mockResolvedValueOnce({
        sectionsCompleted: [
          { sectionId: 'intro', completedAt: new Date() },
          { sectionId: 'basics', completedAt: new Date() },
        ],
        quizAnswers: [],
        isCompleted: false,
      });

      const beginnerProgressAgain = await getLessonProgressAction(lessonId, 'beginner');
      expect(beginnerProgressAgain.data?.sectionsCompleted).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle duplicate section completion attempts', async () => {
      const lessonId = 'css/colors';
      const sectionId = 'color-models';
      const level: ExperienceLevel = 'beginner';

      mockMarkSectionComplete.mockResolvedValue({
        success: true,
        timestamp: new Date(),
      });

      // Complete the same section twice
      const result1 = await markSectionCompleteAction(lessonId, sectionId, level);
      const result2 = await markSectionCompleteAction(lessonId, sectionId, level);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(mockMarkSectionComplete).toHaveBeenCalledTimes(2);
    });

    it('should handle very long section IDs', async () => {
      const longSectionId = 'a'.repeat(200);
      mockMarkSectionComplete.mockResolvedValue({
        success: true,
        timestamp: new Date(),
      });

      const result = await markSectionCompleteAction(
        'css/test',
        longSectionId,
        'beginner'
      );

      expect(result.success).toBe(true);
    });

    it('should handle special characters in section IDs', async () => {
      const specialSectionId = 'section-with-special-chars_123!@#';
      mockMarkSectionComplete.mockResolvedValue({
        success: true,
        timestamp: new Date(),
      });

      const result = await markSectionCompleteAction(
        'css/test',
        specialSectionId,
        'beginner'
      );

      expect(result.success).toBe(true);
    });
  });
});
