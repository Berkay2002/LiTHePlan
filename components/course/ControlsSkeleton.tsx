// components/course/ControlsSkeleton.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";

// ViewToggle Skeleton - matches the actual ViewToggle component structure
export function ViewToggleSkeleton() {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1 bg-sidebar/10 rounded-lg p-0.5 sm:p-1 border border-sidebar/20">
      {/* Grid button skeleton */}
      <div className="h-8 sm:h-10 px-1.5 sm:px-3 flex items-center gap-0 sm:gap-1.5 bg-sidebar-foreground/5 rounded border border-sidebar/30">
        <Skeleton className="h-3 w-3 sm:h-4 sm:w-4" />
        <Skeleton className="hidden sm:block h-4 w-8" />
      </div>
      {/* List button skeleton */}
      <div className="h-8 sm:h-10 px-1.5 sm:px-3 flex items-center gap-0 sm:gap-1.5 bg-sidebar-foreground/5 rounded border border-sidebar/30">
        <Skeleton className="h-3 w-3 sm:h-4 sm:w-4" />
        <Skeleton className="hidden sm:block h-4 w-8" />
      </div>
    </div>
  );
}

// Combined Top Controls Skeleton - matches page.tsx layout exactly
export function TopControlsSkeleton() {
  return (
    <div
      className="grid gap-4 lg:gap-5 w-full justify-center"
      style={{
        gridTemplateColumns:
          "repeat(auto-fit, minmax(min(100%, 260px), min(100%, 300px)))",
      }}
    >
      {/* InfoBanner skeleton - spans all columns */}
      <div className="col-start-1 -col-end-1 mb-2">
        <div className="rounded-lg border border-sidebar-border bg-sidebar p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 shrink-0" /> {/* Icon */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" /> {/* Title */}
              <Skeleton className="h-4 w-full" /> {/* Description line 1 */}
              <Skeleton className="h-4 w-3/4" /> {/* Description line 2 */}
            </div>
          </div>
        </div>
      </div>

      {/* ViewToggle skeleton - spans all columns, aligned right */}
      <div className="col-start-1 -col-end-1 flex justify-end mb-2">
        <ViewToggleSkeleton />
      </div>
    </div>
  );
}
