"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  type CSSProperties,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { TopControlsSkeleton } from "@/components/course/ControlsSkeleton";
import { CourseGridSkeleton } from "@/components/course/CourseCardSkeleton";
import { CourseGrid } from "@/components/course/CourseGrid";
import { CourseList } from "@/components/course/CourseList";
import { CourseListSkeleton } from "@/components/course/CourseListSkeleton";
import type { FilterState } from "@/components/course/FilterPanel";
import { type ViewMode, ViewToggle } from "@/components/course/ViewToggle";
import { HomeSidebarContent } from "@/components/home-sidebar/home-sidebar-content";
import { InfoBanner } from "@/components/InfoBanner";
import { PageLayout } from "@/components/layout/PageLayout";
import { useProfile } from "@/components/profile/ProfileContext";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { ProfileSidebarSkeleton } from "@/components/profile/ProfileSidebarSkeleton";
import { SearchBar } from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
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
import {
  PROFILE_SIDEBAR_COLLAPSED_WIDTH,
  PROFILE_SIDEBAR_DESKTOP_WIDTH,
  PROFILE_SIDEBAR_DESKTOP_WIDTH_XL,
} from "@/lib/profile-constants";
import { homeProfileSidebarEnabled } from "@/lib/ui-feature-flags";

const COURSES_PER_PAGE = 60;
const PROFILE_SIDEBAR_STORAGE_KEY = "profile-sidebar-open";
const MIN_LOADING_TIME_MS = 400; // Minimum time to show skeleton for UX
const PROFILE_SIDEBAR_COLLAPSED_GAP = "0.75rem";
const noop = () => undefined;
const PROFILE_SIDEBAR_LAYOUT_STYLE = {
  "--profile-sidebar-width": PROFILE_SIDEBAR_DESKTOP_WIDTH,
  "--profile-sidebar-width-collapsed": PROFILE_SIDEBAR_COLLAPSED_WIDTH,
  "--profile-sidebar-collapsed-gap": PROFILE_SIDEBAR_COLLAPSED_GAP,
  "--profile-sidebar-width-xl": PROFILE_SIDEBAR_DESKTOP_WIDTH_XL,
} as CSSProperties;
const PROFILE_SIDEBAR_CONTENT_OFFSET_CLASS =
  "lg:mr-[calc(var(--profile-sidebar-width-collapsed)+var(--profile-sidebar-collapsed-gap))] data-[profile-sidebar-open=true]:lg:mr-[var(--profile-sidebar-width)] data-[profile-sidebar-open=true]:xl:mr-[var(--profile-sidebar-width-xl)]";
const HOME_CONTENT_WRAPPER_BASE_CLASS =
  "w-full transition-[margin] duration-300 ease-in-out";
const HOME_CONTENT_WRAPPER_CLASS = `w-full transition-[margin] duration-300 ease-in-out ${PROFILE_SIDEBAR_CONTENT_OFFSET_CLASS}`;

