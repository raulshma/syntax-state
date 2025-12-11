import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-lg shadow-black/5 bg-card rounded-3xl overflow-hidden h-40">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-lg" />
                <Skeleton className="h-8 w-32 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Stats Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-md bg-card/50 rounded-2xl overflow-hidden h-24">
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-32 rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Tab Content Skeleton */}
        <Card className="border-0 shadow-xl bg-card/80  rounded-3xl overflow-hidden min-h-[500px]">
          <CardHeader className="p-8 border-b border-border/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64 rounded-lg" />
                <Skeleton className="h-4 w-96 rounded-lg" />
              </div>
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full rounded-lg" />
                  <Skeleton className="h-4 w-2/3 rounded-lg" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
