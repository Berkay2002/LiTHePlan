import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProfileDataSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-64" /> {/* Profile name */}
              <Skeleton className="h-5 w-48" /> {/* Metadata */}
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" /> {/* Edit button */}
              <Skeleton className="h-9 w-20" /> {/* Share button */}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Terms Cards */}
      {[7, 8, 9].map((term) => (
        <Card key={term}>
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-24" /> {/* Term title */}
              <Skeleton className="h-5 w-32" /> {/* Credits info */}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="space-y-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-6 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
