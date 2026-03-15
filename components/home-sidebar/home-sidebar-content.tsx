"use client";

import { Minus, SlidersHorizontal } from "lucide-react";
import {
  FilterPanelControls,
  type FilterPanelProps,
} from "@/components/course/FilterPanel";
import { Button } from "@/components/ui/button";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const hasActiveFilterValues = (
  filterState: FilterPanelProps["filterState"]
): boolean =>
  filterState.search.trim().length > 0 ||
  filterState.block.length > 0 ||
  filterState.campus.length > 0 ||
  Object.keys(filterState.examination).length > 0 ||
  filterState.huvudomraden.length > 0 ||
  filterState.level.length > 0 ||
  filterState.pace.length > 0 ||
  filterState.period.length > 0 ||
  filterState.programs.length > 0 ||
  filterState.term.length > 0;

export function HomeSidebarContent(props: FilterPanelProps) {
  const { isMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const hasActiveFilters = hasActiveFilterValues(props.filterState);

  return (
    <SidebarContent className="pb-0">
      <SidebarGroup className={cn("px-3 py-3", isCollapsed && "px-2")}>
        {isCollapsed ? null : (
          <div className="mb-2 flex items-center justify-between px-2">
            <SidebarGroupLabel className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/55">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Course Filters</span>
            </SidebarGroupLabel>
            {props.onResetFilters ? (
              <Button
                className={cn(
                  "h-6 px-2 text-xs transition-all duration-200",
                  !hasActiveFilters && "pointer-events-none opacity-40"
                )}
                onClick={props.onResetFilters}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Minus className="mr-1 h-3 w-3" />
                Reset
              </Button>
            ) : null}
          </div>
        )}
        <SidebarGroupContent>
          {isCollapsed ? null : (
            <FilterPanelControls
              {...props}
              className="px-2 pb-4"
              idPrefix="home-sidebar"
              layout="sidebar"
              onResetFilters={undefined}
            />
          )}
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
