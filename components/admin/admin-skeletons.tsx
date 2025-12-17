import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StatsGridSkeleton() {
  return (
    <div className="space-y-8">
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
    </div>
  );
}

export function TabsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 justify-center">
        <div className="bg-secondary/50 p-1.5 rounded-full inline-flex">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-full mx-0.5" />
          ))}
        </div>
      </div>
      <Card className="border-0 shadow-xl bg-card/80 rounded-3xl overflow-hidden min-h-[500px]">
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
  );
}

export function UsersTabSkeleton() {
  return (
    <Card className="border-0 shadow-xl bg-card/80 rounded-3xl overflow-hidden">
      <CardHeader className="border-b border-border/50 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-lg" />
          </div>
          <Skeleton className="h-11 w-72 rounded-xl" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-48 rounded" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-lg bg-card rounded-3xl overflow-hidden">
            <CardHeader className="p-6">
              <Skeleton className="h-6 w-40 rounded-lg" />
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <Skeleton className="h-64 w-full rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ModelConfigSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-xl bg-card/80 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-border/50 p-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-6 w-48 rounded-lg" />
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AIMonitoringSkeleton() {
  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-lg bg-card/80 rounded-2xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-secondary/50 p-1.5 rounded-full inline-flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-full" />
          ))}
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="border-0 shadow-xl bg-card/80 rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-border/50 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40 rounded-lg" />
              <Skeleton className="h-4 w-64 rounded" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-32 rounded-xl" />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-secondary/20 rounded-2xl">
              <Skeleton className="h-6 w-24 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-3 w-2/3 rounded" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function VisibilitySkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Card */}
      <Card className="border-0 shadow-xl bg-card/80 rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-border/50 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-1">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-6 w-44 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-72 rounded mt-2" />
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-5 w-24 rounded" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-12 rounded" />
                      <Skeleton className="h-4 w-8 rounded" />
                    </div>
                    <Skeleton className="h-4 w-10 rounded" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Management Card */}
      <Card className="border-0 shadow-xl bg-card/80 rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-border/50 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-1">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-6 w-48 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-80 rounded mt-2" />
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-48 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24 rounded" />
              <Skeleton className="h-8 w-24 rounded" />
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/50 bg-secondary/20 p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48 rounded" />
                    <Skeleton className="h-4 w-32 rounded" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-10 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
