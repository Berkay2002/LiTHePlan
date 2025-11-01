import { Pagination } from "@/components/shared/Pagination";
import type { Course } from "@/types/course";
import { CourseListItem } from "./CourseListItem";
import type { FilterState } from "./FilterPanel";

interface CourseListProps {
  courses: Course[];
  isFiltered?: boolean;
  activeFilters?: FilterState;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  totalCourses?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export function CourseList({
  courses,
  isFiltered = false,
  activeFilters,
  currentPage,
  totalPages,
  totalCourses,
  itemsPerPage,
  onPageChange,
}: CourseListProps) {
  if (!courses || courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          {isFiltered
            ? "No courses match your filters"
            : "No courses available"}
        </h3>
        <p className="text-muted-foreground">
          {isFiltered
            ? "Try adjusting your filter criteria to see more results."
            : "There are currently no courses to display."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Course list */}
      <div className="space-y-3 w-full">
        {courses.map((course) => (
          <CourseListItem
            activeFilters={activeFilters}
            course={course}
            key={course.id}
          />
        ))}
      </div>

      {/* Pagination */}
      {currentPage &&
        totalPages &&
        totalCourses &&
        itemsPerPage &&
        onPageChange && (
          <Pagination
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            totalItems={totalCourses}
            totalPages={totalPages}
          />
        )}
    </div>
  );
}
