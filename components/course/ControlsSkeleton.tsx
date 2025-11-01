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
    <div className="w-full mb-6">
      <div className="grid gap-4 lg:gap-5 w-full justify-center" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), min(100%, 450px)))' }}>
        <div className="col-start-1 -col-end-1 flex justify-end">
          <ViewToggleSkeleton />
        </div>
      </div>
    </div>
  );
}
