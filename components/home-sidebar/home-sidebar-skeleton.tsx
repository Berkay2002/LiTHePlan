"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function HomeSidebarMobileBarSkeleton() {
  return (
    <div className="sticky top-0 z-30 border-b border-border/60 bg-background/92 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-linear-to-r from-transparent via-border/60 to-transparent"
      />
      <div className="grid h-15 grid-cols-[auto_1fr_auto] items-center gap-2.5 px-4">
        <Skeleton className="size-6 rounded-sm" />
        <div className="min-w-0">
          <div className="flex justify-center">
            <div className="flex min-w-0 flex-col items-center px-2 py-1">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="mt-1 h-px w-16 rounded-full" />
            </div>
          </div>
        </div>
        <Skeleton className="h-9 w-[6.4rem] rounded-xl" />
      </div>
    </div>
  );
}

export function HomeSidebarSkeleton() {
  const { isMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  return (
    <Sidebar
      className="border-sidebar-border/70"
      collapsible="icon"
      variant="inset"
    >
      <SidebarHeader
        className={cn(
          "gap-0 border-b border-sidebar-border/70 bg-sidebar/95 p-3",
          isCollapsed && "items-center px-2"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {isCollapsed ? null : <Skeleton className="h-8 w-32" />}
          <SidebarTrigger
            className="size-11 rounded-2xl text-sidebar-foreground/72 transition-colors duration-150 hover:bg-sidebar-accent/45 hover:text-sidebar-foreground focus-visible:bg-sidebar-accent/45 focus-visible:text-sidebar-foreground [&>svg]:size-5"
            size="icon-lg"
          />
        </div>
        {isCollapsed ? null : (
          <div className="mt-3 w-full border-t border-sidebar-border/60 pt-3">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3 py-3">
        <div className="flex flex-col gap-4">
          {isCollapsed ? (
            <div className="flex w-full flex-col gap-2 py-2">
              <Skeleton className="h-11 w-full rounded-[1rem]" />
              <Skeleton className="h-11 w-full rounded-[1rem]" />
              <Skeleton className="h-11 w-full rounded-[1rem]" />
            </div>
          ) : (
            <>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-16" />
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuSkeleton textWidth="72%" />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuSkeleton textWidth="58%" />
                    </SidebarMenuItem>
                  </SidebarMenu>
                </div>
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-20" />
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuSkeleton textWidth="64%" />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuSkeleton textWidth="78%" />
                    </SidebarMenuItem>
                  </SidebarMenu>
                </div>
              </div>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton textWidth="74%" />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton textWidth="66%" />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton textWidth="82%" />
                </SidebarMenuItem>
              </SidebarMenu>
            </>
          )}
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/70 p-3">
        <div className="flex flex-col gap-3">
          <Skeleton
            className={cn("h-16 w-full rounded-2xl", isCollapsed && "h-10")}
          />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon textWidth="68%" />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon textWidth="76%" />
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
