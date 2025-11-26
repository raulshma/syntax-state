"use client";

import { motion } from "framer-motion";

export function NewInterviewSkeleton() {
  return (
    <div className="relative flex-1 flex flex-col">
      {/* Header skeleton */}
      <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-sm px-6 md:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-10 h-10 bg-secondary skeleton-pulse" />
          <div className="space-y-2">
            <div className="w-48 h-5 bg-secondary skeleton-pulse" />
            <div className="w-64 h-4 bg-secondary skeleton-pulse" />
          </div>
        </div>
      </header>

      {/* Content skeleton */}
      <div className="relative z-10 flex-1 px-6 md:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Main form area */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-card border border-border p-8">
                <div className="w-32 h-4 bg-secondary skeleton-pulse mb-4" />
                <div className="w-full h-32 bg-secondary skeleton-pulse mb-4" />
                <div className="w-full h-12 bg-secondary skeleton-pulse" />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <div className="w-8 h-4 bg-secondary skeleton-pulse" />
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="w-full h-12 bg-secondary skeleton-pulse" />
            </div>

            {/* Side panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border p-6">
                <div className="w-24 h-4 bg-secondary skeleton-pulse mb-4" />
                <div className="space-y-3">
                  <div className="w-full h-4 bg-secondary skeleton-pulse" />
                  <div className="w-3/4 h-4 bg-secondary skeleton-pulse" />
                  <div className="w-5/6 h-4 bg-secondary skeleton-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
