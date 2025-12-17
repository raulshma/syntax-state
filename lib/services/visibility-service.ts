import { cache } from 'react';
import {
  getVisibility,
  setVisibility,
  getVisibilityBatch,
  findPublicEntities,
  getVisibilityByParent,
} from '@/lib/db/repositories/visibility-repository';
import { getJourneysCollection } from '@/lib/db/collections';
import { logVisibilityChange } from './audit-log';
import type {
  EntityType,
  VisibilitySetting,
  PublicJourney,
  PublicJourneyNode,
  VisibilityOverview,
  JourneyVisibilityInfo,
  JourneyVisibilityDetails,
  MilestoneVisibilityInfo,
  ObjectiveVisibilityInfo,
} from '@/lib/db/schemas/visibility';
import type { JourneyDocument } from '@/lib/db/collections';

/**
 * Visibility Error for handling visibility-related errors
 */
export enum VisibilityErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  PARENT_NOT_FOUND = 'PARENT_NOT_FOUND',
  INVALID_ENTITY_TYPE = 'INVALID_ENTITY_TYPE',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

export class VisibilityError extends Error {
  constructor(
    message: string,
    public code: VisibilityErrorCode,
    public entityType?: EntityType,
    public entityId?: string
  ) {
    super(message);
    this.name = 'VisibilityError';
  }
}

/**
 * Check if an entity is publicly visible, considering hierarchical rules.
 * - If a journey is private, all its milestones and objectives are private
 * - If a milestone is private, all its objectives are private
 */
export const isPubliclyVisible = cache(async (
  entityType: EntityType,
  entityId: string
): Promise<boolean> => {
  const setting = await getVisibility(entityType, entityId);

  if (!setting || !setting.isPublic) {
    return false;
  }

  if (entityType === 'journey') {
    return setting.isPublic;
  }

  if (entityType === 'milestone') {
    if (!setting.parentJourneySlug) {
      return false;
    }
    const parentVisible = await isPubliclyVisible('journey', setting.parentJourneySlug);
    return parentVisible && setting.isPublic;
  }

  if (entityType === 'objective') {
    if (!setting.parentMilestoneId || !setting.parentJourneySlug) {
      return false;
    }
    const milestoneVisible = await isPubliclyVisible('milestone', setting.parentMilestoneId);
    return milestoneVisible && setting.isPublic;
  }

  return false;
});

/**
 * Validate that parent entities exist before updating visibility
 */
async function validateParentExists(
  entityType: EntityType,
  parentJourneySlug?: string,
  parentMilestoneId?: string
): Promise<void> {
  if (entityType === 'journey') {
    return;
  }

  if (entityType === 'milestone') {
    if (!parentJourneySlug) {
      throw new VisibilityError(
        'Milestone visibility requires a parent journey slug',
        VisibilityErrorCode.PARENT_NOT_FOUND,
        entityType
      );
    }
    const collection = await getJourneysCollection();
    const journey = await collection.findOne({ slug: parentJourneySlug });
    if (!journey) {
      throw new VisibilityError(
        `Parent journey '${parentJourneySlug}' not found`,
        VisibilityErrorCode.PARENT_NOT_FOUND,
        entityType
      );
    }
    return;
  }

  if (entityType === 'objective') {
    if (!parentJourneySlug || !parentMilestoneId) {
      throw new VisibilityError(
        'Objective visibility requires both parent journey slug and milestone ID',
        VisibilityErrorCode.PARENT_NOT_FOUND,
        entityType
      );
    }
    const collection = await getJourneysCollection();
    const journey = await collection.findOne({ slug: parentJourneySlug });
    if (!journey) {
      throw new VisibilityError(
        `Parent journey '${parentJourneySlug}' not found`,
        VisibilityErrorCode.PARENT_NOT_FOUND,
        entityType
      );
    }
    const milestoneExists = journey.nodes.some(node => node.id === parentMilestoneId);
    if (!milestoneExists) {
      throw new VisibilityError(
        `Parent milestone '${parentMilestoneId}' not found in journey '${parentJourneySlug}'`,
        VisibilityErrorCode.PARENT_NOT_FOUND,
        entityType
      );
    }
    return;
  }
}

