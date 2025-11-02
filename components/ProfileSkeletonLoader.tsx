// components/ProfileSkeletonLoader.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MASTER_PROGRAM_TERMS,
  type MasterProgramTerm,
  PROFILE_STATS_PIE_CHART_SIZE,
} from "@/lib/profile-constants";

// Profile Stats Card Skeleton
function ProfileStatsCardSkeleton() {
  return (
    <Card className="bg-background border-border shadow-lg">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Pie Chart Skeleton */}
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Progress text skeleton */}
            <div className="text-center">
              <Skeleton className="h-6 w-32 mx-auto mb-1" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>

            {/* Pie Chart Skeleton */}
            <div>
              <Skeleton
                className="rounded-full"
                style={{
                  height: PROFILE_STATS_PIE_CHART_SIZE,
                  width: PROFILE_STATS_PIE_CHART_SIZE,
                }}
              />
            </div>

            {/* Legend Skeleton */}
            <div className="flex flex-wrap gap-4 justify-center">
              {[1, 2, 3].map((i) => (
                <div className="flex items-center gap-2" key={i}>
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Statistics Skeleton */}
          <div className="space-y-6">
            {/* Advanced Credits Section Skeleton */}
            <div className="border border-border rounded-lg p-4 bg-card/50">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-24 rounded" />
              </div>

              <Skeleton className="h-2 w-full mb-2" />

              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            {/* Top Programs Section Skeleton */}
            <div className="border border-border rounded-lg p-4 bg-card/50">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16 rounded" />
              </div>

              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div className="space-y-2" key={i}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-4 w-20" />
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

// Term Card Skeleton
function TermCardSkeleton({ termNumber }: { termNumber: MasterProgramTerm }) {
  const getTermLabel = (term: MasterProgramTerm) => `Termin ${term}`;

  return (
    <Card className="bg-background border-border h-fit shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-card-foreground">
            {getTermLabel(termNumber)}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Period 1 Skeleton */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>

          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                className="p-4 rounded-lg border border-border hover:bg-card/10"
                key={`p1-${i}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-6 rounded ml-2" />
                </div>

                <div className="flex items-center gap-1 mt-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-5 w-8 rounded" />
                  <Skeleton className="h-5 w-8 rounded" />
                </div>

                <div className="flex items-center justify-between gap-2 mt-3">
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-5 w-16 rounded" />
                    <Skeleton className="h-5 w-20 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Period 2 Skeleton */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>

          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                className="p-4 rounded-lg border border-border hover:bg-card/10"
                key={`p2-${i}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-6 rounded ml-2" />
                </div>

                <div className="flex items-center gap-1 mt-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-5 w-8 rounded" />
                  <Skeleton className="h-5 w-8 rounded" />
                </div>

                <div className="flex items-center justify-between gap-2 mt-3">
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-5 w-16 rounded" />
                    <Skeleton className="h-5 w-20 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Profile Skeleton Loader
export function ProfileSkeletonLoader() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Profile Statistics Card Skeleton */}
        <ProfileStatsCardSkeleton />

        {/* Term Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MASTER_PROGRAM_TERMS.map((term) => (
            <TermCardSkeleton key={term} termNumber={term} />
          ))}
        </div>
      </div>
    </div>
  );
}
