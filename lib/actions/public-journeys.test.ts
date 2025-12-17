/**
 * Unit tests for public journey actions
 * 
 * Tests public journey retrieval without authentication
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { PublicJourney } from '@/lib/db/schemas/visibility';

// Mock the visibility service
vi.mock('@/lib/services/visibility-service', () => ({
  getPublicJourneys: vi.fn(),
  getPublicJourneyBySlug: vi.fn(),
}));

// Import after mocking
import {
  getPublicJourneys as getPublicJourneysService,
  getPublicJourneyBySlug as getPublicJourneyBySlugService,
} from '@/lib/services/visibility-service';
import {
  getPublicJourneys,
  getPublicJourneyBySlug,
} from './public-journeys';

// Helper to create a mock public journey
function createMockPublicJourney(
  slug: string,
  options?: {
    nodes?: PublicJourney['nodes'];
    edges?: PublicJourney['edges'];
  }
): PublicJourney {
  return {
    slug,
    title: `journey ${slug}`,
    description: `Description for ${slug}`,
    category: 'frontend',
    difficulty: 5,
    estimatedHours: 10,
    nodes: options?.nodes ?? [],
    edges: options?.edges ?? [],
  };
}

describe('Public journey Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  /**
   * Tests for getPublicjourneys
   * Requirements: 4.1 - Return only journeys marked as publicly visible
   */
  describe('getPublicJourneys', () => {
    it('should return only public journeys', async () => {
      const mockGetPublicJourneys = vi.mocked(getPublicJourneysService);
      
      const publicJourneys = [
        createMockPublicJourney('frontend-basics'),
        createMockPublicJourney('react-fundamentals'),
      ];
      mockGetPublicJourneys.mockResolvedValue(publicJourneys);

      const result = await getPublicJourneys();

      expect(result).toHaveLength(2);
      expect(result[0].slug).toBe('frontend-basics');
      expect(result[1].slug).toBe('react-fundamentals');
      expect(mockGetPublicJourneys).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no public journeys exist', async () => {
      const mockGetPublicJourneys = vi.mocked(getPublicJourneysService);
      mockGetPublicJourneys.mockResolvedValue([]);

      const result = await getPublicJourneys();

      expect(result).toEqual([]);
      expect(mockGetPublicJourneys).toHaveBeenCalledTimes(1);
    });

    it('should return empty array on service error', async () => {
      const mockGetPublicJourneys = vi.mocked(getPublicJourneysService);
      mockGetPublicJourneys.mockRejectedValue(new Error('Database error'));

      const result = await getPublicJourneys();

      // Should return empty array, not throw
      expect(result).toEqual([]);
    });

    it('should not require authentication', async () => {
      const mockGetPublicJourneys = vi.mocked(getPublicJourneysService);
      mockGetPublicJourneys.mockResolvedValue([createMockPublicJourney('test')]);

      // No auth mocking needed - this should work without authentication
      const result = await getPublicJourneys();

      expect(result).toHaveLength(1);
    });
  });

  /**
   * Tests for getPublicJourneyBySlug
   * Requirements: 4.2, 4.3, 4.4
   */
  describe('getPublicJourneyBySlug', () => {
    it('should return public journey by slug', async () => {
      const mockGetPublicJourneyBySlug = vi.mocked(getPublicJourneyBySlugService);
      
      const publicJourney = createMockPublicJourney('frontend-basics');
      mockGetPublicJourneyBySlug.mockResolvedValue(publicJourney);

      const result = await getPublicJourneyBySlug('frontend-basics');

      expect(result).not.toBeNull();
      expect(result?.slug).toBe('frontend-basics');
      expect(mockGetPublicJourneyBySlug).toHaveBeenCalledWith('frontend-basics');
    });

    /**
     * Requirement 4.3: Return null for private journeys without revealing existence
     */
    it('should return null for private journeys (not error)', async () => {
      const mockGetPublicJourneyBySlug = vi.mocked(getPublicJourneyBySlugService);
      mockGetPublicJourneyBySlug.mockResolvedValue(null);

      const result = await getPublicJourneyBySlug('private-journey');

      // Should return null, not throw an error
      expect(result).toBeNull();
    });

    it('should return null for non-existent journeys', async () => {
      const mockGetPublicJourneyBySlug = vi.mocked(getPublicJourneyBySlugService);
      mockGetPublicJourneyBySlug.mockResolvedValue(null);

      const result = await getPublicJourneyBySlug('non-existent');

      expect(result).toBeNull();
    });

    it('should return null on service error', async () => {
      const mockGetPublicJourneyBySlug = vi.mocked(getPublicJourneyBySlugService);
      mockGetPublicJourneyBySlug.mockRejectedValue(new Error('Database error'));

      const result = await getPublicJourneyBySlug('test-journey');

      // Should return null, not throw
      expect(result).toBeNull();
    });

    it('should return null for empty slug', async () => {
      const result = await getPublicJourneyBySlug('');

      expect(result).toBeNull();
    });

    it('should return null for invalid slug type', async () => {
      // @ts-expect-error - Testing invalid input
      const result = await getPublicJourneyBySlug(null);

      expect(result).toBeNull();
    });

    /**
     * Requirement 4.4: Filter out milestones and objectives that are not publicly visible
     */
    it('should return journey with filtered public content', async () => {
      const mockGetPublicJourneyBySlug = vi.mocked(getPublicJourneyBySlugService);
      
      // Service returns already-filtered content
      const filteredJourney = createMockPublicJourney('frontend-basics', {
        nodes: [
          {
            id: 'public-milestone-1',
            title: 'Public Milestone',
            type: 'milestone',
            position: { x: 0, y: 0 },
            learningObjectives: [
              { title: 'Public Objective', lessonId: 'intro-lesson' },
            ],
            estimatedMinutes: 30,
          },
        ],
        edges: [],
      });
      mockGetPublicJourneyBySlug.mockResolvedValue(filteredJourney);

      const result = await getPublicJourneyBySlug('frontend-basics');

      expect(result).not.toBeNull();
      expect(result?.nodes).toHaveLength(1);
      expect(result?.nodes[0].id).toBe('public-milestone-1');
      expect(result?.nodes[0].learningObjectives).toHaveLength(1);
    });

    it('should not require authentication', async () => {
      const mockGetPublicJourneyBySlug = vi.mocked(getPublicJourneyBySlugService);
      mockGetPublicJourneyBySlug.mockResolvedValue(createMockPublicJourney('test'));

      // No auth mocking needed - this should work without authentication
      const result = await getPublicJourneyBySlug('test');

      expect(result).not.toBeNull();
    });
  });
});
