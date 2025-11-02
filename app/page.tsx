"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { TopControlsSkeleton } from "@/components/course/ControlsSkeleton";
import { CourseGridSkeleton } from "@/components/course/CourseCardSkeleton";
import { CourseGrid } from "@/components/course/CourseGrid";
import { CourseList } from "@/components/course/CourseList";
import { CourseListSkeleton } from "@/components/course/CourseListSkeleton";
import {
  CollapsibleFilterSidebar,
  type FilterState,
} from "@/components/course/FilterPanel";
import { FilterSidebarSkeleton } from "@/components/course/FilterSidebarSkeleton";
import { type ViewMode, ViewToggle } from "@/components/course/ViewToggle";
import { InfoBanner } from "@/components/InfoBanner";
import { PageLayout } from "@/components/layout/PageLayout";
import { useProfile } from "@/components/profile/ProfileContext";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { ProfileSidebarSkeleton } from "@/components/profile/ProfileSidebarSkeleton";
import { useCourses } from "@/hooks/useCourses";
import { usePersistentState } from "@/hooks/usePersistentState";
import {
  getStoredSidebarState,
  useResponsiveSidebar,
} from "@/hooks/useResponsiveSidebar";
import { getStoredToggleState, useToggle } from "@/hooks/useToggle";
import {
  createDefaultFilterState,
  FILTER_STORAGE_KEY,
  filterCourses,
  hasActiveFilters,
  parseFilterState,
  parseViewMode,
  VIEW_MODE_STORAGE_KEY,
} from "@/lib/courseFiltering";

const COURSES_PER_PAGE = 12;
const PROFILE_SIDEBAR_STORAGE_KEY = "profile-sidebar-open";
const MIN_LOADING_TIME_MS = 400; // Minimum time to show skeleton for UX

function HomeContent() {
  const searchParams = useSearchParams();
  const { courses, loading, error } = useCourses({
    loadAll: true,
    enableCache: true,
  });

  const { state } = useProfile();

  // Track minimum loading time for better UX
  const [showLoading, setShowLoading] = useState(loading);
  const [loadingStartTime] = useState(() => Date.now());

  useEffect(() => {
    if (!loading && showLoading) {
      // Calculate remaining time to show skeleton
      const elapsed = Date.now() - loadingStartTime;
      const remaining = Math.max(0, MIN_LOADING_TIME_MS - elapsed);

      setTimeout(() => {
        setShowLoading(false);
      }, remaining);
    } else if (loading) {
      setShowLoading(true);
    }
  }, [loading, showLoading, loadingStartTime]);

  const [filterState, setFilterState] = usePersistentState(
    FILTER_STORAGE_KEY,
    createDefaultFilterState,
    {
      deserialize: parseFilterState,
    }
  );

  // Apply URL query parameters to filters on mount
  useEffect(() => {
    const programsParam = searchParams.get("programs");
    const levelParam = searchParams.get("level");
    const huvudomradenParam = searchParams.get("huvudomraden");
    const campusParam = searchParams.get("campus");

    if (programsParam || levelParam || huvudomradenParam || campusParam) {
      // Start with default state, then apply ONLY the URL params
      const newState = createDefaultFilterState();
      if (programsParam) newState.programs = [programsParam];
      if (levelParam) newState.level = [levelParam];
      if (huvudomradenParam) newState.huvudomraden = [huvudomradenParam];
      if (campusParam) newState.campus = [campusParam];

      setFilterState(newState);
    }
  }, [searchParams, setFilterState]);

  const [viewMode, setViewMode] = usePersistentState<ViewMode>(
    VIEW_MODE_STORAGE_KEY,
    () => "grid",
    {
      deserialize: parseViewMode,
      serialize: (value) => value,
    }
  );

  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useResponsiveSidebar();
  const { value: profileSidebarOpen, toggle: toggleProfileSidebar } = useToggle(
    false,
    PROFILE_SIDEBAR_STORAGE_KEY
  );

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

  // Track stored values for skeleton display (client-side only)
  const [storedSkeletonViewMode, setStoredSkeletonViewMode] =
    useState<ViewMode>("grid");
  const [storedSkeletonSidebarOpen, setStoredSkeletonSidebarOpen] =
    useState(false);
  const [
    storedSkeletonProfileSidebarOpen,
    setStoredSkeletonProfileSidebarOpen,
  ] = useState(false);

  useEffect(() => {
    // Read from localStorage only on client side
    if (typeof window !== "undefined") {
      const storedMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      const parsedMode = storedMode ? parseViewMode(storedMode) : null;
      setStoredSkeletonViewMode(parsedMode || "grid");
      setStoredSkeletonSidebarOpen(getStoredSidebarState());
      setStoredSkeletonProfileSidebarOpen(
        getStoredToggleState(PROFILE_SIDEBAR_STORAGE_KEY)
      );
    }
  }, []);

  if (showLoading) {
    return (
      <PageLayout
        isMobileMenuOpen={storedSkeletonSidebarOpen}
        navbarMode="main"
        onMobileMenuToggle={() => {}}
        onSearchChange={handleSearchChange}
        searchQuery={filterState.search}
      >
        <div className="min-h-screen bg-background">
          <div className="flex">
            <FilterSidebarSkeleton
              isOpen={storedSkeletonSidebarOpen}
              onToggle={() => {}}
            />

            <ProfileSidebarSkeleton
              isOpen={storedSkeletonProfileSidebarOpen}
              onToggle={() => {}}
            />

            <div
              className={`w-full pt-20 ${
                storedSkeletonSidebarOpen ? "lg:ml-80 xl:ml-96" : "lg:ml-12"
              } ${storedSkeletonProfileSidebarOpen ? "lg:mr-80 xl:mr-96" : "lg:mr-12"}`}
            >
              <div className="container mx-auto px-4 py-8">
                <TopControlsSkeleton />

                {storedSkeletonViewMode === "grid" ? (
                  <CourseGridSkeleton count={COURSES_PER_PAGE} />
                ) : (
                  <CourseListSkeleton count={COURSES_PER_PAGE} />
                )}
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
            <p className="text-destructive mb-4">
              Error loading courses: {error}
            </p>
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
          <Suspense
            fallback={
              <ProfileSidebarSkeleton
                isOpen={profileSidebarOpen}
                onToggle={toggleProfileSidebar}
              />
            }
          >
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
            <div className="container mx-auto px-4 py-8">
              <InfoBanner />
              <div className="w-full mb-6">
                <div
                  className="grid gap-4 lg:gap-5 w-full justify-center"
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 380px), min(100%, 450px)))",
                  }}
                >
                  <div className="col-start-1 -col-end-1 flex justify-end">
                    <ViewToggle
                      onViewModeChange={setViewMode}
                      viewMode={viewMode}
                    />
                  </div>
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
    <Suspense fallback={<HomeContentSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}

