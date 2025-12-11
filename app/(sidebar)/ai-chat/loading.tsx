import { Skeleton } from "@/components/ui/skeleton";

/**
 * AI Chat page loading skeleton
 * Matches the layout: left sidebar (chat history) + main chat area
 */
export default function AIChatLoading() {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/50">
      {/* Left Sidebar Skeleton - Chat History */}
      <div className="shrink-0 h-full py-4 pl-4 w-80 hidden md:block">
        <div className="h-full w-full rounded-3xl border border-border/40 bg-background/60  shadow-sm overflow-hidden p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>

          {/* New Chat Button */}
          <Skeleton className="h-10 w-full rounded-xl" />

          {/* Search */}
          <Skeleton className="h-10 w-full rounded-xl" />

          {/* Conversation List */}
          <div className="space-y-2 pt-2">
            <Skeleton className="h-3 w-12 mb-2" />
            {[...Array(3)].map((_, i) => (
              <div key={`today-${i}`} className="flex items-center gap-3 p-3">
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}

            <Skeleton className="h-3 w-16 mb-2 mt-4" />
            {[...Array(2)].map((_, i) => (
              <div key={`older-${i}`} className="flex items-center gap-3 p-3">
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area Skeleton */}
      <div className="flex-1 flex flex-col min-w-0 h-full py-4 px-2">
        <div className="h-full rounded-3xl border border-border/40 bg-background/60  shadow-sm overflow-hidden flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded" />
          </div>

          {/* Chat Content - Empty State */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-md">
              <Skeleton className="h-24 w-24 rounded-3xl mx-auto" />
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-80 mx-auto" />

              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border/40">
            <div className="max-w-3xl mx-auto">
              <Skeleton className="h-14 w-full rounded-3xl" />
              <Skeleton className="h-3 w-48 mx-auto mt-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
