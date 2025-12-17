import { StatsGridSkeleton, TabsSkeleton } from "@/components/admin/admin-skeletons";

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <StatsGridSkeleton />
      <TabsSkeleton />
    </div>
  );
}