// Separate skeleton component that uses state to avoid hydration mismatches
function HomeContentSkeleton() {
  // Initialize with safe defaults for SSR, then update on mount
  const [storedViewMode, setStoredViewMode] = useState<ViewMode>("grid");
  const [storedSidebarOpen, setStoredSidebarOpen] = useState(false);
  const [storedProfileSidebarOpen, setStoredProfileSidebarOpen] =
    useState(false);

  // Update state after mount (client-side only)
  useEffect(() => {
    const storedMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    const parsedMode = storedMode ? parseViewMode(storedMode) : null;
    setStoredViewMode(parsedMode || "grid");
    setStoredSidebarOpen(getStoredSidebarState());
    setStoredProfileSidebarOpen(
      getStoredToggleState(PROFILE_SIDEBAR_STORAGE_KEY)
    );
  }, []);

  return (
    <PageLayout
      isMobileMenuOpen={storedSidebarOpen}
      navbarMode="main"
      onMobileMenuToggle={() => {}}
      onSearchChange={() => {}}
      searchQuery=""
    >
      <div className="min-h-screen bg-background">
        <div className="flex">
          <FilterSidebarSkeleton
            isOpen={storedSidebarOpen}
            onToggle={() => {}}
          />
          <ProfileSidebarSkeleton
            isOpen={storedProfileSidebarOpen}
            onToggle={() => {}}
          />
          <div
            className={`w-full pt-20 ${
              storedSidebarOpen ? "lg:ml-80 xl:ml-96" : "lg:ml-12"
            } ${storedProfileSidebarOpen ? "lg:mr-80 xl:mr-96" : "lg:mr-12"}`}
          >
            <div className="container mx-auto px-4 py-8">
              <TopControlsSkeleton />
              {storedViewMode === "grid" ? (
                <CourseGridSkeleton count={COURSES_PER_PAGE} />
              ) : (
                <CourseListSkeleton count={COURSES_PER_PAGE} />
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
