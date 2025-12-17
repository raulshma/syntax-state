import { cache } from 'react';
import 'server-only';
import { auth } from '@clerk/nextjs/server';
import * as journeyRepo from '@/lib/db/repositories/journey-repository';
import { userJourneyProgressRepository as progressRepo } from '@/lib/db/repositories/user-journey-progress-repository';
import type { Journey } from '@/lib/db/schemas/journey';
import type { UserJourneyProgress } from '@/lib/db/schemas/user-journey-progress';
import type { ObjectiveLessonInfo } from '@/lib/actions/lessons';
import type { SubJourneyProgressInfo } from '@/lib/actions/journey';

/**
 * Cached data fetching functions for Journey pages
 * Using React cache() for request deduplication across generateMetadata and page render
 */

// Cache the journey fetch - shared between metadata and page
export const getJourney = cache(async (slug: string): Promise<Journey | null> => {
  return journeyRepo.findJourneyBySlug(slug);
});

// Cache user auth - prevents multiple auth() calls
export const getAuthUserId = cache(async (): Promise<string | null> => {
  const { userId } = await auth();
  return userId;
});

// Cache user progress for a journey
export const getJourneyProgress = cache(
  async (userId: string, slug: string): Promise<UserJourneyProgress | null> => {
    return progressRepo.findByUserAndSlug(userId, slug);
  }
);

// Cache parent journey lookup
export const getParentJourney = cache(
  async (parentSlug: string | undefined): Promise<Journey | null> => {
    if (!parentSlug) return null;
    return journeyRepo.findJourneyBySlug(parentSlug);
  }
);

// Cache sub-journey progress map
export const getSubJourneyProgressMap = cache(
  async (subJourneySlugs: string[]): Promise<Record<string, SubJourneyProgressInfo>> => {
    if (subJourneySlugs.length === 0) return {};
    
    const { getSubJourneyProgressMap: fetchProgressMap } = await import('@/lib/actions/journey');
    return fetchProgressMap(subJourneySlugs);
  }
);

// Cache lesson availability
export const getJourneyLessonAvailability = cache(
  async (journey: Journey): Promise<Record<string, ObjectiveLessonInfo[]>> => {
    const { getJourneyLessonAvailability: fetchAvailability } = await import('@/lib/actions/lessons');
    return fetchAvailability(journey);
  }
);

// Cache gamification data
export const getUserGamification = cache(async () => {
  const { getUserGamificationAction } = await import('@/lib/actions/gamification');
  return getUserGamificationAction();
});

/**
 * Preload functions for eager data fetching
 * Call these early to start fetching before the data is needed
 */
export const preloadJourney = (slug: string) => {
  void getJourney(slug);
};

export const preloadJourneyData = (slug: string) => {
  void getJourney(slug);
  void getAuthUserId();
  void getUserGamification();
};
