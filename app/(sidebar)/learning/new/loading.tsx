"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { useIsMobile } from "@/hooks/use-mobile";

export default function NewLearningPathLoading() {
  const { isCollapsed } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] animate-in fade-in duration-500">
      <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto px-6 md:px-12 pt-12 w-full pb-32">
        {/* Header Skeleton */}
        <div className="mb-8 md:mb-20 text-center flex flex-col items-center">
          <Skeleton className="h-10 md:h-14 w-48 md:w-64 mb-3 rounded-xl" />
          <Skeleton className="h-6 md:h-7 w-64 md:w-96 rounded-lg" />
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col items-center w-full">
          <div className="w-full max-w-4xl flex flex-col items-center space-y-8">
            {/* Input Skeleton */}
            <div className="relative w-full max-w-xl">
              <Skeleton className="h-16 md:h-20 w-full rounded-3xl" />
            </div>

            {/* Chips Skeleton */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-2xl">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-9 md:h-11 w-24 md:w-32 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer Skeleton */}
      <div
        className="fixed bottom-0 right-0 p-4 md:p-6 bg-background/80  border-t border-border/50 z-50 transition-[left] duration-300 ease-in-out"
        style={{ left: isMobile ? 0 : isCollapsed ? "5rem" : "18rem" }}
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
          <Skeleton className="h-12 w-24 rounded-full" />
          <div className="flex gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-2.5 h-2.5 rounded-full" />
            ))}
          </div>
          {/* Right button skeleton: Circle on mobile, Pill on desktop */}
          <Skeleton className="h-12 w-12 md:w-36 md:h-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}
