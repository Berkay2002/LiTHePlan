"use client";

import { useState, useMemo } from "react";
import { Course } from "@/types/course";
import { CourseGrid } from "@/components/course/CourseGrid";
import { CourseList } from "@/components/course/CourseList";
import { ViewToggle, ViewMode } from "@/components/course/ViewToggle";
import { SortDropdown, SortOption, sortCourses } from "@/components/course/SortDropdown";
import { FilterState, CollapsibleFilterSidebar } from "@/components/course/FilterPanel";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { Navbar } from "@/components/shared/Navbar";
import { ProfileProvider, useProfile } from "@/components/profile/ProfileContext";
import coursesData from "@/data/new-real-courses.json";

const COURSES_PER_PAGE = 12;

function HomeContent() {
  // Type assertion since we know the JSON structure matches our Course interface
  const courses: Course[] = coursesData as Course[];
  
  // Access profile context
  const { state } = useProfile();

  // Initialize filter state
  const [filterState, setFilterState] = useState<FilterState>({
    level: [],
    term: [],
    period: [],
    block: [],
    pace: [],
    campus: [],
    examination: {},
    programs: "",
    search: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Sort state
  const [sortOption, setSortOption] = useState<SortOption | null>('name-asc');

  // Sidebar state - Start closed by default for better mobile experience
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileSidebarOpen, setProfileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleProfileSidebar = () => {
    setProfileSidebarOpen(!profileSidebarOpen);
  };

  // Filter and sort logic function
  const filteredAndSortedCourses = useMemo(() => {
    const filtered = courses.filter(course => {
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

      // Term filter - handle string arrays
      if (filterState.term.length > 0) {
        const courseTerms = course.term; // Already an array of strings
        const termMatches = filterState.term.some(selectedTerm => {
          if (selectedTerm === 7) {
            // Term 7 checkbox should match courses available in term "7" OR "9" (since they're combined)
            return courseTerms.includes("7") || courseTerms.includes("9");
          }
          // Convert selectedTerm to string for comparison
          return courseTerms.includes(selectedTerm.toString());
        });
        if (!termMatches) {
          return false;
        }
      }

      // Period filter - handle string arrays
      if (filterState.period.length > 0) {
        const hasMatchingPeriod = filterState.period.some(selectedPeriod => 
          course.period.includes(selectedPeriod.toString())
        );
        if (!hasMatchingPeriod) {
          return false;
        }
      }

      // Block filter - handle string arrays
      if (filterState.block.length > 0) {
        const courseBlocks = course.block; // Already an array of strings
        const hasMatchingBlock = filterState.block.some(selectedBlock => 
          courseBlocks.includes(selectedBlock.toString())
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

      // Examination filter - tri-state per-type filtering
      const examinationFilters = Object.entries(filterState.examination);
      if (examinationFilters.length > 0) {
        const courseExaminations = course.examination;
        
        for (const [examType, mode] of examinationFilters) {
          if (mode === 'ignore') continue; // Skip ignored examination types
          
          const courseHasExamType = courseExaminations.includes(examType as 'TEN' | 'LAB' | 'PROJ' | 'SEM' | 'UPG');
          
          if (mode === 'include' && !courseHasExamType) {
            // Required examination type is missing
            return false;
          }
          
          if (mode === 'exclude' && courseHasExamType) {
            // Forbidden examination type is present
            return false;
          }
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
    
    // Apply sorting to filtered results
    return sortCourses(filtered, sortOption);
  }, [courses, filterState, sortOption]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedCourses.length / COURSES_PER_PAGE);
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
    const endIndex = startIndex + COURSES_PER_PAGE;
    return filteredAndSortedCourses.slice(startIndex, endIndex);
  }, [filteredAndSortedCourses, currentPage]);

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
      examination: {},
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
        onProfileSidebarToggle={toggleProfileSidebar}
        isProfileSidebarOpen={profileSidebarOpen}
      />

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Left Filter Sidebar */}
        <CollapsibleFilterSidebar
          courses={courses}
          filterState={filterState}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        />
        
        {/* Right Profile Sidebar */}
        <ProfileSidebar
          profile={state.current_profile}
          isOpen={profileSidebarOpen}
          onToggle={toggleProfileSidebar}
        />

        {/* Main Content Area */}
        <div className={`w-full transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-80 xl:ml-96' : 'lg:ml-12'
        } ${
          profileSidebarOpen ? 'lg:mr-80 xl:mr-96' : 'lg:mr-12'
        }`}>
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* View Toggle and Sort Controls */}
            <div className="w-full flex justify-between mb-6 ">
              <div className="flex-shrink-0">
                <SortDropdown sortOption={sortOption} onSortChange={setSortOption} />
              </div>
              <div className="flex-shrink-0">
                <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              </div>
            </div>

            {/* Course Catalog View */}
            {viewMode === 'grid' ? (
              <CourseGrid 
                courses={paginatedCourses} 
                isFiltered={Object.entries(filterState).some(([key, value]) => key === 'programs' || key === 'search' ? value : (value as (string | number)[]).length > 0)}
                activeFilters={filterState}
                currentPage={currentPage}
                totalPages={totalPages}
                totalCourses={filteredAndSortedCourses.length}
                itemsPerPage={COURSES_PER_PAGE}
                onPageChange={handlePageChange}
              />
            ) : (
              <CourseList 
                courses={paginatedCourses} 
                isFiltered={Object.entries(filterState).some(([key, value]) => key === 'programs' || key === 'search' ? value : (value as (string | number)[]).length > 0)}
                activeFilters={filterState}
                currentPage={currentPage}
                totalPages={totalPages}
                totalCourses={filteredAndSortedCourses.length}
                itemsPerPage={COURSES_PER_PAGE}
                onPageChange={handlePageChange}
              />
            )}
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
