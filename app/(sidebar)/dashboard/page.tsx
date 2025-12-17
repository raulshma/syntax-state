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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : undefined;
  const status = typeof resolvedSearchParams.status === "string" ? (resolvedSearchParams.status as any) : undefined;
  
  // Note: key={JSON.stringify(resolvedSearchParams)} ensures suspense boundary resets on param change
  return (
    <Suspense fallback={<DashboardSkeleton />} key={JSON.stringify(resolvedSearchParams)}>
      <DashboardDataLoader page={page} search={search} status={status} />
    </Suspense>
  );
}

async function DashboardDataLoader({ 
  page, 
  search, 
  status 
}: { 
  page: number; 
  search?: string; 
  status?: 'active' | 'completed' | 'all';
}) {
  const dashboardData = await getDashboardData(page, search, status);

  const { interviews, stats, sidebar, learningPath, journeyProgress, totalInterviews } = dashboardData;

  return (
    <DashboardPageContent
      interviews={interviews}
      totalInterviews={totalInterviews}
      stats={stats}
      learningPath={learningPath}
      journeyProgress={journeyProgress}
      plan={sidebar.usage.plan}
      currentPage={page}
    />
  );
}
