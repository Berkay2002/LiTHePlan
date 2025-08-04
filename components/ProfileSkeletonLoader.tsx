// components/ProfileSkeletonLoader.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Profile Stats Card Skeleton
function ProfileStatsCardSkeleton() {
  return (
    <Card className="bg-card border-border shadow-lg">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Pie Chart Skeleton */}
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Progress text skeleton */}
            <div className="text-center space-y-2">
              <Skeleton className="h-6 w-24 mx-auto" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>

            {/* Pie Chart Skeleton */}
            <Skeleton className="w-[220px] h-[220px] rounded-full" />

            {/* Legend Skeleton */}
            <div className="flex flex-wrap gap-4 justify-center">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Statistics Skeleton */}
          <div className="space-y-6">
            
            {/* Advanced Credits Section Skeleton */}
            <div className="border border-border rounded-lg p-4 bg-card/50">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              
              <Skeleton className="h-2 w-full mb-2" />
              
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>

            {/* Top Programs Section Skeleton */}
            <div className="border border-border rounded-lg p-4 bg-card/50">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-32" />
                      </div>
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

// Term Card Skeleton
function TermCardSkeleton({ termNumber }: { termNumber: 7 | 8 | 9 }) {
  const getTermLabel = (term: number) => {
    switch (term) {
      case 7: return "Termin 7";
      case 8: return "Termin 8"; 
      case 9: return "Termin 9";
      default: return `Termin ${term}`;
    }
  };

  return (
    <Card className="bg-card border-border h-fit">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-card-foreground">
            {getTermLabel(termNumber)}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Period 1 Skeleton */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Card key={`p1-${i}`} className="border border-border bg-card/50">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      <Skeleton className="h-5 w-12 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                    
                    <div className="flex justify-between items-center pt-1">
                      <Skeleton className="h-4 w-20" />
                      <div className="flex gap-1">
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-6 w-6 rounded" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Period 2 Skeleton */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Card key={`p2-${i}`} className="border border-border bg-card/50">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      <Skeleton className="h-5 w-12 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                    
                    <div className="flex justify-between items-center pt-1">
                      <Skeleton className="h-4 w-20" />
                      <div className="flex gap-1">
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-6 w-6 rounded" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
          <TermCardSkeleton termNumber={7} />
          <TermCardSkeleton termNumber={8} />
          <TermCardSkeleton termNumber={9} />
        </div>

      </div>
    </div>
  );
}