const mobileBarRightSlot = (
  <Button
    asChild
    className="h-9 rounded-xl border-border/70 bg-transparent px-3 text-[0.72rem] font-medium tracking-[0.02em] text-foreground/86 transition-[background-color,border-color,color] duration-150 hover:bg-muted/38 hover:text-foreground focus-visible:border-ring focus-visible:bg-muted/38 focus-visible:text-foreground focus-visible:ring-ring/20"
    size="sm"
    variant="outline"
  >
    <Link href="/profile/edit">
      <span className="max-[359px]:hidden">Course </span>
      <span>Profile</span>
    </Link>
  </Button>
);

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
      if (programsParam) {
        newState.programs = [programsParam];
      }
      if (levelParam) {
        newState.level = [levelParam];
      }
      if (huvudomradenParam) {
        newState.huvudomraden = [huvudomradenParam];
      }
      if (campusParam) {
        newState.campus = [campusParam];
      }

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

  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen } =
    useResponsiveSidebar();
  const { value: profileSidebarOpen, toggle: toggleProfileSidebar } = useToggle(
    false,
    PROFILE_SIDEBAR_STORAGE_KEY
  );
  const effectiveProfileSidebarOpen =
    homeProfileSidebarEnabled && profileSidebarOpen;
  const homeContentWrapperClass = homeProfileSidebarEnabled
    ? HOME_CONTENT_WRAPPER_CLASS
    : HOME_CONTENT_WRAPPER_BASE_CLASS;

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
    const insetScroller = document.querySelector(
      "[data-slot='sidebar-inset'] > div"
    );
    if (insetScroller) {
      insetScroller.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
        mobileBarRightSlot={mobileBarRightSlot}
        onSidebarOpenChange={noop}
        sidebarOpen={storedSkeletonSidebarOpen}
      >
        <div
          className="flex flex-col flex-1"
          style={
            homeProfileSidebarEnabled ? PROFILE_SIDEBAR_LAYOUT_STYLE : undefined
          }
        >
          {homeProfileSidebarEnabled ? (
            <ProfileSidebarSkeleton
              isOpen={storedSkeletonProfileSidebarOpen}
              onToggle={noop}
            />
          ) : null}

          <div
            className={homeContentWrapperClass}
            data-profile-sidebar-open={
              homeProfileSidebarEnabled && storedSkeletonProfileSidebarOpen
                ? "true"
                : "false"
            }
          >
            <div className="container mx-auto px-4 pt-4 pb-8">
              <TopControlsSkeleton />

              {storedSkeletonViewMode === "grid" ? (
                <CourseGridSkeleton count={COURSES_PER_PAGE} />
              ) : (
                <CourseListSkeleton count={COURSES_PER_PAGE} />
              )}
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        mobileBarRightSlot={mobileBarRightSlot}
        onSidebarOpenChange={setSidebarOpen}
        sidebarContent={
          <HomeSidebarContent
            courses={courses}
            filterState={filterState}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        }
        sidebarHeaderExtra={
          <SearchBar
            className="max-w-none border-sidebar-border/80 bg-sidebar-accent/20"
            onChange={handleSearchChange}
            placeholder="Search courses by name or code..."
            value={filterState.search}
          />
        }
        sidebarOpen={sidebarOpen}
      >
        <div className="flex flex-col flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">
              Error loading courses: {error}
            </p>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/10"
              onClick={() => window.location.reload()}
              type="button"
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
      mobileBarRightSlot={mobileBarRightSlot}
      onSidebarOpenChange={setSidebarOpen}
      sidebarContent={
        <HomeSidebarContent
          courses={courses}
          filterState={filterState}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />
      }
      sidebarHeaderExtra={
        <SearchBar
          className="max-w-none border-sidebar-border/80 bg-sidebar-accent/20"
          onChange={handleSearchChange}
          placeholder="Search courses by name or code..."
          value={filterState.search}
        />
      }
      sidebarOpen={sidebarOpen}
    >
      <div
        className="flex flex-col flex-1"
        style={
          homeProfileSidebarEnabled ? PROFILE_SIDEBAR_LAYOUT_STYLE : undefined
        }
      >
        {homeProfileSidebarEnabled ? (
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
        ) : null}

        <div
          className={homeContentWrapperClass}
          data-profile-sidebar-open={
            effectiveProfileSidebarOpen ? "true" : "false"
          }
        >
          <div className="container mx-auto px-4 pt-4 pb-8">
            <div className="flex w-full flex-col gap-4">
              <div>
                <InfoBanner />
              </div>

              <div className="flex justify-end">
                <ViewToggle
                  onViewModeChange={setViewMode}
                  viewMode={viewMode}
                />
              </div>

              <div>
                {viewMode === "grid" ? (
                  <CourseGrid
                    courses={paginatedCourses}
                    currentPage={currentPage}
                    isFiltered={hasActiveFilters(filterState)}
                    itemsPerPage={COURSES_PER_PAGE}
                    onPageChange={handlePageChange}
                    profileSidebarOpen={effectiveProfileSidebarOpen}
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
      mobileBarRightSlot={mobileBarRightSlot}
      onSidebarOpenChange={noop}
      sidebarOpen={storedSidebarOpen}
    >
      <div
        className="flex flex-col flex-1"
        style={
          homeProfileSidebarEnabled ? PROFILE_SIDEBAR_LAYOUT_STYLE : undefined
        }
      >
        {homeProfileSidebarEnabled ? (
          <ProfileSidebarSkeleton
            isOpen={storedProfileSidebarOpen}
            onToggle={noop}
          />
        ) : null}
        <div
          className={
            homeProfileSidebarEnabled
              ? HOME_CONTENT_WRAPPER_CLASS
              : HOME_CONTENT_WRAPPER_BASE_CLASS
          }
          data-profile-sidebar-open={
            homeProfileSidebarEnabled && storedProfileSidebarOpen
              ? "true"
              : "false"
          }
        >
          <div className="container mx-auto px-4 pt-4 pb-8">
            <div className="flex w-full flex-col gap-4">
              <div>
                <TopControlsSkeleton />
              </div>

              <div>
                {storedViewMode === "grid" ? (
                  <CourseGridSkeleton count={COURSES_PER_PAGE} />
                ) : (
                  <CourseListSkeleton count={COURSES_PER_PAGE} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
