// components/course/FilterSidebarSkeleton.tsx
"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface FilterSidebarSkeletonProps {
  isOpen?: boolean;
  onToggle: () => void;
}

export function FilterSidebarSkeleton({
  isOpen,
  onToggle,
}: FilterSidebarSkeletonProps) {
  // Use the passed isOpen prop which already handles responsive behavior
  const sidebarOpen = isOpen ?? false;

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Collapsible Sidebar - Fixed position */}
      <div
        className={cn(
          "fixed top-0 left-0 h-screen lg:top-16 lg:h-[calc(100vh-4rem)] bg-sidebar border-r-2 border-sidebar-border shadow-xl shadow-sidebar/20 z-50 transition-all duration-300 ease-in-out",
          "flex flex-col ring-1 ring-sidebar-border/30",
          isOpen ? "w-72 lg:w-80 xl:w-96" : "w-0 lg:w-12",
          "lg:fixed lg:z-30 lg:shadow-2xl lg:shadow-sidebar/30"
        )}
      >
        {/* Collapsed State - Modern Toggle Button (Desktop Only) */}
        {!sidebarOpen && (
          <div className="hidden lg:flex flex-col items-center justify-center h-full w-12 relative">
            {/* Modern Floating Expand Button */}
            <div className="relative group">
              <Button
                className="h-10 w-10 p-0 bg-sidebar-accent/50 hover:bg-sidebar-accent backdrop-blur-sm border border-sidebar-border hover:border-sidebar-border/80 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={onToggle}
                size="sm"
                variant="ghost"
              >
                <ChevronRight className="h-5 w-5 text-sidebar-foreground group-hover:text-primary transition-colors duration-200" />
              </Button>
            </div>
          </div>
        )}

        {/* Expanded State Content */}
        {sidebarOpen && (
          <div className="flex flex-col h-full relative">
            {/* Modern Floating Collapse Button - Right Edge (Desktop Only) */}
            <div
              className="hidden lg:block absolute -right-6 top-1/2 z-50"
              style={{ transform: "translateY(-50%)" }}
            >
              <div className="relative group">
                <Button
                  className="h-10 w-10 p-0 bg-sidebar-accent/80 hover:bg-sidebar-accent backdrop-blur-sm border border-sidebar-border hover:border-sidebar-border/80 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={onToggle}
                  size="sm"
                  variant="ghost"
                >
                  <ChevronLeft className="h-5 w-5 text-sidebar-foreground group-hover:text-primary transition-colors duration-200" />
                </Button>
              </div>
            </div>

            {/* Mobile Header - Only show on mobile */}
            <div className="shrink-0 p-4 border-b border-sidebar-border bg-sidebar-accent/30 lg:hidden">
              <div className="flex items-center justify-between">
                {/* Logo skeleton for mobile */}
                <div className="shrink-0">
                  <Skeleton className="h-8 w-32" />
                </div>

                <div className="flex items-center gap-2">
                  {/* Close button for mobile */}
                  <Button
                    className="h-10 w-10 p-0 text-sidebar-foreground hover:bg-sidebar-accent hover:scale-110 transition-all duration-200 rounded-full border border-sidebar-border hover:border-sidebar-border/80"
                    onClick={onToggle}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Scrollable Filter Content - Match real structure exactly */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-4 xl:p-6 pb-20 lg:pb-4 xl:pb-6 space-y-4 lg:space-y-4 xl:space-y-5 filter-panel-scroll">
              {/* Programs Filter - Dropdown Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-16" /> {/* "PROGRAM" label */}
                <Skeleton className="w-full h-10 lg:h-11 xl:h-12 2xl:h-14 rounded" />{" "}
                {/* Select dropdown */}
              </div>

              {/* Level and Study Pace - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 xl:gap-6">
                {/* Level Filter Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-12" /> {/* "LEVEL" label */}
                  <div className="grid gap-3">
                    {[1, 2].map((item) => (
                      <div className="flex items-center space-x-3" key={item}>
                        <Skeleton className="h-4 w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4 shrink-0 rounded" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Study Pace Filter Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-20" /> {/* "STUDY PACE" label */}
                  <div className="grid gap-3">
                    {[1, 2, 3].map((item) => (
                      <div className="flex items-center space-x-3" key={item}>
                        <Skeleton className="h-4 w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4 shrink-0 rounded" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Period and Term - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 xl:gap-6">
                {/* Period Filter Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-14" /> {/* "PERIOD" label */}
                  <div className="grid gap-3">
                    {[1, 2].map((item) => (
                      <div className="flex items-center space-x-3" key={item}>
                        <Skeleton className="h-4 w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4 shrink-0 rounded" />
                        <Skeleton className="h-4 w-6" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Term Filter Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-10" /> {/* "TERM" label */}
                  <div className="grid gap-3">
                    {[1, 2].map((item) => (
                      <div className="flex items-center space-x-3" key={item}>
                        <Skeleton className="h-4 w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4 shrink-0 rounded" />
                        <Skeleton className="h-4 w-10" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Campus and Block - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 xl:gap-6">
                {/* Campus Filter Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-14" /> {/* "CAMPUS" label */}
                  <div className="grid gap-3">
                    {[1, 2, 3].map((item) => (
                      <div className="flex items-center space-x-3" key={item}>
                        <Skeleton className="h-4 w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4 shrink-0 rounded" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Block Filter Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-12" /> {/* "BLOCK" label */}
                  <div className="grid gap-3">
                    {[1, 2, 3, 4].map((item) => (
                      <div className="flex items-center space-x-3" key={item}>
                        <Skeleton className="h-4 w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4 shrink-0 rounded" />
                        <Skeleton className="h-4 w-6" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Examination Filter - Tri-state controls Skeleton */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" /> {/* "EXAMINATION" label */}
                  <Skeleton className="h-3 w-32" />{" "}
                  {/* "(Include/Exclude/Ignore)" text */}
                </div>
                <div className="grid gap-3">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div className="flex items-center gap-3" key={item}>
                      <Skeleton className="h-4 w-12 shrink-0" />{" "}
                      {/* Exam type label */}
                      <div className="ml-3">
                        <Skeleton className="w-28 h-6 rounded" />{" "}
                        {/* Select dropdown */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
