"use client";

import { useState, useMemo } from "react";
import { Course } from "@/types/course";
import { CourseGrid } from "@/components/course/CourseGrid";
import { FilterState, CollapsibleFilterSidebar } from "@/components/course/FilterPanel";
import { Navbar } from "@/components/shared/Navbar";
import { ProfileProvider, useProfile } from "@/components/profile/ProfileContext";
import { ProfileSummary } from "@/components/profile/ProfileSummary";
import coursesData from "@/data/mock-courses.json";

const COURSES_PER_PAGE = 12;

function HomeContent() {
  // Type assertion since we know the JSON structure matches our Course interface
  const courses: Course[] = coursesData as Course[];
  const { state, removeCourse, clearTerm, clearProfile } = useProfile();

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
    search: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Sidebar state - Start open by default for better filter accessibility
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Filter logic function
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Search filter - search in name and course code only
      if (filterState.search.trim()) {
        const searchTerm = filterState.search.toLowerCase().trim();
        const matchesName = course.name.toLowerCase().includes(searchTerm);
        const matchesId = course.id.toLowerCase().includes(searchTerm);
        
        if (!matchesName && !matchesId) {
          return false;
        }
      }

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
      search: "",
    });
    setCurrentPage(1); // Reset to first page when filters are reset
  };

  const handleSearchChange = (searchQuery: string) => {
    setFilterState(prev => ({ ...prev, search: searchQuery }));
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar - Non-sticky */}
      <Navbar 
        searchQuery={filterState.search}
        onSearchChange={handleSearchChange}
        onMobileMenuToggle={toggleSidebar}
        isMobileMenuOpen={sidebarOpen}
      />

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Collapsible Sidebar - Available on both desktop and mobile */}
        <CollapsibleFilterSidebar
          courses={courses}
          filterState={filterState}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        />

        {/* Main Content Area */}
        <div className="flex-1 transition-all duration-300 ease-in-out">
          <div className={`container mx-auto px-4 py-8 transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'lg:pl-8' : 'lg:pl-16'
          }`}>
            

            {/* Course Catalog View */}
            <CourseGrid 
              courses={paginatedCourses} 
              isFiltered={Object.entries(filterState).some(([key, value]) => key === 'programs' || key === 'search' ? value : (value as (string | number)[]).length > 0)}
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

export default function Home() {
  return (
    <ProfileProvider>
      <HomeContent />
    </ProfileProvider>
  );
}
