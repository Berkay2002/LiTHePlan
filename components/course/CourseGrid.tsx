import { Course } from "@/types/course";
import { CourseCard } from "./CourseCard";
import { FilterState } from "./FilterPanel";
import { Pagination } from "@/components/shared/Pagination";

interface CourseGridProps {
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

export function CourseGrid({ 
  courses, 
  isFiltered = false, 
  activeFilters,
  currentPage,
  totalPages,
  totalCourses,
  itemsPerPage,
  onPageChange
}: CourseGridProps) {
  if (!courses || courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">
          {isFiltered ? "No courses match your filters" : "No courses available"}
        </h3>
        <p className="text-muted-foreground">
          {isFiltered 
            ? "Try adjusting your filter criteria to see more results."
            : "There are currently no courses to display."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} activeFilters={activeFilters} />
        ))}
      </div>

      {/* Pagination */}
      {currentPage && totalPages && totalCourses && itemsPerPage && onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCourses}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
} 