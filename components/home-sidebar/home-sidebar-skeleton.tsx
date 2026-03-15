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

export function AppSidebarSkeleton() {
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
      </SidebarHeader>

      <SidebarContent className="px-3 py-3" />

      <SidebarFooter className="border-t border-sidebar-border/70 p-3">
        <div className="flex flex-col gap-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
          </SidebarMenu>
          <Skeleton
            className={cn("h-16 w-full rounded-2xl", isCollapsed && "h-10")}
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
