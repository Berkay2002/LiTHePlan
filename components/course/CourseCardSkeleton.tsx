// components/course/CourseCardSkeleton.tsx
"use client";

export function CourseCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-start mb-2">
          <div className="h-4 bg-muted rounded w-16"></div>
          <div className="flex gap-1">
            <div className="h-5 w-5 bg-muted rounded"></div>
            <div className="h-5 w-5 bg-muted rounded"></div>
          </div>
        </div>
        <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>

      {/* Course Details */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="h-3 bg-muted rounded w-8 mx-auto mb-1"></div>
            <div className="h-6 bg-muted rounded w-6 mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-3 bg-muted rounded w-12 mx-auto mb-1"></div>
            <div className="h-6 bg-muted rounded w-8 mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-3 bg-muted rounded w-10 mx-auto mb-1"></div>
            <div className="h-6 bg-muted rounded w-6 mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-3 bg-muted rounded w-8 mx-auto mb-1"></div>
            <div className="h-6 bg-muted rounded w-6 mx-auto"></div>
          </div>
        </div>

        {/* Campus and Pace */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-16"></div>
          </div>
          <div className="h-4 bg-muted rounded w-8"></div>
        </div>

        {/* Programs */}
        <div className="space-y-1">
          <div className="h-3 bg-muted rounded w-16"></div>
          <div className="flex flex-wrap gap-1">
            <div className="h-5 bg-muted rounded w-24"></div>
            <div className="h-5 bg-muted rounded w-20"></div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-4 pt-0">
        <div className="h-9 bg-muted rounded w-full"></div>
      </div>
    </div>
  );
}

export function CourseGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  );
}