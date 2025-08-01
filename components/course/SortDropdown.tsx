import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

export type SortOption = 
  | 'name-asc' 
  | 'name-desc'
  | 'code-asc' 
  | 'code-desc'
  | 'exam-moments-asc'
  | 'exam-moments-desc';

interface SortDropdownProps {
  sortOption: SortOption | null;
  onSortChange: (option: SortOption | null) => void;
}

export function SortDropdown({ sortOption, onSortChange }: SortDropdownProps) {
  const sortOptions = [
    { value: 'name-asc', label: 'Course Name (A-Z)' },
    { value: 'name-desc', label: 'Course Name (Z-A)' },
    { value: 'code-asc', label: 'Course Code (A-Z)' },
    { value: 'code-desc', label: 'Course Code (Z-A)' },
    { value: 'exam-moments-asc', label: 'Examination Moments (Few to Many)' },
    { value: 'exam-moments-desc', label: 'Examination Moments (Many to Few)' },
  ] as const;

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-air-superiority-blue" />
      <Select
        value={sortOption || ''}
        onValueChange={(value) => onSortChange(value as SortOption)}
      >
        <SelectTrigger className="w-40 h-8 text-sm bg-white/80 border-air-superiority-blue/30 text-air-superiority-blue hover:border-air-superiority-blue/50">
          <SelectValue placeholder="Sort after..." />
        </SelectTrigger>
        <SelectContent className="bg-white border-air-superiority-blue/30">
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-sm">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {sortOption && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSortChange(null)}
          className="h-8 px-2 text-xs text-air-superiority-blue hover:bg-air-superiority-blue/10"
        >
          Clear
        </Button>
      )}
    </div>
  );
}

// Utility function to sort courses based on the selected option
export function sortCourses(courses: Course[], sortOption: SortOption | null): Course[] {
  if (!sortOption) return courses;

  const sortedCourses = [...courses];

  switch (sortOption) {
    case 'name-asc':
      return sortedCourses.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sortedCourses.sort((a, b) => b.name.localeCompare(a.name));
    case 'code-asc':
      return sortedCourses.sort((a, b) => a.id.localeCompare(b.id));
    case 'code-desc':
      return sortedCourses.sort((a, b) => b.id.localeCompare(a.id));
    case 'exam-moments-asc':
      return sortedCourses.sort((a, b) => a.examination.length - b.examination.length);
    case 'exam-moments-desc':
      return sortedCourses.sort((a, b) => b.examination.length - a.examination.length);
    default:
      return sortedCourses;
  }
}