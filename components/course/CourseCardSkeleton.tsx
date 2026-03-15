// components/course/CourseCardSkeleton.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";

const getCourseCardSkeletonKeys = (count: number): string[] =>
  Array.from(
    { length: count },
    (_, itemNumber) => `course-card-skeleton-${itemNumber + 1}`
  );

export function CourseCardSkeleton() {
  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-primary/15 bg-card/95 shadow-sm">
      <div className="flex flex-col md:hidden">
        <div className="space-y-3 border-b border-border/40 px-3.5 py-3.5">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="size-8 rounded-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-18" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>

        <div className="flex flex-col gap-3 px-3.5 py-3">
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }, (_, tileIndex) => (
              <div
                className="rounded-xl border border-border/45 bg-muted/15 px-3 py-2.5"
                key={`mobile-summary-tile-${tileIndex + 1}`}
              >
                <Skeleton className="h-2.5 w-12" />
                <Skeleton className="mt-2 h-4 w-16" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-2.5 w-10" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 px-3.5 py-3">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-24 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="hidden md:flex md:flex-col">
        <div className="space-y-4 border-b border-border/40 px-4 py-4">
          <div className="flex items-start justify-between gap-3 border-b border-border/35 pb-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <Skeleton className="h-5 w-18" />
              <Skeleton className="h-5 w-22 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="size-8 rounded-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 px-4 py-4">
          <div className="grid gap-3 lg:grid-cols-2">
            {Array.from({ length: 4 }, (_, tileIndex) => (
              <div
                className="rounded-md border border-border/40 bg-muted/20 p-3.5"
                key={`desktop-summary-tile-${tileIndex + 1}`}
              >
                <Skeleton className="h-2.5 w-14" />
                <Skeleton className="mt-3 h-4 w-20" />
              </div>
            ))}
          </div>

          <div className="rounded-md border border-border/40 bg-muted/20 p-3.5">
            <Skeleton className="h-2.5 w-16" />
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
            <Skeleton className="mt-3 h-3 w-28" />
          </div>
        </div>

        <div className="border-t border-border/40 px-4 py-4">
          <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto]">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md lg:w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CourseGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] lg:gap-5">
      {getCourseCardSkeletonKeys(count).map((itemKey) => (
        <CourseCardSkeleton key={itemKey} />
      ))}
    </div>
  );
}
