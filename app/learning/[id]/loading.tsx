import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Target, Brain, Clock, Sparkles } from 'lucide-react';

// Exported for use in Suspense fallback
export function LearningWorkspaceSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Floating Header Skeleton */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-4 mt-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-background/70 border border-border/40 rounded-2xl shadow-lg shadow-black/5">
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="h-6 w-px bg-border/50" />
                  <Skeleton className="h-5 w-48 rounded-lg" />
                </div>
                <div className="hidden sm:flex items-center gap-4 px-4 py-2 rounded-xl bg-secondary/30">
                  <Skeleton className="h-4 w-16 rounded-lg" />
                  <div className="h-4 w-px bg-border/50" />
                  <Skeleton className="h-4 w-16 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Navigation Pills Skeleton */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1.5 rounded-2xl bg-secondary/40 border border-border/30">
              {['Learn', 'History', 'Insights'].map((label, i) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl ${
                    i === 0 ? 'bg-background shadow-sm border border-border/50' : ''
                  }`}
                >
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-12 rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Skeleton */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Current Topic Card */}
              <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Target className="w-4 h-4 text-primary/50" />
                  </div>
                  <Skeleton className="h-3 w-20 rounded-lg" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-2 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-2/3 mt-1 rounded-lg" />
                <div className="mt-4 pt-4 border-t border-primary/10 flex justify-between">
                  <Skeleton className="h-3 w-16 rounded-lg" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </div>

              {/* Topics List */}
              <div className="p-6 rounded-3xl bg-background/60 border border-border/40">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-muted-foreground/50" />
                  <Skeleton className="h-4 w-20 rounded-lg" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-3 rounded-xl bg-secondary/20">
                      <Skeleton className="h-4 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Progress */}
              <div className="p-6 rounded-3xl bg-background/60 border border-border/40">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-4 h-4 text-muted-foreground/50" />
                  <Skeleton className="h-4 w-12 rounded-lg" />
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-20 rounded-lg" />
                        <Skeleton className="h-3 w-8 rounded-lg" />
                      </div>
                      <Skeleton className="h-1.5 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Activity Area Skeleton */}
            <div className="lg:col-span-3">
              <div className="rounded-3xl bg-background/80 border border-border/40 shadow-xl shadow-black/5 overflow-hidden">
                {/* Card Header */}
                <div className="px-8 py-6 border-b border-border/30 bg-secondary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-14 h-14 rounded-2xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-40 rounded-lg" />
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-4 w-24 rounded-lg" />
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground/30" />
                            <Skeleton className="h-4 w-20 rounded-lg" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <Skeleton className="h-10 w-32 rounded-xl" />
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-8 space-y-6">
                  {/* Question */}
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-full rounded-xl" />
                    <Skeleton className="h-6 w-4/5 rounded-xl" />
                  </div>

                  {/* Options */}
                  <div className="space-y-3 pt-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className="h-16 w-full rounded-2xl"
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-border/30 flex justify-center">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    <span className="text-sm font-medium">Preparing your activity...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Default export for Next.js loading.tsx convention
export default function LearningLoading() {
  return <LearningWorkspaceSkeleton />;
}
