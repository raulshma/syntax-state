'use client';

import { useEffect } from 'react';
import { useSharedHeader } from '@/components/dashboard/shared-header-context';
import { JourneyClient } from './journey-client';
import type { Journey } from '@/lib/db/schemas/journey';
import type { UserJourneyProgress } from '@/lib/db/schemas/user-journey-progress';
import type { ObjectiveLessonInfo } from '@/lib/actions/lessons';
import type { UserGamification } from '@/lib/db/schemas/user';
import type { SubJourneyProgressInfo } from '@/lib/actions/journey';

interface JourneyPageClientProps {
  initialJourney: Journey;
  initialProgress: UserJourneyProgress | null;
  initialLessonAvailability: Record<string, ObjectiveLessonInfo[]>;
  initialGamification: UserGamification | null;
  parentJourney?: Journey | null;
  subJourneyProgressMap?: Record<string, SubJourneyProgressInfo>;
}

export function JourneyPageClient({
  initialJourney,
  initialProgress,
  initialLessonAvailability,
  initialGamification,
  parentJourney,
  subJourneyProgressMap = {},
}: JourneyPageClientProps) {
  const { hideHeader } = useSharedHeader();

  useEffect(() => {
    hideHeader();
  }, [hideHeader]);

  return (
    <div className="h-[calc(100vh-4rem)]">
      <JourneyClient
        initialJourney={initialJourney}
        initialProgress={initialProgress}
        initialLessonAvailability={initialLessonAvailability}
        initialGamification={initialGamification}
        parentJourney={parentJourney}
        subJourneyProgressMap={subJourneyProgressMap}
      />
    </div>
  );
}