/**
 * Update visibility for an entity with parent validation and audit logging
 */
export async function updateVisibility(
  adminId: string,
  entityType: EntityType,
  entityId: string,
  isPublic: boolean,
  parentJourneySlug?: string,
  parentMilestoneId?: string
): Promise<VisibilitySetting> {
  await validateParentExists(entityType, parentJourneySlug, parentMilestoneId);

  const currentSetting = await getVisibility(entityType, entityId);
  const oldValue = currentSetting?.isPublic ?? null;

  await logVisibilityChange(
    adminId,
    entityType,
    entityId,
    oldValue,
    isPublic,
    parentJourneySlug,
    parentMilestoneId
  );

  const newSetting = await setVisibility({
    entityType,
    entityId,
    isPublic,
    parentJourneySlug,
    parentMilestoneId,
    updatedBy: adminId,
  });

  return newSetting;
}


/**
 * Get all publicly visible journeys
 */
export const getPublicJourneys = cache(async (): Promise<PublicJourney[]> => {
  const publicJourneySlugs = await findPublicEntities('journey');
  
  if (publicJourneySlugs.length === 0) {
    return [];
  }

  const collection = await getJourneysCollection();
  const journeys = await collection
    .find({ slug: { $in: publicJourneySlugs }, isActive: true })
    .toArray();

  const publicJourneys: PublicJourney[] = [];
  
  for (const journey of journeys) {
    const publicJourney = await filterJourneyForPublic(journey);
    if (publicJourney) {
      publicJourneys.push(publicJourney);
    }
  }

  return publicJourneys;
});

/**
 * Get a specific public journey by slug with filtered content
 */
export const getPublicJourneyBySlug = cache(async (
  slug: string
): Promise<PublicJourney | null> => {
  const isVisible = await isPubliclyVisible('journey', slug);
  if (!isVisible) {
    return null;
  }

  const collection = await getJourneysCollection();
  const journey = await collection.findOne({ slug, isActive: true });
  
  if (!journey) {
    return null;
  }

  return filterJourneyForPublic(journey);
});

/**
 * Filter journey content to only include publicly visible milestones and objectives
 */
async function filterJourneyForPublic(
  journey: JourneyDocument
): Promise<PublicJourney | null> {
  const slug = journey.slug;
  
  const milestoneSettings = await getVisibilityByParent('milestone', slug);
  const publicMilestoneIds = new Set(
    milestoneSettings
      .filter(s => s.isPublic)
      .map(s => s.entityId)
  );

  const publicNodes: PublicJourneyNode[] = [];
  
  for (const node of journey.nodes) {
    if (!publicMilestoneIds.has(node.id)) {
      continue;
    }

    const objectiveSettings = await getVisibilityByParent('objective', node.id);
    const publicObjectiveIndices = new Set(
      objectiveSettings
        .filter(s => s.isPublic)
        .map(s => parseInt(s.entityId.split('-').pop() || '0', 10))
    );

    const publicObjectives = node.learningObjectives.filter((_, index) => 
      publicObjectiveIndices.has(index)
    );

    publicNodes.push({
      id: node.id,
      title: node.title,
      description: node.description,
      type: node.type,
      position: node.position,
      learningObjectives: publicObjectives,
      estimatedMinutes: node.estimatedMinutes,
      difficulty: node.difficulty,
    });
  }

  const publicNodeIds = new Set(publicNodes.map(n => n.id));
  const publicEdges = journey.edges.filter(
    edge => publicNodeIds.has(edge.source) && publicNodeIds.has(edge.target)
  );

  return {
    slug: journey.slug,
    title: journey.title,
    description: journey.description,
    category: journey.category,
    difficulty: journey.difficulty,
    estimatedHours: journey.estimatedHours,
    nodes: publicNodes,
    edges: publicEdges,
  };
}


