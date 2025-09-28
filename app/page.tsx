"use client";

import { useEffect, useMemo, useState } from "react";
import { TopControlsSkeleton } from "@/components/course/ControlsSkeleton";
import { CourseGridSkeleton } from "@/components/course/CourseCardSkeleton";
import { CourseGrid } from "@/components/course/CourseGrid";
import { CourseList } from "@/components/course/CourseList";
import {
  CollapsibleFilterSidebar,
  type FilterState,
} from "@/components/course/FilterPanel";
import { FilterSidebarSkeleton } from "@/components/course/FilterSidebarSkeleton";
import { type ViewMode, ViewToggle } from "@/components/course/ViewToggle";
import { InfoBanner } from "@/components/InfoBanner";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  ProfileProvider,
  useProfile,
} from "@/components/profile/ProfileContext";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { ProfileSidebarSkeleton } from "@/components/profile/ProfileSidebarSkeleton";
import { useCourses } from "@/hooks/useCourses";

const COURSES_PER_PAGE = 12;

function HomeContent() {
  // Fetch courses from Supabase API with caching enabled
  const { courses, loading, error } = useCourses({
    loadAll: true, // We need all courses for client-side filtering
    enableCache: true,
  });

  // Access profile context
  const { state } = useProfile();

  // Initialize filter state with localStorage persistence
  const [filterState, setFilterState] = useState<FilterState>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("litheplan-filters");
        if (saved) {
          const parsed = JSON.parse(saved);
          // Ensure examination array has default values if empty
          if (!parsed.examination || parsed.examination.length === 0) {
            parsed.examination = ["TEN", "LAB", "PROJ", "SEM", "UPG"];
          }
          return parsed;
        }
      } catch (error) {
        console.warn("Failed to load filter preferences:", error);
      }
    }

    return {
      level: [],
      term: [],
      period: [],
      block: [],
      pace: [],
      campus: [],
      examination: ["TEN", "LAB", "PROJ", "SEM", "UPG"], // Pre-select all examination types
      programs: [],
      huvudomraden: [],
      search: "",
    };
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("litheplan-view-mode");
        if (saved && (saved === "grid" || saved === "list")) {
          return saved as ViewMode;
        }
      } catch (error) {
        console.warn("Failed to load view mode preference:", error);
      }
    }
    return "grid";
  });


  // Sidebar state - Start open on desktop, closed on mobile/tablet
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Save filter state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("litheplan-filters", JSON.stringify(filterState));
      } catch (error) {
        console.warn("Failed to save filter preferences:", error);
      }
    }
  }, [filterState]);

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("litheplan-view-mode", viewMode);
      } catch (error) {
        console.warn("Failed to save view mode preference:", error);
      }
    }
  }, [viewMode]);

  // Set initial sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      // Open sidebar for desktop (1024px and above), closed for tablet/mobile
      setSidebarOpen(window.innerWidth >= 1024);
    };

    // Set initial state
    handleResize();

    // Listen for resize events
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [profileSidebarOpen, setProfileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleProfileSidebar = () => {
    setProfileSidebarOpen(!profileSidebarOpen);
  };

  // Filter logic function
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // Enhanced search filter - search across multiple fields:
      // - Course name and ID (original functionality)
      // - Examiner (examinator field)
      // - Director (studierektor field)
      // - Programs array
      if (filterState.search.trim()) {
        const searchTerm = filterState.search.toLowerCase().trim();
        const matchesName = course.name.toLowerCase().includes(searchTerm);
        const matchesId = course.id.toLowerCase().includes(searchTerm);
        const matchesExaminer = course.examinator?.toLowerCase().includes(searchTerm) || false;
        const matchesDirector = course.studierektor?.toLowerCase().includes(searchTerm) || false;
        const matchesPrograms = course.programs.some(program =>
          program.toLowerCase().includes(searchTerm)
        );

        if (!(matchesName || matchesId || matchesExaminer || matchesDirector || matchesPrograms)) {
          return false;
        }
      }

      // Level filter
      if (
        filterState.level.length > 0 &&
        !filterState.level.includes(course.level)
      ) {
        return false;
      }

      // Term filter - handle string arrays
      if (filterState.term.length > 0) {
        const courseTerms = course.term; // Already an array of strings
        const termMatches = filterState.term.some((selectedTerm) => {
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
        const hasMatchingPeriod = filterState.period.some((selectedPeriod) =>
          course.period.includes(selectedPeriod.toString())
        );
        if (!hasMatchingPeriod) {
          return false;
        }
      }

      // Block filter - handle string arrays
      if (filterState.block.length > 0) {
        const courseBlocks = course.block; // Already an array of strings
        const hasMatchingBlock = filterState.block.some((selectedBlock) =>
          courseBlocks.includes(selectedBlock.toString())
        );
        if (!hasMatchingBlock) {
          return false;
        }
      }

      // Pace filter
      if (
        filterState.pace.length > 0 &&
        !filterState.pace.includes(course.pace)
      ) {
        return false;
      }

      // Campus filter
      if (
        filterState.campus.length > 0 &&
        !filterState.campus.includes(course.campus)
      ) {
        return false;
      }

      // Examination filter - exclusion filtering (show courses that don't have unselected examination types)
      if (filterState.examination.length < 5) { // Only filter if not all examination types are selected
        const allExaminationTypes = ["TEN", "LAB", "PROJ", "SEM", "UPG"];
        const unselectedExaminationTypes = allExaminationTypes.filter(
          examType => !filterState.examination.includes(examType)
        );

        const courseExaminations = course.examination;
        const hasAnyUnselectedExamination = unselectedExaminationTypes.some(examType =>
          courseExaminations.includes(examType as "TEN" | "LAB" | "PROJ" | "SEM" | "UPG")
        );

        if (hasAnyUnselectedExamination) {
          return false;
        }
      }

      // Programs filter - multiple selection, show only courses eligible for selected programs
      if (filterState.programs.length > 0) {
        const coursePrograms = course.programs || [];
        const hasAnySelectedProgram = filterState.programs.some(program =>
          coursePrograms.includes(program)
        );
        if (!hasAnySelectedProgram) {
          return false;
        }
      }

      // Huvudområden filter - multiple selection, show only courses eligible for selected huvudområden
      if (filterState.huvudomraden.length > 0) {
        const courseHuvudomraden = course.huvudomrade || "";
        const courseHuvudomradenArray = courseHuvudomraden
          .split(',')
          .map(h => h.trim())
          .filter(h => h !== "");

        const hasAnySelectedHuvudomrade = filterState.huvudomraden.some(selectedHuvudomrade =>
          courseHuvudomradenArray.includes(selectedHuvudomrade)
        );

        if (!hasAnySelectedHuvudomrade) {
          return false;
        }
      }

      return true;
    });
  }, [courses, filterState]);

  // Pagination logic
  const totalPages = Math.ceil(
    filteredCourses.length / COURSES_PER_PAGE
  );
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
      examination: ["TEN", "LAB", "PROJ", "SEM", "UPG"], // Reset to all examination types selected
      programs: [],
      huvudomraden: [],
      search: "",
    });
    setCurrentPage(1); // Reset to first page when filters are reset
  };

  const handleSearchChange = (searchQuery: string) => {
    setFilterState((prev) => ({ ...prev, search: searchQuery }));
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Show loading state with skeleton
  if (loading) {
    return (
      <PageLayout
        isMobileMenuOpen={sidebarOpen}
        navbarMode="main"
        onMobileMenuToggle={toggleSidebar}
        onSearchChange={handleSearchChange}
        searchQuery={filterState.search}
      >
        <div className="min-h-screen bg-background">
          <div className="flex">
            {/* Left Filter Sidebar Skeleton - Responsive based on screen size */}
            <FilterSidebarSkeleton
              isOpen={sidebarOpen}
              onToggle={toggleSidebar}
            />

            {/* Right Profile Sidebar Skeleton - Default closed state */}
            <ProfileSidebarSkeleton isOpen={false} onToggle={() => {}} />

            {/* Main Content Area - Match real layout with proper margins */}
            <div
              className={`w-full pt-20 ${
                sidebarOpen ? "lg:ml-80 xl:ml-96" : "lg:ml-12"
              } lg:mr-12`}
            >
              <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Top Controls - Skeleton with integrated loading indicator */}
                <TopControlsSkeleton />

                {/* Course Grid Skeleton - Always assume sidebar is open during loading */}
                <CourseGridSkeleton
                  count={12}
                  profileSidebarOpen={false}
                  sidebarOpen={true}
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
        isMobileMenuOpen={sidebarOpen}
        navbarMode="main"
        onMobileMenuToggle={toggleSidebar}
        onSearchChange={handleSearchChange}
        searchQuery={filterState.search}
      >
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error loading courses: {error}</p>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              onClick={() => window.location.reload()}
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
      isMobileMenuOpen={sidebarOpen}
      navbarMode="main"
      onMobileMenuToggle={toggleSidebar}
      onSearchChange={handleSearchChange}
      searchQuery={filterState.search}
    >
      <div className="min-h-screen bg-background">
        {/* Main Content with Sidebar */}
        <div className="flex">
          {/* Left Filter Sidebar */}
          <CollapsibleFilterSidebar
            courses={courses}
            filterState={filterState}
            isOpen={sidebarOpen}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onToggle={toggleSidebar}
          />

          {/* Right Profile Sidebar */}
          <ProfileSidebar
            isOpen={profileSidebarOpen}
            onToggle={toggleProfileSidebar}
            profile={state.current_profile}
          />

          {/* Main Content Area */}
          <div
            className={`w-full transition-all duration-300 ease-in-out pt-20 ${
              sidebarOpen ? "lg:ml-80 xl:ml-96" : "lg:ml-12"
            } ${profileSidebarOpen ? "lg:mr-80 xl:mr-96" : "lg:mr-12"}`}
          >
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              {/* Info Banner */}
              <InfoBanner />
              {/* View Toggle Controls */}
              <div className="w-full max-w-full mb-6 px-1 sm:px-2 lg:px-0">
                <div className="flex justify-end items-center">
                  <ViewToggle
                    onViewModeChange={setViewMode}
                    viewMode={viewMode}
                  />
                </div>
              </div>

              {/* Course Catalog View */}
              {viewMode === "grid" ? (
                <CourseGrid
                  courses={paginatedCourses}
                  currentPage={currentPage}
                  isFiltered={Object.entries(filterState).some(
                    ([key, value]) =>
                      key === "programs" || key === "search"
                        ? value
                        : (value as (string | number)[]).length > 0
                  )}
                  itemsPerPage={COURSES_PER_PAGE}
                  onPageChange={handlePageChange}
                  profileSidebarOpen={profileSidebarOpen}
                  sidebarOpen={sidebarOpen}
                  totalCourses={filteredCourses.length}
                  totalPages={totalPages}
                />
              ) : (
                <CourseList
                  activeFilters={filterState}
                  courses={paginatedCourses}
                  currentPage={currentPage}
                  isFiltered={Object.entries(filterState).some(
                    ([key, value]) =>
                      key === "programs" || key === "search"
                        ? value
                        : (value as (string | number)[]).length > 0
                  )}
                  itemsPerPage={COURSES_PER_PAGE}
                  onPageChange={handlePageChange}
                  totalCourses={filteredCourses.length}
                  totalPages={totalPages}
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
