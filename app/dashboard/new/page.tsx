import { Suspense } from "react";
import { getIterationStatus } from "@/lib/actions/user";
import { NewInterviewContent } from "@/components/interview/new-interview-content";
import { NewInterviewSkeleton } from "@/components/interview/new-interview-skeleton";

async function getUsageData() {
  const result = await getIterationStatus();
  if (!result.success) {
    return {
      interviews: { count: 0, limit: 3 },
      plan: "FREE" as const,
      isByok: false,
    };
  }
  return {
    interviews: {
      count: result.data.interviews.count,
      limit: result.data.interviews.limit,
    },
    plan: result.data.plan,
    isByok: result.data.isByok,
  };
}

export default async function NewInterviewPage() {
  const usageData = await getUsageData();

  return (
    <main className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
      {/* Background effects - matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

      {/* Floating gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />

      <Suspense fallback={<NewInterviewSkeleton />}>
        <NewInterviewContent usageData={usageData} />
      </Suspense>
    </main>
  );
}
