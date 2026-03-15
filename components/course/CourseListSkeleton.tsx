// components/course/CourseListSkeleton.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const getCourseListSkeletonKeys = (count: number): string[] =>
  Array.from(
    { length: count },
    (_, itemNumber) => `course-list-skeleton-${itemNumber + 1}`
  );

export function CourseListItemSkeleton() {
  return (
    <Card className="border-2 border-primary/20 bg-background">
      <CardContent className="p-3 lg:p-4">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="space-y-2">
            {/* Row 1: name + notes badge on left, exam badges + action button + external link button on right */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-2">
                <Skeleton className="h-5 flex-1" />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {/* Exam badge skeletons */}
                <Skeleton className="h-5 w-10 rounded-full" />
                <Skeleton className="h-5 w-10 rounded-full" />
                {/* Action + external link buttons */}
                <div className="flex gap-1">
                  <Skeleton className="h-7 w-8 rounded" />
                  <Skeleton className="h-7 w-8 rounded" />
                </div>
              </div>
            </div>

            {/* Row 2: course ID + info items */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden items-start gap-4 lg:flex">
          {/* Left side */}
          <div className="min-w-0 flex-1">
            {/* Row 1: name + exam badges */}
            <div className="mb-3 flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-start gap-2">
                  <Skeleton className="h-5 flex-1" />
                </div>
                <Skeleton className="mb-2 h-4 w-28" />
              </div>
              {/* Exam badge skeletons on right of name block */}
              <div className="ml-3 flex gap-1">
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>

            {/* Row 2: term, period, block, level, examiner, director */}
            <div className="mb-3 flex flex-wrap items-center gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-28" />
            </div>

            {/* Row 3: campus, pace, programs */}
            <div className="flex flex-wrap items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>

          {/* Right side: action button + external link button */}
          <div className="ml-4 flex items-center gap-2">
            <Skeleton className="h-8 w-28 rounded" />
            <Skeleton className="h-8 w-24 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CourseListSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="space-y-3 w-full">
      {getCourseListSkeletonKeys(count).map((itemKey) => (
        <CourseListItemSkeleton key={itemKey} />
      ))}
    </div>
  );
}
