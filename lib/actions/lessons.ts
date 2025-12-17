'use server';

import fs from 'fs/promises';
import path from 'path';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import type { ExperienceLevel } from '@/lib/db/schemas/lesson-progress';
import type { LearningObjective } from '@/lib/db/schemas/journey';
import {
  type LessonMetadata,
  validateLessonMetadata,
  isSingleLevelLesson,
} from '@/lib/db/schemas/lesson-metadata';
import { objectiveToLessonSlug, getObjectiveTitle, getObjectiveLessonId } from '@/lib/utils/lesson-utils';
import { resolvePathWithinRoot } from '@/lib/utils/safe-path';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'lessons');

// Re-export type guard for use in other modules
export { isSingleLevelLesson };
export type { LessonMetadata };

/**
 * Get lesson metadata from JSON file
 * Supports both single-level and three-level lesson formats
 * 
 * Single-level format: has singleLevel: true with top-level estimatedMinutes/xpReward
 * Three-level format: has levels object with beginner/intermediate/advanced configs
 */
export async function getLessonMetadata(lessonPath: string): Promise<LessonMetadata | null> {
  try {
    const metadataPath = await resolvePathWithinRoot(CONTENT_DIR, lessonPath, 'metadata.json');
    if (!metadataPath) {
      return null;
    }
    const content = await fs.readFile(metadataPath, 'utf-8');
    const parsed = JSON.parse(content);
    
    // Validate and return typed metadata
    const metadata = validateLessonMetadata(parsed);
    if (!metadata) {
      console.error('Invalid lesson metadata format:', lessonPath);
      return null;
    }
    
    return metadata;
  } catch (error) {
    console.error('Failed to load lesson metadata:', error);
    return null;
  }
}

/**
 * Get MDX content for a specific lesson and experience level
 * Handles both single-level and three-level lesson formats
 * 
 * Single-level lessons: loads content.mdx (level parameter is ignored)
 * Three-level lessons: loads {level}.mdx with fallback to content.mdx
 * 
 * No caching during development to ensure fresh content
 */
export async function getLessonContent(lessonPath: string, level?: ExperienceLevel) {
  try {
    // Get metadata to determine lesson format
    const metadata = await getLessonMetadata(lessonPath);
    if (!metadata) {
      console.error('Could not load metadata for lesson:', lessonPath);
      return null;
    }
    
    // Determine which file to load based on format
    let fileName: string;
    
    if (isSingleLevelLesson(metadata)) {
      // Single-level lessons always use content.mdx
      // Level parameter is ignored for single-level lessons
      fileName = 'content.mdx';
    } else {
      // Three-level lessons use {level}.mdx
      // Validate the experience level to prevent injection in filename
      const validLevels: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];
      
      // For three-level lessons, level is required and must be valid
      // Default to 'beginner' if level is undefined (for backward compatibility)
      // But reject explicitly invalid levels
      if (level !== undefined && !validLevels.includes(level)) {
        console.error('Invalid experience level:', level);
        return null;
      }
      
      const effectiveLevel = level || 'beginner';
      fileName = `${effectiveLevel}.mdx`;
    }
    
    // Try to resolve the primary file path
    let mdxPath = await resolvePathWithinRoot(CONTENT_DIR, lessonPath, fileName);
    
    // Fallback: if level-specific file doesn't exist for three-level lessons, try content.mdx
    if (!mdxPath && !isSingleLevelLesson(metadata)) {
      mdxPath = await resolvePathWithinRoot(CONTENT_DIR, lessonPath, 'content.mdx');
    }
    
    if (!mdxPath) {
      console.error('Could not resolve MDX path for:', lessonPath, fileName);
      return null;
    }
    
    // Read fresh content from disk
    const source = await fs.readFile(mdxPath, 'utf-8');
    
    const mdxSource = await serialize(source, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug],
      },
    });
    
    return mdxSource;
  } catch (error) {
    console.error('Failed to load lesson content:', lessonPath, level, error);
    return null;
  }
}

/**
 * Check if a lesson exists
 */
export async function lessonExists(lessonPath: string): Promise<boolean> {
  try {
    const metadataPath = await resolvePathWithinRoot(CONTENT_DIR, lessonPath, 'metadata.json');
    if (!metadataPath) {
      return false;
    }
    await fs.access(metadataPath);
    return true;
  } catch {
    return false;
  }
}

