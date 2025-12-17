'use server';

import { allJourneys } from '@/lib/data/journeys';
import { upsertJourneyBySlug } from '@/lib/db/repositories/journey-repository';

/**
 * Seed all predefined journeys into the database.
 * Uses upsert to avoid duplicates - safe to run multiple times.
 */
export async function seedJourneys(): Promise<{ seeded: number; slugs: string[] }> {
  const slugs: string[] = [];
  
  for (const journey of allJourneys) {
    await upsertJourneyBySlug(journey);
    slugs.push(journey.slug);
    console.log(`[Seed] Upserted journey: ${journey.slug}`);
  }
  
  return { seeded: slugs.length, slugs };
}

/**
 * Check if journeys need seeding (for auto-seed on first run)
 */
export async function checkAndSeedJourneys(): Promise<boolean> {
  const { findAllJourneys } = await import('@/lib/db/repositories/journey-repository');
  const existing = await findAllJourneys();
  
  if (existing.length === 0) {
    console.log('[Seed] No journeys found, seeding...');
    await seedJourneys();
    return true;
  }
  
  return false;
}
