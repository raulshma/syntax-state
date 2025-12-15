'use server';

import { auth } from '@clerk/nextjs/server';
import * as roadmapRepo from '@/lib/db/repositories/roadmap-repository';

export type SearchResultType = 'roadmap' | 'milestone' | 'topic' | 'optional' | 'objective';

export interface RoadmapSearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description?: string;
  roadmapSlug: string;
  roadmapTitle: string;
  nodeId?: string;
  nodeTitle?: string;
  lessonId?: string;
  keywords: string[];
}

/**
 * Get all searchable items for client-side fuzzy search
 * If roadmapSlug is provided, prioritizes that roadmap's items
 * Otherwise returns all roadmaps
 */
export async function getRoadmapSearchIndex(roadmapSlug?: string): Promise<RoadmapSearchResult[]> {
  const { userId } = await auth();
  if (!userId) {
    return [];
  }

  const roadmaps = await roadmapRepo.findAllRoadmaps();
  if (!roadmaps.length) {
    return [];
  }

  const results: RoadmapSearchResult[] = [];

  // Sort roadmaps to prioritize current roadmap
  const sortedRoadmaps = roadmapSlug
    ? [...roadmaps].sort((a, b) => {
        if (a.slug === roadmapSlug) return -1;
        if (b.slug === roadmapSlug) return 1;
        return 0;
      })
    : roadmaps;

  for (const roadmap of sortedRoadmaps) {
    // Add roadmap itself
    results.push({
      id: `roadmap-${roadmap.slug}`,
      type: 'roadmap',
      title: roadmap.title,
      description: roadmap.description,
      roadmapSlug: roadmap.slug,
      roadmapTitle: roadmap.title,
      keywords: [roadmap.category, ...roadmap.prerequisites],
    });

    // Add all nodes and objectives
    for (const node of roadmap.nodes) {
      results.push({
        id: `node-${roadmap.slug}-${node.id}`,
        type: node.type as SearchResultType,
        title: node.title,
        description: node.description,
        roadmapSlug: roadmap.slug,
        roadmapTitle: roadmap.title,
        nodeId: node.id,
        keywords: node.tags,
      });

      // Add learning objectives
      if (node.learningObjectives) {
        for (const objective of node.learningObjectives) {
          const objectiveTitle = typeof objective === 'string' ? objective : objective.title;
          const lessonId = typeof objective === 'string' ? undefined : objective.lessonId;

          results.push({
            id: `objective-${roadmap.slug}-${node.id}-${objectiveTitle}`,
            type: 'objective',
            title: objectiveTitle,
            roadmapSlug: roadmap.slug,
            roadmapTitle: roadmap.title,
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