import { buildLessonCandidatePaths } from '@/lib/utils/lesson-paths';

/**
 * Resolve lesson path from URL segments
 * Tries multiple path patterns to find the lesson
 */
export async function resolveLessonPath(
  milestoneId: string,
  lessonId: string,
  journeySlug?: string
): Promise<string | null> {
  const candidatePaths = buildLessonCandidatePaths(milestoneId, lessonId, journeySlug);
  
  for (const candidate of candidatePaths) {
    if (await lessonExists(candidate)) {
      return candidate;
    }
  }
  
  return null;
}

/**
 * Get all lesson paths for a milestone
 */
export async function getLessonsForMilestone(milestoneId: string) {
  try {
    const milestonePath = await resolvePathWithinRoot(CONTENT_DIR, milestoneId);
    if (!milestonePath) {
      return [];
    }
    const entries = await fs.readdir(milestonePath, { withFileTypes: true });
    
    const lessons = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const metadata = await getLessonMetadata(`${milestoneId}/${entry.name}`);
        if (metadata) {
          lessons.push({
            path: `${milestoneId}/${entry.name}`,
            ...metadata,
          });
        }
      }
    }
    
    return lessons.sort((a, b) => a.order - b.order);
  } catch (error) {
    // ENOENT is expected for milestones without lesson directories
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Failed to get lessons for milestone:', error);
    }
    return [];
  }
}

/**
 * Find lesson path from milestone and objective
 * Supports both string objectives and object objectives with lessonId
 */
export async function findLessonPath(milestoneId: string, objective: LearningObjective): Promise<string | null> {
  const objectiveTitle = getObjectiveTitle(objective);
  const lessonId = getObjectiveLessonId(objective);

  const candidatePaths: string[] = [];
  const seenPaths = new Set<string>();
  const addPath = (path?: string) => {
    if (!path) return;
    if (seenPaths.has(path)) return;
    seenPaths.add(path);
    candidatePaths.push(path);
  };

  const slugParts = lessonId.split('/').filter(Boolean);
  addPath(lessonId);

  if (!lessonId.startsWith(`${milestoneId}/`)) {
    addPath(`${milestoneId}/${lessonId}`);
  }

  if (slugParts.length > 1) {
    const trailing = slugParts.slice(1).join('/');
    addPath(trailing);
    addPath(`${milestoneId}/${trailing}`);
  }

  const finalSlug = slugParts[slugParts.length - 1];
  if (finalSlug) {
    addPath(`${milestoneId}/${finalSlug}`);
  }

  // For SQL journey: lessons are in sql/{lessonId}/ structure
  // Try sql/ prefix as a fallback for SQL lessons
  addPath(`sql/${lessonId}`);
  addPath(`sql/${finalSlug}`);

  // For EF Core journey: lessons are in entity-framework-core/{lessonId}/ structure
  // Try entity-framework-core/ prefix as a fallback for EF Core lessons
  addPath(`entity-framework-core/${lessonId}`);
  addPath(`entity-framework-core/${finalSlug}`);
  
  // Also try ef-core-introduction/ - this is where single-level EF Core lessons are stored
  addPath(`ef-core-introduction/${lessonId}`);
  addPath(`ef-core-introduction/${finalSlug}`);

  for (const candidate of candidatePaths) {
    if (await lessonExists(candidate)) {
      return candidate;
    }
  }

  // Try to find by listing lessons
  const lessons = await getLessonsForMilestone(milestoneId);
  const matchingLesson = lessons.find(
    (l) =>
      l.title.toLowerCase() === objectiveTitle.toLowerCase() ||
      l.id === lessonId
  );

  return matchingLesson?.path || null;
}

