"use client";

import Link from "next/link";
import type { FilterPanelProps } from "@/components/course/FilterPanel";
import { LiThePlanLogo } from "@/components/LiThePlanLogo";
import { SearchBar } from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { HomeSidebarContent } from "./home-sidebar-content";
import { HomeSidebarFooter } from "./home-sidebar-footer";

interface HomeSidebarProps extends FilterPanelProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
}

function HomeSidebarBrand() {
  return (
    <Link className="flex min-w-0 items-center gap-3" href="/">
      <LiThePlanLogo className="h-8 w-auto" height={32} />
    </Link>
  );
}

function HomeSidebarMobileBrand() {
  return (
    <Link className="flex min-w-0 justify-center" href="/">
      <div className="flex min-w-0 flex-col items-center px-2 py-1">
        <LiThePlanLogo className="h-5 w-auto shrink-0" height={20} />
        <span aria-hidden="true" className="mt-1 h-px w-16 bg-border/70" />
      </div>
    </Link>
  );
}

function HomeSidebarMobileMenuTrigger() {
  return (
    <SidebarTrigger
      className="size-10 rounded-none border-0 bg-transparent p-0 text-foreground/88 shadow-none transition-opacity duration-150 hover:bg-transparent hover:text-foreground hover:opacity-80 focus-visible:bg-transparent focus-visible:ring-0 focus-visible:opacity-80 [&>svg]:size-6"
      size="icon-lg"
    />
  );
}

export function HomeSidebar({
  courses,
  filterState,
  onFilterChange,
  onResetFilters,
  onSearchChange,
  searchQuery,
}: HomeSidebarProps) {
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
          {isCollapsed ? null : <HomeSidebarBrand />}
          <SidebarTrigger
            className="size-11 rounded-2xl text-sidebar-foreground/72 transition-colors duration-150 hover:bg-sidebar-accent/45 hover:text-sidebar-foreground focus-visible:bg-sidebar-accent/45 focus-visible:text-sidebar-foreground [&>svg]:size-5"
            size="icon-lg"
          />
        </div>
        {isCollapsed ? null : (
          <div className="mt-3 border-t border-sidebar-border/60 pt-3">
            <SearchBar
              className="max-w-none border-sidebar-border/80 bg-sidebar-accent/20"
              onChange={onSearchChange}
              placeholder="Search courses by name or code..."
              value={searchQuery}
            />
          </div>
        )}
      </SidebarHeader>

      <HomeSidebarContent
        courses={courses}
        filterState={filterState}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
      />
      <HomeSidebarFooter />
    </Sidebar>
  );
}

export function HomeSidebarMobileBar() {
  return (
    <div className="sticky top-0 z-30 border-b border-border/60 bg-background/92 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-linear-to-r from-transparent via-border/60 to-transparent"
      />
      <div className="grid h-15 grid-cols-[auto_1fr_auto] items-center gap-2.5 px-4">
        <HomeSidebarMobileMenuTrigger />
        <div className="min-w-0">
          <HomeSidebarMobileBrand />
        </div>
        <Button
          className="h-9 rounded-xl border-border/70 bg-transparent px-3 text-[0.72rem] font-medium tracking-[0.02em] text-foreground/86 transition-[background-color,border-color,color] duration-150 hover:bg-muted/38 hover:text-foreground focus-visible:border-ring focus-visible:bg-muted/38 focus-visible:text-foreground focus-visible:ring-ring/20"
          nativeButton={false}
          render={<Link href="/profile/edit" />}
          size="sm"
          variant="outline"
        >
          <span className="max-[359px]:hidden">Course </span>
          <span>Profile</span>
        </Button>
      </div>
    </div>
  );
}
