import { describe, it, expect } from 'vitest';
import { buildLessonCandidatePaths } from '@/lib/utils/lesson-paths';

describe('buildLessonCandidatePaths', () => {
  describe('standard dotnet pattern', () => {
    it('should handle milestone/lessonId pattern (e.g., csharp-basics/variables-data-types)', () => {
      const paths = buildLessonCandidatePaths(
        'csharp-basics',
        'variables-data-types',
        'dotnet'
      );
      
      // Should include the standard pattern
      expect(paths).toContain('variables-data-types');
      expect(paths).toContain('csharp-basics/variables-data-types');
    });
  });

  describe('SQL journey pattern', () => {
    it('should handle SQL lessons in sql/ folder (e.g., sql/learn-basics)', () => {
      const paths = buildLessonCandidatePaths(
        'learn-basics',
        'learn-basics',
        'sql'
      );
      
      // Should include sql/ prefix patterns
      expect(paths).toContain('sql/learn-basics');
    });

    it('should handle dml lessons in sql/ folder', () => {
      const paths = buildLessonCandidatePaths('dml', 'dml', 'sql');
      
      expect(paths).toContain('sql/dml');
    });

    it('should handle join-queries lessons in sql/ folder', () => {
      const paths = buildLessonCandidatePaths(
        'join-queries',
        'join-queries',
        'sql'
      );
      
      expect(paths).toContain('sql/join-queries');
    });
  });

  describe('path with slashes', () => {
    it('should handle lessonId with slash (e.g., sql/learn-basics)', () => {
      const paths = buildLessonCandidatePaths(
        'learn-basics',
        'sql/learn-basics',
        'sql'
      );
      
      // Should include direct path
      expect(paths).toContain('sql/learn-basics');
      // Should also try trailing part after slash
      expect(paths).toContain('learn-basics');
    });
  });

  describe('deduplication', () => {
    it('should not have duplicate paths', () => {
      const paths = buildLessonCandidatePaths(
        'learn-basics',
        'learn-basics',
        'sql'
      );
      
      const uniquePaths = [...new Set(paths)];
      expect(paths.length).toBe(uniquePaths.length);
    });
  });

  describe('priority order', () => {
    it('should try direct lessonId first', () => {
      const paths = buildLessonCandidatePaths(
        'csharp-basics',
        'variables-data-types',
        'dotnet'
      );
      
      // First path should be the direct lessonId
      expect(paths[0]).toBe('variables-data-types');
    });

    it('should try journeySlug-prefixed paths before generic category fallbacks', () => {
      const paths = buildLessonCandidatePaths(
        'learn-basics',
        'learn-basics',
        'sql'
      );
      
      const sqlPrefixIndex = paths.findIndex(p => p === 'sql/learn-basics');
      const databasesPrefixIndex = paths.findIndex(p => p === 'databases/learn-basics');
      
      // sql/ prefix should come before databases/ fallback
      expect(sqlPrefixIndex).toBeLessThan(databasesPrefixIndex);
    });
  });

  describe('edge cases', () => {
    it('should handle empty lessonId gracefully', () => {
      const paths = buildLessonCandidatePaths('milestone', '', 'journey');
      expect(paths).toBeDefined();
      expect(Array.isArray(paths)).toBe(true);
    });

    it('should handle undefined journeySlug', () => {
      const paths = buildLessonCandidatePaths(
        'csharp-basics',
        'variables-data-types'
      );
      
      expect(paths).toContain('variables-data-types');
      expect(paths).toContain('csharp-basics/variables-data-types');
    });

    it('should handle deep nested paths', () => {
      const paths = buildLessonCandidatePaths(
        'milestone',
        'a/b/c',
        'journey'
      );
      
      expect(paths).toContain('a/b/c');
      expect(paths).toContain('b/c'); // Trailing after first slash
      expect(paths).toContain('milestone/c'); // Final slug with milestone
    });
  });

  describe('real-world scenarios', () => {
    // These test cases match actual URLs that will be generated
    
    it('should resolve /journeys/sql/learn/learn-basics/learn-basics', () => {
      const paths = buildLessonCandidatePaths(
        'learn-basics',
        'learn-basics',
        'sql'
      );
      
      // The actual lesson is at sql/learn-basics/
      expect(paths).toContain('sql/learn-basics');
    });

    it('should resolve /journeys/sql/learn/dml/dml', () => {
      const paths = buildLessonCandidatePaths('dml', 'dml', 'sql');
      expect(paths).toContain('sql/dml');
    });

    it('should resolve /journeys/sql/learn/ddl/ddl', () => {
      const paths = buildLessonCandidatePaths('ddl', 'ddl', 'sql');
      expect(paths).toContain('sql/ddl');
    });

    it('should resolve /journeys/sql/learn/transactions/transactions', () => {
      const paths = buildLessonCandidatePaths(
        'transactions',
        'transactions',
        'sql'
      );
      expect(paths).toContain('sql/transactions');
    });

    it('should resolve /journeys/dotnet/learn/csharp-basics/variables-data-types', () => {
      const paths = buildLessonCandidatePaths(
        'csharp-basics',
        'variables-data-types',
        'dotnet'
      );
      expect(paths).toContain('csharp-basics/variables-data-types');
    });

    it('should resolve /journeys/dotnet/learn/databases/sql-fundamentals', () => {
      const paths = buildLessonCandidatePaths(
        'databases',
        'sql-fundamentals',
        'dotnet'
      );
      expect(paths).toContain('databases/sql-fundamentals');
    });
  });
});
