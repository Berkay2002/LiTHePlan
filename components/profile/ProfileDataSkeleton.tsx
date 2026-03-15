import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PROFILE_STATS_PIE_CHART_SIZE } from "@/lib/profile-constants";

function AlertBannerSkeleton() {
  return (
    <div className="bg-primary/10 border-primary border-l-4 p-4 rounded-r-lg shadow-sm">
      <div className="flex items-start">
        <div className="shrink-0">
          <Skeleton className="h-6 w-6 rounded" />
        </div>
        <div className="ml-3 flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-72" />
        </div>
      </div>
    </div>
  );
}

function StatsCardSkeleton() {
  return (
    <Card className="bg-background border-border shadow-lg">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: pie chart placeholder + legend */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-center space-y-1">
              <Skeleton className="h-6 w-32 mx-auto" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
            <Skeleton
              className="rounded-full"
              style={{
                height: PROFILE_STATS_PIE_CHART_SIZE,
                width: PROFILE_STATS_PIE_CHART_SIZE,
              }}
            />
            <div className="flex flex-wrap gap-4 justify-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>

          {/* Right: two stat sections */}
          <div className="space-y-6">
            {/* Advanced Credits section */}
            <div className="border border-border rounded-lg p-4 bg-card/50">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>

            {/* Top Programs section */}
            <div className="border border-border rounded-lg p-4 bg-card/50">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <div className="space-y-3">
                {(["prog-0", "prog-1", "prog-2"] as const).map((id) => (
                  <div className="space-y-2" key={id}>
                    <div className="flex items-center justify-between gap-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-1.5 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CourseSkeleton() {
  return (
    <div className="p-4 rounded-lg border">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24 mt-1" />
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-3">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

function TermCardSkeleton() {
  return (
    <Card className="h-full bg-background">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Badge className="opacity-0 select-none" variant="secondary">
            &nbsp;
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Period 1 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <div className="space-y-3">
            <CourseSkeleton />
            <CourseSkeleton />
          </div>
        </div>
        {/* Period 2 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <div className="space-y-3">
            <CourseSkeleton />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProfileDataSkeleton() {
  return (
    <div className="space-y-8">
      {/* Shared Profile Banner */}
      <AlertBannerSkeleton />

      {/* Profile Stats Card */}
      <StatsCardSkeleton />

      {/* Term Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {([7, 8, 9] as const).map((term) => (
          <TermCardSkeleton key={term} />
        ))}
      </div>
    </div>
  );
}
