import { Course } from "@/types/course";
import { CourseCard } from "./CourseCard";
import { Pagination } from "@/components/shared/Pagination";

interface CourseGridProps {
  courses: Course[];
  isFiltered?: boolean;
  // Sidebar state props for responsive layout
  sidebarOpen?: boolean;
  profileSidebarOpen?: boolean;
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
  sidebarOpen = false,
  profileSidebarOpen = false,
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
        <h3 className="text-xl font-semibold mb-2 text-white">
          {isFiltered ? "No courses match your filters" : "No courses available"}
        </h3>
        <p className="text-white/80">
          {isFiltered 
            ? "Try adjusting your filter criteria to see more results."
            : "There are currently no courses to display."
          }
        </p>
      </div>
    );
  }

  // Determine grid columns based on sidebar states
  const bothSidebarsOpen = sidebarOpen && profileSidebarOpen;
  const gridClasses = bothSidebarsOpen 
    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 lg:gap-5 w-full"
    : "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 w-full";

  return (
    <div className="space-y-6 w-full">
      {/* Course grid */}
      <div className={gridClasses}>
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
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