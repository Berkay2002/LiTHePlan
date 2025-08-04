"use client";

import { useState, useMemo, useEffect } from "react";
import { CourseGrid } from "@/components/course/CourseGrid";
import { CourseList } from "@/components/course/CourseList";
import { CourseGridSkeleton } from "@/components/course/CourseCardSkeleton";
import { FilterSidebarSkeleton } from "@/components/course/FilterSidebarSkeleton";
import { ProfileSidebarSkeleton } from "@/components/profile/ProfileSidebarSkeleton";
import { TopControlsSkeleton } from "@/components/course/ControlsSkeleton";
import { ViewToggle, ViewMode } from "@/components/course/ViewToggle";
import { SortDropdown, SortOption, sortCourses } from "@/components/course/SortDropdown";
import { FilterState, CollapsibleFilterSidebar } from "@/components/course/FilterPanel";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProfileProvider, useProfile } from "@/components/profile/ProfileContext";
import { useCourses } from "@/hooks/useCourses";
import { InfoBanner } from "@/components/InfoBanner";

const COURSES_PER_PAGE = 12;

function HomeContent() {
  // Fetch courses from Supabase API with caching enabled
  const { courses, loading, error } = useCourses({ 
    loadAll: true,  // We need all courses for client-side filtering
    enableCache: true 
  });
  
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

  // Sidebar state - Start open on desktop, closed on mobile/tablet
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Set initial sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      // Open sidebar for desktop (1024px and above), closed for tablet/mobile
      setSidebarOpen(window.innerWidth >= 1024);
    };
    
    // Set initial state
    handleResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
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

  // Show loading state with skeleton
  if (loading) {
    return (
      <PageLayout 
        navbarMode="main"
        searchQuery={filterState.search}
        onSearchChange={handleSearchChange}
        onMobileMenuToggle={toggleSidebar}
        isMobileMenuOpen={sidebarOpen}
      >
        <div className="min-h-screen bg-background">
          <div className="flex">
            {/* Left Filter Sidebar Skeleton - Responsive based on screen size */}
            <FilterSidebarSkeleton
              isOpen={sidebarOpen}
              onToggle={toggleSidebar}
            />
            
            {/* Right Profile Sidebar Skeleton - Default closed state */}
            <ProfileSidebarSkeleton
              isOpen={false}
              onToggle={() => {}}
            />

            {/* Main Content Area - Match real layout with proper margins */}
            <div className={`w-full pt-20 ${
              sidebarOpen ? 'lg:ml-80 xl:ml-96' : 'lg:ml-12'
            } lg:mr-12`}>
              <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Top Controls - Skeleton with integrated loading indicator */}
                <TopControlsSkeleton />

                {/* Course Grid Skeleton - Always assume sidebar is open during loading */}
                <CourseGridSkeleton 
                  count={12} 
                  sidebarOpen={true}
                  profileSidebarOpen={false}
                />
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <PageLayout 
        navbarMode="main"
        searchQuery={filterState.search}
        onSearchChange={handleSearchChange}
        onMobileMenuToggle={toggleSidebar}
        isMobileMenuOpen={sidebarOpen}
      >
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error loading courses: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      navbarMode="main"
      searchQuery={filterState.search}
      onSearchChange={handleSearchChange}
      onMobileMenuToggle={toggleSidebar}
      isMobileMenuOpen={sidebarOpen}
    >
      <div className="min-h-screen bg-background">
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
        <div className={`w-full transition-all duration-300 ease-in-out pt-20 ${
          sidebarOpen ? 'lg:ml-80 xl:ml-96' : 'lg:ml-12'
        } ${
          profileSidebarOpen ? 'lg:mr-80 xl:mr-96' : 'lg:mr-12'
        }`}>
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Info Banner */}
            <InfoBanner />
            {/* View Toggle and Sort Controls */}
            <div className="w-full max-w-full mb-6 px-1 sm:px-2 lg:px-0">
              <div className="flex justify-between items-center gap-2 sm:gap-4 min-w-0 overflow-hidden">
                {/* Left Column - Sort Controls */}
                <div className="flex-shrink min-w-0 overflow-hidden">
                  <SortDropdown sortOption={sortOption} onSortChange={setSortOption} />
                </div>
                
                {/* Spacer for visual separation */}
                <div className="flex-1 min-w-2"></div>
                
                {/* Right Column - View Toggle */}
                <div className="flex-shrink-0">
                  <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                </div>
              </div>
            </div>

            {/* Course Catalog View */}
            {viewMode === 'grid' ? (
              <CourseGrid 
                courses={paginatedCourses} 
                isFiltered={Object.entries(filterState).some(([key, value]) => key === 'programs' || key === 'search' ? value : (value as (string | number)[]).length > 0)}
                sidebarOpen={sidebarOpen}
                profileSidebarOpen={profileSidebarOpen}
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
    </PageLayout>
  );
}

export default function Home() {
  return (
    <ProfileProvider>
      <HomeContent />
    </ProfileProvider>
  );
}
