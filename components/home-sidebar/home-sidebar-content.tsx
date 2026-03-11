"use client";

import { SlidersHorizontal } from "lucide-react";
import {
  FilterPanelControls,
  type FilterPanelProps,
} from "@/components/course/FilterPanel";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface CollapsedFilterSnapshot {
  description: string;
  key: string;
  label: string;
  value: string;
}

const DEFAULT_FILTER_LEVEL_COUNT = 2;

const isDefinedSnapshot = (
  snapshot: CollapsedFilterSnapshot | null
): snapshot is CollapsedFilterSnapshot => snapshot !== null;

const createCountSnapshot = ({
  count,
  descriptionLabel,
  key,
  label,
}: {
  count: number;
  descriptionLabel: string;
  key: string;
  label: string;
}): CollapsedFilterSnapshot | null => {
  if (count === 0) {
    return null;
  }

  return {
    description: `${descriptionLabel} filter active with ${count} selected option${count === 1 ? "" : "s"}`,
    key,
    label,
    value: `${count}`,
  };
};

const getTermSnapshot = (
  selectedTerms: number[]
): CollapsedFilterSnapshot | null => {
  if (selectedTerms.length === 0) {
    return null;
  }

  let value = `${selectedTerms.length}`;

  if (selectedTerms.length === 1) {
    value = selectedTerms[0] === 7 ? "7/9" : `${selectedTerms[0]}`;
  }

  return {
    description: `Term filter active with ${selectedTerms.length} selected option${selectedTerms.length === 1 ? "" : "s"}`,
    key: "term",
    label: "TRM",
    value,
  };
};

const getLevelSnapshot = (
  selectedLevels: string[]
): CollapsedFilterSnapshot | null => {
  if (selectedLevels.length === 0) {
    return null;
  }

  let value = `${selectedLevels.length}`;

  if (selectedLevels.length === 1) {
    value = selectedLevels[0] === "grundnivå" ? "BSC" : "ADV";
  }

  return {
    description: `Level filter active with ${selectedLevels.length} selected option${selectedLevels.length === 1 ? "" : "s"}`,
    key: "level",
    label: "LVL",
    value,
  };
};

const countActiveFilterGroups = (
  filterState: FilterPanelProps["filterState"]
): number =>
  [
    filterState.programs.length > 0,
    filterState.huvudomraden.length > 0,
    filterState.level.length > 0,
    filterState.pace.length > 0,
    filterState.period.length > 0,
    filterState.term.length > 0,
    filterState.campus.length > 0,
    filterState.block.length > 0,
    Object.keys(filterState.examination).length > 0,
  ].filter(Boolean).length;

const getActiveCollapsedSnapshots = (
  filterState: FilterPanelProps["filterState"]
): CollapsedFilterSnapshot[] =>
  [
    getTermSnapshot(filterState.term),
    getLevelSnapshot(filterState.level),
    createCountSnapshot({
      count: filterState.programs.length,
      descriptionLabel: "Program",
      key: "programs",
      label: "PGM",
    }),
    createCountSnapshot({
      count: Object.keys(filterState.examination).length,
      descriptionLabel: "Examination",
      key: "examination",
      label: "EXM",
    }),
    createCountSnapshot({
      count: filterState.campus.length,
      descriptionLabel: "Campus",
      key: "campus",
      label: "CMP",
    }),
    createCountSnapshot({
      count: filterState.period.length,
      descriptionLabel: "Period",
      key: "period",
      label: "PRD",
    }),
    createCountSnapshot({
      count: filterState.block.length,
      descriptionLabel: "Block",
      key: "block",
      label: "BLK",
    }),
    createCountSnapshot({
      count: filterState.huvudomraden.length,
      descriptionLabel: "Huvudomraden",
      key: "huvudomraden",
      label: "HVD",
    }),
    createCountSnapshot({
      count: filterState.pace.length,
      descriptionLabel: "Study pace",
      key: "pace",
      label: "PCE",
    }),
  ].filter(isDefinedSnapshot);

const getAvailableTermSnapshotValue = (
  courses: FilterPanelProps["courses"]
): string => {
  const courseTerms = new Set<string>();

  for (const course of courses) {
    for (const term of course.term) {
      courseTerms.add(term);
    }
  }

  const availableTerms: string[] = [];

  if (courseTerms.has("7") || courseTerms.has("9")) {
    availableTerms.push("7/9");
  }

  if (courseTerms.has("8")) {
    availableTerms.push("8");
  }

  return availableTerms.join(" ") || "All";
};

const getCollapsedFilterSnapshots = ({
  courses,
  filterState,
}: FilterPanelProps): CollapsedFilterSnapshot[] => {
  const activeGroupCount = countActiveFilterGroups(filterState);
  const activeSnapshots = getActiveCollapsedSnapshots(filterState);

  const fallbackSnapshots: CollapsedFilterSnapshot[] = [
    {
      description: "Filter stack is currently showing all available options",
      key: "filters",
      label: "FLT",
      value: activeGroupCount === 0 ? "ALL" : `${activeGroupCount}`,
    },
    {
      description: "Term filters available in the expanded sidebar",
      key: "term-availability",
      label: "TRM",
      value: getAvailableTermSnapshotValue(courses),
    },
    {
      description: "Examination filters available in the expanded sidebar",
      key: "examination-availability",
      label: "EXM",
      value: "5",
    },
    {
      description: "Level filters available in the expanded sidebar",
      key: "level-availability",
      label: "LVL",
      value: `${DEFAULT_FILTER_LEVEL_COUNT}`,
    },
  ];

  const snapshots = [
    fallbackSnapshots[0],
    ...activeSnapshots,
    ...fallbackSnapshots.slice(1),
  ];

  return snapshots
    .filter(
      (snapshot, index, collection) =>
        collection.findIndex((item) => item.key === snapshot.key) === index
    )
    .slice(0, 3);
};

export function HomeSidebarContent(props: FilterPanelProps) {
  const { isMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const collapsedSnapshots = getCollapsedFilterSnapshots(props);

  return (
    <SidebarContent className="pb-0">
      <SidebarGroup className={cn("px-3 py-3", isCollapsed && "px-2")}>
        {isCollapsed ? null : (
          <SidebarGroupLabel className="mb-2 flex items-center gap-2 px-2 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/55">
            <SlidersHorizontal />
            <span>Course Filters</span>
          </SidebarGroupLabel>
        )}
        <SidebarGroupContent>
          {isCollapsed ? (
            <div className="flex w-full flex-col gap-2 py-2">
              {collapsedSnapshots.map((snapshot, index) => (
                <div
                  className={cn(
                    "flex min-h-11 w-full flex-col items-center justify-center rounded-[1rem] border px-1 py-2 text-center shadow-sm",
                    index === 0 && snapshot.value !== "ALL"
                      ? "border-sidebar-border bg-sidebar-accent/60 text-sidebar-foreground"
                      : "border-sidebar-border/60 bg-sidebar-accent/25 text-sidebar-foreground/85"
                  )}
                  key={snapshot.key}
                >
                  <span className="text-[0.5rem] font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/55">
                    {snapshot.label}
                  </span>
                  <span className="mt-1 text-[0.72rem] font-semibold leading-none">
                    {snapshot.value}
                  </span>
                  <span className="sr-only">{snapshot.description}</span>
                </div>
              ))}
              <span className="sr-only">
                Expand the sidebar to adjust course filters.
              </span>
            </div>
          ) : (
            <FilterPanelControls
              {...props}
              className="px-2 pb-4"
              idPrefix="home-sidebar"
              layout="sidebar"
            />
          )}
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
