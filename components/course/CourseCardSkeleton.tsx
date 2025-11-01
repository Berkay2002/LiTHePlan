// components/course/CourseCardSkeleton.tsx
"use client";

export function CourseCardSkeleton() {
  return (
    <div className="bg-background border-2 border-primary/20 rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex justify-between items-start mb-2">
          <div className="h-4 bg-muted rounded w-16" />
          <div className="flex gap-1">
            <div className="h-5 w-5 bg-muted rounded" />
            <div className="h-5 w-5 bg-muted rounded" />
          </div>
        </div>
        <div className="h-5 bg-muted rounded w-3/4 mb-2" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>

      {/* Course Details */}
      <div className="p-5 space-y-3">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="h-3 bg-muted rounded w-8 mx-auto mb-1" />
            <div className="h-6 bg-muted rounded w-6 mx-auto" />
          </div>
          <div className="text-center">
            <div className="h-3 bg-muted rounded w-12 mx-auto mb-1" />
            <div className="h-6 bg-muted rounded w-8 mx-auto" />
          </div>
          <div className="text-center">
            <div className="h-3 bg-muted rounded w-10 mx-auto mb-1" />
            <div className="h-6 bg-muted rounded w-6 mx-auto" />
          </div>
          <div className="text-center">
            <div className="h-3 bg-muted rounded w-8 mx-auto mb-1" />
            <div className="h-6 bg-muted rounded w-6 mx-auto" />
          </div>
        </div>

        {/* Campus and Pace */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-16" />
          </div>
          <div className="h-4 bg-muted rounded w-8" />
        </div>

        {/* Programs */}
        <div className="space-y-1">
          <div className="h-3 bg-muted rounded w-16" />
          <div className="flex flex-wrap gap-1">
            <div className="h-5 bg-muted rounded w-24" />
            <div className="h-5 bg-muted rounded w-20" />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="border-t border-border pt-4 mt-4 px-5 pb-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

export function CourseGridSkeleton({
  count = 12,
}: {
  count?: number;
}) {
  // Match CourseGrid layout logic - use same auto-fit pattern with 450px max
  return (
    <div className="grid gap-4 lg:gap-5 w-full justify-center" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), min(100%, 450px)))' }}>
      {Array.from({ length: count }).map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  );
}
