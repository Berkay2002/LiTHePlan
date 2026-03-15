import { CourseCardSkeleton } from "@/components/course/CourseCardSkeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function CoursePageSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumb Skeleton — 2 items: "Courses" > "CourseName" */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <Skeleton className="h-4 w-12" />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Skeleton className="h-4 w-40" />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Skeleton — matches CourseHero div wrapper */}
        <div className="mb-8 p-8 rounded-xl bg-background border border-border shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-10 w-3/4" /> {/* Course name */}
              <Skeleton className="h-7 w-32" /> {/* Course ID */}
            </div>
            <Skeleton className="h-11 w-44 hidden sm:block sm:shrink-0 sm:mt-2" />{" "}
            {/* CTA button */}
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>

        {/* Mobile Sticky CTA Skeleton */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur border-t border-border sm:hidden shadow-lg">
          <Skeleton className="h-11 w-full" />
        </div>

        {/* Content Cards */}
        <div className="space-y-6">
          {/* Course Overview */}
          <Card className="bg-background border-border">
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card className="bg-background border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-52" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[...new Array(6)].map((_, i) => (
                  <div className="space-y-2" key={`academic-skeleton-${i}`}>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <Skeleton className="h-5 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Examination */}
          <Card className="bg-background border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex flex-wrap gap-2">
                {[...new Array(5)].map((_, i) => (
                  <Skeleton className="h-6 w-16" key={`exam-skeleton-${i}`} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Schedule Information */}
          <Card className="bg-background border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-52" />
              </div>
              <Skeleton className="h-4 w-64" />
              <div className="grid sm:grid-cols-2 gap-4">
                {[...new Array(4)].map((_, i) => (
                  <div className="space-y-2" key={`schedule-skeleton-${i}`}>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Programs */}
          <Card className="bg-background border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-80" />
              </div>
              <div className="flex flex-wrap gap-2">
                {[...new Array(6)].map((_, i) => (
                  <Skeleton
                    className="h-6 w-24"
                    key={`programs-skeleton-${i}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes — border-l-4 border-l-destructive */}
          <Card className="bg-background border-border border-l-4 border-l-destructive">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Related Courses Skeleton */}
        <div className="mt-12 mb-20 sm:mb-12">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-52" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:[grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),min(100%,360px)))]">
            {[...new Array(6)].map((_, i) => (
              <CourseCardSkeleton key={`related-skeleton-${i + 1}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
