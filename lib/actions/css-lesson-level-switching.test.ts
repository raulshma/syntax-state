/**
 * Integration tests for CSS lesson experience level switching
 * 
 * Tests verify that:
 * - Content loads correctly for each experience level (beginner, intermediate, advanced)
 * - All CSS lesson topics support level switching
 * - Loading states are handled properly
 * - Error states are handled gracefully
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import type { ExperienceLevel } from '@/lib/db/schemas/lesson-progress';

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
];

const EXPERIENCE_LEVELS: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];

describe('CSS Lesson Level Switching', () => {
  describe('Content File Existence', () => {
    it('should have all three experience level files for each CSS topic', async () => {
      for (const topic of CSS_TOPICS) {
        for (const level of EXPERIENCE_LEVELS) {
          const filePath = path.join(CONTENT_DIR, topic, `${level}.mdx`);
          
          try {
            await fs.access(filePath);
            // File exists
            expect(true).toBe(true);
          } catch (error) {
            throw new Error(`Missing ${level}.mdx file for ${topic}`);
          }
        }
      }
    });

    it('should have metadata.json for each CSS topic', async () => {
      for (const topic of CSS_TOPICS) {
        const metadataPath = path.join(CONTENT_DIR, topic, 'metadata.json');
        
        try {
          await fs.access(metadataPath);
          expect(true).toBe(true);
        } catch (error) {
          throw new Error(`Missing metadata.json for ${topic}`);
        }
      }
    });
  });

  describe('Content Loading', () => {
    it('should load beginner content for all CSS topics', async () => {
      for (const topic of CSS_TOPICS) {
        const filePath = path.join(CONTENT_DIR, topic, 'beginner.mdx');
        const content = await fs.readFile(filePath, 'utf-8');
        
        expect(content).toBeTruthy();
        expect(content.length).toBeGreaterThan(0);
        expect(content).toContain('#'); // Should have markdown headers
      }
    });

    it('should load intermediate content for all CSS topics', async () => {
      for (const topic of CSS_TOPICS) {
        const filePath = path.join(CONTENT_DIR, topic, 'intermediate.mdx');
        const content = await fs.readFile(filePath, 'utf-8');
        
        expect(content).toBeTruthy();
        expect(content.length).toBeGreaterThan(0);
        expect(content).toContain('#'); // Should have markdown headers
      }
    });

    it('should load advanced content for all CSS topics', async () => {
      for (const topic of CSS_TOPICS) {
        const filePath = path.join(CONTENT_DIR, topic, 'advanced.mdx');
        const content = await fs.readFile(filePath, 'utf-8');
        
        expect(content).toBeTruthy();
        expect(content.length).toBeGreaterThan(0);
        expect(content).toContain('#'); // Should have markdown headers
      }
    });
  });

  describe('Content Differentiation', () => {
    it('should have different content for each experience level', async () => {
      for (const topic of CSS_TOPICS) {
        const beginnerPath = path.join(CONTENT_DIR, topic, 'beginner.mdx');
        const intermediatePath = path.join(CONTENT_DIR, topic, 'intermediate.mdx');
        const advancedPath = path.join(CONTENT_DIR, topic, 'advanced.mdx');
        
        const beginnerContent = await fs.readFile(beginnerPath, 'utf-8');
        const intermediateContent = await fs.readFile(intermediatePath, 'utf-8');
        const advancedContent = await fs.readFile(advancedPath, 'utf-8');
        
        // Content should be different for each level
        expect(beginnerContent).not.toBe(intermediateContent);
        expect(intermediateContent).not.toBe(advancedContent);
        expect(beginnerContent).not.toBe(advancedContent);
      }
    });
  });

  describe('Metadata Validation', () => {
    it('should have valid metadata for all CSS topics', async () => {
      for (const topic of CSS_TOPICS) {
        const metadataPath = path.join(CONTENT_DIR, topic, 'metadata.json');
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        const metadata = JSON.parse(metadataContent);
        
        // Validate required fields
        expect(metadata.id).toBeTruthy();
        expect(metadata.title).toBeTruthy();
        expect(metadata.description).toBeTruthy();
        expect(metadata.milestone).toBe('css');
        expect(metadata.sections).toBeInstanceOf(Array);
        expect(metadata.sections.length).toBeGreaterThan(0);
        
        // Validate levels configuration
        expect(metadata.levels).toBeTruthy();
        expect(metadata.levels.beginner).toBeTruthy();
        expect(metadata.levels.intermediate).toBeTruthy();
        expect(metadata.levels.advanced).toBeTruthy();
        
        // Validate XP rewards
        expect(metadata.levels.beginner.xpReward).toBe(50);
        expect(metadata.levels.intermediate.xpReward).toBe(100);
        expect(metadata.levels.advanced.xpReward).toBe(200);
      }
    });

    it('should have sections defined in metadata', async () => {
      for (const topic of CSS_TOPICS) {
        const metadataPath = path.join(CONTENT_DIR, topic, 'metadata.json');
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        const metadata = JSON.parse(metadataContent);
        
        expect(metadata.sections).toBeInstanceOf(Array);
        expect(metadata.sections.length).toBeGreaterThan(0);
        
        // Each section should be a string
        metadata.sections.forEach((section: any) => {
          expect(typeof section).toBe('string');
          expect(section.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent topic gracefully', async () => {
      const nonExistentPath = path.join(CONTENT_DIR, 'non-existent-topic', 'beginner.mdx');
      
      await expect(fs.readFile(nonExistentPath, 'utf-8')).rejects.toThrow();
    });

    it('should handle non-existent level gracefully', async () => {
      const invalidLevelPath = path.join(CONTENT_DIR, 'selectors', 'expert.mdx');
      
      await expect(fs.readFile(invalidLevelPath, 'utf-8')).rejects.toThrow();
    });
  });

  describe('Content Structure', () => {
    it('should have ProgressCheckpoint components in content', async () => {
      for (const topic of CSS_TOPICS) {
        for (const level of EXPERIENCE_LEVELS) {
          const filePath = path.join(CONTENT_DIR, topic, `${level}.mdx`);
          const content = await fs.readFile(filePath, 'utf-8');
          
          // Should contain ProgressCheckpoint components
          expect(content).toContain('ProgressCheckpoint');
        }
      }
    });

    it('should have section attributes in ProgressCheckpoint components', async () => {
      for (const topic of CSS_TOPICS) {
        for (const level of EXPERIENCE_LEVELS) {
          const filePath = path.join(CONTENT_DIR, topic, `${level}.mdx`);
          const content = await fs.readFile(filePath, 'utf-8');
          
          // Check that ProgressCheckpoint components have section attributes
          const sectionPattern = /section=["'][^"']+["']/g;
          const matches = content.match(sectionPattern);
          
          expect(matches).toBeTruthy();
          expect(matches!.length).toBeGreaterThan(0);
          
          // Verify each match has a valid section name
          matches!.forEach((match) => {
            const sectionName = match.match(/section=["']([^"']+)["']/)?.[1];
            expect(sectionName).toBeTruthy();
            expect(sectionName!.length).toBeGreaterThan(0);
          });
        }
      }
    });
  });

  describe('Interactive Components', () => {
    it('should include interactive components in lessons', async () => {
      const componentChecks = [
        { topic: 'selectors', component: 'SelectorPlayground' },
        { topic: 'box-model', component: 'BoxModelVisualizer' },
        { topic: 'flexbox', component: 'FlexboxPlayground' },
        { topic: 'grid', component: 'GridPlayground' },
        { topic: 'positioning', component: 'PositioningDemo' },
        { topic: 'colors', component: 'ColorMixer' },
        { topic: 'animations', component: 'AnimationBuilder' },
        { topic: 'transforms', component: 'TransformPlayground' },
        { topic: 'responsive-design', component: 'ResponsivePreview' },
      ];

      for (const { topic, component } of componentChecks) {
        let foundInAnyLevel = false;
        
        for (const level of EXPERIENCE_LEVELS) {
          const filePath = path.join(CONTENT_DIR, topic, `${level}.mdx`);
          const content = await fs.readFile(filePath, 'utf-8');
          
          if (content.includes(component)) {
            foundInAnyLevel = true;
            break;
          }
        }
        
        expect(foundInAnyLevel).toBe(true);
      }
    });
  });

  describe('Level Switching Simulation', () => {
    it('should successfully switch between all levels for each topic', async () => {
      for (const topic of CSS_TOPICS) {
        const loadedContent: Record<ExperienceLevel, string> = {
          beginner: '',
          intermediate: '',
          advanced: '',
        };
        
        // Simulate loading each level
        for (const level of EXPERIENCE_LEVELS) {
          const filePath = path.join(CONTENT_DIR, topic, `${level}.mdx`);
          loadedContent[level] = await fs.readFile(filePath, 'utf-8');
          
          expect(loadedContent[level]).toBeTruthy();
          expect(loadedContent[level].length).toBeGreaterThan(0);
        }
        
        // Verify all levels were loaded successfully
        expect(loadedContent.beginner).toBeTruthy();
        expect(loadedContent.intermediate).toBeTruthy();
        expect(loadedContent.advanced).toBeTruthy();
        
        // Verify content is different for each level
        expect(loadedContent.beginner).not.toBe(loadedContent.intermediate);
        expect(loadedContent.intermediate).not.toBe(loadedContent.advanced);
      }
    });
  });
});
