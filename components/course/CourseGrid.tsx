import { Pagination } from "@/components/shared/Pagination";
import type { Course } from "@/types/course";
import { CourseCard } from "./CourseCard";

interface CourseGridProps {
  courses: Course[];
  // Pagination props
  currentPage?: number;
  isFiltered?: boolean;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  profileSidebarOpen?: boolean;
  // Sidebar state props for responsive layout
  sidebarOpen?: boolean;
  totalCourses?: number;
  totalPages?: number;
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
  onPageChange,
}: CourseGridProps) {
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
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] lg:gap-5">
        {courses.map((course) => (
          <CourseCard course={course} key={course.id} />
        ))}
      </div>

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
