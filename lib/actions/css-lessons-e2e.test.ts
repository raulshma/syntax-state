/**
 * End-to-End Tests for CSS Interactive Lessons
 * 
 * This test suite verifies the complete CSS lessons implementation by:
 * 1. Testing all 10 CSS lesson topics
 * 2. Verifying all experience levels (beginner, intermediate, advanced)
 * 3. Checking interactive components are present
 * 4. Validating progress tracking integration
 * 5. Verifying gamification features
 * 
 * Requirements: All (comprehensive validation)
 * Task: 38.1 - Test all CSS lessons end-to-end
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'lessons', 'css');

const CSS_TOPICS = [
  'selectors',
  'box-model',
  'positioning',
  'flexbox',
  'grid',
  'typography',
  'colors',
  'responsive-design',
  'animations',
  'transforms',
] as const;

const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

// Expected interactive components for each topic
const EXPECTED_COMPONENTS: Record<string, string[]> = {
  'selectors': ['SelectorPlayground', 'SpecificityCalculator'],
  'box-model': ['BoxModelVisualizer'],
  'positioning': ['PositioningDemo'],
  'flexbox': ['FlexboxPlayground'],
  'grid': ['GridPlayground'],
  'typography': ['CssEditor'],
  'colors': ['ColorMixer'],
  'responsive-design': ['ResponsivePreview'],
  'animations': ['AnimationBuilder', 'AnimationTimeline'],
  'transforms': ['TransformPlayground'],
};

describe('CSS Lessons - End-to-End Testing', () => {
  describe('Lesson Structure Completeness', () => {
    it.each(CSS_TOPICS)('should have metadata.json for %s', async (topic) => {
      const metadataPath = path.join(CONTENT_DIR, topic, 'metadata.json');
      const exists = await fs.access(metadataPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it.each(CSS_TOPICS)('should have valid metadata structure for %s', async (topic) => {
      const metadataPath = path.join(CONTENT_DIR, topic, 'metadata.json');
      const content = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(content);

      // Verify required fields
      expect(metadata).toHaveProperty('id');
      expect(metadata).toHaveProperty('title');
      expect(metadata).toHaveProperty('description');
      expect(metadata).toHaveProperty('milestone');
      expect(metadata).toHaveProperty('order');
      expect(metadata).toHaveProperty('sections');
      expect(metadata).toHaveProperty('levels');
      expect(metadata).toHaveProperty('prerequisites');
      expect(metadata).toHaveProperty('tags');

      // Verify milestone is 'css'
      expect(metadata.milestone).toBe('css');

      // Verify levels structure
      expect(metadata.levels).toHaveProperty('beginner');
      expect(metadata.levels).toHaveProperty('intermediate');
      expect(metadata.levels).toHaveProperty('advanced');

      // Verify each level has required properties
      for (const level of EXPERIENCE_LEVELS) {
        expect(metadata.levels[level]).toHaveProperty('estimatedMinutes');
        expect(metadata.levels[level]).toHaveProperty('xpReward');
        expect(typeof metadata.levels[level].estimatedMinutes).toBe('number');
        expect(typeof metadata.levels[level].xpReward).toBe('number');
      }

      // Verify sections is an array
      expect(Array.isArray(metadata.sections)).toBe(true);
      expect(metadata.sections.length).toBeGreaterThan(0);
    });

    it.each(CSS_TOPICS)('should have MDX files for all experience levels for %s', async (topic) => {
      for (const level of EXPERIENCE_LEVELS) {
        const mdxPath = path.join(CONTENT_DIR, topic, `${level}.mdx`);
        const exists = await fs.access(mdxPath).then(() => true).catch(() => false);
        expect(exists).toBe(true);
      }
    });
  });

  describe('Interactive Components Presence', () => {
    it.each(CSS_TOPICS)('should include expected interactive components in %s lessons', async (topic) => {
      const expectedComponents = EXPECTED_COMPONENTS[topic];
      
      // Check that at least one level has the expected components
      let foundInAnyLevel = false;
      
      for (const level of EXPERIENCE_LEVELS) {
        const mdxPath = path.join(CONTENT_DIR, topic, `${level}.mdx`);
        const content = await fs.readFile(mdxPath, 'utf-8');

        // Check if any expected component is present
        const hasComponent = expectedComponents.some(component => 
          content.includes(`<${component}`)
        );
        
        if (hasComponent) {
          foundInAnyLevel = true;
          break;
        }
      }
      
      expect(foundInAnyLevel).toBe(true);
    });

    it.each(CSS_TOPICS)('should include ProgressCheckpoint components in %s lessons', async (topic) => {
      for (const level of EXPERIENCE_LEVELS) {
        const mdxPath = path.join(CONTENT_DIR, topic, `${level}.mdx`);
        const content = await fs.readFile(mdxPath, 'utf-8');

        // Should have at least one ProgressCheckpoint
        expect(content).toContain('<ProgressCheckpoint');
      }
    });
  });

  describe('Metadata-Content Consistency', () => {
    it.each(CSS_TOPICS)('should have matching sections between metadata and MDX for %s', async (topic) => {
      // Read metadata
      const metadataPath = path.join(CONTENT_DIR, topic, 'metadata.json');
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(metadataContent);

      // Collect all sections found across all levels
      const allFoundSections = new Set<string>();

      // Check each level
      for (const level of EXPERIENCE_LEVELS) {
        const mdxPath = path.join(CONTENT_DIR, topic, `${level}.mdx`);
        const mdxContent = await fs.readFile(mdxPath, 'utf-8');

        // Extract ProgressCheckpoint section IDs from MDX
        const checkpointRegex = /<ProgressCheckpoint\s+section=["']([^"']+)["']/g;
        let match;
        
        while ((match = checkpointRegex.exec(mdxContent)) !== null) {
          allFoundSections.add(match[1]);
        }
      }

      // Verify all metadata sections are present in at least one MDX file
      for (const section of metadata.sections) {
        expect(allFoundSections.has(section)).toBe(true);
      }
    });
  });

  describe('Content Quality', () => {
    it.each(CSS_TOPICS)('should have non-empty content for all levels in %s', async (topic) => {
      for (const level of EXPERIENCE_LEVELS) {
        const mdxPath = path.join(CONTENT_DIR, topic, `${level}.mdx`);
        const content = await fs.readFile(mdxPath, 'utf-8');

        // Content should be substantial (at least 500 characters)
        expect(content.length).toBeGreaterThan(500);

        // Should have at least one heading
        expect(content).toMatch(/^#+ /m);
      }
    });

    it.each(CSS_TOPICS)('should include learning objectives or introduction in %s', async (topic) => {
      for (const level of EXPERIENCE_LEVELS) {
        const mdxPath = path.join(CONTENT_DIR, topic, `${level}.mdx`);
        const content = await fs.readFile(mdxPath, 'utf-8');

        // Should have some introductory content before first checkpoint
        const firstCheckpoint = content.indexOf('<ProgressCheckpoint');
        expect(firstCheckpoint).toBeGreaterThan(100);
      }
    });
  });

  describe('XP Rewards Configuration', () => {
    it.each(CSS_TOPICS)('should have appropriate XP rewards for %s', async (topic) => {
      const metadataPath = path.join(CONTENT_DIR, topic, 'metadata.json');
      const content = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(content);

      // Verify XP rewards follow expected pattern
      expect(metadata.levels.beginner.xpReward).toBeGreaterThanOrEqual(50);
      expect(metadata.levels.intermediate.xpReward).toBeGreaterThanOrEqual(100);
      expect(metadata.levels.advanced.xpReward).toBeGreaterThanOrEqual(200);

      // Advanced should have more XP than intermediate
      expect(metadata.levels.advanced.xpReward).toBeGreaterThan(metadata.levels.intermediate.xpReward);
      
      // Intermediate should have more XP than beginner
      expect(metadata.levels.intermediate.xpReward).toBeGreaterThan(metadata.levels.beginner.xpReward);
    });
  });

  describe('Prerequisites and Dependencies', () => {
    it.each(CSS_TOPICS)('should have valid prerequisites array for %s', async (topic) => {
      const metadataPath = path.join(CONTENT_DIR, topic, 'metadata.json');
      const content = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(content);

      expect(Array.isArray(metadata.prerequisites)).toBe(true);
      
      // Prerequisites should be strings
      for (const prereq of metadata.prerequisites) {
        expect(typeof prereq).toBe('string');
      }
    });
  });

  describe('Tags and Categorization', () => {
    it.each(CSS_TOPICS)('should have relevant tags for %s', async (topic) => {
      const metadataPath = path.join(CONTENT_DIR, topic, 'metadata.json');
      const content = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(content);

      expect(Array.isArray(metadata.tags)).toBe(true);
      expect(metadata.tags.length).toBeGreaterThan(0);
      
      // Tags should be strings
      for (const tag of metadata.tags) {
        expect(typeof tag).toBe('string');
        expect(tag.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Lesson Ordering', () => {
    it('should have unique order values for all lessons', async () => {
      const orders = new Set<number>();
      
      for (const topic of CSS_TOPICS) {
        const metadataPath = path.join(CONTENT_DIR, topic, 'metadata.json');
        const content = await fs.readFile(metadataPath, 'utf-8');
        const metadata = JSON.parse(content);

        expect(typeof metadata.order).toBe('number');
        expect(orders.has(metadata.order)).toBe(false);
        orders.add(metadata.order);
      }
    });

    it('should have sequential order values starting from 1', async () => {
      const orders: number[] = [];
      
      for (const topic of CSS_TOPICS) {
        const metadataPath = path.join(CONTENT_DIR, topic, 'metadata.json');
        const content = await fs.readFile(metadataPath, 'utf-8');
        const metadata = JSON.parse(content);
        orders.push(metadata.order);
      }

      orders.sort((a, b) => a - b);
      
      // Should start at 1
      expect(orders[0]).toBe(1);
      
      // Should be sequential
      for (let i = 1; i < orders.length; i++) {
        expect(orders[i]).toBe(orders[i - 1] + 1);
      }
    });
  });

  describe('Component Integration', () => {
    it('should have all interactive components exported from index', async () => {
      const indexPath = path.join(process.cwd(), 'components', 'learn', 'interactive', 'css', 'index.ts');
      const exists = await fs.access(indexPath).then(() => true).catch(() => false);
      
      if (exists) {
        const content = await fs.readFile(indexPath, 'utf-8');
        
        const expectedExports = [
          'BoxModelVisualizer',
          'SelectorPlayground',
          'FlexboxPlayground',
          'GridPlayground',
          'PositioningDemo',
          'ColorMixer',
          'AnimationBuilder',
          'TransformPlayground',
          'ResponsivePreview',
          'CssEditor',
          'SpecificityCalculator',
          'AnimationTimeline',
          'BrowserCompatibility',
        ];

        for (const component of expectedExports) {
          expect(content).toContain(component);
        }
      }
    });
  });

  describe('Estimated Time Accuracy', () => {
    it.each(CSS_TOPICS)('should have reasonable time estimates for %s', async (topic) => {
      const metadataPath = path.join(CONTENT_DIR, topic, 'metadata.json');
      const content = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(content);

      // Time estimates should be reasonable (between 10 and 120 minutes)
      for (const level of EXPERIENCE_LEVELS) {
        const minutes = metadata.levels[level].estimatedMinutes;
        expect(minutes).toBeGreaterThanOrEqual(10);
        expect(minutes).toBeLessThanOrEqual(120);
      }

      // Advanced should take longer than or equal to intermediate
      expect(metadata.levels.advanced.estimatedMinutes).toBeGreaterThanOrEqual(
        metadata.levels.intermediate.estimatedMinutes
      );
    });
  });
});
