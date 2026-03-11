"use client";

import { Check, Info, Minus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
type ExaminationFilterMode = "include" | "exclude" | "ignore";

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

export type { ExaminationFilterMode };

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

// Animated Examination Toggle Component
function ExaminationToggle({
  mode,
  onChange,
  label,
}: {
  mode: ExaminationFilterMode;
  onChange: (mode: Exclude<ExaminationFilterMode, "ignore">) => void;
  label: string;
}) {
  return (
    <div className="group flex items-center justify-between gap-3 py-2">
      <span className="text-sm font-medium text-sidebar-foreground/90 transition-colors group-hover:text-sidebar-foreground">
        {label}
      </span>
      <div className="relative flex items-center rounded-lg bg-sidebar-accent/40 p-1 ring-1 ring-sidebar-border/50">
        {/* Sliding background indicator */}
        <div
          className={cn(
            "absolute h-6 w-14 rounded-md bg-background shadow-sm ring-1 ring-sidebar-border/30 transition-all duration-200 ease-out",
            mode === "include" && "left-1 translate-x-0",
            mode === "exclude" && "left-1 translate-x-[3.5rem]",
            mode === "ignore" && "opacity-0 scale-90"
          )}
        />

        <button
          aria-pressed={mode === "include"}
          className={cn(
            "relative z-10 flex h-6 w-14 items-center justify-center gap-1 rounded-md text-xs font-medium transition-colors duration-200",
            mode === "include"
              ? "text-green-700"
              : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80"
          )}
          onClick={() => onChange("include")}
          type="button"
        >
          <Check className="h-3 w-3" />
          <span>In</span>
        </button>

        <button
          aria-pressed={mode === "exclude"}
          className={cn(
            "relative z-10 flex h-6 w-14 items-center justify-center gap-1 rounded-md text-xs font-medium transition-colors duration-200",
            mode === "exclude"
              ? "text-red-700"
              : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80"
          )}
          onClick={() => onChange("exclude")}
          type="button"
        >
          <X className="h-3 w-3" />
          <span>Out</span>
        </button>
      </div>
    </div>
  );
}

// Animated Checkbox Option Component
function FilterCheckboxOption({
  checked,
  id,
  label,
  onChange,
}: {
  checked: boolean;
  id: string;
  label: React.ReactNode;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-all duration-150",
        "hover:bg-sidebar-accent/30",
        checked && "bg-sidebar-accent/20"
      )}
      htmlFor={id}
    >
      <div
        className={cn(
          "relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
          checked
            ? "border-primary bg-primary"
            : "border-sidebar-border/70 bg-background group-hover:border-sidebar-border"
        )}
      >
        <Check
          className={cn(
            "h-3 w-3 text-primary-foreground transition-all duration-200",
            checked ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
          strokeWidth={3}
        />
      </div>
      <input
        checked={checked}
        className="sr-only"
        id={id}
        onChange={onChange}
        type="checkbox"
      />
      <span
        className={cn(
          "text-sm font-medium leading-none transition-colors duration-150",
          checked
            ? "text-sidebar-foreground"
            : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground/90"
        )}
      >
        {label}
      </span>
    </label>
  );
}

// Section Header Component
function FilterSectionHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-center gap-2", className)}>
      <div className="h-px flex-1 bg-gradient-to-r from-sidebar-border/80 to-transparent" />
      <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/55">
        {children}
      </h3>
      <div className="h-px flex-1 bg-gradient-to-l from-sidebar-border/80 to-transparent" />
    </div>
  );
}

