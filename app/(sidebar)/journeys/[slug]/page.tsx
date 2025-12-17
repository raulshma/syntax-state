import { notFound } from 'next/navigation';
import { getJourneyWithProgress } from '@/lib/actions/journey';
import { getUserGamificationAction } from '@/lib/actions/gamification';
import { JourneyPageClient } from './journey-page-client';

interface JourneyPageProps {
  params: Promise<{ slug: string }>;
}

export default async function JourneyPage({ params }: JourneyPageProps) {
  const { slug } = await params;
  const [{ journey, progress, lessonAvailability, parentJourney, subJourneyProgressMap }, gamification] = await Promise.all([
    getJourneyWithProgress(slug),
    getUserGamificationAction(),
  ]);
  
  if (!journey) {
    notFound();
  }
  
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

export async function generateMetadata({ params }: JourneyPageProps) {
  const { slug } = await params;
  const { journey } = await getJourneyWithProgress(slug);
  
  if (!journey) {
    return { title: 'Journey Not Found' };
  }
  
  return {
    title: `${journey.title} | Learning Journey`,
    description: journey.description,
  };
}

