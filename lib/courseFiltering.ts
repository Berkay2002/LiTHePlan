import {
  FILTER_STORAGE_KEY as COURSE_FILTER_STORAGE_KEY,
  VIEW_MODE_STORAGE_KEY as COURSE_VIEW_MODE_STORAGE_KEY,
  type CourseDiscoveryFilters,
  type ExaminationFilterMode as CourseExaminationFilterMode,
  createDefaultCourseFilters,
  filterCourses as filterCoursesWithDiscovery,
  hasActiveCourseFilters,
  parseViewMode as parseDiscoveryViewMode,
  parseStoredCourseFilters,
} from "./course-discovery";

export const FILTER_STORAGE_KEY = COURSE_FILTER_STORAGE_KEY;
export const VIEW_MODE_STORAGE_KEY = COURSE_VIEW_MODE_STORAGE_KEY;

export type FilterState = CourseDiscoveryFilters;
export type ExaminationFilterMode = CourseExaminationFilterMode;

export const createDefaultFilterState = createDefaultCourseFilters;
export const filterCourses = filterCoursesWithDiscovery;
export const hasActiveFilters = hasActiveCourseFilters;
export const parseFilterState = parseStoredCourseFilters;
export const parseViewMode = parseDiscoveryViewMode;