// Filter Section Container
function FilterSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <section
      className={cn("animate-fade-in-up opacity-0", className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: "400ms",
        animationFillMode: "forwards",
      }}
    >
      {children}
    </section>
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
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Header with Reset */}
      {onResetFilters && layout === "sidebar" ? (
        <FilterSection className="flex items-center justify-between gap-3">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40">
            Filter Options
          </span>
          <Button
            className={cn(
              "h-7 px-3 text-xs transition-all duration-200",
              !hasActiveFilters && "pointer-events-none opacity-40"
            )}
            onClick={onResetFilters}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Minus className="mr-1 h-3 w-3" />
            Reset
          </Button>
        </FilterSection>
      ) : null}

      {/* Program Section */}
      <FilterSection delay={50}>
        <div className="flex items-center gap-2">
          <FilterSectionHeader>Program</FilterSectionHeader>
          <TooltipProvider>
            <Tooltip
              key={isMobile ? "mobile" : "desktop"}
              open={isMobile ? showProgramTooltip : undefined}
            >
              <TooltipTrigger
                render={
                  <button
                    aria-label="Show program info"
                    className="flex h-5 w-5 items-center justify-center rounded-full text-sidebar-foreground/40 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground/70"
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
                    <Info className="h-3.5 w-3.5" />
                  </button>
                }
              />
              <TooltipContent sideOffset={4}>
                <p className="max-w-[200px] text-xs">
                  Program indicates the main degree program, such as Media
                  Technology and Engineering.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <MultiSelect
          className="text-sidebar-foreground [&_span.text-muted-foreground]:text-sidebar-foreground/60"
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
      </FilterSection>

      {/* Huvudomraden Section */}
      <FilterSection delay={100}>
        <FilterSectionHeader>Huvudområden</FilterSectionHeader>
        <MultiSelect
          className="text-sidebar-foreground [&_span.text-muted-foreground]:text-sidebar-foreground/60"
          defaultValue={filterState.huvudomraden}
          maxCount={1}
          onValueChange={(values) => {
            handleMultiSelectChange("huvudomraden", values);
          }}
          options={filterOptions.huvudomraden.map((huvudomrade) => ({
            label: huvudomrade,
            value: huvudomrade,
          }))}
          placeholder="Select huvudområden..."
          variant="secondary"
        />
      </FilterSection>

      {/* Examination Section with Animated Toggles */}
      <FilterSection delay={150}>
        <FilterSectionHeader>Examination</FilterSectionHeader>
        <div className="rounded-xl border border-sidebar-border/40 bg-sidebar-accent/15 p-4">
          {examinationOptions.map((option) => {
            const mode = filterState.examination[option.value] ?? "ignore";
            return (
              <ExaminationToggle
                key={option.value}
                label={option.label}
                mode={mode}
                onChange={(newMode) => {
                  handleExaminationChange(option.value, newMode);
                }}
              />
            );
          })}
        </div>
      </FilterSection>

      {/* Level & Study Pace Grid */}
      <FilterSection className="grid gap-6 sm:grid-cols-2" delay={200}>
        <div>
          <FilterSectionHeader>Level</FilterSectionHeader>
          <div className="space-y-1">
            {filterOptions.level.map((level) => {
              const inputId = `${idPrefix}-level-${level}`;
              return (
                <FilterCheckboxOption
                  checked={filterState.level.includes(level)}
                  id={inputId}
                  key={inputId}
                  label={level === "grundnivå" ? "Basic" : "Advanced"}
                  onChange={() => {
                    handleCheckboxChange("level", level);
                  }}
                />
              );
            })}
          </div>
        </div>

        <div>
          <FilterSectionHeader>Study Pace</FilterSectionHeader>
          <div className="space-y-1">
            {filterOptions.pace.map((pace) => {
              const inputId = `${idPrefix}-pace-${pace}`;
              return (
                <FilterCheckboxOption
                  checked={filterState.pace.includes(pace)}
                  id={inputId}
                  key={inputId}
                  label={pace}
                  onChange={() => {
                    handleCheckboxChange("pace", pace);
                  }}
                />
              );
            })}
          </div>
        </div>
      </FilterSection>

      {/* Period & Term Grid */}
      <FilterSection className="grid gap-6 sm:grid-cols-2" delay={250}>
        <div>
          <FilterSectionHeader>Period</FilterSectionHeader>
          <div className="space-y-1">
            {filterOptions.period.map((period) => {
              const inputId = `${idPrefix}-period-${period}`;
              return (
                <FilterCheckboxOption
                  checked={filterState.period.includes(period)}
                  id={inputId}
                  key={inputId}
                  label={`Period ${period}`}
                  onChange={() => {
                    handleCheckboxChange("period", period);
                  }}
                />
              );
            })}
          </div>
        </div>

        <div>
          <FilterSectionHeader>Term</FilterSectionHeader>
          <div className="space-y-1">
            {filterOptions.term.map((term) => {
              const inputId = `${idPrefix}-term-${term}`;
              return (
                <FilterCheckboxOption
                  checked={filterState.term.includes(term)}
                  id={inputId}
                  key={inputId}
                  label={term === 7 ? "7 & 9" : `${term}`}
                  onChange={() => {
                    handleCheckboxChange("term", term);
                  }}
                />
              );
            })}
          </div>
        </div>
      </FilterSection>

      {/* Campus & Block Grid */}
      <FilterSection className="grid gap-6 sm:grid-cols-2" delay={300}>
        <div>
          <FilterSectionHeader>Campus</FilterSectionHeader>
          <div className="space-y-1">
            {filterOptions.campus.map((campus) => {
              const inputId = `${idPrefix}-campus-${campus}`;
              return (
                <FilterCheckboxOption
                  checked={filterState.campus.includes(campus)}
                  id={inputId}
                  key={inputId}
                  label={campus}
                  onChange={() => {
                    handleCheckboxChange("campus", campus);
                  }}
                />
              );
            })}
          </div>
        </div>

        <div>
          <FilterSectionHeader>Block</FilterSectionHeader>
          <div className="space-y-1">
            {filterOptions.block.map((block) => {
              const inputId = `${idPrefix}-block-${block}`;
              return (
                <FilterCheckboxOption
                  checked={filterState.block.includes(block)}
                  id={inputId}
                  key={inputId}
                  label={`Block ${block}`}
                  onChange={() => {
                    handleCheckboxChange("block", block);
                  }}
                />
              );
            })}
          </div>
        </div>
      </FilterSection>
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
