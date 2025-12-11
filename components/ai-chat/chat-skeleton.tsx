"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for the chat history sidebar
 */
export function ChatHistorySkeleton() {
  return (
    <div className="h-full w-full p-4 space-y-4">
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
          <ConversationItemSkeleton key={`today-${i}`} />
        ))}

        <Skeleton className="h-3 w-16 mb-2 mt-4" />
        {[...Array(2)].map((_, i) => (
          <ConversationItemSkeleton key={`older-${i}`} />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for a single conversation item
 */
function ConversationItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl">
      <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/**
 * Skeleton for the main chat area
 */
export function ChatMainSkeleton() {
  return (
    <div className="flex flex-col h-full">
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
  );
}

/**
 * Skeleton for chat messages (when loading conversation history)
 */
export function ChatMessagesSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* User message */}
      <div className="flex gap-4 flex-row-reverse">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="space-y-2 max-w-[70%]">
          <Skeleton className="h-16 w-64 rounded-2xl rounded-tr-none" />
        </div>
      </div>

      {/* Assistant message */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="space-y-2 max-w-[70%]">
          <Skeleton className="h-32 w-80 rounded-2xl rounded-tl-none" />
        </div>
      </div>

      {/* User message */}
      <div className="flex gap-4 flex-row-reverse">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="space-y-2 max-w-[70%]">
          <Skeleton className="h-12 w-48 rounded-2xl rounded-tr-none" />
        </div>
      </div>

      {/* Assistant message */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="space-y-2 max-w-[70%]">
          <Skeleton className="h-24 w-72 rounded-2xl rounded-tl-none" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for the tools sidebar
 */
export function ToolsSidebarSkeleton() {
  return (
    <div className="h-full w-full p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>

      {/* Tool Cards */}
      <div className="space-y-3 pt-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-border/40 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Full page skeleton combining all parts
 */
export function AIChatPageSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/50">
      {/* Left Sidebar */}
      <div className="shrink-0 h-full py-4 pl-4 w-80 hidden md:block">
        <div className="h-full w-full rounded-3xl border border-border/40 bg-background/60  shadow-sm overflow-hidden">
          <ChatHistorySkeleton />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full py-4 px-2">
        <div className="h-full rounded-3xl border border-border/40 bg-background/60  shadow-sm overflow-hidden">
          <ChatMainSkeleton />
        </div>
      </div>
    </div>
  );
}
