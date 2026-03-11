"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelect } from "@/components/ui/multi-select";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

const examinationOptions = [
  { value: "TEN", label: "TEN" },
  { value: "LAB", label: "LAB" },
  { value: "PROJ", label: "PROJ" },
  { value: "SEM", label: "SEM" },
  { value: "UPG", label: "UPG" },
] as const;

type FilterSectionLayout = "card" | "sidebar";

interface CourseFilterOptions {
  block: number[];
  campus: string[];
  huvudomraden: string[];
  level: string[];
  pace: string[];
  period: number[];
  programs: string[];
  term: number[];
}

export type ExaminationFilterMode = "include" | "exclude" | "ignore";

export interface FilterState {
  block: number[];
  campus: string[];
  examination: Record<string, ExaminationFilterMode>;
  huvudomraden: string[];
  level: string[];
  pace: string[];
  period: number[];
  programs: string[];
  search: string;
  term: number[];
}

export interface FilterPanelProps {
  courses: Course[];
  filterState: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters?: () => void;
}

interface FilterPanelControlsProps extends FilterPanelProps {
  className?: string;
  idPrefix?: string;
  layout?: FilterSectionLayout;
}

const getTermOptions = (courses: Course[]): number[] => {
  const allTerms = new Set<string>();

  for (const course of courses) {
    for (const term of course.term) {
      allTerms.add(term);
    }
  }

  const uniqueTerms = Array.from(allTerms).sort();
  const termOptions: number[] = [];

  if (uniqueTerms.includes("7") || uniqueTerms.includes("9")) {
    termOptions.push(7);
  }

  if (uniqueTerms.includes("8")) {
    termOptions.push(8);
  }

  return termOptions;
};

const getFilterOptions = (courses: Course[]): CourseFilterOptions => ({
  block: Array.from(
    new Set(
      courses
        .flatMap((course) => course.block)
        .map((value) => Number.parseInt(value, 10))
        .filter((value) => !Number.isNaN(value))
    )
  ).sort(),
  campus: Array.from(new Set(courses.map((course) => course.campus))).sort(),
  huvudomraden: Array.from(
    new Set(
      courses
        .flatMap((course) =>
          course.huvudomrade
            ? course.huvudomrade
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean)
            : []
        )
        .filter(Boolean)
    )
  ).sort(),
  level: Array.from(new Set(courses.map((course) => course.level))).sort(),
  pace: Array.from(new Set(courses.map((course) => course.pace))).sort(),
  period: Array.from(
    new Set(
      courses
        .flatMap((course) => course.period)
        .map((value) => Number.parseInt(value, 10))
        .filter((value) => !Number.isNaN(value))
    )
  ).sort(),
  programs: Array.from(
    new Set(
      courses
        .flatMap((course) => course.programs || [])
        .filter((program) => program.trim() !== "")
    )
  ).sort(),
  term: getTermOptions(courses),
});

const hasActiveFilterValues = (filterState: FilterState): boolean =>
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

const toggleFilterValue = (
  filterState: FilterState,
  filterType:
    | "block"
    | "campus"
    | "huvudomraden"
    | "level"
    | "pace"
    | "period"
    | "programs"
    | "term",
  value: number | string
): FilterState => {
  const nextFilters = { ...filterState };

  if (
    filterType === "campus" ||
    filterType === "huvudomraden" ||
    filterType === "level" ||
    filterType === "pace" ||
    filterType === "programs"
  ) {
    const currentValues = [...nextFilters[filterType]];
    nextFilters[filterType] = currentValues.includes(value as string)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value as string];
    return nextFilters;
  }

  const currentValues = [...nextFilters[filterType]];
  nextFilters[filterType] = currentValues.includes(value as number)
    ? currentValues.filter((item) => item !== value)
    : [...currentValues, value as number];

  return nextFilters;
};

const headingClassNames: Record<FilterSectionLayout, string> = {
  card: "text-xs",
  sidebar: "text-[0.7rem]",
};

const sectionGridClassNames: Record<FilterSectionLayout, string> = {
  card: "grid-cols-1 xl:grid-cols-2",
  sidebar: "grid-cols-1 xl:grid-cols-2",
};

function FilterSectionHeading({
  children,
  layout,
}: {
  children: string;
  layout: FilterSectionLayout;
}) {
  return (
    <h3
      className={cn(
        "font-semibold uppercase tracking-[0.2em] text-sidebar-foreground",
        headingClassNames[layout]
      )}
    >
      {children}
    </h3>
  );
}

