import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, ChevronRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TopicLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar Skeleton */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent border-b border-transparent">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" disabled className="rounded-full w-10 h-10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20 px-6 max-w-5xl mx-auto">
        {/* Hero Section Skeleton */}
        <div className="mb-12 relative">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-32 rounded-full" />
            </div>

            <Skeleton className="h-16 w-3/4 max-w-2xl rounded-lg" />

            <Skeleton className="h-6 w-1/2 max-w-xl rounded-md" />
          </div>
        </div>

        {/* Style Selector Skeleton */}
        <div className="mb-8 sticky top-20 z-40">
          <div className="flex gap-2 overflow-hidden">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>

        {/* Main Content Skeleton */}
        <Card className="border-none shadow-xl shadow-black/5 bg-card/50 overflow-hidden ring-1 ring-border/50">
          <CardContent className="p-10">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Skeleton className="h-6 w-32 mb-1" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>

            {/* Prose Content Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[98%]" />
              <Skeleton className="h-4 w-[95%]" />
              <Skeleton className="h-4 w-[92%]" />
              <div className="py-2" />
              <Skeleton className="h-4 w-[96%]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[94%]" />
              <Skeleton className="h-4 w-[90%]" />
              <div className="py-2" />
              <Skeleton className="h-4 w-[88%]" />
              <Skeleton className="h-4 w-[92%]" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>

          {/* Footer Actions Skeleton */}
          <div className="bg-secondary/30 border-t border-border/40 p-6 flex gap-4">
            <Skeleton className="h-11 flex-1 rounded-xl" />
            <Skeleton className="h-11 flex-1 rounded-xl" />
          </div>
        </Card>
      </main>
    </div>
  );
}
