import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Course } from "@/types/course";

export type SortOption =
  | "name-asc"
  | "name-desc"
  | "code-asc"
  | "code-desc"
  | "exam-moments-asc"
  | "exam-moments-desc";

interface SortDropdownProps {
  sortOption: SortOption | null;
  onSortChange: (option: SortOption | null) => void;
}

export function SortDropdown({ sortOption, onSortChange }: SortDropdownProps) {
  const sortOptions = [
    { value: "name-asc", label: "Course Name (A-Z)" },
    { value: "name-desc", label: "Course Name (Z-A)" },
    { value: "code-asc", label: "Course Code (A-Z)" },
    { value: "code-desc", label: "Course Code (Z-A)" },
    { value: "exam-moments-asc", label: "Examination Moments (Few to Many)" },
    { value: "exam-moments-desc", label: "Examination Moments (Many to Few)" },
  ] as const;

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4 text-air-superiority-blue" />
      <Select
        onValueChange={(value) => onSortChange(value as SortOption)}
        value={sortOption || ""}
      >
        <SelectTrigger className="w-24 sm:w-32 md:w-40 h-8 sm:h-10 text-xs sm:text-sm bg-white/80 border-air-superiority-blue/30 text-air-superiority-blue hover:border-air-superiority-blue/50">
          <SelectValue placeholder="Sort..." />
        </SelectTrigger>
        <SelectContent className="bg-white border-air-superiority-blue/30">
          {sortOptions.map((option) => (
            <SelectItem
              className="text-xs sm:text-sm"
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {sortOption && (
        <Button
          className="h-8 sm:h-10 px-1.5 sm:px-2 text-xs text-air-superiority-blue hover:bg-air-superiority-blue/10"
          onClick={() => onSortChange(null)}
          size="sm"
          variant="ghost"
        >
          <span className="hidden sm:inline">Clear</span>
          <span className="sm:hidden">×</span>
        </Button>
      )}
    </div>
  );
}

// Natural sorting function for course codes (alphabetical first, then numeric)
function naturalSort(a: string, b: string): number {
  // Split strings into alphabetic and numeric parts
  const parseCode = (code: string) => {
    const match = code.match(/^([A-Za-z]+)(\d+)(.*)$/);
    if (match) {
      return {
        alpha: match[1].toUpperCase(),
        number: Number.parseInt(match[2], 10),
        rest: match[3],
      };
    }
    return { alpha: code.toUpperCase(), number: 0, rest: "" };
  };

  const aParts = parseCode(a);
  const bParts = parseCode(b);

  // First compare alphabetic parts
  const alphaComparison = aParts.alpha.localeCompare(bParts.alpha);
  if (alphaComparison !== 0) {
    return alphaComparison;
  }

  // If alphabetic parts are equal, compare numeric parts
  const numComparison = aParts.number - bParts.number;
  if (numComparison !== 0) {
    return numComparison;
  }

  // If both alpha and number are equal, compare the rest
  return aParts.rest.localeCompare(bParts.rest);
}

// Utility function to sort courses based on the selected option
export function sortCourses(
  courses: Course[],
  sortOption: SortOption | null
): Course[] {
  if (!sortOption) return courses;

  const sortedCourses = [...courses];

  switch (sortOption) {
    case "name-asc":
      return sortedCourses.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sortedCourses.sort((a, b) => b.name.localeCompare(a.name));
    case "code-asc":
      return sortedCourses.sort((a, b) => naturalSort(a.id, b.id));
    case "code-desc":
      return sortedCourses.sort((a, b) => naturalSort(b.id, a.id));
    case "exam-moments-asc":
      return sortedCourses.sort(
        (a, b) => a.examination.length - b.examination.length
      );
    case "exam-moments-desc":
      return sortedCourses.sort(
        (a, b) => b.examination.length - a.examination.length
      );
    default:
      return sortedCourses;
  }
}