export function FilterPanelControls({
  courses,
  filterState,
  onFilterChange,
  onResetFilters,
  className,
  idPrefix = "filters",
  layout = "card",
}: FilterPanelControlsProps) {
  const [showProgramTooltip, setShowProgramTooltip] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const filterOptions = getFilterOptions(courses);

  const handleMultiSelectChange = (
    filterType: "huvudomraden" | "programs",
    values: string[]
  ) => {
    onFilterChange({
      ...filterState,
      [filterType]: values,
    });
  };

  const handleCheckboxChange = (
    filterType:
      | "block"
      | "campus"
      | "huvudomraden"
      | "level"
      | "pace"
      | "period"
      | "programs"
      | "term",
    value: number | string
  ) => {
    onFilterChange(toggleFilterValue(filterState, filterType, value));
  };

  const handleExaminationChange = (
    value: string,
    mode: Exclude<ExaminationFilterMode, "ignore">
  ) => {
    const nextFilters = { ...filterState };

    if (nextFilters.examination[value] === mode) {
      const { [value]: _removed, ...remaining } = nextFilters.examination;
      nextFilters.examination = remaining;
    } else {
      nextFilters.examination = {
        ...nextFilters.examination,
        [value]: mode,
      };
    }

    onFilterChange(nextFilters);
  };

  const hasActiveFilters = hasActiveFilterValues(filterState);

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {onResetFilters && layout === "sidebar" ? (
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-[0.18em] text-sidebar-foreground/55">
            Filter stack
          </span>
          <Button
            className={cn(
              !hasActiveFilters && "pointer-events-none opacity-50"
            )}
            onClick={onResetFilters}
            size="sm"
            type="button"
            variant="ghost"
          >
            Reset
          </Button>
        </div>
      ) : null}

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <FilterSectionHeading layout={layout}>Program</FilterSectionHeading>
          <TooltipProvider>
            <Tooltip
              key={isMobile ? "mobile" : "desktop"}
              open={isMobile ? showProgramTooltip : undefined}
            >
              <TooltipTrigger
                render={
                  <button
                    aria-label="Show program info"
                    className="flex items-center justify-center rounded-md p-1 text-sidebar-foreground/70 transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    onBlur={() => {
                      if (isMobile) {
                        setShowProgramTooltip(false);
                      }
                    }}
                    onClick={() => {
                      if (isMobile) {
                        setShowProgramTooltip((previous) => !previous);
                      }
                    }}
                    type="button"
                  >
                    <Info className="size-4" />
                  </button>
                }
              />
              <TooltipContent sideOffset={4}>
                <p>
                  Program indicates the main degree program, such as Media
                  Technology and Engineering.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <MultiSelect
          className="text-sidebar-foreground [&_span.text-muted-foreground]:text-sidebar-foreground"
          defaultValue={filterState.programs}
          maxCount={0}
          onValueChange={(values) => {
            handleMultiSelectChange("programs", values);
          }}
          options={filterOptions.programs.map((program) => ({
            label: program,
            value: program,
          }))}
          placeholder="Select programs..."
          variant="secondary"
        />
      </section>

      <section className="flex flex-col gap-3">
        <FilterSectionHeading layout={layout}>
          Huvudomraden
        </FilterSectionHeading>
        <MultiSelect
          className="text-sidebar-foreground [&_span.text-muted-foreground]:text-sidebar-foreground"
          defaultValue={filterState.huvudomraden}
          maxCount={1}
          onValueChange={(values) => {
            handleMultiSelectChange("huvudomraden", values);
          }}
          options={filterOptions.huvudomraden.map((huvudomrade) => ({
            label: huvudomrade,
            value: huvudomrade,
          }))}
          placeholder="Select huvudomraden..."
          variant="secondary"
        />
      </section>

      <section className="flex flex-col gap-3">
        <FilterSectionHeading layout={layout}>Examination</FilterSectionHeading>
        <div className="flex flex-col gap-2 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/20 p-3">
          {examinationOptions.map((option) => {
            const mode = filterState.examination[option.value] ?? "ignore";
            return (
              <div
                className="flex items-center justify-between gap-2"
                key={option.value}
              >
                <span className="text-sm font-medium text-sidebar-foreground">
                  {option.label}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    className={cn(
                      "h-7 px-2 text-xs",
                      mode === "include" &&
                        "bg-green-600 text-white hover:bg-green-700"
                    )}
                    onClick={() => {
                      handleExaminationChange(option.value, "include");
                    }}
                    size="sm"
                    type="button"
                    variant={mode === "include" ? "default" : "outline"}
                  >
                    Include
                  </Button>
                  <Button
                    className={cn(
                      "h-7 px-2 text-xs",
                      mode === "exclude" &&
                        "bg-red-600 text-white hover:bg-red-700"
                    )}
                    onClick={() => {
                      handleExaminationChange(option.value, "exclude");
                    }}
                    size="sm"
                    type="button"
                    variant={mode === "exclude" ? "default" : "outline"}
                  >
                    Exclude
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className={cn("grid gap-5", sectionGridClassNames[layout])}>
        <section className="flex flex-col gap-3">
          <FilterSectionHeading layout={layout}>Level</FilterSectionHeading>
          <div className="grid gap-3">
            {filterOptions.level.map((level) => {
              const inputId = `${idPrefix}-level-${level}`;
              return (
                <div className="group flex items-center gap-3" key={inputId}>
                  <Checkbox
                    checked={filterState.level.includes(level)}
                    className="shrink-0 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    id={inputId}
                    onCheckedChange={() => {
                      handleCheckboxChange("level", level);
                    }}
                  />
                  <label
                    className="cursor-pointer text-sm font-medium leading-none text-sidebar-foreground transition-colors group-hover:text-primary"
                    htmlFor={inputId}
                  >
                    {level === "grundnivå" ? "Basic" : "Advanced"}
                  </label>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <FilterSectionHeading layout={layout}>
            Study Pace
          </FilterSectionHeading>
          <div className="grid gap-3">
            {filterOptions.pace.map((pace) => {
              const inputId = `${idPrefix}-pace-${pace}`;
              return (
                <div className="group flex items-center gap-3" key={inputId}>
                  <Checkbox
                    checked={filterState.pace.includes(pace)}
                    className="shrink-0 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    id={inputId}
                    onCheckedChange={() => {
                      handleCheckboxChange("pace", pace);
                    }}
                  />
                  <label
                    className="cursor-pointer text-sm font-medium leading-none text-sidebar-foreground transition-colors group-hover:text-primary"
                    htmlFor={inputId}
                  >
                    {pace}
                  </label>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className={cn("grid gap-5", sectionGridClassNames[layout])}>
        <section className="flex flex-col gap-3">
          <FilterSectionHeading layout={layout}>Period</FilterSectionHeading>
          <div className="grid gap-3">
            {filterOptions.period.map((period) => {
              const inputId = `${idPrefix}-period-${period}`;
              return (
                <div className="group flex items-center gap-3" key={inputId}>
                  <Checkbox
                    checked={filterState.period.includes(period)}
                    className="shrink-0 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    id={inputId}
                    onCheckedChange={() => {
                      handleCheckboxChange("period", period);
                    }}
                  />
                  <label
                    className="cursor-pointer text-sm font-medium leading-none text-sidebar-foreground transition-colors group-hover:text-primary"
                    htmlFor={inputId}
                  >
                    {period}
                  </label>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <FilterSectionHeading layout={layout}>Term</FilterSectionHeading>
          <div className="grid gap-3">
            {filterOptions.term.map((term) => {
              const inputId = `${idPrefix}-term-${term}`;
              return (
                <div className="group flex items-center gap-3" key={inputId}>
                  <Checkbox
                    checked={filterState.term.includes(term)}
                    className="shrink-0 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    id={inputId}
                    onCheckedChange={() => {
                      handleCheckboxChange("term", term);
                    }}
                  />
                  <label
                    className="cursor-pointer text-sm font-medium leading-none text-sidebar-foreground transition-colors group-hover:text-primary"
                    htmlFor={inputId}
                  >
                    {term === 7 ? "7 & 9" : term}
                  </label>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className={cn("grid gap-5", sectionGridClassNames[layout])}>
        <section className="flex flex-col gap-3">
          <FilterSectionHeading layout={layout}>Campus</FilterSectionHeading>
          <div className="grid gap-3">
            {filterOptions.campus.map((campus) => {
              const inputId = `${idPrefix}-campus-${campus}`;
              return (
                <div className="group flex items-center gap-3" key={inputId}>
                  <Checkbox
                    checked={filterState.campus.includes(campus)}
                    className="shrink-0 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    id={inputId}
                    onCheckedChange={() => {
                      handleCheckboxChange("campus", campus);
                    }}
                  />
                  <label
                    className="cursor-pointer text-sm font-medium leading-none text-sidebar-foreground transition-colors group-hover:text-primary"
                    htmlFor={inputId}
                  >
                    {campus}
                  </label>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <FilterSectionHeading layout={layout}>Block</FilterSectionHeading>
          <div className="grid gap-3">
            {filterOptions.block.map((block) => {
              const inputId = `${idPrefix}-block-${block}`;
              return (
                <div className="group flex items-center gap-3" key={inputId}>
                  <Checkbox
                    checked={filterState.block.includes(block)}
                    className="shrink-0 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    id={inputId}
                    onCheckedChange={() => {
                      handleCheckboxChange("block", block);
                    }}
                  />
                  <label
                    className="cursor-pointer text-sm font-medium leading-none text-sidebar-foreground transition-colors group-hover:text-primary"
                    htmlFor={inputId}
                  >
                    {block}
                  </label>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export function FilterPanel({
  courses,
  filterState,
  onFilterChange,
  onResetFilters,
}: FilterPanelProps) {
  return (
    <Card className="w-full border-sidebar-border bg-sidebar shadow-lg shadow-sidebar/10">
      <CardHeader className="gap-3 border-b border-sidebar-border bg-sidebar-accent/25">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg text-card-foreground">
            Filters
          </CardTitle>
          {onResetFilters ? (
            <Button
              onClick={onResetFilters}
              size="sm"
              type="button"
              variant="ghost"
            >
              Reset
            </Button>
          ) : null}
        </div>
        <Separator className="bg-sidebar-border" />
      </CardHeader>
      <CardContent className="px-6 py-6">
        <FilterPanelControls
          courses={courses}
          filterState={filterState}
          idPrefix="filter-panel"
          layout="card"
          onFilterChange={onFilterChange}
          onResetFilters={onResetFilters}
        />
      </CardContent>
    </Card>
  );
}
