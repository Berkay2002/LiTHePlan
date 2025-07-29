"use client";

import { useState, useMemo } from "react";
import { Course } from "@/types/course";
import { CourseGrid } from "@/components/course/CourseGrid";
import { FilterPanel, FilterState } from "@/components/course/FilterPanel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import coursesData from "@/data/mock-courses.json";

const COURSES_PER_PAGE = 12;

export default function Home() {
  // Type assertion since we know the JSON structure matches our Course interface
  const courses: Course[] = coursesData as Course[];

  // Initialize filter state
  const [filterState, setFilterState] = useState<FilterState>({
    level: [],
    term: [],
    period: [],
    block: [],
    pace: [],
    campus: [],
    examination: [],
    programs: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Filter logic function
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Level filter
      if (filterState.level.length > 0 && !filterState.level.includes(course.level)) {
        return false;
      }

      // Term filter - combine terms 7 & 9 since they can have same courses
      if (filterState.term.length > 0) {
        const termMatches = filterState.term.some(selectedTerm => {
          if (selectedTerm === 7) {
            return course.term === 7 || course.term === 9;
          }
          return course.term === selectedTerm;
        });
        if (!termMatches) {
          return false;
        }
      }

      // Period filter
      if (filterState.period.length > 0 && !filterState.period.includes(course.period)) {
        return false;
      }

      // Block filter - handle both single blocks and dual blocks for 50% courses
      if (filterState.block.length > 0) {
        const courseBlocks = Array.isArray(course.block) ? course.block : [course.block];
        const hasMatchingBlock = filterState.block.some(selectedBlock => 
          courseBlocks.includes(selectedBlock)
        );
        if (!hasMatchingBlock) {
          return false;
        }
      }

      // Pace filter
      if (filterState.pace.length > 0 && !filterState.pace.includes(course.pace)) {
        return false;
      }

      // Campus filter
      if (filterState.campus.length > 0 && !filterState.campus.includes(course.campus)) {
        return false;
      }

      // Examination filter
      if (filterState.examination.length > 0) {
        const courseExaminations = course.examination;
        const hasMatchingExamination = filterState.examination.some(exam => 
          courseExaminations.includes(exam)
        );
        if (!hasMatchingExamination) {
          return false;
        }
      }

      // Programs filter - single selection, show only courses eligible for selected program
      if (filterState.programs) {
        const coursePrograms = course.programs;
        if (!coursePrograms.includes(filterState.programs)) {
          return false;
        }
      }

      return true;
    });
  }, [courses, filterState]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
    const endIndex = startIndex + COURSES_PER_PAGE;
    return filteredCourses.slice(startIndex, endIndex);
  }, [filteredCourses, currentPage]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilterState(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    setFilterState({
      level: [],
      term: [],
      period: [],
      block: [],
      pace: [],
      campus: [],
      examination: [],
      programs: "",
    });
    setCurrentPage(1); // Reset to first page when filters are reset
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">

          
          {/* Mobile Filter Button */}
          <div className="lg:hidden mt-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters {(Object.entries(filterState).some(([key, value]) => key === 'programs' ? value : (value as any[]).length > 0)) && 
                    `(${Object.entries(filterState).reduce((count, [key, value]) => key === 'programs' ? count + (value ? 1 : 0) : count + (value as any[]).length, 0)})`}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6 pb-6">
                  <FilterPanel
                    courses={courses}
                    filterState={filterState}
                    onFilterChange={handleFilterChange}
                    onResetFilters={handleResetFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Panel */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-8 h-[calc(100vh-2rem)] overflow-y-auto will-change-transform" style={{ transform: 'translateZ(0)' }}>
              <FilterPanel
                courses={courses}
                filterState={filterState}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
              />
            </div>
          </div>
          
          {/* Course Grid */}
          <div className="lg:col-span-3">
            <CourseGrid 
              courses={paginatedCourses} 
              isFiltered={Object.entries(filterState).some(([key, value]) => key === 'programs' ? value : (value as any[]).length > 0)}
              activeFilters={filterState}
              currentPage={currentPage}
              totalPages={totalPages}
              totalCourses={filteredCourses.length}
              itemsPerPage={COURSES_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
