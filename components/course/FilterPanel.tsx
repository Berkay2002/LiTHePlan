import { ChevronLeft, ChevronRight, Info, X } from "lucide-react";
import { useState } from "react";
import { LiThePlanLogo } from "@/components/LiThePlanLogo";
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
];

export type ExaminationFilterMode = 'include' | 'exclude' | 'ignore';

export interface FilterState {
  level: string[];
  term: number[];
  period: number[];
  block: number[];
  pace: string[];
  campus: string[];
  examination: Record<string, ExaminationFilterMode>; // Per-type include/exclude/ignore
  programs: string[]; // Multiple string selection for main programs
  huvudomraden: string[]; // Multiple string selection for huvudområden (replaces orientations)
  search: string; // New search field
}

export interface FilterPanelProps {
  courses: Course[];
  filterState: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
}

export interface CollapsibleFilterSidebarProps extends FilterPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function CollapsibleFilterSidebar({
  courses,
  filterState,
  onFilterChange,
  isOpen,
  onToggle,
}: CollapsibleFilterSidebarProps) {
  const [showProgramTooltip, setShowProgramTooltip] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Ensure courses is always an array
  const safeCourses = courses || [];

  // Generate unique filter options from course data
  const filterOptions = {
    level: Array.from(new Set(safeCourses.map((course) => course.level))),
    term: (() => {
      // Extract all unique terms from courses - now they're string arrays
      const allTerms = new Set<string>();
      safeCourses.forEach((course) => {
        course.term.forEach((term) => allTerms.add(term));
      });
      const uniqueTerms = Array.from(allTerms).sort();

      // Combine "7" & "9" into a single option, keep "8" separate
      const termOptions: number[] = [];
      if (uniqueTerms.includes("7") || uniqueTerms.includes("9")) {
        termOptions.push(7); // This represents "7 & 9"
      }
      if (uniqueTerms.includes("8")) {
        termOptions.push(8);
      }
      return termOptions;
    })(),
    period: Array.from(
      new Set(
        safeCourses
          .flatMap((course) => course.period)
          .map((p) => Number.parseInt(p))
          .filter((p) => !isNaN(p))
      )
    ).sort(),
    block: Array.from(
      new Set(
        safeCourses
          .flatMap((course) => course.block)
          .map((b) => Number.parseInt(b))
          .filter((b) => !isNaN(b))
      )
    ).sort(),
    pace: Array.from(new Set(safeCourses.map((course) => course.pace))),
    campus: Array.from(new Set(safeCourses.map((course) => course.campus))),
    programs: Array.from(
      new Set(
        safeCourses
          .flatMap((course) => course.programs || [])
          .filter((program) => program && program.trim() !== "")
      )
    ).sort(),
    huvudomraden: Array.from(
      new Set(
        safeCourses
          .flatMap((course) =>
            course.huvudomrade
              ? course.huvudomrade
                  .split(",")
                  .map((h) => h.trim())
                  .filter((h) => h !== "")
              : []
          )
          .filter((huvudomrade) => huvudomrade && huvudomrade.trim() !== "")
      )
    ).sort(),
  };

  const handleFilterChange = (
    filterType: keyof FilterState,
    value: string | number | null
  ) => {
    const newFilters = { ...filterState };

    if (filterType === "search") {
      // Search is single string selection
      newFilters[filterType] = value as string;
    } else if (
      filterType === "level" ||
      filterType === "pace" ||
      filterType === "campus" ||
      filterType === "huvudomraden" ||
      filterType === "examination" ||
      filterType === "programs"
    ) {
      // Array-based filters (checkboxes)
      const currentArray = [...(newFilters[filterType] as string[])];
      if (currentArray.includes(value as string)) {
        newFilters[filterType] = currentArray.filter((item) => item !== value);
      } else {
        newFilters[filterType] = [...currentArray, value as string];
      }
    } else {
      // term, period, block are number arrays
      const currentArray = [...(newFilters[filterType] as number[])];
      if (currentArray.includes(value as number)) {
        newFilters[filterType] = currentArray.filter((item) => item !== value);
      } else {
        newFilters[filterType] = [...currentArray, value as number];
      }
    }

    onFilterChange(newFilters);
  };

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
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
        {!isOpen && (
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

              {/* Tooltip on hover */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground border border-border shadow-xl text-sm font-medium px-4 py-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-100">
                Open Filters
              </div>
            </div>
          </div>
        )}

        {/* Expanded State - Full Sidebar Content */}
        {isOpen && (
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

                {/* Tooltip on hover */}
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground border border-border shadow-xl text-sm font-medium px-4 py-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-100">
                  Close Filters
                </div>
              </div>
            </div>

            {/* Mobile Header - Only show clear button and close on mobile */}
            <div className="shrink-0 p-4 border-b border-sidebar-border bg-sidebar-accent/30 lg:hidden">
              <div className="flex items-center justify-between">
                {/* Logo for mobile */}
                <div className="shrink-0">
                  <LiThePlanLogo
                    className="h-8 w-auto"
                    height={32}
                    width={200}
                  />
                </div>

                <div className="flex items-center gap-2">
                  {/* Enhanced Close button for mobile */}
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

            {/* Scrollable Filter Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-4 xl:p-6 pb-20 lg:pb-4 xl:pb-6 space-y-4 lg:space-y-4 xl:space-y-5 filter-panel-scroll">
              {/* Programs Filter - Dropdown */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm lg:text-sm xl:text-sm font-semibold text-sidebar-foreground uppercase tracking-wide">
                    Program
                  </h3>
                  <TooltipProvider>
                    <Tooltip open={isMobile ? showProgramTooltip : undefined}>
                      <TooltipTrigger asChild>
                        <button
                          className="flex items-center justify-center p-1 rounded-md hover:bg-sidebar-accent transition-colors duration-200 touch-manipulation"
                          onBlur={() =>
                            isMobile && setShowProgramTooltip(false)
                          }
                          onClick={() =>
                            isMobile &&
                            setShowProgramTooltip(!showProgramTooltip)
                          }
                        >
                          <Info className="h-5 w-5 text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-help transition-colors duration-200" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        onPointerDownOutside={() =>
                          isMobile && setShowProgramTooltip(false)
                        }
                        sideOffset={4}
                      >
                        <p>
                          Program indicates the main degree program (e.g., Media
                          Technology and Engineering).
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <MultiSelect
                  className="text-sidebar-foreground [&_span.text-muted-foreground]:text-sidebar-foreground"
                  defaultValue={filterState.programs || []}
                  maxCount={0}
                  onValueChange={(values) => {
                    const newFilters = { ...filterState };
                    newFilters.programs = values;
                    onFilterChange(newFilters);
                  }}
                  options={filterOptions.programs.map((program) => ({
                    value: program,
                    label: program,
                  }))}
                  placeholder="Välj program..."
                  variant="secondary"
                />
              </div>

              {/* Huvudområden Filter - Multi-Select */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm lg:text-sm xl:text-sm font-semibold text-sidebar-foreground uppercase tracking-wide">
                    Huvudområden
                  </h3>
                </div>
                <MultiSelect
                  className="text-sidebar-foreground [&_span.text-muted-foreground]:text-sidebar-foreground"
                  defaultValue={filterState.huvudomraden || []}
                  maxCount={1}
                  onValueChange={(values) => {
                    const newFilters = { ...filterState };
                    newFilters.huvudomraden = values;
                    onFilterChange(newFilters);
                  }}
                  options={filterOptions.huvudomraden.map((huvudomrade) => ({
                    value: huvudomrade,
                    label: huvudomrade,
                  }))}
                  placeholder="Välj huvudområden..."
                  variant="secondary"
                />
              </div>

              {/* Examination Filter - Tri-State (Include/Exclude/Ignore) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm lg:text-sm xl:text-sm font-semibold text-sidebar-foreground uppercase tracking-wide">
                    Examination
                  </h3>
                </div>
                <div className="space-y-2 bg-inherit p-3 rounded-md border shadow-sm">
                  {examinationOptions.map((option) => {
                    const mode = filterState.examination[option.value] || 'ignore';
                    return (
                      <div key={option.value} className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-sidebar-foreground">
                          {option.label}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            className={cn(
                              "h-7 px-2 text-xs",
                              mode === 'include' && "bg-green-600 hover:bg-green-700 text-white"
                            )}
                            onClick={() => {
                              const newFilters = { ...filterState };
                              if (mode === 'include') {
                                delete newFilters.examination[option.value];
                              } else {
                                newFilters.examination = { ...newFilters.examination, [option.value]: 'include' };
                              }
                              onFilterChange(newFilters);
                            }}
                            size="sm"
                            variant={mode === 'include' ? 'default' : 'outline'}
                          >
                            Include
                          </Button>
                          <Button
                            className={cn(
                              "h-7 px-2 text-xs",
                              mode === 'exclude' && "bg-red-600 hover:bg-red-700 text-white"
                            )}
                            onClick={() => {
                              const newFilters = { ...filterState };
                              if (mode === 'exclude') {
                                delete newFilters.examination[option.value];
                              } else {
                                newFilters.examination = { ...newFilters.examination, [option.value]: 'exclude' };
                              }
                              onFilterChange(newFilters);
                            }}
                            size="sm"
                            variant={mode === 'exclude' ? 'default' : 'outline'}
                          >
                            Exclude
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Level and Study Pace - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 xl:gap-6">
                {/* Level Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm lg:text-sm xl:text-sm font-semibold text-sidebar-foreground uppercase tracking-wide">
                      Level
                    </h3>
                  </div>
                  <div className="grid gap-3">
                    {filterOptions.level.map((level) => (
                      <div
                        className="flex items-center space-x-3 group"
                        key={`sidebar-level-${level}`}
                      >
                        <Checkbox
                          checked={filterState.level.includes(level)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary lg:h-4 lg:w-4 xl:h-4 xl:w-4 shrink-0"
                          id={`level-${level}`}
                          onCheckedChange={() =>
                            handleFilterChange("level", level)
                          }
                        />
                        <label
                          className="text-sm lg:text-sm xl:text-sm font-medium cursor-pointer text-sidebar-foreground group-hover:text-primary transition-colors leading-none"
                          htmlFor={`level-${level}`}
                        >
                          {level === "grundnivå" ? "Basic" : "Advanced"}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Study Pace Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm lg:text-sm xl:text-sm font-semibold text-sidebar-foreground uppercase tracking-wide">
                      Study Pace
                    </h3>
                  </div>
                  <div className="grid gap-3">
                    {filterOptions.pace.map((pace) => (
                      <div
                        className="flex items-center space-x-3 group"
                        key={`sidebar-pace-${pace}`}
                      >
                        <Checkbox
                          checked={filterState.pace.includes(pace)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary lg:h-4 lg:w-4 xl:h-4 xl:w-4 shrink-0"
                          id={`pace-${pace}`}
                          onCheckedChange={() =>
                            handleFilterChange("pace", pace)
                          }
                        />
                        <label
                          className="text-sm lg:text-sm xl:text-sm font-medium cursor-pointer text-sidebar-foreground group-hover:text-primary transition-colors leading-none"
                          htmlFor={`pace-${pace}`}
                        >
                          {pace}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Period and Term - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 xl:gap-6">
                {/* Period Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm lg:text-sm xl:text-sm font-semibold text-sidebar-foreground uppercase tracking-wide">
                      Period
                    </h3>
                  </div>
                  <div className="grid gap-3">
                    {filterOptions.period.map((period) => (
                      <div
                        className="flex items-center space-x-3 group"
                        key={`sidebar-period-${period}`}
                      >
                        <Checkbox
                          checked={filterState.period.includes(period)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary lg:h-4 lg:w-4 xl:h-4 xl:w-4 shrink-0"
                          id={`period-${period}`}
                          onCheckedChange={() =>
                            handleFilterChange("period", period)
                          }
                        />
                        <label
                          className="text-sm lg:text-sm xl:text-sm font-medium cursor-pointer text-sidebar-foreground group-hover:text-primary transition-colors leading-none"
                          htmlFor={`period-${period}`}
                        >
                          {period}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Term Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm lg:text-sm xl:text-sm font-semibold text-sidebar-foreground uppercase tracking-wide">
                      Term
                    </h3>
                  </div>
                  <div className="grid gap-3">
                    {filterOptions.term.map((term) => (
                      <div
                        className="flex items-center space-x-3 group"
                        key={`sidebar-term-${term}`}
                      >
                        <Checkbox
                          checked={filterState.term.includes(term)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary lg:h-4 lg:w-4 xl:h-4 xl:w-4 shrink-0"
                          id={`term-${term}`}
                          onCheckedChange={() =>
                            handleFilterChange("term", term)
                          }
                        />
                        <label
                          className="text-sm lg:text-sm xl:text-sm font-medium cursor-pointer text-sidebar-foreground group-hover:text-primary transition-colors leading-none"
                          htmlFor={`term-${term}`}
                        >
                          {term === 7 ? "7 & 9" : term}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Campus and Block - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 xl:gap-6">
                {/* Campus Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm lg:text-sm xl:text-sm font-semibold text-sidebar-foreground uppercase tracking-wide">
                      Campus
                    </h3>
                  </div>
                  <div className="grid gap-3">
                    {filterOptions.campus.map((campus) => (
                      <div
                        className="flex items-center space-x-3 group"
                        key={`sidebar-campus-${campus}`}
                      >
                        <Checkbox
                          checked={filterState.campus.includes(campus)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary lg:h-4 lg:w-4 xl:h-4 xl:w-4 shrink-0"
                          id={`campus-${campus}`}
                          onCheckedChange={() =>
                            handleFilterChange("campus", campus)
                          }
                        />
                        <label
                          className="text-sm lg:text-sm xl:text-sm font-medium cursor-pointer text-sidebar-foreground group-hover:text-primary transition-colors leading-none"
                          htmlFor={`campus-${campus}`}
                        >
                          {campus}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Block Filter - 4x1 horizontal layout */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm lg:text-sm xl:text-sm font-semibold text-sidebar-foreground uppercase tracking-wide">
                      Block
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {filterOptions.block.map((block) => (
                      <div
                        className="flex items-center space-x-3 group"
                        key={`sidebar-block-${block}`}
                      >
                        <Checkbox
                          checked={filterState.block.includes(block)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary lg:h-4 lg:w-4 xl:h-4 xl:w-4 shrink-0"
                          id={`block-${block}`}
                          onCheckedChange={() =>
                            handleFilterChange("block", block)
                          }
                        />
                        <label
                          className="text-sm lg:text-sm xl:text-sm font-medium cursor-pointer text-sidebar-foreground group-hover:text-primary transition-colors leading-none"
                          htmlFor={`block-${block}`}
                        >
                          {block}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Keep the original FilterPanel for backward compatibility (used in mobile Sheet)
export function FilterPanel({
  courses,
  filterState,
  onFilterChange,
}: FilterPanelProps) {
  const [showProgramTooltip, setShowProgramTooltip] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Ensure courses is always an array
  const safeCourses = courses || [];

  // All available programs (complete and incomplete)
  const allPrograms = [
    "Datateknik",
    "Design och produktutveckling",
    "Elektronik och systemdesign",
    "Energi – miljö – management",
    "Industriell ekonomi",
    "Informationsteknologi",
    "Kemisk biologi",
    "Maskinteknik",
    "Medicinsk teknik",
    "Media Technology and Engineering", // This is the complete one
    "Mjukvaruteknik",
    "Samhällsbyggnad och logistik",
    "Strategisk systemanalys",
    "Teknisk biologi",
    "Teknisk fysik och elektroteknik",
    "Teknisk matematik",
  ].sort();

  const completePrograms = ["Media Technology and Engineering"]; // Only this one is complete

  // Generate unique filter options from course data
  const filterOptions = {
    level: Array.from(new Set(safeCourses.map((course) => course.level))),
    term: (() => {
      // Extract all unique terms from courses - now they're string arrays
      const allTerms = new Set<string>();
      safeCourses.forEach((course) => {
        course.term.forEach((term) => allTerms.add(term));
      });
      const uniqueTerms = Array.from(allTerms).sort();

      // Combine "7" & "9" into a single option, keep "8" separate
      const termOptions: number[] = [];
      if (uniqueTerms.includes("7") || uniqueTerms.includes("9")) {
        termOptions.push(7); // This represents "7 & 9"
      }
      if (uniqueTerms.includes("8")) {
        termOptions.push(8);
      }
      return termOptions;
    })(),
    period: Array.from(
      new Set(
        safeCourses
          .flatMap((course) => course.period)
          .map((p) => Number.parseInt(p))
          .filter((p) => !isNaN(p))
      )
    ).sort(),
    block: Array.from(
      new Set(
        safeCourses
          .flatMap((course) => course.block)
          .map((b) => Number.parseInt(b))
          .filter((b) => !isNaN(b))
      )
    ).sort(),
    pace: Array.from(new Set(safeCourses.map((course) => course.pace))),
    campus: Array.from(new Set(safeCourses.map((course) => course.campus))),
    programs: Array.from(
      new Set(
        safeCourses
          .flatMap((course) => course.programs || [])
          .filter((program) => program && program.trim() !== "")
      )
    ).sort(),
    huvudomraden: Array.from(
      new Set(
        safeCourses
          .flatMap((course) =>
            course.huvudomrade
              ? course.huvudomrade
                  .split(",")
                  .map((h) => h.trim())
                  .filter((h) => h !== "")
              : []
          )
          .filter((huvudomrade) => huvudomrade && huvudomrade.trim() !== "")
      )
    ).sort(),
  };

  const handleFilterChange = (
    filterType: keyof FilterState,
    value: string | number | null
  ) => {
    const newFilters = { ...filterState };

    if (filterType === "search") {
      // Search is single string selection
      newFilters[filterType] = value as string;
    } else if (
      filterType === "level" ||
      filterType === "pace" ||
      filterType === "campus" ||
      filterType === "huvudomraden" ||
      filterType === "examination" ||
      filterType === "programs"
    ) {
      // Array-based filters (checkboxes)
      const currentArray = [...(newFilters[filterType] as string[])];
      if (currentArray.includes(value as string)) {
        newFilters[filterType] = currentArray.filter((item) => item !== value);
      } else {
        newFilters[filterType] = [...currentArray, value as string];
      }
    } else {
      // term, period, block are number arrays
      const currentArray = [...(newFilters[filterType] as number[])];
      if (currentArray.includes(value as number)) {
        newFilters[filterType] = currentArray.filter((item) => item !== value);
      } else {
        newFilters[filterType] = [...currentArray, value as number];
      }
    }

    onFilterChange(newFilters);
  };

  return (
    <Card className="w-full border border-sidebar-border bg-sidebar shadow-lg shadow-sidebar/20 ring-1 ring-sidebar-border/30">
      <CardHeader className="pb-3 bg-sidebar-accent/30 rounded-t-lg border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold tracking-tight text-card-foreground">
            Filters
          </CardTitle>
        </div>
        <Separator className="mt-3 bg-sidebar-border" />
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-6 bg-sidebar">
        {/* Programs Filter - Dropdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wide">
              Program
            </h3>
            <TooltipProvider>
              <Tooltip open={isMobile ? showProgramTooltip : undefined}>
                <TooltipTrigger asChild>
                  <button
                    className="flex items-center justify-center p-1 rounded-md hover:bg-sidebar-accent transition-colors duration-200 touch-manipulation"
                    onBlur={() => isMobile && setShowProgramTooltip(false)}
                    onClick={() =>
                      isMobile && setShowProgramTooltip(!showProgramTooltip)
                    }
                  >
                    <Info className="h-5 w-5 text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-help transition-colors duration-200" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  onPointerDownOutside={() =>
                    isMobile && setShowProgramTooltip(false)
                  }
                  sideOffset={4}
                >
                  <p>
                    Program indicates the main degree program (e.g., Media
                    Technology and Engineering).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <MultiSelect
            className="text-sidebar-foreground [&_span.text-muted-foreground]:text-sidebar-foreground"
            defaultValue={filterState.programs || []}
            maxCount={0}
            onValueChange={(values) => {
              const newFilters = { ...filterState };
              newFilters.programs = values;
              onFilterChange(newFilters);
            }}
            options={filterOptions.programs.map((program) => ({
              value: program,
              label: program,
            }))}
            placeholder="Välj program..."
            variant="secondary"
          />
        </div>

        {/* Huvudområden Filter - Multi-Select */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wide">
              Huvudområden
            </h3>
          </div>
          <MultiSelect
            className="text-sidebar-foreground [&_span.text-muted-foreground]:text-sidebar-foreground"
            defaultValue={filterState.huvudomraden || []}
            maxCount={1}
            onValueChange={(values) => {
              const newFilters = { ...filterState };
              newFilters.huvudomraden = values;
              onFilterChange(newFilters);
            }}
            options={filterOptions.huvudomraden.map((huvudomrade) => ({
              value: huvudomrade,
              label: huvudomrade,
            }))}
            placeholder="Välj huvudområden..."
            variant="secondary"
          />
        </div>

        {/* Examination Filter - Tri-State (Include/Exclude/Ignore) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wide">
              Examination
            </h3>
          </div>
          <div className="space-y-2 bg-inherit p-3 rounded-md border shadow-sm">
            {examinationOptions.map((option) => {
              const mode = filterState.examination[option.value] || 'ignore';
              return (
                <div key={option.value} className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-sidebar-foreground">
                    {option.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      className={cn(
                        "h-7 px-2 text-xs",
                        mode === 'include' && "bg-green-600 hover:bg-green-700 text-white"
                      )}
                      onClick={() => {
                        const newFilters = { ...filterState };
                        if (mode === 'include') {
                          delete newFilters.examination[option.value];
                        } else {
                          newFilters.examination = { ...newFilters.examination, [option.value]: 'include' };
                        }
                        onFilterChange(newFilters);
                      }}
                      size="sm"
                      variant={mode === 'include' ? 'default' : 'outline'}
                    >
                      Include
                    </Button>
                    <Button
                      className={cn(
                        "h-7 px-2 text-xs",
                        mode === 'exclude' && "bg-red-600 hover:bg-red-700 text-white"
                      )}
                      onClick={() => {
                        const newFilters = { ...filterState };
                        if (mode === 'exclude') {
                          delete newFilters.examination[option.value];
                        } else {
                          newFilters.examination = { ...newFilters.examination, [option.value]: 'exclude' };
                        }
                        onFilterChange(newFilters);
                      }}
                      size="sm"
                      variant={mode === 'exclude' ? 'default' : 'outline'}
                    >
                      Exclude
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Level and Study Pace - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Level Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wide">
                Level
              </h3>
            </div>
            <div className="grid gap-3">
              {filterOptions.level.map((level) => (
                <div
                  className="flex items-center space-x-3 group"
                  key={`mobile-level-${level}`}
                >
                  <Checkbox
                    checked={filterState.level.includes(level)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                    id={`level-${level}`}
                    onCheckedChange={() => handleFilterChange("level", level)}
                  />
                  <label
                    className="text-sm font-medium cursor-pointer group-hover:text-primary transition-colors leading-none"
                    htmlFor={`level-${level}`}
                  >
                    {level === "grundnivå" ? "Basic Level" : "Advanced Level"}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Study Pace Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wide">
                Study Pace
              </h3>
            </div>
            <div className="grid gap-3">
              {filterOptions.pace.map((pace) => (
                <div
                  className="flex items-center space-x-3 group"
                  key={`mobile-pace-${pace}`}
                >
                  <Checkbox
                    checked={filterState.pace.includes(pace)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                    id={`pace-${pace}`}
                    onCheckedChange={() => handleFilterChange("pace", pace)}
                  />
                  <label
                    className="text-sm font-medium cursor-pointer group-hover:text-primary transition-colors leading-none"
                    htmlFor={`pace-${pace}`}
                  >
                    {pace}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Term and Period - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Term Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wide">
                Term
              </h3>
            </div>
            <div className="grid gap-3">
              {filterOptions.term.map((term) => (
                <div
                  className="flex items-center space-x-3 group"
                  key={`mobile-term-${term}`}
                >
                  <Checkbox
                    checked={filterState.term.includes(term)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                    id={`term-${term}`}
                    onCheckedChange={() => handleFilterChange("term", term)}
                  />
                  <label
                    className="text-sm font-medium cursor-pointer group-hover:text-primary transition-colors leading-none"
                    htmlFor={`term-${term}`}
                  >
                    {term === 7 ? "7 & 9" : term}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Period Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wide">
                Period
              </h3>
            </div>
            <div className="grid gap-3">
              {filterOptions.period.map((period) => (
                <div
                  className="flex items-center space-x-3 group"
                  key={`mobile-period-${period}`}
                >
                  <Checkbox
                    checked={filterState.period.includes(period)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                    id={`period-${period}`}
                    onCheckedChange={() => handleFilterChange("period", period)}
                  />
                  <label
                    className="text-sm font-medium cursor-pointer group-hover:text-primary transition-colors leading-none"
                    htmlFor={`period-${period}`}
                  >
                    {period}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Campus and Block - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Campus Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wide">
                Campus
              </h3>
            </div>
            <div className="grid gap-3">
              {filterOptions.campus.map((campus) => (
                <div
                  className="flex items-center space-x-3 group"
                  key={`mobile-campus-${campus}`}
                >
                  <Checkbox
                    checked={filterState.campus.includes(campus)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                    id={`campus-${campus}`}
                    onCheckedChange={() => handleFilterChange("campus", campus)}
                  />
                  <label
                    className="text-sm font-medium cursor-pointer group-hover:text-primary transition-colors leading-none"
                    htmlFor={`campus-${campus}`}
                  >
                    {campus}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Block Filter - 4x1 horizontal layout (2x2 on mobile for space) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wide">
                Block
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {filterOptions.block.map((block) => (
                <div
                  className="flex items-center space-x-3 group"
                  key={`mobile-block-${block}`}
                >
                  <Checkbox
                    checked={filterState.block.includes(block)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                    id={`block-${block}`}
                    onCheckedChange={() => handleFilterChange("block", block)}
                  />
                  <label
                    className="text-sm font-medium cursor-pointer group-hover:text-primary transition-colors leading-none"
                    htmlFor={`block-${block}`}
                  >
                    {block}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
