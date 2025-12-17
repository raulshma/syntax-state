import { describe, it, expect } from 'vitest';
import { efCoreJourney } from '../ef-core-journey';
import { dotnetJourney } from '../dotnet-journey';
import { allJourneys } from '../index';

/**
 * EF Core Journey Validation Tests
 * 
 * These tests verify the parent journey relationship and data integrity
 * for the Entity Framework Core sub-journey.
 * 
 * Requirements: 13.1, 13.2, 13.5
 */
describe('EF Core Journey - Parent Relationship Validation', () => {
  describe('Parent Journey Existence', () => {
    it('should have parentJourneySlug set to "dotnet"', () => {
      // Requirement 13.1: THE System SHALL set parentJourneySlug to 'dotnet'
      expect(efCoreJourney.parentJourneySlug).toBe('dotnet');
    });

    it('should have parentNodeId set to "entity-framework-core"', () => {
      // Requirement 13.2: THE System SHALL set parentNodeId to 'entity-framework-core'
      expect(efCoreJourney.parentNodeId).toBe('entity-framework-core');
    });

    it('should reference a parent journey that exists in allJourneys', () => {
      // Requirement 13.5: THE System SHALL maintain referential integrity
      const parentJourney = allJourneys.find(
        (r) => r.slug === efCoreJourney.parentJourneySlug
      );
      expect(parentJourney).toBeDefined();
      expect(parentJourney?.slug).toBe('dotnet');
    });

    it('should reference a parent journey with matching slug in dotnetJourney', () => {
      // Verify the dotnet journey has the expected slug
      expect(dotnetJourney.slug).toBe(efCoreJourney.parentJourneySlug);
    });
  });

  describe('Parent Node Existence', () => {
    it('should reference a parent node that exists in the dotnet journey', () => {
      // Requirement 13.5: THE System SHALL maintain referential integrity
      const parentNode = dotnetJourney.nodes.find(
        (n) => n.id === efCoreJourney.parentNodeId
      );
      expect(parentNode).toBeDefined();
      expect(parentNode?.id).toBe('entity-framework-core');
    });

    it('should reference a parent node with title "Entity Framework Core"', () => {
      const parentNode = dotnetJourney.nodes.find(
        (n) => n.id === efCoreJourney.parentNodeId
      );
      expect(parentNode?.title).toBe('Entity Framework Core');
    });

    it('should reference a parent node of type "milestone"', () => {
      // The parent node should be a milestone (major learning checkpoint)
      const parentNode = dotnetJourney.nodes.find(
        (n) => n.id === efCoreJourney.parentNodeId
      );
      expect(parentNode?.type).toBe('milestone');
    });
  });

  describe('Referential Integrity', () => {
    it('should have showInListing set to true', () => {
      // Requirement 13.3: THE System SHALL set showInListing to true
      expect(efCoreJourney.showInListing).toBe(true);
    });

    it('should have matching category with parent journey', () => {
      // Sub-journey should be in the same category as parent
      expect(efCoreJourney.category).toBe(dotnetJourney.category);
    });

    it('should have prerequisites that reference parent journey concepts', () => {
      // Requirement 13.4: THE System SHALL include appropriate prerequisites
      expect(efCoreJourney.prerequisites).toBeDefined();
      expect(efCoreJourney.prerequisites.length).toBeGreaterThan(0);
      // Should include csharp-basics which is a node in the parent journey
      expect(efCoreJourney.prerequisites).toContain('csharp-basics');
    });

    it('should have parent node that contains related learning objectives', () => {
      // The parent node should have EF Core related learning objectives
      const parentNode = dotnetJourney.nodes.find(
        (n) => n.id === efCoreJourney.parentNodeId
      );
      expect(parentNode?.learningObjectives).toBeDefined();
      expect(parentNode?.learningObjectives.length).toBeGreaterThan(0);
      
      // Check that parent node has EF Core related lessons
      const lessonIds = parentNode?.learningObjectives
        .filter((lo): lo is { title: string; lessonId?: string } => typeof lo !== 'string')
        .map((lo) => lo.lessonId)
        .filter((id): id is string => id !== undefined) || [];
      expect(lessonIds).toContain('dbcontext-dbset');
    });
  });

  describe('Sub-journey Metadata', () => {
    it('should have a valid slug', () => {
      expect(efCoreJourney.slug).toBe('ef-core');
    });

    it('should have a descriptive title', () => {
      expect(efCoreJourney.title).toBe('Entity Framework Core');
    });

    it('should be active', () => {
      expect(efCoreJourney.isActive).toBe(true);
    });

    it('should have a version', () => {
      expect(efCoreJourney.version).toBeDefined();
      expect(efCoreJourney.version).toBe('2025.1');
    });
  });
});
