"use client";

import { Suspense, useMemo, useState } from "react";
import { CourseGridSkeleton } from "@/components/course/CourseCardSkeleton";
import { CourseGrid } from "@/components/course/CourseGrid";
import { CourseList } from "@/components/course/CourseList";
import {
  CollapsibleFilterSidebar,
  type FilterState,
} from "@/components/course/FilterPanel";
import { FilterSidebarSkeleton } from "@/components/course/FilterSidebarSkeleton";
import { TopControlsSkeleton } from "@/components/course/ControlsSkeleton";
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
import { usePersistentState } from "@/hooks/usePersistentState";
import { useResponsiveSidebar } from "@/hooks/useResponsiveSidebar";
import { useToggle } from "@/hooks/useToggle";
import {
  createDefaultFilterState,
  filterCourses,
  FILTER_STORAGE_KEY,
  hasActiveFilters,
  parseFilterState,
  parseViewMode,
  VIEW_MODE_STORAGE_KEY,
} from "@/lib/courseFiltering";

const COURSES_PER_PAGE = 12;

function HomeContent() {
  const { courses, loading, error } = useCourses({
    loadAll: true,
    enableCache: true,
  });

  const { state } = useProfile();

  const [filterState, setFilterState] = usePersistentState(
    FILTER_STORAGE_KEY,
    createDefaultFilterState,
    {
      deserialize: parseFilterState,
    }
  );

  const [viewMode, setViewMode] = usePersistentState<ViewMode>(
    VIEW_MODE_STORAGE_KEY,
    () => "grid",
    {
      deserialize: parseViewMode,
      serialize: (value) => value,
    }
  );

  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useResponsiveSidebar();
  const {
    value: profileSidebarOpen,
    toggle: toggleProfileSidebar,
  } = useToggle(false);

  const [currentPage, setCurrentPage] = useState(1);

  const filteredCourses = useMemo(
    () => filterCourses(courses, filterState),
    [courses, filterState]
  );

  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
    const endIndex = startIndex + COURSES_PER_PAGE;
    return filteredCourses.slice(startIndex, endIndex);
  }, [filteredCourses, currentPage]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilterState(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilterState(createDefaultFilterState());
    setCurrentPage(1);
  };

  const handleSearchChange = (searchQuery: string) => {
    setFilterState((previous) => ({ ...previous, search: searchQuery }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
            <FilterSidebarSkeleton
              isOpen={sidebarOpen}
              onToggle={toggleSidebar}
            />

            <ProfileSidebarSkeleton isOpen={false} onToggle={() => {}} />

            <div
              className={`w-full pt-20 ${
                sidebarOpen ? "lg:ml-80 xl:ml-96" : "lg:ml-12"
              } lg:mr-12`}
            >
              <div className="container mx-auto px-4 py-8 max-w-7xl">
                <TopControlsSkeleton />

                <CourseGridSkeleton
                  count={COURSES_PER_PAGE}
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
            <p className="text-destructive mb-4">Error loading courses: {error}</p>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/10"
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
        <div className="flex">
          <CollapsibleFilterSidebar
            courses={courses}
            filterState={filterState}
            isOpen={sidebarOpen}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onToggle={toggleSidebar}
          />

          {/* PPR: Wrap ProfileSidebar in Suspense for dynamic user data */}
          <Suspense fallback={<ProfileSidebarSkeleton isOpen={profileSidebarOpen} onToggle={toggleProfileSidebar} />}>
            <ProfileSidebar
              isOpen={profileSidebarOpen}
              onToggle={toggleProfileSidebar}
              profile={state.current_profile}
            />
          </Suspense>

          <div
            className={`w-full transition-all duration-300 ease-in-out pt-20 ${
              sidebarOpen ? "lg:ml-80 xl:ml-96" : "lg:ml-12"
            } ${profileSidebarOpen ? "lg:mr-80 xl:mr-96" : "lg:mr-12"}`}
          >
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              <InfoBanner />
              <div className="w-full max-w-full mb-6 px-1 sm:px-2 lg:px-0">
                <div className="flex justify-end items-center">
                  <ViewToggle
                    onViewModeChange={setViewMode}
                    viewMode={viewMode}
                  />
                </div>
              </div>

              {viewMode === "grid" ? (
                <CourseGrid
                  courses={paginatedCourses}
                  currentPage={currentPage}
                  isFiltered={hasActiveFilters(filterState)}
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
                  isFiltered={hasActiveFilters(filterState)}
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