/**
 * Get visibility overview for admin UI
 */
export const getVisibilityOverview = cache(async (): Promise<VisibilityOverview> => {
  const collection = await getJourneysCollection();
  
  const journeys = await collection.find({ isActive: true }).toArray();
  
  const journeySlugs = journeys.map(r => r.slug);
  const journeyVisibility = await getVisibilityBatch('journey', journeySlugs);
  
  let totalMilestones = 0;
  let publicMilestones = 0;
  let totalObjectives = 0;
  let publicObjectives = 0;
  
  const journeyInfos: JourneyVisibilityInfo[] = [];
  
  for (const journey of journeys) {
    const visibility = journeyVisibility.get(journey.slug);
    const isPublic = visibility?.isPublic ?? false;
    
    const milestoneSettings = await getVisibilityByParent('milestone', journey.slug);
    const publicMilestoneCount = milestoneSettings.filter(s => s.isPublic).length;
    
    for (const node of journey.nodes) {
      totalMilestones++;
      if (milestoneSettings.some(s => s.entityId === node.id && s.isPublic)) {
        publicMilestones++;
      }
      
      const objectiveCount = node.learningObjectives.length;
      totalObjectives += objectiveCount;
      
      const objectiveSettings = await getVisibilityByParent('objective', node.id);
      publicObjectives += objectiveSettings.filter(s => s.isPublic).length;
    }
    
    journeyInfos.push({
      slug: journey.slug,
      title: journey.title,
      isPublic,
      milestoneCount: journey.nodes.length,
      publicMilestoneCount,
    });
  }
  
  return {
    journeys: journeyInfos,
    stats: {
      totalJourneys: journeys.length,
      publicJourneys: journeyInfos.filter(r => r.isPublic).length,
      totalMilestones,
      publicMilestones,
      totalObjectives,
      publicObjectives,
    },
  };
});

/**
 * Get detailed visibility information for a specific journey
 */
export const getJourneyVisibilityDetails = cache(async (
  journeySlug: string
): Promise<JourneyVisibilityDetails | null> => {
  const collection = await getJourneysCollection();
  const journey = await collection.findOne({ slug: journeySlug, isActive: true });
  
  if (!journey) {
    return null;
  }
  
  const journeyVisibility = await getVisibility('journey', journeySlug);
  const isJourneyPublic = journeyVisibility?.isPublic ?? false;
  
  const milestoneSettings = await getVisibilityByParent('milestone', journeySlug);
  const milestoneVisibilityMap = new Map(
    milestoneSettings.map(s => [s.entityId, s.isPublic])
  );
  
  const milestones: MilestoneVisibilityInfo[] = [];
  
  for (const node of journey.nodes) {
    const isMilestonePublic = milestoneVisibilityMap.get(node.id) ?? false;
    const effectivelyPublic = isJourneyPublic && isMilestonePublic;
    
    const objectiveSettings = await getVisibilityByParent('objective', node.id);
    const objectiveVisibilityMap = new Map(
      objectiveSettings.map(s => [s.entityId, s.isPublic])
    );
    
    const objectives: ObjectiveVisibilityInfo[] = node.learningObjectives.map(
      (obj, index) => {
        const objectiveId = `${node.id}-objective-${index}`;
        const isObjectivePublic = objectiveVisibilityMap.get(objectiveId) ?? false;
        
        return {
          index,
          title: typeof obj === 'string' ? obj : obj.title,
          isPublic: isObjectivePublic,
          effectivelyPublic: effectivelyPublic && isObjectivePublic,
        };
      }
    );
    
    milestones.push({
      nodeId: node.id,
      title: node.title,
      isPublic: isMilestonePublic,
      effectivelyPublic,
      objectives,
    });
  }
  
  return {
    journey: {
      slug: journey.slug,
      title: journey.title,
      isPublic: isJourneyPublic,
      milestoneCount: journey.nodes.length,
      publicMilestoneCount: milestoneSettings.filter(s => s.isPublic).length,
    },
    milestones,
  };
});
