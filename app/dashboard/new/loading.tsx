import { NewInterviewSkeleton } from "@/components/interview/new-interview-skeleton";

export default function NewInterviewLoading() {
  return (
    <main className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

      <NewInterviewSkeleton />
    </main>
  );
}
