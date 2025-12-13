'use client';

import { Suspense, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading fallback for interactive CSS components
 */
function InteractiveComponentSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto my-8 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      <Skeleton className="h-[400px] w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

/**
 * Higher-order component that wraps a lazy-loaded component with Suspense
 */
export function withSuspense<P extends object>(
  Component: ComponentType<P>,
  fallback: React.ReactNode = <InteractiveComponentSkeleton />
) {
  return function SuspenseWrapper(props: P) {
    return (
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    );
  };
}
