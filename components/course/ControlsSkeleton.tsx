// components/course/ControlsSkeleton.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";

// ViewToggle Skeleton
export function ViewToggleSkeleton() {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1 bg-sidebar/10 rounded-lg p-0.5 sm:p-1 border border-sidebar/20">
      <Skeleton className="h-8 sm:h-10 w-8 sm:w-16 rounded" />
      <Skeleton className="h-8 sm:h-10 w-8 sm:w-16 rounded" />
    </div>
  );
}

// SortDropdown Skeleton
export function SortDropdownSkeleton() {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded" />
      <Skeleton className="w-24 sm:w-32 md:w-40 h-8 sm:h-10 rounded" />
    </div>
  );
}

// Combined Top Controls Skeleton
export function TopControlsSkeleton() {
  return (
    <div className="w-full max-w-full mb-6 px-1 sm:px-2 lg:px-0">
      <div className="flex justify-between items-center gap-2 sm:gap-4 min-w-0 overflow-hidden">
        {/* Left Column - Sort Controls */}
        <div className="flex-shrink min-w-0 overflow-hidden">
          <SortDropdownSkeleton />
        </div>

        {/* Spacer with loading indicator */}
        <div className="flex-1 min-w-2 flex items-center justify-center">
          <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-lg">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">Loading courses...</p>
          </div>
        </div>

        {/* Right Column - View Toggle */}
        <div className="flex-shrink-0">
          <ViewToggleSkeleton />
        </div>
      </div>
    </div>
  );
}
