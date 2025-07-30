import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterState {
  level: string[];
  term: number[];
  period: number[];
  block: number[];
  pace: string[];
  campus: string[];
  examination: string[];
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
    term: [7, 8], // Combine terms 7 & 9 since they can have same courses
    period: Array.from(new Set(courses.map(course => course.period))).sort(),
    block: Array.from(new Set(courses.flatMap(course => 
      Array.isArray(course.block) ? course.block : [course.block]
    ))).sort(),
    pace: Array.from(new Set(courses.map(course => course.pace))),
    campus: Array.from(new Set(courses.map(course => course.campus))),
    examination: Array.from(new Set(courses.flatMap(course => course.examination))).sort(),
    programs: Array.from(new Set(courses.flatMap(course => course.programs))).sort(),
  };

  const handleFilterChange = (filterType: keyof FilterState, value: string | number | null) => {
    const newFilters = { ...filterState };
    
    if (filterType === 'programs' || filterType === 'search') {
      // Programs and search are single string selections
      newFilters[filterType] = value as string;
    } else if (filterType === 'level' || filterType === 'pace' || filterType === 'campus' || filterType === 'examination') {
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

      {/* Collapsible Sidebar - Made sticky/fixed */}
      <div className={cn(
        "fixed top-0 left-0 h-screen bg-air-superiority-blue-400 border-r-2 border-air-superiority-blue-300/40 shadow-xl shadow-air-superiority-blue-200/20 z-40 transition-all duration-300 ease-in-out",
        "flex flex-col ring-1 ring-air-superiority-blue-300/30",
        isOpen ? "w-80 lg:w-96 xl:w-[28rem] 2xl:w-[32rem]" : "w-0 lg:w-12",
        "lg:sticky lg:z-auto lg:shadow-2xl lg:shadow-air-superiority-blue-300/30"
      )}>
        {/* Collapsed State - Arrow in Middle */}
        {!isOpen && (
          <div className="hidden lg:flex flex-col items-center justify-center h-full w-12 relative">
            <Button
              onClick={onToggle}
              variant="ghost"
              size="default"
              className="h-12 w-12 p-0 hover:bg-muted/80 transition-colors"
            >
              <ChevronRight className="h-6 w-6 text-muted-foreground hover:text-foreground" />
            </Button>
            
            {/* Filter Count Badge - Top */}
            {activeFilterCount > 0 && (
              <div className="absolute top-4">
                <Badge variant="secondary" className="h-5 w-5 p-0 text-xs flex items-center justify-center bg-primary text-primary-foreground">
                  {activeFilterCount}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Expanded State - Full Sidebar Content */}
        {isOpen && (
          <div className="flex flex-col h-full overflow-hidden relative">
            {/* Close Arrow Button - Right Edge Center */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
              <Button
                onClick={onToggle}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted/80 transition-colors bg-background/80 backdrop-blur-sm border-r-0 rounded-l-md rounded-r-none"
              >
                <ChevronLeft className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>

            {/* Mobile Header - Only show clear button and close on mobile */}
            <div className="flex-shrink-0 p-4 border-b border-air-superiority-blue-300/40 bg-air-superiority-blue-300/30 lg:hidden">
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <>
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
                    </>
                  )}
                  {/* Close button for mobile */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="h-8 w-8 p-0 hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Scrollable Filter Content */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 xl:p-8 2xl:p-10 space-y-6 lg:space-y-8 xl:space-y-10 2xl:space-y-12">
              {/* Programs Filter - Dropdown */}
              <div className="space-y-3 lg:space-y-4 xl:space-y-5 2xl:space-y-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm lg:text-base xl:text-xl 2xl:text-2xl font-semibold text-foreground uppercase tracking-wide">Program</h3>
                  {filterState.programs && (
                    <Badge variant="outline" className="h-5 lg:h-6 xl:h-7 2xl:h-8 px-2 lg:px-3 xl:px-4 2xl:px-5 text-xs lg:text-sm xl:text-lg 2xl:text-xl">
                      Selected
                    </Badge>
                  )}
                </div>
                <Select 
                  value={filterState.programs || undefined} 
                  onValueChange={(value) => handleFilterChange('programs', value === "all" ? "" : value)}
                >
                  <SelectTrigger className="w-full h-10 lg:h-11 xl:h-12 2xl:h-14 text-sm lg:text-base xl:text-lg 2xl:text-xl">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 2xl:gap-12">
                {/* Level Filter */}
                <div className="space-y-3 lg:space-y-4 xl:space-y-5 2xl:space-y-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm lg:text-base xl:text-xl 2xl:text-2xl font-semibold text-foreground uppercase tracking-wide">Level</h3>
                    {filterState.level.length > 0 && (
                      <Badge variant="outline" className="h-5 lg:h-6 xl:h-7 2xl:h-8 px-2 lg:px-3 xl:px-4 2xl:px-5 text-xs lg:text-sm xl:text-lg 2xl:text-xl">
                        {filterState.level.length}
                      </Badge>
                    )}
                  </div>
                  <div className="grid gap-3 lg:gap-4 xl:gap-5 2xl:gap-6">
                    {filterOptions.level.map((level) => (
                      <div key={level} className="flex items-center space-x-3 lg:space-x-4 xl:space-x-5 2xl:space-x-6 group">
                        <Checkbox
                          id={`level-${level}`}
                          checked={filterState.level.includes(level)}
                          onCheckedChange={() => handleFilterChange('level', level)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary lg:h-5 lg:w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7"
                        />
                        <label 
                          htmlFor={`level-${level}`} 
                          className="text-sm lg:text-base xl:text-lg 2xl:text-xl font-medium cursor-pointer group-hover:text-primary transition-colors"
                        >
                          {level === 'grundnivå' ? 'Basic' : 'Advanced'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Study Pace Filter */}
                <div className="space-y-3 lg:space-y-4 xl:space-y-5 2xl:space-y-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm lg:text-base xl:text-xl 2xl:text-2xl font-semibold text-foreground uppercase tracking-wide">Study Pace</h3>
                    {filterState.pace.length > 0 && (
                      <Badge variant="outline" className="h-5 lg:h-6 xl:h-7 2xl:h-8 px-2 lg:px-3 xl:px-4 2xl:px-5 text-xs lg:text-sm xl:text-lg 2xl:text-xl">
                        {filterState.pace.length}
                      </Badge>
                    )}
                  </div>
                  <div className="grid gap-3 lg:gap-4 xl:gap-5 2xl:gap-6">
                    {filterOptions.pace.map((pace) => (
                      <div key={pace} className="flex items-center space-x-3 lg:space-x-4 xl:space-x-5 2xl:space-x-6 group">
                        <Checkbox
                          id={`pace-${pace}`}
                          checked={filterState.pace.includes(pace)}
                          onCheckedChange={() => handleFilterChange('pace', pace)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary lg:h-5 lg:w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7"
                        />
                        <label 
                          htmlFor={`pace-${pace}`} 
                          className="text-sm lg:text-base xl:text-lg 2xl:text-xl font-medium cursor-pointer group-hover:text-primary transition-colors"
                        >
                          {pace}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Term and Period - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 2xl:gap-12">
                {/* Term Filter */}
                <div className="space-y-3 lg:space-y-4 xl:space-y-5 2xl:space-y-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm lg:text-base xl:text-xl 2xl:text-2xl font-semibold text-foreground uppercase tracking-wide">Term</h3>
                    {filterState.term.length > 0 && (
                      <Badge variant="outline" className="h-5 lg:h-6 xl:h-7 2xl:h-8 px-2 lg:px-3 xl:px-4 2xl:px-5 text-xs lg:text-sm xl:text-lg 2xl:text-xl">
                        {filterState.term.length}
                      </Badge>
                    )}
                  </div>
                  <div className="grid gap-3 lg:gap-4 xl:gap-5 2xl:gap-6">
                    {filterOptions.term.map((term) => (
                      <div key={term} className="flex items-center space-x-3 lg:space-x-4 xl:space-x-5 2xl:space-x-6 group">
                        <Checkbox
                          id={`term-${term}`}
                          checked={filterState.term.includes(term)}
                          onCheckedChange={() => handleFilterChange('term', term)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary lg:h-5 lg:w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7"
                        />
                        <label 
                          htmlFor={`term-${term}`} 
                          className="text-sm lg:text-base xl:text-lg 2xl:text-xl font-medium cursor-pointer group-hover:text-primary transition-colors"
                        >
                          {term === 7 ? '7 & 9' : term}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Period Filter */}
                <div className="space-y-3 lg:space-y-4 xl:space-y-5 2xl:space-y-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm lg:text-base xl:text-xl 2xl:text-2xl font-semibold text-foreground uppercase tracking-wide">Period</h3>
                    {filterState.period.length > 0 && (
                      <Badge variant="outline" className="h-5 lg:h-6 xl:h-7 2xl:h-8 px-2 lg:px-3 xl:px-4 2xl:px-5 text-xs lg:text-sm xl:text-lg 2xl:text-xl">
                        {filterState.period.length}
                      </Badge>
                    )}
                  </div>
                  <div className="grid gap-3 lg:gap-4 xl:gap-5 2xl:gap-6">
                    {filterOptions.period.map((period) => (
                      <div key={period} className="flex items-center space-x-3 lg:space-x-4 xl:space-x-5 2xl:space-x-6 group">
                        <Checkbox
                          id={`period-${period}`}
                          checked={filterState.period.includes(period)}
                          onCheckedChange={() => handleFilterChange('period', period)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary lg:h-5 lg:w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7"
                        />
                        <label 
                          htmlFor={`period-${period}`} 
                          className="text-sm lg:text-base xl:text-lg 2xl:text-xl font-medium cursor-pointer group-hover:text-primary transition-colors"
                        >
                          {period}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Block Filter - Improved 2x2 spacing */}
              <div className="space-y-3 lg:space-y-4 xl:space-y-5 2xl:space-y-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm lg:text-base xl:text-xl 2xl:text-2xl font-semibold text-foreground uppercase tracking-wide">Block</h3>
                  {filterState.block.length > 0 && (
                    <Badge variant="outline" className="h-5 lg:h-6 xl:h-7 2xl:h-8 px-2 lg:px-3 xl:px-4 2xl:px-5 text-xs lg:text-sm xl:text-lg 2xl:text-xl">
                      {filterState.block.length}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 lg:gap-6 xl:gap-8 2xl:gap-10">
                  {filterOptions.block.map((block) => (
                    <div key={block} className="flex items-center space-x-3 lg:space-x-4 xl:space-x-5 2xl:space-x-6 group">
                      <Checkbox
                        id={`block-${block}`}
                        checked={filterState.block.includes(block)}
                        onCheckedChange={() => handleFilterChange('block', block)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary lg:h-5 lg:w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 flex-shrink-0"
                      />
                      <label 
                        htmlFor={`block-${block}`} 
                        className="text-sm lg:text-base xl:text-lg 2xl:text-xl font-medium cursor-pointer group-hover:text-primary transition-colors leading-none"
                      >
                        {block}
                      </label>
                    </div>
                  ))}
                </div>
              </div>


              {/* Campus and Examination - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 2xl:gap-12">
                {/* Campus Filter */}
                <div className="space-y-3 lg:space-y-4 xl:space-y-5 2xl:space-y-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm lg:text-base xl:text-xl 2xl:text-2xl font-semibold text-foreground uppercase tracking-wide">Campus</h3>
                    {filterState.campus.length > 0 && (
                      <Badge variant="outline" className="h-5 lg:h-6 xl:h-7 2xl:h-8 px-2 lg:px-3 xl:px-4 2xl:px-5 text-xs lg:text-sm xl:text-lg 2xl:text-xl">
                        {filterState.campus.length}
                      </Badge>
                    )}
                  </div>
                  <div className="grid gap-3 lg:gap-4 xl:gap-5 2xl:gap-6">
                    {filterOptions.campus.map((campus) => (
                      <div key={campus} className="flex items-center space-x-3 lg:space-x-4 xl:space-x-5 2xl:space-x-6 group">
                        <Checkbox
                          id={`campus-${campus}`}
                          checked={filterState.campus.includes(campus)}
                          onCheckedChange={() => handleFilterChange('campus', campus)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary lg:h-5 lg:w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7"
                        />
                        <label 
                          htmlFor={`campus-${campus}`} 
                          className="text-sm lg:text-base xl:text-lg 2xl:text-xl font-medium cursor-pointer group-hover:text-primary transition-colors"
                        >
                          {campus}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Examination Filter - Remove SEM and UPG */}
                <div className="space-y-3 lg:space-y-4 xl:space-y-5 2xl:space-y-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm lg:text-base xl:text-xl 2xl:text-2xl font-semibold text-foreground uppercase tracking-wide">Examination</h3>
                    {filterState.examination.length > 0 && (
                      <Badge variant="outline" className="h-5 lg:h-6 xl:h-7 2xl:h-8 px-2 lg:px-3 xl:px-4 2xl:px-5 text-xs lg:text-sm xl:text-lg 2xl:text-xl">
                        {filterState.examination.length}
                      </Badge>
                    )}
                  </div>
                  <div className="grid gap-3 lg:gap-4 xl:gap-5 2xl:gap-6">
                    {filterOptions.examination.filter(exam => exam !== 'SEM' && exam !== 'UPG').map((exam) => (
                      <div key={exam} className="flex items-center space-x-3 lg:space-x-4 xl:space-x-5 2xl:space-x-6 group">
                        <Checkbox
                          id={`exam-${exam}`}
                          checked={filterState.examination.includes(exam)}
                          onCheckedChange={() => handleFilterChange('examination', exam)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary lg:h-5 lg:w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7"
                        />
                        <label 
                          htmlFor={`exam-${exam}`} 
                          className="text-sm lg:text-base xl:text-lg 2xl:text-xl font-medium cursor-pointer group-hover:text-primary transition-colors leading-tight"
                        >
                          {exam}
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
export function FilterPanel({ courses, filterState, onFilterChange, onResetFilters }: FilterPanelProps) {
  // Generate unique filter options from course data
  const filterOptions = {
    level: Array.from(new Set(courses.map(course => course.level))),
    term: [7, 8], // Combine terms 7 & 9 since they can have same courses
    period: Array.from(new Set(courses.map(course => course.period))).sort(),
    block: Array.from(new Set(courses.flatMap(course => 
      Array.isArray(course.block) ? course.block : [course.block]
    ))).sort(),
    pace: Array.from(new Set(courses.map(course => course.pace))),
    campus: Array.from(new Set(courses.map(course => course.campus))),
    examination: Array.from(new Set(courses.flatMap(course => course.examination))).sort(),
    programs: Array.from(new Set(courses.flatMap(course => course.programs))).sort(),
  };

  const handleFilterChange = (filterType: keyof FilterState, value: string | number | null) => {
    const newFilters = { ...filterState };
    
    if (filterType === 'programs' || filterType === 'search') {
      // Programs and search are single string selections
      newFilters[filterType] = value as string;
    } else if (filterType === 'level' || filterType === 'pace' || filterType === 'campus' || filterType === 'examination') {
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
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Program</h3>
            {filterState.programs && (
              <Badge variant="outline" className="h-5 px-2 text-xs">
                Selected
              </Badge>
            )}
          </div>
          <Select 
            value={filterState.programs || undefined} 
            onValueChange={(value) => handleFilterChange('programs', value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-full">
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
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Level</h3>
              {filterState.level.length > 0 && (
                <Badge variant="outline" className="h-5 px-2 text-xs">
                  {filterState.level.length}
                </Badge>
              )}
            </div>
            <div className="grid gap-3">
              {filterOptions.level.map((level) => (
                <div key={level} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`level-${level}`}
                    checked={filterState.level.includes(level)}
                    onCheckedChange={() => handleFilterChange('level', level)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label 
                    htmlFor={`level-${level}`} 
                    className="text-base font-medium cursor-pointer group-hover:text-primary transition-colors"
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
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Study Pace</h3>
              {filterState.pace.length > 0 && (
                <Badge variant="outline" className="h-5 px-2 text-xs">
                  {filterState.pace.length}
                </Badge>
              )}
            </div>
            <div className="grid gap-3">
              {filterOptions.pace.map((pace) => (
                <div key={pace} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`pace-${pace}`}
                    checked={filterState.pace.includes(pace)}
                    onCheckedChange={() => handleFilterChange('pace', pace)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label 
                    htmlFor={`pace-${pace}`} 
                    className="text-base font-medium cursor-pointer group-hover:text-primary transition-colors"
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
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Term</h3>
              {filterState.term.length > 0 && (
                <Badge variant="outline" className="h-5 px-2 text-xs">
                  {filterState.term.length}
                </Badge>
              )}
            </div>
            <div className="grid gap-3">
              {filterOptions.term.map((term) => (
                <div key={term} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`term-${term}`}
                    checked={filterState.term.includes(term)}
                    onCheckedChange={() => handleFilterChange('term', term)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label 
                    htmlFor={`term-${term}`} 
                    className="text-base font-medium cursor-pointer group-hover:text-primary transition-colors"
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
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Period</h3>
              {filterState.period.length > 0 && (
                <Badge variant="outline" className="h-5 px-2 text-xs">
                  {filterState.period.length}
                </Badge>
              )}
            </div>
            <div className="grid gap-3">
              {filterOptions.period.map((period) => (
                <div key={period} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`period-${period}`}
                    checked={filterState.period.includes(period)}
                    onCheckedChange={() => handleFilterChange('period', period)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label 
                    htmlFor={`period-${period}`} 
                    className="text-base font-medium cursor-pointer group-hover:text-primary transition-colors"
                  >
                    {period}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Block Filter - Standalone */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Block</h3>
            {filterState.block.length > 0 && (
              <Badge variant="outline" className="h-5 px-2 text-xs">
                {filterState.block.length}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filterOptions.block.map((block) => (
              <div key={block} className="flex items-center space-x-3 group">
                <Checkbox
                  id={`block-${block}`}
                  checked={filterState.block.includes(block)}
                  onCheckedChange={() => handleFilterChange('block', block)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label 
                  htmlFor={`block-${block}`} 
                  className="text-base font-medium cursor-pointer group-hover:text-primary transition-colors"
                >
                  {block}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Campus and Examination - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Campus Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Campus</h3>
              {filterState.campus.length > 0 && (
                <Badge variant="outline" className="h-5 px-2 text-xs">
                  {filterState.campus.length}
                </Badge>
              )}
            </div>
            <div className="grid gap-3">
              {filterOptions.campus.map((campus) => (
                <div key={campus} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`campus-${campus}`}
                    checked={filterState.campus.includes(campus)}
                    onCheckedChange={() => handleFilterChange('campus', campus)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label 
                    htmlFor={`campus-${campus}`} 
                    className="text-base font-medium cursor-pointer group-hover:text-primary transition-colors"
                  >
                    {campus}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Examination Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Examination</h3>
              {filterState.examination.length > 0 && (
                <Badge variant="outline" className="h-5 px-2 text-xs">
                  {filterState.examination.length}
                </Badge>
              )}
            </div>
            <div className="grid gap-3">
              {filterOptions.examination.filter(exam => exam !== 'SEM' && exam !== 'UPG').map((exam) => (
                <div key={exam} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`exam-${exam}`}
                    checked={filterState.examination.includes(exam)}
                    onCheckedChange={() => handleFilterChange('examination', exam)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label 
                    htmlFor={`exam-${exam}`} 
                    className="text-base font-medium cursor-pointer group-hover:text-primary transition-colors leading-tight"
                  >
                    {exam}
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