export interface ObjectiveLessonInfo {
  objective: string;
  lessonId: string;
  hasLesson: boolean;
  lessonPath?: string;
  /** True if this is a single-level lesson (no beginner/intermediate/advanced) */
  isSingleLevel?: boolean;
  /** XP rewards - for single-level, all three values are the same */
  xpRewards?: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  /** Estimated minutes - for single-level, all three values are the same */
  estimatedMinutes?: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

/**
 * Get lesson availability info for a list of objectives
 * Supports both string objectives and object objectives with lessonId
 * Handles both single-level and three-level lesson formats
 */
export async function getObjectivesWithLessons(
  milestoneId: string, 
  objectives: LearningObjective[]
): Promise<ObjectiveLessonInfo[]> {
  const results: ObjectiveLessonInfo[] = [];
  
  for (const objective of objectives) {
    const objectiveTitle = getObjectiveTitle(objective);
    const lessonId = getObjectiveLessonId(objective);
    const lessonPath = await findLessonPath(milestoneId, objective);
    
    if (lessonPath) {
      const metadata = await getLessonMetadata(lessonPath);
      
      if (metadata) {
        if (isSingleLevelLesson(metadata)) {
          // Single-level lesson: use top-level values for all levels
          results.push({
            objective: objectiveTitle,
            lessonId,
            hasLesson: true,
            lessonPath,
            isSingleLevel: true,
            xpRewards: {
              beginner: metadata.xpReward,
              intermediate: metadata.xpReward,
              advanced: metadata.xpReward,
            },
            estimatedMinutes: {
              beginner: metadata.estimatedMinutes,
              intermediate: metadata.estimatedMinutes,
              advanced: metadata.estimatedMinutes,
            },
          });
        } else {
          // Three-level lesson: use level-specific values
          results.push({
            objective: objectiveTitle,
            lessonId,
            hasLesson: true,
            lessonPath,
            isSingleLevel: false,
            xpRewards: {
              beginner: metadata.levels.beginner.xpReward,
              intermediate: metadata.levels.intermediate.xpReward,
              advanced: metadata.levels.advanced.xpReward,
            },
            estimatedMinutes: {
              beginner: metadata.levels.beginner.estimatedMinutes,
              intermediate: metadata.levels.intermediate.estimatedMinutes,
              advanced: metadata.levels.advanced.estimatedMinutes,
            },
          });
        }
        continue;
      }
    }
    
    results.push({
      objective: objectiveTitle,
      lessonId,
      hasLesson: false,
    });
  }
  
  return results;
}

/**
 * Get lesson availability for an entire journey
 * Optimized to reduce file system operations
 */
export async function getJourneyLessonAvailability(
  journey: { nodes: { id: string; learningObjectives?: LearningObjective[] }[] }
): Promise<Record<string, ObjectiveLessonInfo[]>> {
  const results: Record<string, ObjectiveLessonInfo[]> = {};
  
  // 1. Collect all unique milestones from nodes
  // In our system, the milestone ID is usually the first part of the lesson path
  // simpler for now: iterate all nodes with objectives
  
  const nodesWithObjectives = journey.nodes.filter(
    (n: { id: string; learningObjectives?: LearningObjective[] }) => n.learningObjectives && n.learningObjectives.length > 0
  );

  // We'll process in parallel but limited concurrency if needed.
  // Ideally, we want to batch this.
  
  // Group by milestone if possible to optimize FS reads?
  // Our structure is `content/lessons/{milestoneId}/{lessonSlug}`
  // So we can assume the node.id IS the milestone ID for milestone nodes, but what about topic nodes?
  
  // Strategy: Just run everything in parallel for now, but on server side it is much faster than client requests.
  // We can further optimize by reading directories once per unique milestone.
  
  await Promise.all(
    nodesWithObjectives.map(async (node: { id: string; learningObjectives?: LearningObjective[] }) => {
      // The node.id is traditionally used as the milestone directory for lessons associated with it
      // if the node is a milestone. If it's a topic, it might be nested?
      // Based on `JourneySidebar`, it calls `getObjectivesWithLessons(node.id, ...)`
      // So `node.id` is passed as `milestoneId`.
      
      const info = await getObjectivesWithLessons(node.id, node.learningObjectives || []);
      results[node.id] = info;
    })
  );
  
  return results;
}

/**
 * Normalize lesson path to full format (milestone/lesson)
 */
function normalizeLessonPath(prerequisite: string, currentMilestone: string): string {
  // If it already contains a slash, it's a full path
  if (prerequisite.includes('/')) {
    return prerequisite;
  }
  // Otherwise, assume it's in the same milestone
  return `${currentMilestone}/${prerequisite}`;
}

export interface NextLessonSuggestion {
  lessonPath: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  xpReward: number;
}

/**
 * Get next lesson suggestion based on prerequisites
 * Suggests lessons where all prerequisites are completed
 */
export interface AdjacentLesson {
  lessonPath: string;
  title: string;
  milestone: string;
}

export interface AdjacentLessons {
  previous: AdjacentLesson | null;
  next: AdjacentLesson | null;
}

/**
 * Get adjacent lessons (previous and next) for zen mode navigation
 */
export async function getAdjacentLessons(
  currentLessonPath: string
): Promise<AdjacentLessons> {
  try {
    const currentMetadata = await getLessonMetadata(currentLessonPath);
    if (!currentMetadata) {
      return { previous: null, next: null };
    }

    const [currentMilestone] = currentLessonPath.split('/');
    const milestoneLessons = await getLessonsForMilestone(currentMilestone);
    
    // Sort by order
    const sortedLessons = milestoneLessons.sort((a, b) => a.order - b.order);
    const currentIndex = sortedLessons.findIndex(l => l.path === currentLessonPath);
    
    if (currentIndex === -1) {
      return { previous: null, next: null };
    }

    const previousLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

    return {
      previous: previousLesson ? {
        lessonPath: previousLesson.path,
        title: previousLesson.title,
        milestone: currentMilestone,
      } : null,
      next: nextLesson ? {
        lessonPath: nextLesson.path,
        title: nextLesson.title,
        milestone: currentMilestone,
      } : null,
    };
  } catch (error) {
    console.error('Failed to get adjacent lessons:', error);
    return { previous: null, next: null };
  }
}

export async function getNextLessonSuggestion(
  currentLessonPath: string,
  currentLevel: ExperienceLevel,
  completedLessons: Array<{ lessonId: string; experienceLevel: string }>
): Promise<NextLessonSuggestion | null> {
  try {
    // Get current lesson metadata
    const currentMetadata = await getLessonMetadata(currentLessonPath);
    if (!currentMetadata) {
      return null;
    }

    const [currentMilestone] = currentLessonPath.split('/');
    
    // Get all lessons in the same milestone
    const milestoneLessons = await getLessonsForMilestone(currentMilestone);
    
    // Create a set of completed lesson paths for quick lookup
    const completedPaths = new Set(
      completedLessons
        .filter(l => l.experienceLevel === currentLevel)
        .map(l => l.lessonId)
    );
    
    // Add current lesson to completed set
    completedPaths.add(currentLessonPath);
    
    // Find lessons where:
    // 1. All prerequisites are completed
    // 2. The lesson itself is not completed
    // 3. Order is higher than current lesson (natural progression)
    const suggestions = milestoneLessons
      .filter(lesson => {
        const lessonPath = lesson.path;
        
        // Skip if already completed
        if (completedPaths.has(lessonPath)) {
          return false;
        }
        
        // Skip if order is not higher (we want natural progression)
        if (lesson.order <= currentMetadata.order) {
          return false;
        }
        
        // Check if all prerequisites are met
        const allPrerequisitesMet = lesson.prerequisites.every(prereq => {
          const normalizedPath = normalizeLessonPath(prereq, currentMilestone);
          return completedPaths.has(normalizedPath);
        });
        
        return allPrerequisitesMet;
      })
      .sort((a, b) => a.order - b.order); // Sort by order to get the next logical lesson
    
    // Return the first suggestion (next in sequence)
    if (suggestions.length > 0) {
      const nextLesson = suggestions[0];
      
      // Handle both single-level and three-level lessons
      let estimatedMinutes: number;
      let xpReward: number;
      
      if (isSingleLevelLesson(nextLesson)) {
        estimatedMinutes = nextLesson.estimatedMinutes;
        xpReward = nextLesson.xpReward;
      } else {
        estimatedMinutes = nextLesson.levels[currentLevel].estimatedMinutes;
        xpReward = nextLesson.levels[currentLevel].xpReward;
      }
      
      return {
        lessonPath: nextLesson.path,
        title: nextLesson.title,
        description: nextLesson.description,
        estimatedMinutes,
        xpReward,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get next lesson suggestion:', error);
    return null;
  }
}

// ============================================================================
// Next Lesson Navigation (Journey-aware)
// ============================================================================

import * as journeyRepo from '@/lib/db/repositories/journey-repository';
import type { JourneyNode, JourneyEdge, LearningObjective as JourneyLearningObjective } from '@/lib/db/schemas/journey';

/**
 * Navigation info for the "Go to Next Lesson" button
 */
export interface NextLessonNavigation {
  lessonPath: string;
  title: string;
  milestone: string;
  milestoneTitle: string;
  nodeType: 'milestone' | 'topic' | 'optional';
}

/** Edge priority for navigation (lower = higher priority) */
const EDGE_PRIORITY: Record<string, number> = {
  sequential: 1,
  recommended: 2,
  optional: 3,
};

/**
 * Get the next lesson based on journey structure
 * 
 * Priority:
 * 1. Next sibling objective in the same node
 * 2. First objective of the target node via edges (sequential > recommended > optional)
 * 3. null if no next lesson found
 * 
 * Performance: Uses cached journey data from repository
 */
export async function getNextLessonNavigation(
  currentLessonPath: string,
  milestoneId: string,
  journeySlug: string
): Promise<NextLessonNavigation | null> {
  try {
    // Fetch journey (cached by React cache())
    const journey = await journeyRepo.findJourneyBySlug(journeySlug);
    if (!journey) {
      return null;
    }

    // Find the current node containing this lesson
    const currentNode = journey.nodes.find(node => node.id === milestoneId);
    if (!currentNode || !currentNode.learningObjectives) {
      return null;
    }

    // Find current objective index within the node
    const currentObjectiveIndex = findObjectiveIndexInNode(
      currentNode.learningObjectives,
      currentLessonPath
    );

    // Strategy 1: Check for next sibling objective in same node
    const siblingResult = await findNextSiblingLesson(
      currentNode,
      currentObjectiveIndex,
      milestoneId
    );
    if (siblingResult) {
      return siblingResult;
    }

    // Strategy 2: Follow edges to find next node
    const edgeResult = await findNextNodeLesson(
      journey.nodes,
      journey.edges,
      milestoneId
    );
    if (edgeResult) {
      return edgeResult;
    }

    return null;
  } catch (error) {
    console.error('Failed to get next lesson navigation:', error);
    return null;
  }
}

/** Find the index of an objective by its lessonId */
function findObjectiveIndexInNode(
  objectives: JourneyLearningObjective[],
  lessonPath: string
): number {
  const lessonSlug = lessonPath.split('/').pop() || '';
  
  return objectives.findIndex(obj => {
    if (typeof obj === 'string') {
      return objectiveToLessonSlug(obj) === lessonSlug;
    }
    return obj.lessonId === lessonSlug || 
           obj.lessonId === lessonPath ||
           objectiveToLessonSlug(obj.title) === lessonSlug;
  });
}

/** Find the next sibling objective with a lesson in the same node */
async function findNextSiblingLesson(
  node: JourneyNode,
  currentIndex: number,
  milestoneId: string
): Promise<NextLessonNavigation | null> {
  if (!node.learningObjectives || currentIndex < 0) {
    return null;
  }

  // Check remaining objectives after current
  for (let i = currentIndex + 1; i < node.learningObjectives.length; i++) {
    const objective = node.learningObjectives[i];
    const lessonPath = await findLessonPath(milestoneId, objective);
    
    if (lessonPath) {
      const metadata = await getLessonMetadata(lessonPath);
      if (metadata) {
        return {
          lessonPath,
          title: metadata.title,
          milestone: milestoneId,
          milestoneTitle: node.title,
          nodeType: node.type as 'milestone' | 'topic' | 'optional',
        };
      }
    }
  }

  return null;
}

/** Find the first lesson in the next connected node via edges */
async function findNextNodeLesson(
  nodes: JourneyNode[],
  edges: JourneyEdge[],
  currentNodeId: string
): Promise<NextLessonNavigation | null> {
  // Get outgoing edges from current node, sorted by priority
  const outgoingEdges = edges
    .filter(edge => edge.source === currentNodeId)
    .sort((a, b) => (EDGE_PRIORITY[a.type] || 99) - (EDGE_PRIORITY[b.type] || 99));

  // Try each target node in priority order
  for (const edge of outgoingEdges) {
    const targetNode = nodes.find(n => n.id === edge.target);
    if (!targetNode || !targetNode.learningObjectives?.length) {
      continue;
    }

    // Find first objective with a lesson in target node
    for (const objective of targetNode.learningObjectives) {
      const lessonPath = await findLessonPath(targetNode.id, objective);
      
      if (lessonPath) {
        const metadata = await getLessonMetadata(lessonPath);
        if (metadata) {
          return {
            lessonPath,
            title: metadata.title,
            milestone: targetNode.id,
            milestoneTitle: targetNode.title,
            nodeType: targetNode.type as 'milestone' | 'topic' | 'optional',
          };
        }
      }
    }
  }

  return null;
}

