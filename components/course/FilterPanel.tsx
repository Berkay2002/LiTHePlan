import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LiTHePlanLogo } from "@/components/LiTHePlanLogo";

export interface FilterState {
  level: string[];
  term: number[];
  period: number[];
  block: number[];
  pace: string[];
  campus: string[];
  examination: { [key: string]: 'include' | 'exclude' | 'ignore' }; // Per-examination-type controls
  programs: string; // Changed to single string selection
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

export function CollapsibleFilterSidebar({ courses, filterState, onFilterChange, onResetFilters, isOpen, onToggle }: CollapsibleFilterSidebarProps) {
  // Generate unique filter options from course data
  const filterOptions = {
    level: Array.from(new Set(courses.map(course => course.level))),
    term: (() => {
      // Extract all unique terms from courses - now they're string arrays
      const allTerms = new Set<string>();
      courses.forEach(course => {
        course.term.forEach(term => allTerms.add(term));
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
    period: Array.from(new Set(courses.flatMap(course => course.period).map(p => parseInt(p)).filter(p => !isNaN(p)))).sort(),
    block: Array.from(new Set(courses.flatMap(course => course.block).map(b => parseInt(b)).filter(b => !isNaN(b)))).sort(),
    pace: Array.from(new Set(courses.map(course => course.pace))),
    campus: Array.from(new Set(courses.map(course => course.campus))),
    examination: Array.from(new Set(courses.flatMap(course => course.examination))).filter(exam => ['TEN', 'LAB', 'PROJ', 'SEM', 'UPG'].includes(exam)).sort(),
    programs: Array.from(new Set(courses.flatMap(course => course.programs))).sort(),
  };

  const handleFilterChange = (filterType: keyof FilterState, value: string | number | null) => {
    const newFilters = { ...filterState };
    
    if (filterType === 'programs' || filterType === 'search') {
      // Programs and search are single string selections
      newFilters[filterType] = value as string;
    } else if (filterType === 'examination') {
      // Examination is now an object with per-type controls
      // value should be in format "examType:mode" (e.g., "TEN:exclude")
      const [examType, mode] = (value as string).split(':');
      newFilters.examination = {
        ...newFilters.examination,
        [examType]: mode as 'include' | 'exclude' | 'ignore'
      };
    } else if (filterType === 'level' || filterType === 'pace' || filterType === 'campus') {
      // Array-based filters (checkboxes)
      const currentArray = [...(newFilters[filterType] as string[])];
      if (currentArray.includes(value as string)) {
        newFilters[filterType] = currentArray.filter(item => item !== value);
      } else {
        newFilters[filterType] = [...currentArray, value as string];
      }
    } else {
      // term, period, block are number arrays
      const currentArray = [...(newFilters[filterType] as number[])];
      if (currentArray.includes(value as number)) {
        newFilters[filterType] = currentArray.filter(item => item !== value);
      } else {
        newFilters[filterType] = [...currentArray, value as number];
      }
    }
    
    onFilterChange(newFilters);
  };

  const getActiveFilterCount = () => {
    return Object.entries(filterState).reduce((count, [key, value]) => {
      if (key === 'programs' || key === 'search') {
        return count + (value ? 1 : 0);
      }
      if (key === 'examination') {
        // Count non-ignore examination filters
        return count + Object.values(value as { [key: string]: string }).filter(mode => mode !== 'ignore').length;
      }
      return count + (value as (string | number)[]).length;
    }, 0);
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onToggle}
        />
      )}

      {/* Collapsible Sidebar - Fixed position */}
      <div className={cn(
        "fixed top-0 left-0 h-screen lg:top-20 lg:h-[calc(100vh-5rem)] bg-air-superiority-blue-400 border-r-2 border-air-superiority-blue-300/40 shadow-xl shadow-air-superiority-blue-200/20 z-50 transition-all duration-300 ease-in-out",
        "flex flex-col ring-1 ring-air-superiority-blue-300/30",
        isOpen ? "w-72 lg:w-80 xl:w-96" : "w-0 lg:w-12",
        "lg:fixed lg:z-30 lg:shadow-2xl lg:shadow-air-superiority-blue-300/30"
      )}>
        {/* Collapsed State - Modern Toggle Button (Desktop Only) */}
        {!isOpen && (
          <div className="hidden lg:flex flex-col items-center justify-center h-full w-12 relative">
            {/* Modern Floating Expand Button */}
            <div className="relative group">
              <Button
                onClick={onToggle}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <ChevronRight className="h-5 w-5 text-white group-hover:text-primary transition-colors duration-200" />
              </Button>
              
              {/* Tooltip on hover */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Open Filters
              </div>
            </div>
            
            {/* Filter Count Badge */}
            {activeFilterCount > 0 && (
              <div className="absolute top-6 right-1">
                <div className="h-5 w-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <span className="text-xs font-bold text-white">{activeFilterCount}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expanded State - Full Sidebar Content */}
        {isOpen && (
          <div className="flex flex-col h-full relative">
            {/* Modern Floating Collapse Button - Right Edge (Desktop Only) */}
            <div className="hidden lg:block absolute -right-6 top-1/2 z-50" style={{ transform: 'translateY(-50%)' }}>
              <div className="relative group">
                <Button
                  onClick={onToggle}
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 bg-air-superiority-blue-400/90 hover:bg-air-superiority-blue-500 backdrop-blur-sm border border-air-superiority-blue-300 hover:border-air-superiority-blue-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <ChevronLeft className="h-5 w-5 text-white group-hover:text-picton-blue transition-colors duration-200" />
                </Button>
                
                {/* Tooltip on hover */}
                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Close Filters
                </div>
              </div>
            </div>

            {/* Mobile Header - Only show clear button and close on mobile */}
            <div className="flex-shrink-0 p-4 border-b border-air-superiority-blue-300/40 bg-air-superiority-blue-300/30 lg:hidden">
              <div className="flex items-center justify-between">
                {/* Logo for mobile */}
                <div className="flex-shrink-0">
                  <LiTHePlanLogo 
                    width={200} 
                    height={32} 
                    className="h-8 w-auto" 
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <>
                      <Badge variant="secondary" className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-white border-primary/20">
                        {activeFilterCount} active
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={onResetFilters}
                        className="h-8 px-2 text-xs text-white hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    </>
                  )}
                  {/* Enhanced Close button for mobile */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="h-10 w-10 p-0 text-white hover:bg-white/20 hover:scale-110 transition-all duration-200 rounded-full border border-white/30 hover:border-white/50"
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
                  <h3 className="text-sm lg:text-sm xl:text-sm font-semibold text-white uppercase tracking-wide">Program</h3>
                </div>
                <Select 
                  value={filterState.programs || undefined} 
                  onValueChange={(value) => handleFilterChange('programs', value === "all" ? "" : value)}
                >
                  <SelectTrigger className="w-full h-10 lg:h-11 xl:h-12 2xl:h-14 text-sm lg:text-sm xl:text-sm data-[placeholder]:text-white">
                    <SelectValue placeholder="Select a program..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {filterOptions.programs.map((program) => (
                      <SelectItem key={program} value={program}>
                        {program}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level and Study Pace - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 xl:gap-6">
                {/* Level Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm lg:text-sm xl:text-sm font-semibold text-white uppercase tracking-wide">Level</h3>
                  </div>
                  <div className="grid gap-3">
                    {filterOptions.level.map((level) => (
                      <div key={`sidebar-level-${level}`} className="flex items-center space-x-3 group">
                        <Checkbox
                          id={`level-${level}`}
                          checked={filterState.level.includes(level)}
                          onCheckedChange={() => handleFilterChange('level', level)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary lg:h-4 lg:w-4 xl:h-4 xl:w-4 flex-shrink-0"
                        />
                        <label 
                          htmlFor={`level-${level}`} 
                                                      className="text-sm lg:text-sm xl:text-sm font-medium cursor-pointer text-white group-hover:text-primary transition-colors leading-none"
                        >
                          {level === 'grundnivå' ? 'Basic' : 'Advanced'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Study Pace Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm lg:text-sm xl:text-sm font-semibold text-white uppercase tracking-wide">Study Pace</h3>
                  </div>
                  <div className="grid gap-3">
                    {filterOptions.pace.map((pace) => (
                      <div key={`sidebar-pace-${pace}`} className="flex items-center space-x-3 group">
                        <Checkbox
                          id={`pace-${pace}`}
                          checked={filterState.pace.includes(pace)}
                          onCheckedChange={() => handleFilterChange('pace', pace)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary lg:h-4 lg:w-4 xl:h-4 xl:w-4 flex-shrink-0"
                        />
                        <label 
                          htmlFor={`pace-${pace}`} 
                          className="text-sm lg:text-sm xl:text-sm font-medium cursor-pointer text-white group-hover:text-primary transition-colors leading-none"
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
                    <h3 className="text-sm lg:text-sm xl:text-sm font-semibold text-white uppercase tracking-wide">Period</h3>
                  </div>
                  <div className="grid gap-3">
                    {filterOptions.period.map((period) => (
                      <div key={`sidebar-period-${period}`} className="flex items-center space-x-3 group">
                        <Checkbox
                          id={`period-${period}`}
                          checked={filterState.period.includes(period)}
                          onCheckedChange={() => handleFilterChange('period', period)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary lg:h-4 lg:w-4 xl:h-4 xl:w-4 flex-shrink-0"
                        />
                        <label 
                          htmlFor={`period-${period}`} 
                          className="text-sm lg:text-sm xl:text-sm font-medium cursor-pointer text-white group-hover:text-primary transition-colors leading-none"
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
                    <h3 className="text-sm lg:text-sm xl:text-sm font-semibold text-white uppercase tracking-wide">Term</h3>
                  </div>
                  <div className="grid gap-3">
                    {filterOptions.term.map((term) => (
                      <div key={`sidebar-term-${term}`} className="flex items-center space-x-3 group">
                        <Checkbox
                          id={`term-${term}`}
                          checked={filterState.term.includes(term)}
                          onCheckedChange={() => handleFilterChange('term', term)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary lg:h-4 lg:w-4 xl:h-4 xl:w-4 flex-shrink-0"
                        />
                        <label 
                          htmlFor={`term-${term}`} 
                          className="text-sm lg:text-sm xl:text-sm font-medium cursor-pointer text-white group-hover:text-primary transition-colors leading-none"
                        >
                          {term === 7 ? '7 & 9' : term}
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
                    <h3 className="text-sm lg:text-sm xl:text-sm font-semibold text-white uppercase tracking-wide">Campus</h3>
                  </div>
                  <div className="grid gap-3">
                    {filterOptions.campus.map((campus) => (
                      <div key={`sidebar-campus-${campus}`} className="flex items-center space-x-3 group">
                        <Checkbox
                          id={`campus-${campus}`}
                          checked={filterState.campus.includes(campus)}
                          onCheckedChange={() => handleFilterChange('campus', campus)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary lg:h-4 lg:w-4 xl:h-4 xl:w-4 flex-shrink-0"
                        />
                        <label 
                          htmlFor={`campus-${campus}`} 
                          className="text-sm lg:text-sm xl:text-sm font-medium cursor-pointer text-white group-hover:text-primary transition-colors leading-none"
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
                    <h3 className="text-sm lg:text-sm xl:text-sm font-semibold text-white uppercase tracking-wide">Block</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {filterOptions.block.map((block) => (
                      <div key={`sidebar-block-${block}`} className="flex items-center space-x-3 group">
                        <Checkbox
                          id={`block-${block}`}
                          checked={filterState.block.includes(block)}
                          onCheckedChange={() => handleFilterChange('block', block)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary lg:h-4 lg:w-4 xl:h-4 xl:w-4 flex-shrink-0"
                        />
                        <label 
                          htmlFor={`block-${block}`} 
                          className="text-sm lg:text-sm xl:text-sm font-medium cursor-pointer text-white group-hover:text-primary transition-colors leading-none"
                        >
                          {block}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Examination Filter - Tri-state controls */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm lg:text-sm xl:text-sm font-semibold text-white uppercase tracking-wide">Examination</h3>
                  <div className="text-xs text-white/60">
                    (Include/Exclude/Ignore)
                  </div>
                </div>
                <div className="grid gap-3">
                  {filterOptions.examination.map((exam) => {
                    const currentMode = filterState.examination[exam] || 'ignore';
                    return (
                      <div key={`sidebar-exam-${exam}`} className="flex items-center gap-3 group">
                        <label className="text-sm lg:text-sm xl:text-sm font-medium text-white w-12 flex-shrink-0">
                          {exam}
                        </label>
                        <div className="ml-3">
                          <Select 
                            value={currentMode} 
                            onValueChange={(mode: 'include' | 'exclude' | 'ignore') => 
                              handleFilterChange('examination', `${exam}:${mode}`)
                            }
                          >
                            <SelectTrigger className={`w-28 h-6 text-xs border-0 ${
                              currentMode === 'include' 
                                ? 'bg-green-500/30 text-green-200' 
                                : currentMode === 'exclude'
                                ? 'bg-red-500/30 text-red-200'
                                : 'bg-gray-500/30 text-gray-300'
                            }`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ignore">Ignore</SelectItem>
                              <SelectItem value="include">Include</SelectItem>
                              <SelectItem value="exclude">Exclude</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
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
export function FilterPanel({ courses, filterState, onFilterChange, onResetFilters }: FilterPanelProps) {
  // Generate unique filter options from course data
  const filterOptions = {
    level: Array.from(new Set(courses.map(course => course.level))),
    term: (() => {
      // Extract all unique terms from courses - now they're string arrays
      const allTerms = new Set<string>();
      courses.forEach(course => {
        course.term.forEach(term => allTerms.add(term));
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
    period: Array.from(new Set(courses.flatMap(course => course.period).map(p => parseInt(p)).filter(p => !isNaN(p)))).sort(),
    block: Array.from(new Set(courses.flatMap(course => course.block).map(b => parseInt(b)).filter(b => !isNaN(b)))).sort(),
    pace: Array.from(new Set(courses.map(course => course.pace))),
    campus: Array.from(new Set(courses.map(course => course.campus))),
    examination: Array.from(new Set(courses.flatMap(course => course.examination))).filter(exam => ['TEN', 'LAB', 'PROJ', 'SEM', 'UPG'].includes(exam)).sort(),
    programs: Array.from(new Set(courses.flatMap(course => course.programs))).sort(),
  };

  const handleFilterChange = (filterType: keyof FilterState, value: string | number | null) => {
    const newFilters = { ...filterState };
    
    if (filterType === 'programs' || filterType === 'search') {
      // Programs and search are single string selections
      newFilters[filterType] = value as string;
    } else if (filterType === 'examination') {
      // Examination is now an object with per-type controls
      // value should be in format "examType:mode" (e.g., "TEN:exclude")
      const [examType, mode] = (value as string).split(':');
      newFilters.examination = {
        ...newFilters.examination,
        [examType]: mode as 'include' | 'exclude' | 'ignore'
      };
    } else if (filterType === 'level' || filterType === 'pace' || filterType === 'campus') {
      // Array-based filters (checkboxes)
      const currentArray = [...(newFilters[filterType] as string[])];
      if (currentArray.includes(value as string)) {
        newFilters[filterType] = currentArray.filter(item => item !== value);
      } else {
        newFilters[filterType] = [...currentArray, value as string];
      }
    } else {
      // term, period, block are number arrays
      const currentArray = [...(newFilters[filterType] as number[])];
      if (currentArray.includes(value as number)) {
        newFilters[filterType] = currentArray.filter(item => item !== value);
      } else {
        newFilters[filterType] = [...currentArray, value as number];
      }
    }
    
    onFilterChange(newFilters);
  };

  const getActiveFilterCount = () => {
    return Object.entries(filterState).reduce((count, [key, value]) => {
      if (key === 'programs' || key === 'search') {
        return count + (value ? 1 : 0);
      }
      if (key === 'examination') {
        // Count non-ignore examination filters
        return count + Object.values(value as { [key: string]: string }).filter(mode => mode !== 'ignore').length;
      }
      return count + (value as (string | number)[]).length;
    }, 0);
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className="w-full border border-air-superiority-blue-300/40 bg-air-superiority-blue-400 shadow-lg shadow-air-superiority-blue-300/20 ring-1 ring-air-superiority-blue-300/30">
      <CardHeader className="pb-3 bg-air-superiority-blue-300/30 rounded-t-lg border-b border-air-superiority-blue-300/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold tracking-tight text-card-foreground">Filters</CardTitle>
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary border-primary/20">
                {activeFilterCount} active
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onResetFilters}
                className="h-8 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          )}
        </div>
        <Separator className="mt-3 bg-air-superiority-blue-300/40" />
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-6 bg-air-superiority-blue-400">
        {/* Programs Filter - Dropdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Program</h3>
          </div>
          <Select 
            value={filterState.programs || undefined} 
            onValueChange={(value) => handleFilterChange('programs', value === "all" ? "" : value)}
          >
                      <SelectTrigger className="w-full text-xs data-[placeholder]:text-white">
            <SelectValue placeholder="Select a program..." />
          </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {filterOptions.programs.map((program) => (
                <SelectItem key={program} value={program}>
                  {program}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Level and Study Pace - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Level Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Level</h3>
            </div>
            <div className="grid gap-3">
              {filterOptions.level.map((level) => (
                <div key={`mobile-level-${level}`} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`level-${level}`}
                    checked={filterState.level.includes(level)}
                    onCheckedChange={() => handleFilterChange('level', level)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary flex-shrink-0"
                  />
                  <label 
                    htmlFor={`level-${level}`} 
                    className="text-sm font-medium cursor-pointer group-hover:text-primary transition-colors leading-none"
                  >
                    {level === 'grundnivå' ? 'Basic Level' : 'Advanced Level'}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Study Pace Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Study Pace</h3>
            </div>
            <div className="grid gap-3">
              {filterOptions.pace.map((pace) => (
                <div key={`mobile-pace-${pace}`} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`pace-${pace}`}
                    checked={filterState.pace.includes(pace)}
                    onCheckedChange={() => handleFilterChange('pace', pace)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary flex-shrink-0"
                  />
                  <label 
                    htmlFor={`pace-${pace}`} 
                    className="text-sm font-medium cursor-pointer group-hover:text-primary transition-colors leading-none"
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
              <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Term</h3>
            </div>
            <div className="grid gap-3">
              {filterOptions.term.map((term) => (
                <div key={`mobile-term-${term}`} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`term-${term}`}
                    checked={filterState.term.includes(term)}
                    onCheckedChange={() => handleFilterChange('term', term)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary flex-shrink-0"
                  />
                  <label 
                    htmlFor={`term-${term}`} 
                    className="text-sm font-medium cursor-pointer group-hover:text-primary transition-colors leading-none"
                  >
                    {term === 7 ? '7 & 9' : term}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Period Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Period</h3>
            </div>
            <div className="grid gap-3">
              {filterOptions.period.map((period) => (
                <div key={`mobile-period-${period}`} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`period-${period}`}
                    checked={filterState.period.includes(period)}
                    onCheckedChange={() => handleFilterChange('period', period)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary flex-shrink-0"
                  />
                  <label 
                    htmlFor={`period-${period}`} 
                    className="text-sm font-medium cursor-pointer group-hover:text-primary transition-colors leading-none"
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
              <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Campus</h3>
            </div>
            <div className="grid gap-3">
              {filterOptions.campus.map((campus) => (
                <div key={`mobile-campus-${campus}`} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`campus-${campus}`}
                    checked={filterState.campus.includes(campus)}
                    onCheckedChange={() => handleFilterChange('campus', campus)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary flex-shrink-0"
                  />
                  <label 
                    htmlFor={`campus-${campus}`} 
                    className="text-sm font-medium cursor-pointer group-hover:text-primary transition-colors leading-none"
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
              <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Block</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {filterOptions.block.map((block) => (
                <div key={`mobile-block-${block}`} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`block-${block}`}
                    checked={filterState.block.includes(block)}
                    onCheckedChange={() => handleFilterChange('block', block)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary flex-shrink-0"
                  />
                  <label 
                    htmlFor={`block-${block}`} 
                    className="text-sm font-medium cursor-pointer group-hover:text-primary transition-colors leading-none"
                  >
                    {block}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Examination Filter - Tri-state controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Examination</h3>
            <div className="text-xs text-white/60">
              (Include/Exclude/Ignore)
            </div>
          </div>
          <div className="grid gap-3">
            {filterOptions.examination.map((exam) => {
              const currentMode = filterState.examination[exam] || 'ignore';
              return (
                <div key={`mobile-exam-${exam}`} className="flex items-center gap-3 group">
                  <label className="text-sm font-medium text-white w-12 flex-shrink-0">
                    {exam}
                  </label>
                  <div className="ml-2">
                    <Select 
                      value={currentMode} 
                      onValueChange={(mode: 'include' | 'exclude' | 'ignore') => 
                        handleFilterChange('examination', `${exam}:${mode}`)
                      }
                    >
                      <SelectTrigger className={`w-28 h-6 text-xs border-0 ${
                        currentMode === 'include' 
                          ? 'bg-green-500/30 text-green-200' 
                          : currentMode === 'exclude'
                          ? 'bg-red-500/30 text-red-200'
                          : 'bg-gray-500/30 text-gray-300'
                      }`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ignore">Ignore</SelectItem>
                        <SelectItem value="include">Include</SelectItem>
                        <SelectItem value="exclude">Exclude</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}