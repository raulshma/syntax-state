import { Suspense } from "react";
import {
  getDashboardData,
  type DashboardInterviewData,
} from "@/lib/actions/dashboard";
import { getActiveLearningPath } from "@/lib/actions/learning-path";
import { DashboardPageContent } from "@/components/dashboard/dashboard-page-content";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

// Re-export for backward compatibility with components
export type InterviewWithMeta = DashboardInterviewData;

export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardDataLoader />
    </Suspense>
  );
}

async function DashboardDataLoader() {
  const [dashboardData, learningPathResult] = await Promise.all([
    getDashboardData(),
    getActiveLearningPath(),
  ]);

  const { interviews, stats, sidebar } = dashboardData;
  const learningPath = learningPathResult.success
    ? learningPathResult.data
    : null;

  return (
    <DashboardPageContent
      interviews={interviews}
      stats={stats}
      learningPath={learningPath}
      plan={sidebar.usage.plan}
    />
  );
}
