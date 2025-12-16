import { describe, it, expect } from 'vitest';
import { efCoreRoadmap } from '../ef-core-roadmap';
import { dotnetRoadmap } from '../dotnet-roadmap';
import { allRoadmaps } from '../index';

/**
 * EF Core Roadmap Validation Tests
 * 
 * These tests verify the parent roadmap relationship and data integrity
 * for the Entity Framework Core sub-roadmap.
 * 
 * Requirements: 13.1, 13.2, 13.5
 */
describe('EF Core Roadmap - Parent Relationship Validation', () => {
  describe('Parent Roadmap Existence', () => {
    it('should have parentRoadmapSlug set to "dotnet"', () => {
      // Requirement 13.1: THE System SHALL set parentRoadmapSlug to 'dotnet'
      expect(efCoreRoadmap.parentRoadmapSlug).toBe('dotnet');
    });

    it('should have parentNodeId set to "entity-framework-core"', () => {
      // Requirement 13.2: THE System SHALL set parentNodeId to 'entity-framework-core'
      expect(efCoreRoadmap.parentNodeId).toBe('entity-framework-core');
    });

    it('should reference a parent roadmap that exists in allRoadmaps', () => {
      // Requirement 13.5: THE System SHALL maintain referential integrity
      const parentRoadmap = allRoadmaps.find(
        (r) => r.slug === efCoreRoadmap.parentRoadmapSlug
      );
      expect(parentRoadmap).toBeDefined();
      expect(parentRoadmap?.slug).toBe('dotnet');
    });

    it('should reference a parent roadmap with matching slug in dotnetRoadmap', () => {
      // Verify the dotnet roadmap has the expected slug
      expect(dotnetRoadmap.slug).toBe(efCoreRoadmap.parentRoadmapSlug);
    });
  });

  describe('Parent Node Existence', () => {
    it('should reference a parent node that exists in the dotnet roadmap', () => {
      // Requirement 13.5: THE System SHALL maintain referential integrity
      const parentNode = dotnetRoadmap.nodes.find(
        (n) => n.id === efCoreRoadmap.parentNodeId
      );
      expect(parentNode).toBeDefined();
      expect(parentNode?.id).toBe('entity-framework-core');
    });

    it('should reference a parent node with title "Entity Framework Core"', () => {
      const parentNode = dotnetRoadmap.nodes.find(
        (n) => n.id === efCoreRoadmap.parentNodeId
      );
      expect(parentNode?.title).toBe('Entity Framework Core');
    });

    it('should reference a parent node of type "milestone"', () => {
      // The parent node should be a milestone (major learning checkpoint)
      const parentNode = dotnetRoadmap.nodes.find(
        (n) => n.id === efCoreRoadmap.parentNodeId
      );
      expect(parentNode?.type).toBe('milestone');
    });
  });

  describe('Referential Integrity', () => {
    it('should have showInListing set to true', () => {
      // Requirement 13.3: THE System SHALL set showInListing to true
      expect(efCoreRoadmap.showInListing).toBe(true);
    });

    it('should have matching category with parent roadmap', () => {
      // Sub-roadmap should be in the same category as parent
      expect(efCoreRoadmap.category).toBe(dotnetRoadmap.category);
    });

    it('should have prerequisites that reference parent roadmap concepts', () => {
      // Requirement 13.4: THE System SHALL include appropriate prerequisites
      expect(efCoreRoadmap.prerequisites).toBeDefined();
      expect(efCoreRoadmap.prerequisites.length).toBeGreaterThan(0);
      // Should include csharp-basics which is a node in the parent roadmap
      expect(efCoreRoadmap.prerequisites).toContain('csharp-basics');
    });

    it('should have parent node that contains related learning objectives', () => {
      // The parent node should have EF Core related learning objectives
      const parentNode = dotnetRoadmap.nodes.find(
        (n) => n.id === efCoreRoadmap.parentNodeId
      );
      expect(parentNode?.learningObjectives).toBeDefined();
      expect(parentNode?.learningObjectives.length).toBeGreaterThan(0);
      
      // Check that parent node has EF Core related lessons
      const lessonIds = parentNode?.learningObjectives.map((lo) => lo.lessonId) || [];
      expect(lessonIds).toContain('dbcontext-dbset');
    });
  });

  describe('Sub-roadmap Metadata', () => {
    it('should have a valid slug', () => {
      expect(efCoreRoadmap.slug).toBe('ef-core');
    });

    it('should have a descriptive title', () => {
      expect(efCoreRoadmap.title).toBe('Entity Framework Core');
    });

    it('should be active', () => {
      expect(efCoreRoadmap.isActive).toBe(true);
    });

    it('should have a version', () => {
      expect(efCoreRoadmap.version).toBeDefined();
      expect(efCoreRoadmap.version).toBe('2025.1');
    });
  });
});
