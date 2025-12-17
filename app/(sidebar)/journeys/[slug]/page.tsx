import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getJourney,
  getAuthUserId,
  getJourneyProgress,
  getParentJourney,
  getSubJourneyProgressMap,
  getJourneyLessonAvailability,
  getUserGamification,
  preloadJourneyData,
} from '@/lib/data/journey';
import { JourneyPageClient } from './journey-page-client';
import { JourneyPageSkeleton } from '@/components/journey';

interface JourneyPageProps {
  params: Promise<{ slug: string }>;
}

// Preload data as early as possible
export default async function JourneyPage({ params }: JourneyPageProps) {
  const { slug } = await params;
  
  // Start preloading immediately
  preloadJourneyData(slug);

  return (
    <Suspense fallback={<JourneyPageSkeleton />}>
      <JourneyContent slug={slug} />
    </Suspense>
  );
}

// Async server component that streams in after data loads
async function JourneyContent({ slug }: { slug: string }) {
  // Fetch journey first (needed to determine sub-journey slugs)
  const journey = await getJourney(slug);
  
  if (!journey) {
    notFound();
  }

  // Get user ID for progress queries
  const userId = await getAuthUserId();

  // Extract sub-journey slugs for progress map
  const subJourneySlugs = journey.nodes
    .filter((node) => node.subJourneySlug)
    .map((node) => node.subJourneySlug as string);

  // Parallel fetch all remaining data
  const [progress, parentJourney, subJourneyProgressMap, lessonAvailability, gamification] =
    await Promise.all([
      userId ? getJourneyProgress(userId, slug) : null,
      getParentJourney(journey.parentJourneySlug),
      userId && subJourneySlugs.length > 0
        ? getSubJourneyProgressMap(subJourneySlugs)
        : {},
      getJourneyLessonAvailability(journey),
      getUserGamification(),
    ]);

  return (
    <JourneyPageClient
      initialJourney={journey}
      initialProgress={progress}
      initialLessonAvailability={lessonAvailability}
      initialGamification={gamification}
      parentJourney={parentJourney}
      subJourneyProgressMap={subJourneyProgressMap}
    />
  );
}

// Metadata uses cached getJourney - no duplicate fetch
export async function generateMetadata({ params }: JourneyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const journey = await getJourney(slug);

  if (!journey) {
    return { title: 'Journey Not Found' };
  }

  return {
    title: `${journey.title} | Learning Journey`,
    description: journey.description,
  };
}
