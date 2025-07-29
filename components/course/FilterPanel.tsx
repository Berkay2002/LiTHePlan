import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export interface FilterState {
  level: string[];
  term: number[];
  period: number[];
  block: number[];
  pace: string[];
  campus: string[];
  examination: string[];
  programs: string; // Changed to single string selection
}

export interface FilterPanelProps {
  courses: Course[];
  filterState: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
}

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

  const handleFilterChange = (filterType: keyof FilterState, value: string | number | null, isArray = false) => {
    const newFilters = { ...filterState };
    
    if (filterType === 'programs') {
      // Programs is now a single selection
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
      if (key === 'programs') {
        return count + (value ? 1 : 0);
      }
      return count + (value as any[]).length;
    }, 0);
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className="w-full border border-border bg-card shadow-md">
      <CardHeader className="pb-3 bg-muted/30 rounded-t-lg">
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
        <Separator className="mt-3 bg-border/60" />
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-6 bg-card">
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

        {/* Level Filter - 2x1 Layout */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Academic Level</h3>
            {filterState.level.length > 0 && (
              <Badge variant="outline" className="h-5 px-2 text-xs">
                {filterState.level.length}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filterOptions.level.map((level) => (
              <div key={level} className="flex items-center space-x-3 group">
                <Checkbox
                  id={`level-${level}`}
                  checked={filterState.level.includes(level)}
                  onCheckedChange={() => handleFilterChange('level', level, true)}
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
                    onCheckedChange={() => handleFilterChange('term', term, true)}
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
                    onCheckedChange={() => handleFilterChange('period', period, true)}
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

        {/* Block and Pace - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Block Filter */}
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
                    onCheckedChange={() => handleFilterChange('block', block, true)}
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

          {/* Pace Filter */}
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
                    onCheckedChange={() => handleFilterChange('pace', pace, true)}
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
                    onCheckedChange={() => handleFilterChange('campus', campus, true)}
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
              {filterOptions.examination.map((exam) => (
                <div key={exam} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`exam-${exam}`}
                    checked={filterState.examination.includes(exam)}
                    onCheckedChange={() => handleFilterChange('examination', exam, true)}
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