/**
 * Lesson utility functions
 * These are NOT server actions, just helper functions
 */

import type { LearningObjective } from '@/lib/db/schemas/roadmap';

/**
 * Convert objective title to lesson slug
 */
export function objectiveToLessonSlug(objective: string): string {
  return objective
    .toLowerCase()
    .replace(/[?]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Get the title from a learning objective (handles both string and object formats)
 */
export function getObjectiveTitle(objective: LearningObjective): string {
  return typeof objective === 'string' ? objective : objective.title;
}

/**
 * Get the lesson ID from a learning objective (handles both string and object formats)
 * Returns the explicit lessonId if available, otherwise derives from title
 */
export function getObjectiveLessonId(objective: LearningObjective): string {
  if (typeof objective === 'string') {
    return objectiveToLessonSlug(objective);
  }
  return objective.lessonId || objectiveToLessonSlug(objective.title);
}

/**
 * Normalize learning objectives to strings (for backward compatibility)
 */
export function normalizeObjectives(objectives: LearningObjective[]): string[] {
  return objectives.map(getObjectiveTitle);
}
