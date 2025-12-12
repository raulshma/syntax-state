import { Map } from 'lucide-react';
import { getRoadmaps } from '@/lib/actions/roadmap';
import { checkAndSeedRoadmaps } from '@/lib/actions/seed-roadmaps';
import { getUserGamificationAction } from '@/lib/actions/gamification';
import { RoadmapsPageClient } from '@/components/roadmap/roadmaps-page-client';
import { RoadmapCard } from '@/components/roadmap/roadmap-card';
import { RoadmapListStatsHeader } from '@/components/roadmap/roadmap-stats-header';

export default async function RoadmapsPage() {
  // Auto-seed roadmaps if none exist
  await checkAndSeedRoadmaps();

  const [{ roadmaps, progressMap }, gamification] = await Promise.all([
    getRoadmaps(),
    getUserGamificationAction(),
  ]);

  return (
    <RoadmapsPageClient>
      <div className="flex-1 flex flex-col">
        {/* User Stats Header */}
        <RoadmapListStatsHeader
          gamification={gamification}
          progressMap={progressMap}
          totalRoadmaps={roadmaps.length}
        />

        {/* Content */}
        <div className="flex-1">
          {roadmaps.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-3xl bg-secondary/30 flex items-center justify-center mx-auto mb-6">
                <Map className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No roadmaps available</h2>
              <p className="text-muted-foreground">Check back soon for new learning paths!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {roadmaps.map((roadmap) => {
                const progress = progressMap[roadmap.slug];
                const progressPercent = progress?.overallProgress || 0;
                const isStarted = !!progress;

                return (
                  <RoadmapCard
                    key={roadmap._id}
                    roadmap={roadmap}
                    progressPercent={progressPercent}
                    isStarted={isStarted}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </RoadmapsPageClient>
  );
}
