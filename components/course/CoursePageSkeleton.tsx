import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function CoursePageSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumb Skeleton */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <Skeleton className="h-4 w-12" />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Skeleton className="h-4 w-16" />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Skeleton className="h-4 w-40" />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Skeleton (CourseHero) */}
        <Card className="mb-6 bg-background border-border">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-32" /> {/* Course ID */}
                <Skeleton className="h-10 w-3/4" /> {/* Course name */}
              </div>
              <Skeleton className="h-11 w-44 hidden sm:block" />{" "}
              {/* CTA button */}
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16" /> {/* Badge 1 */}
              <Skeleton className="h-6 w-20" /> {/* Badge 2 */}
              <Skeleton className="h-6 w-24" /> {/* Badge 3 */}
              <Skeleton className="h-6 w-20" /> {/* Badge 4 */}
            </div>
          </CardHeader>
        </Card>

        {/* Mobile Sticky CTA Skeleton */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur border-t border-border sm:hidden shadow-lg">
          <Skeleton className="h-11 w-full" />
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-1 border-b">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Tab Content Skeleton */}
          <div className="space-y-6 mt-6">
            {/* Course Overview Card */}
            <Card className="bg-background border-border">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>

            {/* Academic Information Card */}
            <Card className="bg-background border-border">
              <CardHeader>
                <Skeleton className="h-6 w-52" />
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div className="space-y-2" key={i}>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <Skeleton className="h-5 w-48" />
                </div>
              </CardContent>
            </Card>

            {/* Examination Card */}
            <Card className="bg-background border-border">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton className="h-6 w-16" key={i} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Programs Card */}
            <Card className="bg-background border-border">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-80" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton className="h-6 w-24" key={i} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Related Courses Skeleton */}
        <div className="mt-12 mb-20 sm:mb-12">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-52" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card className="overflow-hidden bg-background border-border" key={i}>
                <CardHeader className="space-y-3">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
