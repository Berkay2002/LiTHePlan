// components/course/CourseCardSkeleton.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CourseCardSkeleton() {
  return (
    <div className="group h-full flex flex-col transition-all duration-200 border-2 border-primary/20 bg-background rounded-lg shadow-md">
      <div className="flex-1 flex flex-col gap-2.5 p-4">
        {/* SCANNABLE HEADER - Course ID + Level + Warnings */}
        <div className="flex items-center justify-between gap-2 -mb-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" /> {/* Course ID */}
            <Skeleton className="h-5 w-20" /> {/* Level badge */}
          </div>
          <Skeleton className="h-4 w-4" /> {/* External link */}
        </div>

        {/* COURSE NAME */}
        <div className="min-h-[2.5rem]">
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* CRITICAL METADATA - Badges */}
        <div className="flex items-center flex-wrap gap-1.5">
          <Skeleton className="h-6 w-12" /> {/* Term badge */}
          <Skeleton className="h-6 w-12" /> {/* Period badge */}
          <Skeleton className="h-6 w-12" /> {/* Block badge */}
          <div className="flex items-center gap-1.5 ml-auto">
            <Skeleton className="h-4 w-8" /> {/* Campus */}
          </div>
        </div>

        {/* EXAMINATION TYPES */}
        <div className="flex items-center gap-1 pt-0.5">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-14" />
        </div>

        {/* SECONDARY INFO */}
        <div className="flex-1 min-h-0 pt-1 border-t border-border/20">
          <Skeleton className="h-3 w-2/3" /> {/* Examiner */}
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}

export function CourseGridSkeleton({ count = 12 }: { count?: number }) {
  // Match CourseGrid layout logic - use same auto-fit pattern
  return (
    <div
      className="grid gap-4 lg:gap-5 w-full justify-center"
      style={{
        gridTemplateColumns:
          "repeat(auto-fit, minmax(min(100%, 260px), min(100%, 300px)))",
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  );
}
