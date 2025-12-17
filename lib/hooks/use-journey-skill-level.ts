'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ExperienceLevel } from '@/lib/db/schemas/lesson-progress';

/**
 * Persist skill level selection per journey
 * When a user selects a skill level in a lesson, it's saved for that journey
 * so subsequent lessons in the same journey auto-load at that level
 */

const STORAGE_KEY_PREFIX = 'journey_skill_level_';

/**
 * Get the storage key for a journey's skill level
 */
function getStorageKey(journeySlug: string): string {
  return `${STORAGE_KEY_PREFIX}${journeySlug}`;
}

/**
 * Get the persisted skill level for a journey
 * Returns null if no level has been persisted
 */
export function getJourneySkillLevel(journeySlug: string): ExperienceLevel | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(getStorageKey(journeySlug));
  if (!stored) return null;
  
  // Validate it's a valid experience level
  if (['beginner', 'intermediate', 'advanced'].includes(stored)) {
    return stored as ExperienceLevel;
  }
  
  return null;
}

/**
 * Save the skill level for a journey
 */
export function saveJourneySkillLevel(journeySlug: string, level: ExperienceLevel): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(getStorageKey(journeySlug), level);
  
  // Dispatch event for same-tab listeners
  try {
    window.dispatchEvent(
      new CustomEvent('journey-skill-level-changed', {
        detail: { journeySlug, level },
      })
    );
  } catch {
    // Ignore if CustomEvent is not available
  }
}

/**
 * Clear the skill level for a journey
 */
export function clearJourneySkillLevel(journeySlug: string): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(getStorageKey(journeySlug));
}

/**
 * Hook to manage skill level for a journey
 * Provides reactive state that updates when the level changes
 */
export function useJourneySkillLevel(journeySlug: string) {
  const [level, setLevelState] = useState<ExperienceLevel | null>(() => 
    getJourneySkillLevel(journeySlug)
  );
  
  // Update state when storage changes (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === getStorageKey(journeySlug)) {
        const newLevel = e.newValue as ExperienceLevel | null;
        if (newLevel && ['beginner', 'intermediate', 'advanced'].includes(newLevel)) {
          setLevelState(newLevel);
        } else {
          setLevelState(null);
        }
      }
    };
    
    // Handle same-tab updates
    const handleCustomEvent = (e: CustomEvent<{ journeySlug: string; level: ExperienceLevel }>) => {
      if (e.detail.journeySlug === journeySlug) {
        setLevelState(e.detail.level);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('journey-skill-level-changed', handleCustomEvent as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('journey-skill-level-changed', handleCustomEvent as EventListener);
    };
  }, [journeySlug]);
  
  const setLevel = useCallback((newLevel: ExperienceLevel) => {
    saveJourneySkillLevel(journeySlug, newLevel);
    setLevelState(newLevel);
  }, [journeySlug]);
  
  const clearLevel = useCallback(() => {
    clearJourneySkillLevel(journeySlug);
    setLevelState(null);
  }, [journeySlug]);
  
  return {
    level,
    setLevel,
    clearLevel,
    /** Get the effective level (persisted or default to beginner) */
    effectiveLevel: level ?? 'beginner' as ExperienceLevel,
  };
}
