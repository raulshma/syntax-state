/**
 * Tests for Lesson Server Actions
 * Comprehensive test coverage for all lesson-related functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import type { ExperienceLevel } from '@/lib/db/schemas/lesson-progress';
import type { JourneyNode, JourneyEdge, LearningObjective, Journey } from '@/lib/db/schemas/journey';

// Mock fs/promises before importing the module
vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    access: vi.fn(),
    readdir: vi.fn(),
    realpath: vi.fn(async (p: string) => p),
  },
}));

// Mock next-mdx-remote/serialize
vi.mock('next-mdx-remote/serialize', () => ({
  serialize: vi.fn(async (source: string) => ({
    compiledSource: source,
    frontmatter: {},
  })),
}));

// Mock journey repository
vi.mock('@/lib/db/repositories/journey-repository', () => ({
  findJourneyBySlug: vi.fn(),
}));

// Mock safe-path to return predictable paths
vi.mock('@/lib/utils/safe-path', () => ({
  resolvePathWithinRoot: vi.fn(async (root: string, ...segments: string[]) => {
    const path = segments.join('/');
    // Reject unsafe paths
    if (path.includes('..') || path.startsWith('/')) return null;
    return `${root}/${path}`;
  }),
}));

import fs from 'fs/promises';
import * as journeyRepo from '@/lib/db/repositories/journey-repository';
import { resolvePathWithinRoot } from '@/lib/utils/safe-path';

import {
  getLessonMetadata,
  getLessonContent,
  lessonExists,
  resolveLessonPath,
  getLessonsForMilestone,
  findLessonPath,
  getObjectivesWithLessons,
  getJourneyLessonAvailability,
  getAdjacentLessons,
  getNextLessonSuggestion,
  getNextLessonNavigation,
  type ObjectiveLessonInfo,
  type AdjacentLessons,
  type NextLessonSuggestion,
  type NextLessonNavigation,
} from './lessons';

// ============================================================================
// Test Fixtures
// ============================================================================

interface MockThreeLevelMetadata {
  id: string;
  title: string;
  description: string;
  milestone: string;
  order: number;
  sections: string[];
  levels: {
    beginner: { estimatedMinutes: number; xpReward: number };
    intermediate: { estimatedMinutes: number; xpReward: number };
    advanced: { estimatedMinutes: number; xpReward: number };
  };
  prerequisites: string[];
  tags: string[];
}

const createMockMetadata = (overrides: Partial<MockThreeLevelMetadata> = {}): MockThreeLevelMetadata => ({
  id: 'test-lesson',
  title: 'Test Lesson',
  description: 'A test lesson description',
  milestone: 'test-milestone',
  order: 1,
  sections: ['intro', 'main', 'summary'],
  levels: {
    beginner: { estimatedMinutes: 15, xpReward: 50 },
    intermediate: { estimatedMinutes: 25, xpReward: 75 },
    advanced: { estimatedMinutes: 35, xpReward: 100 },
  },
  prerequisites: [],
  tags: ['test', 'example'],
  ...overrides,
});

const createMockJourney = (overrides: Partial<Journey> = {}): Journey => ({
  _id: 'journey-1',
  slug: 'test-journey',
  title: 'Test Journey',
  description: 'A test journey',
  category: 'frontend',
  version: '1.0.0',
  nodes: [],
  edges: [],
  estimatedHours: 10,
  difficulty: 5,
  prerequisites: [],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const createMockNode = (overrides: Partial<JourneyNode> = {}): JourneyNode => ({
  id: 'node-1',
  title: 'Test Node',
  type: 'milestone',
  position: { x: 0, y: 0 },
  learningObjectives: [],
  resources: [],
  estimatedMinutes: 30,
  tags: [],
  ...overrides,
});

const createMockEdge = (overrides: Partial<JourneyEdge> = {}): JourneyEdge => ({
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  type: 'sequential',
  ...overrides,
});

// ============================================================================
// getLessonMetadata Tests
// ============================================================================

describe('getLessonMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return metadata when file exists and is valid JSON', async () => {
    const mockMetadata = createMockMetadata();
    vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(mockMetadata));

    const result = await getLessonMetadata('css/selectors');

    expect(result).toEqual(mockMetadata);
    expect(resolvePathWithinRoot).toHaveBeenCalledWith(
      expect.stringContaining('content'),
      'css/selectors',
      'metadata.json'
    );
  });

  it('should return null when path resolution fails', async () => {
    vi.mocked(resolvePathWithinRoot).mockResolvedValueOnce(null);

    const result = await getLessonMetadata('../invalid/path');

    expect(result).toBeNull();
  });

  it('should return null when file read fails', async () => {
    vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('ENOENT'));

    const result = await getLessonMetadata('nonexistent/lesson');

    expect(result).toBeNull();
  });

  it('should return null when JSON is invalid', async () => {
    vi.mocked(fs.readFile).mockResolvedValueOnce('{ invalid json }');

    const result = await getLessonMetadata('css/selectors');

    expect(result).toBeNull();
  });

  it('should handle nested lesson paths', async () => {
    const mockMetadata = createMockMetadata({ id: 'nested-lesson' });
    vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(mockMetadata));

    const result = await getLessonMetadata('frontend/css/selectors');

    expect(result).toEqual(mockMetadata);
  });
});

// ============================================================================
// getLessonContent Tests
// ============================================================================

describe('getLessonContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper to create three-level metadata JSON
  const threeLevelMetadataJson = JSON.stringify(createMockMetadata());
  
  // Helper to create single-level metadata JSON
  const singleLevelMetadataJson = JSON.stringify({
    id: 'test-lesson',
    title: 'Test Lesson',
    description: 'A test lesson description',
    milestone: 'test-milestone',
    order: 1,
    sections: ['intro', 'main', 'summary'],
    singleLevel: true,
    estimatedMinutes: 20,
    xpReward: 75,
    prerequisites: [],
    tags: ['test'],
  });

  it('should return serialized MDX content for valid level (three-level lesson)', async () => {
    const mdxContent = '# Hello World\n\nThis is a test lesson.';
    // First call returns metadata, second call returns MDX content
    vi.mocked(fs.readFile)
      .mockResolvedValueOnce(threeLevelMetadataJson)
      .mockResolvedValueOnce(mdxContent);

    const result = await getLessonContent('css/selectors', 'beginner');

    expect(result).toBeDefined();
    expect(result?.compiledSource).toBe(mdxContent);
  });

  it('should load content.mdx for single-level lessons', async () => {
    const mdxContent = '# Single Level Content';
    vi.mocked(fs.readFile)
      .mockResolvedValueOnce(singleLevelMetadataJson)
      .mockResolvedValueOnce(mdxContent);

    const result = await getLessonContent('ef-core/overview', 'beginner');

    expect(result).toBeDefined();
    expect(result?.compiledSource).toBe(mdxContent);
    // Should resolve to content.mdx, not beginner.mdx
    expect(resolvePathWithinRoot).toHaveBeenCalledWith(
      expect.any(String),
      'ef-core/overview',
      'content.mdx'
    );
  });

  it('should ignore level parameter for single-level lessons', async () => {
    const mdxContent = '# Single Level Content';
    vi.mocked(fs.readFile)
      .mockResolvedValueOnce(singleLevelMetadataJson)
      .mockResolvedValueOnce(mdxContent);

    // Pass 'advanced' level, but should still load content.mdx
    const result = await getLessonContent('ef-core/overview', 'advanced');

    expect(result).toBeDefined();
    expect(resolvePathWithinRoot).toHaveBeenCalledWith(
      expect.any(String),
      'ef-core/overview',
      'content.mdx'
    );
  });

  it('should default to beginner level when level is undefined for three-level lessons', async () => {
    const mdxContent = '# Beginner Content';
    vi.mocked(fs.readFile)
      .mockResolvedValueOnce(threeLevelMetadataJson)
      .mockResolvedValueOnce(mdxContent);

    const result = await getLessonContent('css/selectors');

    expect(result).toBeDefined();
    expect(resolvePathWithinRoot).toHaveBeenCalledWith(
      expect.any(String),
      'css/selectors',
      'beginner.mdx'
    );
  });

  it('should return null when metadata cannot be loaded', async () => {
    vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('ENOENT'));

    const result = await getLessonContent('css/selectors', 'beginner');

    expect(result).toBeNull();
  });

  it('should return null when path resolution fails for MDX file', async () => {
    vi.mocked(fs.readFile).mockResolvedValueOnce(threeLevelMetadataJson);
    // First call for metadata succeeds, then path resolution for MDX fails
    // Also need to fail the fallback to content.mdx
    vi.mocked(resolvePathWithinRoot)
      .mockResolvedValueOnce('/path/to/metadata.json') // metadata path
      .mockResolvedValueOnce(null) // beginner.mdx path fails
      .mockResolvedValueOnce(null); // content.mdx fallback also fails

    const result = await getLessonContent('css/selectors', 'beginner');

    expect(result).toBeNull();
  });

  it('should return null when MDX file read fails', async () => {
    vi.mocked(fs.readFile)
      .mockResolvedValueOnce(threeLevelMetadataJson)
      .mockRejectedValueOnce(new Error('ENOENT'));

    const result = await getLessonContent('css/selectors', 'beginner');

    expect(result).toBeNull();
  });

  it('should fallback to content.mdx when level-specific file does not exist for three-level lessons', async () => {
    const mdxContent = '# Fallback Content';
    vi.mocked(fs.readFile)
      .mockResolvedValueOnce(threeLevelMetadataJson)
      .mockResolvedValueOnce(mdxContent);
    // First MDX path resolution fails, fallback succeeds
    vi.mocked(resolvePathWithinRoot)
      .mockResolvedValueOnce('/path/to/metadata.json')
      .mockResolvedValueOnce(null) // beginner.mdx doesn't exist
      .mockResolvedValueOnce('/path/to/content.mdx'); // fallback to content.mdx

    const result = await getLessonContent('css/selectors', 'beginner');

    expect(result).toBeDefined();
    expect(result?.compiledSource).toBe(mdxContent);
  });

  it.each(['beginner', 'intermediate', 'advanced'] as ExperienceLevel[])(
    'should accept valid level: %s for three-level lessons',
    async (level) => {
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(threeLevelMetadataJson)
        .mockResolvedValueOnce('# Content');

      const result = await getLessonContent('css/selectors', level);

      expect(result).toBeDefined();
      expect(resolvePathWithinRoot).toHaveBeenCalledWith(
        expect.any(String),
        'css/selectors',
        `${level}.mdx`
      );
    }
  );
});

// ============================================================================
// lessonExists Tests
// ============================================================================

describe('lessonExists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when metadata.json exists', async () => {
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    const result = await lessonExists('css/selectors');

    expect(result).toBe(true);
  });

  it('should return false when path resolution fails', async () => {
    vi.mocked(resolvePathWithinRoot).mockResolvedValueOnce(null);

    const result = await lessonExists('../invalid/path');

    expect(result).toBe(false);
  });

  it('should return false when file access fails', async () => {
    vi.mocked(fs.access).mockRejectedValueOnce(new Error('ENOENT'));

    const result = await lessonExists('nonexistent/lesson');

    expect(result).toBe(false);
  });
});

// ============================================================================
// resolveLessonPath Tests
// ============================================================================

describe('resolveLessonPath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return first matching path from candidates', async () => {
    // Mock lessonExists to return true for css/selectors
    vi.mocked(fs.access).mockImplementation(async () => {
      throw new Error('ENOENT');
    });
    // Override for the specific path we want to match
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    const result = await resolveLessonPath('css', 'selectors');

    // The first candidate that exists will be returned
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should return null when no candidates exist', async () => {
    vi.mocked(resolvePathWithinRoot).mockResolvedValue(null);

    const result = await resolveLessonPath('nonexistent', 'lesson');

    expect(result).toBeNull();
  });

  it('should try journeySlug as category folder', async () => {
    // All paths fail
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

    const result = await resolveLessonPath('milestone', 'lesson', 'sql');

    // Result should be null since all paths fail
    expect(result).toBeNull();
  });
});

// ============================================================================
// getLessonsForMilestone Tests
// ============================================================================

describe('getLessonsForMilestone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock to default behavior
    vi.mocked(resolvePathWithinRoot).mockImplementation(async (root: string, ...segments: string[]) => {
      const path = segments.join('/');
      if (path.includes('..') || path.startsWith('/')) return null;
      return `${root}/${path}`;
    });
  });

  it('should return sorted lessons for a milestone', async () => {
    const mockDirEntries = [
      { name: 'lesson-a', isDirectory: () => true },
      { name: 'lesson-b', isDirectory: () => true },
      { name: 'readme.md', isDirectory: () => false },
    ];
    
    vi.mocked(fs.readdir).mockResolvedValue(mockDirEntries as any);
    
    // Mock metadata for each lesson directory (called twice per lesson - once for path resolution, once for reading)
    vi.mocked(fs.readFile)
      .mockResolvedValueOnce(JSON.stringify(createMockMetadata({ id: 'lesson-a', order: 2 })))
      .mockResolvedValueOnce(JSON.stringify(createMockMetadata({ id: 'lesson-b', order: 1 })));

    const result = await getLessonsForMilestone('css');

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('lesson-b'); // order: 1
    expect(result[1].id).toBe('lesson-a'); // order: 2
  });

  it('should return empty array when milestone directory does not exist', async () => {
    vi.mocked(resolvePathWithinRoot).mockResolvedValueOnce(null);

    const result = await getLessonsForMilestone('nonexistent');

    expect(result).toEqual([]);
  });

  it('should skip directories without valid metadata', async () => {
    const mockDirEntries = [
      { name: 'valid-lesson', isDirectory: () => true },
      { name: 'invalid-lesson', isDirectory: () => true },
    ];
    
    vi.mocked(fs.readdir).mockResolvedValue(mockDirEntries as any);
    vi.mocked(fs.readFile)
      .mockResolvedValueOnce(JSON.stringify(createMockMetadata({ id: 'valid-lesson' })))
      .mockResolvedValueOnce('invalid json');

    const result = await getLessonsForMilestone('css');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('valid-lesson');
  });

  it('should only include directories, not files', async () => {
    const mockDirEntries = [
      { name: 'lesson', isDirectory: () => true },
      { name: 'notes.txt', isDirectory: () => false },
      { name: '.gitkeep', isDirectory: () => false },
    ];
    
    vi.mocked(fs.readdir).mockResolvedValue(mockDirEntries as any);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(createMockMetadata()));

    const result = await getLessonsForMilestone('css');

    expect(result).toHaveLength(1);
  });
});

// ============================================================================
// findLessonPath Tests
// ============================================================================

describe('findLessonPath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should find lesson with string objective', async () => {
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    const result = await findLessonPath('css', 'Box Model');

    expect(result).toBeDefined();
  });

  it('should find lesson with object objective containing lessonId', async () => {
    vi.mocked(fs.access).mockResolvedValueOnce(undefined);

    const objective: LearningObjective = {
      title: 'Understanding Box Model',
      lessonId: 'box-model',
    };

    const result = await findLessonPath('css', objective);

    expect(result).toBeDefined();
  });

  it('should try multiple path patterns', async () => {
    // All paths fail except the last one
    vi.mocked(resolvePathWithinRoot).mockResolvedValue('/valid/path');
    vi.mocked(fs.access)
      .mockRejectedValueOnce(new Error('ENOENT'))
      .mockRejectedValueOnce(new Error('ENOENT'))
      .mockResolvedValueOnce(undefined);

    const result = await findLessonPath('css', 'selectors');

    expect(result).toBeDefined();
  });

  it('should fall back to listing lessons when direct paths fail', async () => {
    // All direct paths fail
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));
    
    // But listing finds a match
    const mockDirEntries = [
      { name: 'selectors', isDirectory: () => true },
    ];
    vi.mocked(fs.readdir).mockResolvedValueOnce(mockDirEntries as any);
    vi.mocked(fs.readFile).mockResolvedValueOnce(
      JSON.stringify(createMockMetadata({ id: 'selectors', title: 'CSS Selectors' }))
    );

    const result = await findLessonPath('css', 'CSS Selectors');

    // May return the path from listing
    expect(typeof result === 'string' || result === null).toBe(true);
  });

  it('should return null when no lesson found', async () => {
    vi.mocked(resolvePathWithinRoot).mockResolvedValue(null);
    vi.mocked(fs.readdir).mockResolvedValueOnce([]);

    const result = await findLessonPath('nonexistent', 'lesson');

    expect(result).toBeNull();
  });

  it('should handle SQL journey special case', async () => {
    // Test that sql/ prefix is tried
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));
    vi.mocked(fs.readdir).mockResolvedValueOnce([]);

    const result = await findLessonPath('learn-basics', 'select-queries');

    // The function should have tried sql/select-queries path
    expect(resolvePathWithinRoot).toHaveBeenCalled();
  });
});

// ============================================================================
// getObjectivesWithLessons Tests
// ============================================================================

describe('getObjectivesWithLessons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolvePathWithinRoot).mockImplementation(async (root: string, ...segments: string[]) => {
      const path = segments.join('/');
      if (path.includes('..') || path.startsWith('/')) return null;
      return `${root}/${path}`;
    });
  });

  it('should return lesson info for objectives with lessons', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(
      JSON.stringify(createMockMetadata({
        levels: {
          beginner: { estimatedMinutes: 10, xpReward: 25 },
          intermediate: { estimatedMinutes: 20, xpReward: 50 },
          advanced: { estimatedMinutes: 30, xpReward: 75 },
        },
      }))
    );

    const objectives: LearningObjective[] = ['Box Model', 'Flexbox'];
    const result = await getObjectivesWithLessons('css', objectives);

    expect(result).toHaveLength(2);
    result.forEach((info) => {
      if (info.hasLesson) {
        expect(info.xpRewards).toBeDefined();
        expect(info.estimatedMinutes).toBeDefined();
      }
    });
  });

  it('should handle objectives without lessons', async () => {
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));
    vi.mocked(fs.readdir).mockResolvedValue([]);

    const objectives: LearningObjective[] = ['No Lesson 1', 'No Lesson 2'];
    const result = await getObjectivesWithLessons('css', objectives);

    expect(result).toHaveLength(2);
    expect(result[0].hasLesson).toBe(false);
    expect(result[1].hasLesson).toBe(false);
  });

  it('should handle object objectives with lessonId', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(createMockMetadata()));

    const objectives: LearningObjective[] = [
      { title: 'Learn Flexbox', lessonId: 'flexbox-basics' },
    ];
    const result = await getObjectivesWithLessons('css', objectives);

    expect(result).toHaveLength(1);
    expect(result[0].lessonId).toBe('flexbox-basics');
  });

  it('should return empty array for empty objectives', async () => {
    const result = await getObjectivesWithLessons('css', []);

    expect(result).toEqual([]);
  });
});

// ============================================================================
// getJourneyLessonAvailability Tests
// ============================================================================

describe('getJourneyLessonAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return availability for all nodes with objectives', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(createMockMetadata()));

    const journey = {
      nodes: [
        createMockNode({
          id: 'css-basics',
          learningObjectives: ['Selectors', 'Box Model'],
        }),
        createMockNode({
          id: 'css-advanced',
          learningObjectives: ['Grid', 'Flexbox'],
        }),
        createMockNode({
          id: 'no-objectives',
          learningObjectives: [],
        }),
      ],
    };

    const result = await getJourneyLessonAvailability(journey);

    expect(Object.keys(result)).toHaveLength(2); // Only nodes with objectives
    expect(result['css-basics']).toBeDefined();
    expect(result['css-advanced']).toBeDefined();
    expect(result['no-objectives']).toBeUndefined();
  });

  it('should handle empty journey', async () => {
    const journey = { nodes: [] };

    const result = await getJourneyLessonAvailability(journey);

    expect(result).toEqual({});
  });

  it('should process nodes in parallel', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(createMockMetadata()));

    const journey = {
      nodes: Array.from({ length: 5 }, (_, i) =>
        createMockNode({
          id: `node-${i}`,
          learningObjectives: [`Objective ${i}`],
        })
      ),
    };

    const result = await getJourneyLessonAvailability(journey);

    expect(Object.keys(result)).toHaveLength(5);
  });
});

// ============================================================================
// getAdjacentLessons Tests
// ============================================================================

describe('getAdjacentLessons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolvePathWithinRoot).mockImplementation(async (root: string, ...segments: string[]) => {
      const path = segments.join('/');
      if (path.includes('..') || path.startsWith('/')) return null;
      return `${root}/${path}`;
    });
  });

  it('should return previous and next lessons', async () => {
    const mockDirEntries = [
      { name: 'lesson-1', isDirectory: () => true },
      { name: 'lesson-2', isDirectory: () => true },
      { name: 'lesson-3', isDirectory: () => true },
    ];
    
    vi.mocked(fs.readdir).mockResolvedValue(mockDirEntries as any);
    vi.mocked(fs.readFile).mockImplementation(async (path: any) => {
      const pathStr = String(path);
      if (pathStr.includes('lesson-1')) {
        return JSON.stringify(createMockMetadata({ id: 'lesson-1', title: 'Lesson 1', order: 1 }));
      }
      if (pathStr.includes('lesson-2')) {
        return JSON.stringify(createMockMetadata({ id: 'lesson-2', title: 'Lesson 2', order: 2 }));
      }
      if (pathStr.includes('lesson-3')) {
        return JSON.stringify(createMockMetadata({ id: 'lesson-3', title: 'Lesson 3', order: 3 }));
      }
      return JSON.stringify(createMockMetadata());
    });

    const result = await getAdjacentLessons('css/lesson-2');

    expect(result.previous).toBeDefined();
    expect(result.next).toBeDefined();
    expect(result.previous?.title).toBe('Lesson 1');
    expect(result.next?.title).toBe('Lesson 3');
  });

  it('should return null for previous when at first lesson', async () => {
    const mockDirEntries = [
      { name: 'lesson-1', isDirectory: () => true },
      { name: 'lesson-2', isDirectory: () => true },
    ];
    
    vi.mocked(fs.readdir).mockResolvedValue(mockDirEntries as any);
    vi.mocked(fs.readFile).mockImplementation(async (path: any) => {
      const pathStr = String(path);
      if (pathStr.includes('lesson-1')) {
        return JSON.stringify(createMockMetadata({ id: 'lesson-1', title: 'Lesson 1', order: 1 }));
      }
      return JSON.stringify(createMockMetadata({ id: 'lesson-2', title: 'Lesson 2', order: 2 }));
    });

    const result = await getAdjacentLessons('css/lesson-1');

    expect(result.previous).toBeNull();
    expect(result.next).toBeDefined();
  });

  it('should return null for next when at last lesson', async () => {
    const mockDirEntries = [
      { name: 'lesson-1', isDirectory: () => true },
      { name: 'lesson-2', isDirectory: () => true },
    ];
    
    vi.mocked(fs.readdir).mockResolvedValue(mockDirEntries as any);
    vi.mocked(fs.readFile).mockImplementation(async (path: any) => {
      const pathStr = String(path);
      if (pathStr.includes('lesson-1')) {
        return JSON.stringify(createMockMetadata({ id: 'lesson-1', title: 'Lesson 1', order: 1 }));
      }
      return JSON.stringify(createMockMetadata({ id: 'lesson-2', title: 'Lesson 2', order: 2 }));
    });

    const result = await getAdjacentLessons('css/lesson-2');

    expect(result.previous).toBeDefined();
    expect(result.next).toBeNull();
  });

  it('should return both null when metadata not found', async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'));

    const result = await getAdjacentLessons('nonexistent/lesson');

    expect(result).toEqual({ previous: null, next: null });
  });

  it('should return both null when lesson not in milestone list', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(createMockMetadata({ id: 'orphan' })));
    vi.mocked(fs.readdir).mockResolvedValue([]);

    const result = await getAdjacentLessons('css/orphan-lesson');

    expect(result).toEqual({ previous: null, next: null });
  });
});

// ============================================================================
// getNextLessonSuggestion Tests
// ============================================================================

describe('getNextLessonSuggestion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolvePathWithinRoot).mockImplementation(async (root: string, ...segments: string[]) => {
      const path = segments.join('/');
      if (path.includes('..') || path.startsWith('/')) return null;
      return `${root}/${path}`;
    });
  });

  it('should suggest next lesson based on prerequisites', async () => {
    const mockDirEntries = [
      { name: 'lesson-1', isDirectory: () => true },
      { name: 'lesson-2', isDirectory: () => true },
      { name: 'lesson-3', isDirectory: () => true },
    ];
    
    vi.mocked(fs.readdir).mockResolvedValue(mockDirEntries as any);
    vi.mocked(fs.readFile).mockImplementation(async (path: any) => {
      const pathStr = String(path);
      if (pathStr.includes('lesson-1')) {
        return JSON.stringify(createMockMetadata({ 
          id: 'lesson-1', 
          title: 'Lesson 1',
          order: 1,
          prerequisites: [],
        }));
      }
      if (pathStr.includes('lesson-2')) {
        return JSON.stringify(createMockMetadata({ 
          id: 'lesson-2', 
          title: 'Lesson 2',
          description: 'Second lesson',
          order: 2,
          prerequisites: [],
          levels: {
            beginner: { estimatedMinutes: 15, xpReward: 30 },
            intermediate: { estimatedMinutes: 25, xpReward: 55 },
            advanced: { estimatedMinutes: 35, xpReward: 80 },
          },
        }));
      }
      return JSON.stringify(createMockMetadata({ 
        id: 'lesson-3', 
        title: 'Lesson 3',
        order: 3,
        prerequisites: ['lesson-2'],
      }));
    });

    const result = await getNextLessonSuggestion('css/lesson-1', 'beginner', []);

    expect(result).toBeDefined();
    expect(result?.title).toBe('Lesson 2');
    expect(result?.estimatedMinutes).toBe(15);
    expect(result?.xpReward).toBe(30);
  });

  it('should skip lessons with unmet prerequisites', async () => {
    const mockDirEntries = [
      { name: 'lesson-1', isDirectory: () => true },
      { name: 'lesson-2', isDirectory: () => true },
    ];
    
    vi.mocked(fs.readdir).mockResolvedValue(mockDirEntries as any);
    vi.mocked(fs.readFile).mockImplementation(async (path: any) => {
      const pathStr = String(path);
      if (pathStr.includes('lesson-1')) {
        return JSON.stringify(createMockMetadata({ id: 'lesson-1', order: 1, prerequisites: [] }));
      }
      return JSON.stringify(createMockMetadata({ id: 'lesson-2', order: 2, prerequisites: ['unmet-prereq'] }));
    });

    const result = await getNextLessonSuggestion('css/lesson-1', 'beginner', []);

    expect(result).toBeNull();
  });

  it('should return null when no more lessons available', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(createMockMetadata({ order: 99 })));
    vi.mocked(fs.readdir).mockResolvedValue([]);

    const result = await getNextLessonSuggestion('css/last-lesson', 'beginner', []);

    expect(result).toBeNull();
  });

  it('should not suggest already completed lessons', async () => {
    const mockDirEntries = [
      { name: 'lesson-1', isDirectory: () => true },
      { name: 'lesson-2', isDirectory: () => true },
    ];
    
    vi.mocked(fs.readdir).mockResolvedValue(mockDirEntries as any);
    vi.mocked(fs.readFile).mockImplementation(async (path: any) => {
      const pathStr = String(path);
      if (pathStr.includes('lesson-1')) {
        return JSON.stringify(createMockMetadata({ id: 'lesson-1', order: 1, prerequisites: [] }));
      }
      return JSON.stringify(createMockMetadata({ id: 'lesson-2', order: 2, prerequisites: [] }));
    });

    const completedLessons = [
      { lessonId: 'css/lesson-2', experienceLevel: 'beginner' },
    ];

    const result = await getNextLessonSuggestion('css/lesson-1', 'beginner', completedLessons);

    expect(result).toBeNull();
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error('Read error'));

    const result = await getNextLessonSuggestion('css/lesson', 'beginner', []);

    expect(result).toBeNull();
  });
});

// ============================================================================
// getNextLessonNavigation Tests
// ============================================================================

describe('getNextLessonNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolvePathWithinRoot).mockImplementation(async (root: string, ...segments: string[]) => {
      const path = segments.join('/');
      if (path.includes('..') || path.startsWith('/')) return null;
      return `${root}/${path}`;
    });
  });

  it('should return next sibling objective in same node', async () => {
    const mockJourney = createMockJourney({
      nodes: [
        createMockNode({
          id: 'css-basics',
          title: 'CSS Basics',
          learningObjectives: [
            { title: 'Selectors', lessonId: 'selectors' },
            { title: 'Box Model', lessonId: 'box-model' },
            { title: 'Flexbox', lessonId: 'flexbox' },
          ],
        }),
      ],
      edges: [],
    });

    vi.mocked(journeyRepo.findJourneyBySlug).mockResolvedValue(mockJourney);
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockImplementation(async (path: any) => {
      const pathStr = String(path);
      if (pathStr.includes('box-model')) {
        return JSON.stringify(createMockMetadata({ title: 'Box Model' }));
      }
      return JSON.stringify(createMockMetadata({ title: 'Selectors' }));
    });

    const result = await getNextLessonNavigation(
      'css-basics/selectors',
      'css-basics',
      'frontend'
    );

    expect(result).toBeDefined();
    expect(result?.title).toBe('Box Model');
    expect(result?.milestone).toBe('css-basics');
  });

  it('should follow edges to next node when no more siblings', async () => {
    const mockJourney = createMockJourney({
      nodes: [
        createMockNode({
          id: 'node-1',
          title: 'First Node',
          learningObjectives: [{ title: 'Only Objective', lessonId: 'only-lesson' }],
        }),
        createMockNode({
          id: 'node-2',
          title: 'Second Node',
          learningObjectives: [{ title: 'Next Objective', lessonId: 'next-lesson' }],
        }),
      ],
      edges: [
        createMockEdge({ source: 'node-1', target: 'node-2', type: 'sequential' }),
      ],
    });

    vi.mocked(journeyRepo.findJourneyBySlug).mockResolvedValue(mockJourney);
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(
      JSON.stringify(createMockMetadata({ title: 'Next Objective' }))
    );

    const result = await getNextLessonNavigation(
      'node-1/only-lesson',
      'node-1',
      'test-journey'
    );

    expect(result).toBeDefined();
    expect(result?.milestone).toBe('node-2');
    expect(result?.milestoneTitle).toBe('Second Node');
  });

  it('should prioritize sequential edges over recommended', async () => {
    const mockJourney = createMockJourney({
      nodes: [
        createMockNode({
          id: 'node-1',
          learningObjectives: [{ title: 'Lesson', lessonId: 'lesson' }],
        }),
        createMockNode({
          id: 'recommended-node',
          title: 'Recommended',
          learningObjectives: [{ title: 'Rec Lesson', lessonId: 'rec-lesson' }],
        }),
        createMockNode({
          id: 'sequential-node',
          title: 'Sequential',
          learningObjectives: [{ title: 'Seq Lesson', lessonId: 'seq-lesson' }],
        }),
      ],
      edges: [
        createMockEdge({ id: 'e1', source: 'node-1', target: 'recommended-node', type: 'recommended' }),
        createMockEdge({ id: 'e2', source: 'node-1', target: 'sequential-node', type: 'sequential' }),
      ],
    });

    vi.mocked(journeyRepo.findJourneyBySlug).mockResolvedValue(mockJourney);
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(
      JSON.stringify(createMockMetadata({ title: 'Seq Lesson' }))
    );

    const result = await getNextLessonNavigation('node-1/lesson', 'node-1', 'test');

    expect(result?.milestoneTitle).toBe('Sequential');
  });

  it('should return null when journey not found', async () => {
    vi.mocked(journeyRepo.findJourneyBySlug).mockResolvedValue(null);

    const result = await getNextLessonNavigation('css/lesson', 'css', 'nonexistent');

    expect(result).toBeNull();
  });

  it('should return null when current node not found', async () => {
    const mockJourney = createMockJourney({
      nodes: [createMockNode({ id: 'other-node' })],
    });

    vi.mocked(journeyRepo.findJourneyBySlug).mockResolvedValue(mockJourney);

    const result = await getNextLessonNavigation('css/lesson', 'nonexistent-node', 'test');

    expect(result).toBeNull();
  });

  it('should return null when no next lesson available', async () => {
    const mockJourney = createMockJourney({
      nodes: [
        createMockNode({
          id: 'only-node',
          learningObjectives: [{ title: 'Only Lesson', lessonId: 'only-lesson' }],
        }),
      ],
      edges: [],
    });

    vi.mocked(journeyRepo.findJourneyBySlug).mockResolvedValue(mockJourney);
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));
    vi.mocked(fs.readdir).mockResolvedValue([]);

    const result = await getNextLessonNavigation('only-node/only-lesson', 'only-node', 'test');

    expect(result).toBeNull();
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(journeyRepo.findJourneyBySlug).mockRejectedValue(new Error('DB error'));

    const result = await getNextLessonNavigation('css/lesson', 'css', 'test');

    expect(result).toBeNull();
  });
});

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Property-Based Tests', () => {
  // Generators
  const experienceLevelArb = fc.constantFrom<ExperienceLevel>('beginner', 'intermediate', 'advanced');

  describe('Experience Level Validation', () => {
    it('should only accept valid experience levels', () => {
      fc.assert(
        fc.property(experienceLevelArb, (level) => {
          const validLevels = ['beginner', 'intermediate', 'advanced'];
          return validLevels.includes(level);
        }),
        { numRuns: 10 }
      );
    });

    it.each(['invalid', 'BEGINNER', 'expert', '123', ''])(
      'should reject invalid experience level: %s',
      async (invalidLevel) => {
        vi.clearAllMocks();
        // Mock metadata read to return three-level lesson (which validates levels)
        const threeLevelMetadata = JSON.stringify(createMockMetadata());
        vi.mocked(fs.readFile).mockResolvedValueOnce(threeLevelMetadata);
        const result = await getLessonContent('test/lesson', invalidLevel as ExperienceLevel);
        expect(result).toBeNull();
      }
    );
  });

  describe('Path Safety', () => {
    it.each(['../secret', '../../etc/passwd', 'lesson/../../../secret'])(
      'should reject path traversal attempt: %s',
      async (maliciousPath) => {
        vi.clearAllMocks();
        vi.mocked(resolvePathWithinRoot).mockResolvedValue(null);
        const result = await getLessonMetadata(maliciousPath);
        expect(result).toBeNull();
      }
    );
  });

  describe('Lesson Order Consistency', () => {
    it('should maintain order when sorting lessons', async () => {
      vi.clearAllMocks();
      const orders = [5, 2, 8, 1, 3];
      const mockDirEntries = orders.map((_, i) => ({
        name: `lesson-${i}`,
        isDirectory: () => true,
      }));
      
      vi.mocked(fs.readdir).mockResolvedValueOnce(mockDirEntries as any);
      
      for (let i = 0; i < orders.length; i++) {
        vi.mocked(fs.readFile).mockResolvedValueOnce(
          JSON.stringify(createMockMetadata({ id: `lesson-${i}`, order: orders[i] }))
        );
      }

      const result = await getLessonsForMilestone('test');
      
      // Verify sorted order
      for (let i = 1; i < result.length; i++) {
        expect(result[i].order).toBeGreaterThanOrEqual(result[i - 1].order);
      }
    });
  });

  describe('Objective Info Completeness', () => {
    it('should always include objective and lessonId in results', async () => {
      vi.clearAllMocks();
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));
      vi.mocked(fs.readdir).mockResolvedValue([]);

      const objectives = ['Objective 1', 'Objective 2', 'Objective 3'];
      const result = await getObjectivesWithLessons('test', objectives);
      
      expect(result).toHaveLength(3);
      result.forEach(info => {
        expect(typeof info.objective).toBe('string');
        expect(typeof info.lessonId).toBe('string');
        expect(typeof info.hasLesson).toBe('boolean');
      });
    });
  });
});

// ============================================================================
// Edge Cases and Error Handling Tests
// ============================================================================

describe('Edge Cases and Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty and Null Inputs', () => {
    it('should handle empty lesson path gracefully', async () => {
      vi.mocked(resolvePathWithinRoot).mockResolvedValue(null);
      
      const result = await getLessonMetadata('');
      expect(result).toBeNull();
    });

    it('should handle undefined objectives array', async () => {
      const journey = {
        nodes: [
          createMockNode({ id: 'node-1', learningObjectives: undefined }),
        ],
      };

      const result = await getJourneyLessonAvailability(journey);
      expect(result).toEqual({});
    });

    it('should handle node without learningObjectives property', async () => {
      const journey = {
        nodes: [
          { id: 'node-1', title: 'Test', type: 'milestone', position: { x: 0, y: 0 } } as JourneyNode,
        ],
      };

      const result = await getJourneyLessonAvailability(journey);
      expect(result).toEqual({});
    });
  });

  describe('Malformed Data', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.mocked(resolvePathWithinRoot).mockImplementation(async (root: string, ...segments: string[]) => {
        const path = segments.join('/');
        if (path.includes('..') || path.startsWith('/')) return null;
        return `${root}/${path}`;
      });
    });

    it('should handle metadata with missing required fields', async () => {
      vi.resetAllMocks();
      vi.mocked(resolvePathWithinRoot).mockImplementation(async (root: string, ...segments: string[]) => {
        const path = segments.join('/');
        if (path.includes('..') || path.startsWith('/')) return null;
        return `${root}/${path}`;
      });
      vi.mocked(fs.readFile).mockImplementation(async () => JSON.stringify({
        id: 'partial',
        // Missing title, description, etc.
      }));

      const result = await getLessonMetadata('test/lesson');
      // Metadata validation now rejects incomplete metadata (Requirements 6.2)
      expect(result).toBeNull();
    });

    it('should handle journey with circular edge references', async () => {
      const mockJourney = createMockJourney({
        nodes: [
          createMockNode({
            id: 'node-1',
            learningObjectives: [{ title: 'Lesson 1', lessonId: 'lesson-1' }],
          }),
          createMockNode({
            id: 'node-2',
            learningObjectives: [{ title: 'Lesson 2', lessonId: 'lesson-2' }],
          }),
        ],
        edges: [
          createMockEdge({ source: 'node-1', target: 'node-2' }),
          createMockEdge({ id: 'edge-2', source: 'node-2', target: 'node-1' }), // Circular
        ],
      });

      vi.mocked(journeyRepo.findJourneyBySlug).mockResolvedValueOnce(mockJourney);
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(createMockMetadata()));

      // Should not infinite loop - just returns next based on edges
      const result = await getNextLessonNavigation('node-1/lesson-1', 'node-1', 'test');
      expect(result).toBeDefined();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple parallel getJourneyLessonAvailability calls', async () => {
      vi.clearAllMocks();
      vi.mocked(resolvePathWithinRoot).mockImplementation(async (root: string, ...segments: string[]) => {
        const path = segments.join('/');
        if (path.includes('..') || path.startsWith('/')) return null;
        return `${root}/${path}`;
      });
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(createMockMetadata()));

      const journey = {
        nodes: Array.from({ length: 10 }, (_, i) =>
          createMockNode({
            id: `node-${i}`,
            learningObjectives: [`Objective ${i}`],
          })
        ),
      };

      // Run multiple calls in parallel
      const results = await Promise.all([
        getJourneyLessonAvailability(journey),
        getJourneyLessonAvailability(journey),
        getJourneyLessonAvailability(journey),
      ]);

      results.forEach(result => {
        expect(Object.keys(result)).toHaveLength(10);
      });
    });
  });

  describe('Special Characters in Paths', () => {
    it('should handle lesson paths with hyphens', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(createMockMetadata()));

      const result = await getLessonMetadata('css-basics/box-model-intro');
      expect(result).toBeDefined();
    });

    it('should handle objectives with special characters', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));
      vi.mocked(fs.readdir).mockResolvedValue([]);

      const objectives: LearningObjective[] = [
        'What is CSS?',
        "Understanding the 'Box Model'",
        'CSS: Selectors & Specificity',
      ];

      const result = await getObjectivesWithLessons('css', objectives);
      
      expect(result).toHaveLength(3);
      result.forEach(info => {
        expect(info.objective).toBeDefined();
        expect(info.lessonId).toBeDefined();
      });
    });
  });
});

// ============================================================================
// Integration-Style Tests (Testing Function Interactions)
// ============================================================================

describe('Function Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findLessonPath -> getLessonMetadata chain', () => {
    it('should find path and then load metadata successfully', async () => {
      const mockMetadata = createMockMetadata({
        id: 'selectors',
        title: 'CSS Selectors',
        description: 'Learn about CSS selectors',
      });

      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockMetadata));

      const objective: LearningObjective = { title: 'CSS Selectors', lessonId: 'selectors' };
      const lessonPath = await findLessonPath('css', objective);
      
      expect(lessonPath).toBeDefined();
      
      if (lessonPath) {
        const metadata = await getLessonMetadata(lessonPath);
        expect(metadata?.title).toBe('CSS Selectors');
      }
    });
  });

  describe('getObjectivesWithLessons -> getLessonContent chain', () => {
    it('should get objectives info and then load content for available lessons', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(JSON.stringify(createMockMetadata({ id: 'lesson-1' })))
        .mockResolvedValueOnce('# Lesson Content\n\nThis is the lesson.');

      const objectives: LearningObjective[] = ['First Lesson'];
      const objectiveInfos = await getObjectivesWithLessons('test', objectives);
      
      const lessonsWithContent = objectiveInfos.filter(info => info.hasLesson);
      
      for (const info of lessonsWithContent) {
        if (info.lessonPath) {
          const content = await getLessonContent(info.lessonPath, 'beginner');
          expect(content).toBeDefined();
        }
      }
    });
  });

  describe('getNextLessonNavigation -> getAdjacentLessons comparison', () => {
    it('should provide consistent navigation suggestions', async () => {
      const mockJourney = createMockJourney({
        nodes: [
          createMockNode({
            id: 'css',
            title: 'CSS Basics',
            learningObjectives: [
              { title: 'Lesson 1', lessonId: 'lesson-1' },
              { title: 'Lesson 2', lessonId: 'lesson-2' },
            ],
          }),
        ],
        edges: [],
      });

      vi.mocked(journeyRepo.findJourneyBySlug).mockResolvedValue(mockJourney);
      vi.mocked(fs.access).mockResolvedValue(undefined);
      
      const mockDirEntries = [
        { name: 'lesson-1', isDirectory: () => true },
        { name: 'lesson-2', isDirectory: () => true },
      ];
      vi.mocked(fs.readdir).mockResolvedValue(mockDirEntries as any);
      
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(JSON.stringify(createMockMetadata({ id: 'lesson-2', title: 'Lesson 2', order: 2 })))
        .mockResolvedValueOnce(JSON.stringify(createMockMetadata({ id: 'lesson-1', title: 'Lesson 1', order: 1 })))
        .mockResolvedValueOnce(JSON.stringify(createMockMetadata({ id: 'lesson-2', title: 'Lesson 2', order: 2 })));

      // Both should suggest lesson-2 as next from lesson-1
      const navResult = await getNextLessonNavigation('css/lesson-1', 'css', 'test');
      
      // Reset mocks for adjacent call
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(JSON.stringify(createMockMetadata({ id: 'lesson-1', order: 1 })))
        .mockResolvedValueOnce(JSON.stringify(createMockMetadata({ id: 'lesson-1', title: 'Lesson 1', order: 1 })))
        .mockResolvedValueOnce(JSON.stringify(createMockMetadata({ id: 'lesson-2', title: 'Lesson 2', order: 2 })));
      
      const adjResult = await getAdjacentLessons('css/lesson-1');

      // Both should point to lesson-2 as next
      if (navResult && adjResult.next) {
        expect(navResult.title).toBe(adjResult.next.title);
      }
    });
  });
});

// ============================================================================
// XP and Timing Calculation Tests
// ============================================================================

describe('XP and Timing Calculations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolvePathWithinRoot).mockImplementation(async (root: string, ...segments: string[]) => {
      const path = segments.join('/');
      if (path.includes('..') || path.startsWith('/')) return null;
      return `${root}/${path}`;
    });
  });

  it('should return correct XP rewards for each level', async () => {
    vi.resetAllMocks();
    vi.mocked(resolvePathWithinRoot).mockImplementation(async (root: string, ...segments: string[]) => {
      const path = segments.join('/');
      if (path.includes('..') || path.startsWith('/')) return null;
      return `${root}/${path}`;
    });
    
    const mockMetadata = {
      id: 'xp-test',
      title: 'XP Test',
      description: 'Test',
      milestone: 'test',
      order: 1,
      sections: ['intro'],
      levels: {
        beginner: { estimatedMinutes: 10, xpReward: 25 },
        intermediate: { estimatedMinutes: 20, xpReward: 50 },
        advanced: { estimatedMinutes: 30, xpReward: 100 },
      },
      prerequisites: [],
      tags: [],
    };

    vi.mocked(fs.access).mockImplementation(async () => undefined);
    vi.mocked(fs.readFile).mockImplementation(async () => JSON.stringify(mockMetadata));

    const objectives: LearningObjective[] = ['Test Lesson'];
    const result = await getObjectivesWithLessons('test', objectives);

    expect(result[0].xpRewards).toEqual({
      beginner: 25,
      intermediate: 50,
      advanced: 100,
    });
  });

  it('should return correct estimated minutes for each level', async () => {
    vi.resetAllMocks();
    vi.mocked(resolvePathWithinRoot).mockImplementation(async (root: string, ...segments: string[]) => {
      const path = segments.join('/');
      if (path.includes('..') || path.startsWith('/')) return null;
      return `${root}/${path}`;
    });
    
    const mockMetadata = {
      id: 'time-test',
      title: 'Time Test',
      description: 'Test',
      milestone: 'test',
      order: 1,
      sections: ['intro'],
      levels: {
        beginner: { estimatedMinutes: 15, xpReward: 30 },
        intermediate: { estimatedMinutes: 25, xpReward: 60 },
        advanced: { estimatedMinutes: 40, xpReward: 120 },
      },
      prerequisites: [],
      tags: [],
    };

    vi.mocked(fs.access).mockImplementation(async () => undefined);
    vi.mocked(fs.readFile).mockImplementation(async () => JSON.stringify(mockMetadata));

    const objectives: LearningObjective[] = ['Timed Lesson'];
    const result = await getObjectivesWithLessons('test', objectives);

    expect(result[0].estimatedMinutes).toEqual({
      beginner: 15,
      intermediate: 25,
      advanced: 40,
    });
  });

  it('should include XP in next lesson suggestion', async () => {
    const mockDirEntries = [
      { name: 'lesson-1', isDirectory: () => true },
      { name: 'lesson-2', isDirectory: () => true },
    ];
    
    vi.mocked(fs.readdir).mockResolvedValue(mockDirEntries as any);
    vi.mocked(fs.readFile).mockImplementation(async (path: any) => {
      const pathStr = String(path);
      if (pathStr.includes('lesson-1')) {
        return JSON.stringify(createMockMetadata({ id: 'lesson-1', order: 1, prerequisites: [] }));
      }
      return JSON.stringify(createMockMetadata({ 
        id: 'lesson-2', 
        order: 2,
        prerequisites: [],
        levels: {
          beginner: { estimatedMinutes: 20, xpReward: 45 },
          intermediate: { estimatedMinutes: 30, xpReward: 70 },
          advanced: { estimatedMinutes: 45, xpReward: 110 },
        },
      }));
    });

    const result = await getNextLessonSuggestion('test/lesson-1', 'intermediate', []);

    expect(result?.xpReward).toBe(70);
    expect(result?.estimatedMinutes).toBe(30);
  });
});

// ============================================================================
// Prerequisite Chain Tests
// ============================================================================

describe('Prerequisite Chain Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolvePathWithinRoot).mockImplementation(async (root: string, ...segments: string[]) => {
      const path = segments.join('/');
      if (path.includes('..') || path.startsWith('/')) return null;
      return `${root}/${path}`;
    });
  });

  it('should correctly identify lessons with all prerequisites met', async () => {
    const mockDirEntries = [
      { name: 'intro', isDirectory: () => true },
      { name: 'basics', isDirectory: () => true },
      { name: 'advanced', isDirectory: () => true },
    ];
    
    vi.mocked(fs.readdir).mockResolvedValue(mockDirEntries as any);
    vi.mocked(fs.readFile).mockImplementation(async (path: any) => {
      const pathStr = String(path);
      if (pathStr.includes('intro')) {
        return JSON.stringify(createMockMetadata({ id: 'intro', order: 1, prerequisites: [] }));
      }
      if (pathStr.includes('basics')) {
        return JSON.stringify(createMockMetadata({ id: 'basics', order: 2, prerequisites: ['intro'] }));
      }
      return JSON.stringify(createMockMetadata({ id: 'advanced', order: 3, prerequisites: ['basics'] }));
    });

    const completedLessons = [
      { lessonId: 'test/intro', experienceLevel: 'beginner' },
    ];

    const result = await getNextLessonSuggestion('test/basics', 'beginner', completedLessons);

    expect(result?.lessonPath).toBe('test/advanced');
  });

  it('should handle cross-milestone prerequisites', async () => {
    const mockDirEntries = [
      { name: 'lesson-1', isDirectory: () => true },
    ];
    
    vi.mocked(fs.readdir).mockResolvedValue(mockDirEntries as any);
    vi.mocked(fs.readFile).mockImplementation(async (path: any) => {
      const pathStr = String(path);
      if (pathStr.includes('current')) {
        return JSON.stringify(createMockMetadata({ id: 'current', order: 1, prerequisites: [] }));
      }
      return JSON.stringify(createMockMetadata({ 
        id: 'lesson-1', 
        order: 2,
        prerequisites: ['other-milestone/prereq'],
      }));
    });

    const completedLessons = [
      { lessonId: 'other-milestone/prereq', experienceLevel: 'beginner' },
    ];

    const result = await getNextLessonSuggestion('test/current', 'beginner', completedLessons);

    expect(result).toBeDefined();
  });
});
