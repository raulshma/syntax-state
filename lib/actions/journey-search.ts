'use server';

import { auth } from '@clerk/nextjs/server';
import * as journeyRepo from '@/lib/db/repositories/journey-repository';

export type SearchResultType = 'journey' | 'milestone' | 'topic' | 'optional' | 'objective';

export interface JourneySearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description?: string;
  journeySlug: string;
  journeyTitle: string;
  nodeId?: string;
  nodeTitle?: string;
  lessonId?: string;
  keywords: string[];
}

/**
 * Get all searchable items for client-side fuzzy search
 * If journeySlug is provided, prioritizes that journey's items
 * Otherwise returns all journeys
 */
export async function getJourneySearchIndex(journeySlug?: string): Promise<JourneySearchResult[]> {
  const { userId } = await auth();
  if (!userId) {
    return [];
  }

  const journeys = await journeyRepo.findAllJourneys();
  if (!journeys.length) {
    return [];
  }

  const results: JourneySearchResult[] = [];

  // Sort journeys to prioritize current journey
  const sortedJourneys = journeySlug
    ? [...journeys].sort((a, b) => {
        if (a.slug === journeySlug) return -1;
        if (b.slug === journeySlug) return 1;
        return 0;
      })
    : journeys;

  for (const journey of sortedJourneys) {
    // Add journey itself
    results.push({
      id: `journey-${journey.slug}`,
      type: 'journey',
      title: journey.title,
      description: journey.description,
      journeySlug: journey.slug,
      journeyTitle: journey.title,
      keywords: [journey.category, ...journey.prerequisites],
    });

    // Add all nodes and objectives
    for (const node of journey.nodes) {
      results.push({
        id: `node-${journey.slug}-${node.id}`,
        type: node.type as SearchResultType,
        title: node.title,
        description: node.description,
        journeySlug: journey.slug,
        journeyTitle: journey.title,
        nodeId: node.id,
        keywords: node.tags,
      });

      // Add learning objectives
      if (node.learningObjectives) {
        for (const objective of node.learningObjectives) {
          const objectiveTitle = typeof objective === 'string' ? objective : objective.title;
          const lessonId = typeof objective === 'string' ? undefined : objective.lessonId;

          results.push({
            id: `objective-${journey.slug}-${node.id}-${objectiveTitle}`,
            type: 'objective',
            title: objectiveTitle,
            journeySlug: journey.slug,
            journeyTitle: journey.title,
            nodeId: node.id,
            nodeTitle: node.title,
            lessonId,
            keywords: [node.title, ...node.tags],
          });
        }
      }
    }
  }

  return results;
}
