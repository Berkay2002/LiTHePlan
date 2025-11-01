// components/profile/ProfileSidebarSkeleton.tsx
"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PROFILE_SIDEBAR_PIE_CHART_SIZE } from "@/lib/profile-constants";
import { cn } from "@/lib/utils";

interface ProfileSidebarSkeletonProps {
  isOpen?: boolean;
  onToggle: () => void;
}

export function ProfileSidebarSkeleton({
  isOpen = false,
  onToggle,
}: ProfileSidebarSkeletonProps) {
  const size = PROFILE_SIDEBAR_PIE_CHART_SIZE;

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Profile Sidebar - Fixed position */}
      <div
        className={cn(
          "fixed top-0 right-0 h-screen lg:top-16 lg:h-[calc(100vh-4rem)] bg-sidebar border-l-2 border-sidebar-border shadow-xl shadow-sidebar/20 z-50 transition-all duration-300 ease-in-out",
          "flex flex-col ring-1 ring-sidebar-border/30",
          isOpen ? "w-72 lg:w-80 xl:w-96" : "w-0 lg:w-12",
          "lg:fixed lg:z-30 lg:shadow-2xl lg:shadow-sidebar/30"
        )}
      >
        {/* Collapsed State - Modern Toggle Button (Desktop Only) */}
        {!isOpen && (
          <div className="hidden lg:flex flex-col items-center justify-center h-full w-12 relative">
            {/* Modern Floating Expand Button */}
            <div className="relative group">
              <Button
                className="h-10 w-10 p-0 bg-sidebar-foreground/10 hover:bg-sidebar-foreground/20 backdrop-blur-sm border border-sidebar-foreground/20 hover:border-sidebar-foreground/40 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={onToggle}
                size="sm"
                variant="ghost"
              >
                <ChevronLeft className="h-5 w-5 text-sidebar-foreground group-hover:text-primary transition-colors duration-200" />
              </Button>
            </div>
          </div>
        )}

        {/* Expanded State - Full Sidebar Content */}
        {isOpen && (
          <div className="flex flex-col h-full relative">
            {/* Modern Floating Collapse Button - Left Edge (Desktop Only) */}
            <div
              className="hidden lg:block absolute -left-6 top-1/2 z-50"
              style={{ transform: "translateY(-50%)" }}
            >
              <div className="relative group">
                <Button
                  className="h-10 w-10 p-0 bg-sidebar-accent/80 hover:bg-sidebar-accent backdrop-blur-sm border border-sidebar-border hover:border-sidebar-border/80 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={onToggle}
                  size="sm"
                  variant="ghost"
                >
                  <ChevronRight className="h-5 w-5 text-sidebar-foreground group-hover:text-primary transition-colors duration-200" />
                </Button>
              </div>
            </div>

            {/* Mobile Header */}
            <div className="shrink-0 p-4 border-b border-sidebar-border bg-sidebar-accent/30 lg:hidden">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Button
                  className="h-10 w-10 p-0 text-sidebar-foreground hover:bg-sidebar-foreground/20 hover:scale-110 transition-all duration-200 rounded-full border border-sidebar-foreground/30 hover:border-sidebar-foreground/50"
                  onClick={onToggle}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Scrollable Profile Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-4 xl:p-6 space-y-4 lg:space-y-4 xl:space-y-5 filter-panel-scroll">
              {/* Profile Progress Section */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />

                {/* Progress text */}
                <div className="text-center space-y-2">
                  <Skeleton className="h-6 w-32 mx-auto" />
                  <Skeleton className="h-3 w-24 mx-auto" />
                </div>

                {/* Pie Chart Skeleton */}
                <div className="flex justify-center">
                  <Skeleton
                    className="rounded-full"
                    style={{ width: size, height: size }}
                  />
                </div>

                {/* Legend Skeleton */}
                <div className="space-y-1">
                  {[1, 2, 3].map((i) => (
                    <div className="flex items-center gap-2" key={i}>
                      <Skeleton className="w-3 h-3 rounded-full shrink-0" />
                      <Skeleton className="h-3 flex-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Term Cards Slider Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex items-center gap-1">
                    <Button
                      className="h-6 w-6 p-0 text-sidebar-foreground hover:bg-sidebar-foreground/20"
                      disabled
                      size="sm"
                      variant="ghost"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <Skeleton className="h-3 w-16" />
                    <Button
                      className="h-6 w-6 p-0 text-sidebar-foreground hover:bg-sidebar-foreground/20"
                      disabled
                      size="sm"
                      variant="ghost"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Current Term Card Skeleton */}
                <Card className="bg-background border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-12 rounded" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          className="p-2 rounded border border-primary/20 bg-primary/10"
                          key={i}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 space-y-1">
                              <Skeleton className="h-3 w-full" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
