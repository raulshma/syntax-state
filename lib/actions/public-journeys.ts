'use server';

/**
 * Public Journey Server Actions
 * Handles public journey access for unauthenticated users
 * 
 * These actions do NOT require authentication - they are designed for
 * unauthenticated visitors to preview publicly visible journeys.
 */

import {
  getPublicJourneys as getPublicJourneysService,
  getPublicJourneyBySlug as getPublicJourneyBySlugService,
} from '@/lib/services/visibility-service';
import type { PublicJourney } from '@/lib/db/schemas/visibility';

/**
 * Get all publicly visible journeys
 * 
 * No authentication required - this is for unauthenticated visitors.
 * Returns only journeys that have been explicitly marked as public by admins.
 * 
 * @returns Array of public journeys with filtered content
 */
export async function getPublicJourneys(): Promise<PublicJourney[]> {
  try {
    const journeys = await getPublicJourneysService();
    return journeys;
  } catch (error) {
    console.error('getPublicJourneys error:', error);
    return [];
  }
}

/**
 * Get a specific public journey by slug
 * 
 * No authentication required - this is for unauthenticated visitors.
 * Returns null for private journeys (not an error) to avoid revealing existence.
 * Content is filtered to only include publicly visible milestones and objectives.
 * 
 * @param slug - The journey slug to retrieve
 * @returns Public journey with filtered content, or null if not public/not found
 */
export async function getPublicJourneyBySlug(
  slug: string
): Promise<PublicJourney | null> {
  try {
    if (!slug || typeof slug !== 'string') {
      return null;
    }

    const journey = await getPublicJourneyBySlugService(slug);
    return journey;
  } catch (error) {
    console.error('getPublicJourneyBySlug error:', error);
    return null;
  }
}
