"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LiThePlanLogo } from "@/components/LiThePlanLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { HomeSidebarFooter } from "./home-sidebar-footer";

interface AppSidebarProps {
  children?: ReactNode;
  headerExtra?: ReactNode;
}

function AppSidebarBrand() {
  return (
    <Link className="flex min-w-0 items-center gap-3" href="/">
      <LiThePlanLogo className="h-8 w-auto" height={32} />
    </Link>
  );
}

export function AppSidebar({ children, headerExtra }: AppSidebarProps) {
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
          {isCollapsed ? null : <AppSidebarBrand />}
          <SidebarTrigger
            className={cn(
              "size-11 rounded-2xl text-sidebar-foreground/72 transition-colors duration-150 hover:bg-sidebar-accent/45 hover:text-sidebar-foreground focus-visible:bg-sidebar-accent/45 focus-visible:text-sidebar-foreground [&>svg]:size-5",
              isCollapsed && "[&>svg]:size-6"
            )}
            size="icon-lg"
          />
        </div>
        {isCollapsed || !headerExtra ? null : (
          <div className="mt-3 border-t border-sidebar-border/60 pt-3">
            {headerExtra}
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="pb-0">{children}</SidebarContent>
      <HomeSidebarFooter />
    </Sidebar>
  );
}
