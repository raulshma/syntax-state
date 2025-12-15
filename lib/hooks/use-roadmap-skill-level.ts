'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ExperienceLevel } from '@/lib/db/schemas/lesson-progress';

/**
 * Persist skill level selection per roadmap
 * When a user selects a skill level in a lesson, it's saved for that roadmap
 * so subsequent lessons in the same roadmap auto-load at that level
 */

const STORAGE_KEY_PREFIX = 'roadmap_skill_level_';

/**
 * Get the storage key for a roadmap's skill level
 */
function getStorageKey(roadmapSlug: string): string {
  return `${STORAGE_KEY_PREFIX}${roadmapSlug}`;
}

/**
 * Get the persisted skill level for a roadmap
 * Returns null if no level has been persisted
 */
export function getRoadmapSkillLevel(roadmapSlug: string): ExperienceLevel | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(getStorageKey(roadmapSlug));
  if (!stored) return null;
  
  // Validate it's a valid experience level
  if (['beginner', 'intermediate', 'advanced'].includes(stored)) {
    return stored as ExperienceLevel;
  }
  
  return null;
}

/**
 * Save the skill level for a roadmap
 */
export function saveRoadmapSkillLevel(roadmapSlug: string, level: ExperienceLevel): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(getStorageKey(roadmapSlug), level);
  
  // Dispatch event for same-tab listeners
  try {
    window.dispatchEvent(
      new CustomEvent('roadmap-skill-level-changed', {
        detail: { roadmapSlug, level },
      })
    );
  } catch {
    // Ignore if CustomEvent is not available
  }
}

/**
 * Clear the skill level for a roadmap
 */
export function clearRoadmapSkillLevel(roadmapSlug: string): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(getStorageKey(roadmapSlug));
}

/**
 * Hook to manage skill level for a roadmap
 * Provides reactive state that updates when the level changes
 */
export function useRoadmapSkillLevel(roadmapSlug: string) {
  const [level, setLevelState] = useState<ExperienceLevel | null>(() => 
    getRoadmapSkillLevel(roadmapSlug)
  );
  
  // Update state when storage changes (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === getStorageKey(roadmapSlug)) {
        const newLevel = e.newValue as ExperienceLevel | null;
        if (newLevel && ['beginner', 'intermediate', 'advanced'].includes(newLevel)) {
          setLevelState(newLevel);
        } else {
          setLevelState(null);
        }
      }
    };
    
    // Handle same-tab updates
    const handleCustomEvent = (e: CustomEvent<{ roadmapSlug: string; level: ExperienceLevel }>) => {
      if (e.detail.roadmapSlug === roadmapSlug) {
        setLevelState(e.detail.level);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('roadmap-skill-level-changed', handleCustomEvent as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('roadmap-skill-level-changed', handleCustomEvent as EventListener);
    };
  }, [roadmapSlug]);
  
  const setLevel = useCallback((newLevel: ExperienceLevel) => {
    saveRoadmapSkillLevel(roadmapSlug, newLevel);
    setLevelState(newLevel);
  }, [roadmapSlug]);
  
  const clearLevel = useCallback(() => {
    clearRoadmapSkillLevel(roadmapSlug);
    setLevelState(null);
  }, [roadmapSlug]);
  
  return {
    level,
    setLevel,
    clearLevel,
    /** Get the effective level (persisted or default to beginner) */
    effectiveLevel: level ?? 'beginner' as ExperienceLevel,
  };
}
