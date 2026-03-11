// components/profile/ProfileSidebarSkeleton.tsx
"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PROFILE_SIDEBAR_COLLAPSED_WIDTH,
  PROFILE_SIDEBAR_DESKTOP_WIDTH,
  PROFILE_SIDEBAR_DESKTOP_WIDTH_XL,
  PROFILE_SIDEBAR_PIE_CHART_SIZE,
} from "@/lib/profile-constants";
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
      {isOpen && (
        <button
          aria-label="Dismiss profile rail overlay"
          className="fixed inset-0 z-40 w-full border-0 bg-foreground/45 lg:hidden"
          onClick={onToggle}
          title="Close profile rail"
          type="button"
        />
      )}

      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-screen border-l border-sidebar-border/70 bg-sidebar/95 text-sidebar-foreground shadow-[-12px_0_30px_-24px_hsl(var(--foreground)/0.45)] backdrop-blur supports-[backdrop-filter]:bg-sidebar/90 lg:z-30 lg:h-svh",
          "transition-[transform,width] duration-300 ease-in-out",
          isOpen
            ? "w-[min(100vw,22rem)] translate-x-0 sm:w-80 lg:w-[var(--profile-sidebar-width)] xl:w-[var(--profile-sidebar-width-xl)]"
            : "w-0 translate-x-full overflow-hidden lg:w-[var(--profile-sidebar-width-collapsed)] lg:translate-x-0"
        )}
        style={
          {
            "--profile-sidebar-width": PROFILE_SIDEBAR_DESKTOP_WIDTH,
            "--profile-sidebar-width-collapsed":
              PROFILE_SIDEBAR_COLLAPSED_WIDTH,
            "--profile-sidebar-width-xl": PROFILE_SIDEBAR_DESKTOP_WIDTH_XL,
          } as CSSProperties
        }
      >
        {!isOpen && (
          <div className="hidden h-full flex-col items-center bg-sidebar/95 px-2 py-4 lg:flex">
            <div className="flex w-full justify-center">
              <Button
                aria-label="Expand profile rail"
                className="size-10 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/30 text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={onToggle}
                size="sm"
                title="Expand profile rail"
                type="button"
                variant="ghost"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 flex flex-1 items-center justify-center">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/50 [writing-mode:vertical-rl]">
                Profile
              </span>
            </div>
          </div>
        )}

        {isOpen && (
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-3 border-b border-sidebar-border/70 bg-sidebar/95 px-4 py-3 xl:px-5">
              <div className="min-w-0">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-2 h-3 w-36" />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  aria-label="Collapse profile rail"
                  className="hidden size-9 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/30 text-sidebar-foreground hover:bg-sidebar-accent lg:flex"
                  onClick={onToggle}
                  size="sm"
                  title="Collapse profile rail"
                  type="button"
                  variant="ghost"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  aria-label="Close profile rail"
                  className="size-9 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/30 text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
                  onClick={onToggle}
                  size="sm"
                  title="Close profile rail"
                  type="button"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="filter-panel-scroll flex-1 overflow-y-auto overflow-x-hidden p-4 xl:p-5">
              <div className="space-y-4">
                <section className="space-y-4 rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="mt-2 h-3 w-28" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[auto,1fr] xl:items-center">
                    <div className="space-y-2 text-center">
                      <Skeleton className="mx-auto h-6 w-32" />
                      <Skeleton className="mx-auto h-3 w-24" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-center xl:justify-start">
                        <Skeleton
                          className="rounded-full"
                          style={{ width: size, height: size }}
                        />
                      </div>

                      <div className="space-y-2">
                        {[1, 2, 3].map((item) => (
                          <div className="flex items-center gap-2" key={item}>
                            <Skeleton className="h-3 w-3 rounded-full" />
                            <Skeleton className="h-3 flex-1" />
                            <Skeleton className="h-3 w-14" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-3 rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/15 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="mt-2 h-4 w-24" />
                    </div>
                    <div className="flex items-center gap-1 rounded-xl border border-sidebar-border/70 bg-background/70 p-1">
                      <Button
                        aria-label="Show previous term"
                        className="h-7 w-7 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
                        disabled
                        size="sm"
                        title="Show previous term"
                        type="button"
                        variant="ghost"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <Skeleton className="h-3 w-14" />
                      <Button
                        aria-label="Show next term"
                        className="h-7 w-7 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
                        disabled
                        size="sm"
                        title="Show next term"
                        type="button"
                        variant="ghost"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <Card className="border-sidebar-border/70 bg-background/80 shadow-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-sm font-medium">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-12 rounded-full" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {[1, 2, 3].map((item) => (
                          <div
                            className="rounded-xl border border-sidebar-border/70 bg-sidebar-accent/10 px-3 py-2"
                            key={item}
                          >
                            <div className="space-y-1">
                              <Skeleton className="h-3 w-full" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
