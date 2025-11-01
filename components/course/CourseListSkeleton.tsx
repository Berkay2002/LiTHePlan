// components/course/CourseListSkeleton.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CourseListItemSkeleton() {
  return (
    <div className="border-2 border-primary/20 bg-background rounded-lg p-3 lg:p-4 animate-pulse">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="space-y-2">
          {/* Top row: Course name and action elements */}
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-12 rounded" />
          </div>

          {/* Bottom row: Course info and action button */}
          <div className="flex items-end justify-between gap-3">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Skeleton className="h-5 w-12 rounded" />
                <Skeleton className="h-5 w-12 rounded" />
                <Skeleton className="h-5 w-12 rounded" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 rounded" />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_auto_auto] lg:gap-4 lg:items-center">
        {/* Left: Course info */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-12 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        </div>

        {/* Middle: Badges */}
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-6 w-16 rounded" />
          <Skeleton className="h-6 w-16 rounded" />
          <Skeleton className="h-6 w-16 rounded" />
        </div>

        {/* Right: Action button */}
        <Skeleton className="h-10 w-32 rounded" />
      </div>
    </div>
  );
}

export function CourseListSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <CourseListItemSkeleton key={index} />
      ))}
    </div>
  );
}
