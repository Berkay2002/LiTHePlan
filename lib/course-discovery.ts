import { z } from "zod";
import type { ViewMode } from "@/components/course/ViewToggle";
import type { Course } from "@/types/course";

export const FILTER_STORAGE_KEY = "litheplan-filters";
export const VIEW_MODE_STORAGE_KEY = "litheplan-view-mode";

export const COURSE_EXAMINATION_TYPES = [
  "TEN",
  "LAB",
  "PROJ",
  "SEM",
  "UPG",
] as const;

export type CourseExaminationType = (typeof COURSE_EXAMINATION_TYPES)[number];
export type ExaminationFilterMode = "include" | "exclude" | "ignore";
export type ExaminationFilters = Record<string, ExaminationFilterMode>;

export interface CourseDiscoveryFilters {
  block: number[];
  campus: string[];
  examination: ExaminationFilters;
  huvudomraden: string[];
  level: string[];
  orientations: string[];
  pace: string[];
  period: number[];
  programs: string[];
  search: string;
  term: number[];
}

export interface CourseApiFilters extends CourseDiscoveryFilters {
  limit: number;
  loadAll: boolean;
  page: number;
}

export type CourseDatabaseConstraint =
  | {
      column: "block" | "campus" | "level" | "pace" | "period" | "term";
      kind: "in" | "overlaps";
      values: (number | string)[];
    }
  | {
      column: "examination" | "orientations" | "programs";
      kind: "contains" | "notOverlaps" | "overlaps";
      values: string[];
    }
  | {
      column: "huvudomrade";
      kind: "subjectArea";
      values: string[];
    }
  | {
      kind: "search";
      value: string;
    };

interface SearchParamsLike {
  get: (name: string) => string | null;
  getAll: (name: string) => string[];
}

const MAX_FILTER_VALUE_LENGTH = 120;
const DATABASE_PACE_BY_LABEL: Record<string, number> = {
  "100%": 1,
  "50%": 0.5,
};
const COURSE_FILTER_VALUE_SCHEMA = z
  .string()
  .trim()
  .min(1)
  .max(MAX_FILTER_VALUE_LENGTH);
const COURSE_FILTER_VALUES_SCHEMA = z
  .array(COURSE_FILTER_VALUE_SCHEMA)
  .default([]);
const COURSE_NUMBER_FILTER_SCHEMA =
  COURSE_FILTER_VALUES_SCHEMA.transform(parseNumberValues);
const COURSE_EXAMINATION_SCHEMA = z
  .array(z.enum(COURSE_EXAMINATION_TYPES))
  .default([]);
const BOOLEAN_QUERY_SCHEMA = z
  .union([
    z.boolean(),
    z.enum(["true", "false"]).transform((value) => value === "true"),
  ])
  .default(false);

export const CourseFiltersSchema = z
  .object({
    block: COURSE_NUMBER_FILTER_SCHEMA,
    campus: COURSE_FILTER_VALUES_SCHEMA,
    examinationExclude: COURSE_EXAMINATION_SCHEMA,
    examinationInclude: COURSE_EXAMINATION_SCHEMA,
    huvudomraden: COURSE_FILTER_VALUES_SCHEMA,
    level: COURSE_FILTER_VALUES_SCHEMA,
    limit: z.coerce.number().int().min(1).max(100).default(50),
    loadAll: BOOLEAN_QUERY_SCHEMA,
    orientations: COURSE_FILTER_VALUES_SCHEMA,
    pace: COURSE_FILTER_VALUES_SCHEMA,
    page: z.coerce.number().int().min(1).default(1),
    period: COURSE_NUMBER_FILTER_SCHEMA,
    programs: COURSE_FILTER_VALUES_SCHEMA,
    search: z.string().trim().max(200).optional().default(""),
    term: COURSE_NUMBER_FILTER_SCHEMA,
  })
  .strict()
  .transform(
    ({
      examinationExclude,
      examinationInclude,
      ...filters
    }): CourseApiFilters => ({
      ...filters,
      examination: createExaminationFilters(
        examinationInclude,
        examinationExclude
      ),
    })
  );

export function createDefaultCourseFilters(): CourseDiscoveryFilters {
  return {
    block: [],
    campus: [],
    examination: {},
    huvudomraden: [],
    level: [],
    orientations: [],
    pace: [],
    period: [],
    programs: [],
    search: "",
    term: [],
  };
}

export function createCourseFiltersFromSearchParams(
  searchParams: SearchParamsLike
): CourseDiscoveryFilters {
  return {
    ...createDefaultCourseFilters(),
    block: getNumberParamValues(searchParams, "block"),
    campus: getParamValues(searchParams, "campus"),
    examination: createExaminationFilters(
      getParamValues(searchParams, "examinationInclude"),
      getParamValues(searchParams, "examinationExclude")
    ),
    huvudomraden: getParamValues(searchParams, "huvudomraden"),
    level: getParamValues(searchParams, "level"),
    orientations: getParamValues(searchParams, "orientations"),
    pace: getParamValues(searchParams, "pace"),
    period: getNumberParamValues(searchParams, "period"),
    programs: getParamValues(searchParams, "programs"),
    search: searchParams.get("search")?.trim() ?? "",
    term: getNumberParamValues(searchParams, "term"),
  };
}

export function getRawCourseFilters(searchParams: SearchParamsLike) {
  return {
    block: getParamValues(searchParams, "block"),
    campus: getParamValues(searchParams, "campus"),
    examinationExclude: getParamValues(searchParams, "examinationExclude"),
    examinationInclude: getParamValues(searchParams, "examinationInclude"),
    huvudomraden: getParamValues(searchParams, "huvudomraden"),
    level: getParamValues(searchParams, "level"),
    limit: searchParams.get("limit") ?? undefined,
    loadAll: searchParams.get("loadAll") ?? undefined,
    orientations: getParamValues(searchParams, "orientations"),
    pace: getParamValues(searchParams, "pace"),
    page: searchParams.get("page") ?? undefined,
    period: getParamValues(searchParams, "period"),
    programs: getParamValues(searchParams, "programs"),
    search: searchParams.get("search") ?? undefined,
    term: getParamValues(searchParams, "term"),
  };
}

export function parseStoredCourseFilters(
  serialized: string
): CourseDiscoveryFilters | null {
  try {
    const parsed = JSON.parse(serialized) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return normalizeStoredCourseFilters(parsed);
  } catch (error) {
    console.warn("Failed to parse filter preferences", error);
    return null;
  }
}

export function parseViewMode(value: string): ViewMode | null {
  return value === "grid" || value === "list" ? value : null;
}

export function filterCourses(
  courses: Course[],
  filterState: CourseDiscoveryFilters
): Course[] {
  if (!(courses && Array.isArray(courses))) {
    return [];
  }

  const matchers = createCourseMatchers(filterState);

  return courses.filter((course) =>
    matchers.every((matchesCourse) => matchesCourse(course))
  );
}

export function hasActiveCourseFilters(filterState: CourseDiscoveryFilters) {
  return (
    filterState.search.trim().length > 0 ||
    filterState.block.length > 0 ||
    filterState.campus.length > 0 ||
    Object.keys(filterState.examination).length > 0 ||
    filterState.huvudomraden.length > 0 ||
    filterState.level.length > 0 ||
    filterState.orientations.length > 0 ||
    filterState.pace.length > 0 ||
    filterState.period.length > 0 ||
    filterState.programs.length > 0 ||
    filterState.term.length > 0
  );
}

export function createCourseDatabaseConstraints(
  filterState: CourseDiscoveryFilters
): CourseDatabaseConstraint[] {
  const constraints: CourseDatabaseConstraint[] = [];
  const databaseTerms = expandTermAliases(filterState.term).map(String);
  const databasePaces = filterState.pace.map(
    (pace) => DATABASE_PACE_BY_LABEL[pace] ?? pace
  );
  const includedExaminations = getExaminationsByMode(
    filterState.examination,
    "include"
  );
  const excludedExaminations = getExaminationsByMode(
    filterState.examination,
    "exclude"
  );

  if (filterState.level.length > 0) {
    constraints.push({
      column: "level",
      kind: "in",
      values: filterState.level,
    });
  }

  if (databaseTerms.length > 0) {
    constraints.push({
      column: "term",
      kind: "overlaps",
      values: databaseTerms,
    });
  }

  if (filterState.period.length > 0) {
    constraints.push({
      column: "period",
      kind: "overlaps",
      values: filterState.period.map(String),
    });
  }

  if (filterState.block.length > 0) {
    constraints.push({
      column: "block",
      kind: "overlaps",
      values: filterState.block.map(String),
    });
  }

  if (databasePaces.length > 0) {
    constraints.push({ column: "pace", kind: "in", values: databasePaces });
  }

  if (filterState.campus.length > 0) {
    constraints.push({
      column: "campus",
      kind: "in",
      values: filterState.campus,
    });
  }

  if (filterState.programs.length > 0) {
    constraints.push({
      column: "programs",
      kind: "overlaps",
      values: filterState.programs,
    });
  }

  if (filterState.orientations.length > 0) {
    constraints.push({
      column: "orientations",
      kind: "overlaps",
      values: filterState.orientations,
    });
  }

  if (includedExaminations.length > 0) {
    constraints.push({
      column: "examination",
      kind: "contains",
      values: includedExaminations,
    });
  }

  if (excludedExaminations.length > 0) {
    constraints.push({
      column: "examination",
      kind: "notOverlaps",
      values: excludedExaminations,
    });
  }

  if (filterState.huvudomraden.length > 0) {
    constraints.push({
      column: "huvudomrade",
      kind: "subjectArea",
      values: filterState.huvudomraden,
    });
  }

  if (filterState.search.trim().length > 0) {
    constraints.push({ kind: "search", value: filterState.search.trim() });
  }

  return constraints;
}

export function formatPostgresArray(values: string[]): string {
  return `{${values.map((value) => `"${value.replaceAll('"', '\\"')}"`).join(",")}}`;
}

export function buildSubjectAreaFilter(values: string[]): string {
  return values
    .map(sanitizePostgrestFilterValue)
    .filter(Boolean)
    .flatMap((value) => [
      `huvudomrade.eq.${value}`,
      `huvudomrade.ilike.${value},%`,
      `huvudomrade.ilike.%, ${value}`,
      `huvudomrade.ilike.%, ${value},%`,
    ])
    .join(",");
}

export function buildCourseSearchFilter(search: string): string {
  const value = sanitizePostgrestFilterValue(search);
  return [
    `id.ilike.%${value}%`,
    `name.ilike.%${value}%`,
    `examinator.ilike.%${value}%`,
    `studierektor.ilike.%${value}%`,
    `programs.cs.{${value}}`,
    `orientations.cs.{${value}}`,
    `huvudomrade.ilike.%${value}%`,
  ].join(",");
}

function normalizeStoredCourseFilters(
  parsed: Record<string, unknown>
): CourseDiscoveryFilters {
  return {
    block: getStoredNumberArray(parsed.block),
    campus: getStoredStringArray(parsed.campus),
    examination: getStoredExaminationFilters(parsed.examination),
    huvudomraden: getStoredStringArray(parsed.huvudomraden),
    level: getStoredStringArray(parsed.level),
    orientations: getStoredStringArray(parsed.orientations),
    pace: getStoredStringArray(parsed.pace),
    period: getStoredNumberArray(parsed.period),
    programs: getStoredStringArray(parsed.programs),
    search: typeof parsed.search === "string" ? parsed.search : "",
    term: getStoredNumberArray(parsed.term),
  };
}

function getStoredStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return uniqueValues(
    value.filter((item): item is string => typeof item === "string")
  );
}

function getStoredNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return uniqueValues(
    value.filter((item): item is number => Number.isInteger(item))
  );
}

function getStoredExaminationFilters(value: unknown): ExaminationFilters {
  if (!value || typeof value !== "object") {
    return {};
  }

  const filters: ExaminationFilters = {};
  for (const [examination, mode] of Object.entries(value)) {
    if (mode === "include" || mode === "exclude") {
      filters[examination] = mode;
    }
  }

  return filters;
}

function getParamValues(
  searchParams: SearchParamsLike,
  name: string
): string[] {
  return uniqueValues(
    searchParams
      .getAll(name)
      .map((value) => value.trim())
      .filter(Boolean)
  );
}

function getNumberParamValues(
  searchParams: SearchParamsLike,
  name: string
): number[] {
  return parseNumberValues(getParamValues(searchParams, name));
}

function parseNumberValues(values: string[]): number[] {
  return uniqueValues(
    values
      .map((value) => Number.parseInt(value, 10))
      .filter((value) => Number.isInteger(value))
  );
}

function createExaminationFilters(
  includeValues: string[],
  excludeValues: string[]
): ExaminationFilters {
  const filters: ExaminationFilters = {};

  for (const value of includeValues) {
    if (isCourseExaminationType(value)) {
      filters[value] = "include";
    }
  }

  for (const value of excludeValues) {
    if (isCourseExaminationType(value)) {
      filters[value] = "exclude";
    }
  }

  return filters;
}

function isCourseExaminationType(
  value: string
): value is CourseExaminationType {
  return COURSE_EXAMINATION_TYPES.some(
    (examinationType) => examinationType === value
  );
}

function createCourseMatchers(
  filterState: CourseDiscoveryFilters
): ((course: Course) => boolean)[] {
  return [
    (course) => matchesSearch(course, filterState.search),
    (course) => matchesSimpleArray(filterState.level, course.level),
    (course) => matchesTerm(course, filterState.term),
    (course) => matchesPeriod(course, filterState.period),
    (course) => matchesBlock(course, filterState.block),
    (course) => matchesSimpleArray(filterState.pace, course.pace),
    (course) => matchesSimpleArray(filterState.campus, course.campus),
    (course) => matchesExamination(course, filterState.examination),
    (course) => matchesPrograms(course.programs ?? [], filterState.programs),
    (course) =>
      matchesSimpleStringArray(
        course.orientations ?? [],
        filterState.orientations
      ),
    (course) => matchesHuvudomraden(course, filterState.huvudomraden),
  ];
}

function matchesSearch(course: Course, searchTerm: string) {
  const normalizedTerm = searchTerm.toLowerCase().trim();
  if (!normalizedTerm) {
    return true;
  }

  const searchableValues = [
    course.name,
    course.id,
    course.examinator,
    course.studierektor,
    course.huvudomrade,
    ...(course.programs ?? []),
    ...(course.orientations ?? []),
  ];

  return searchableValues.some(
    (value) => value?.toLowerCase().includes(normalizedTerm) ?? false
  );
}

function matchesTerm(course: Course, selectedTerms: number[]) {
  if (selectedTerms.length === 0) {
    return true;
  }

  return selectedTerms.some((selectedTerm) =>
    expandTermAliases([selectedTerm]).some((term) =>
      course.term.includes(term.toString())
    )
  );
}

function matchesPeriod(course: Course, selectedPeriods: number[]) {
  if (selectedPeriods.length === 0) {
    return true;
  }

  return selectedPeriods.some((period) =>
    course.period.includes(period.toString())
  );
}

function matchesBlock(course: Course, selectedBlocks: number[]) {
  if (selectedBlocks.length === 0) {
    return true;
  }

  return selectedBlocks.some((block) =>
    course.block.includes(block.toString())
  );
}

function matchesSimpleArray(selectedValues: string[], value: string) {
  return selectedValues.length === 0 || selectedValues.includes(value);
}

function matchesSimpleStringArray(values: string[], selectedValues: string[]) {
  return (
    selectedValues.length === 0 ||
    selectedValues.some((selectedValue) => values.includes(selectedValue))
  );
}

function matchesExamination(
  course: Course,
  examinationFilters: ExaminationFilters
) {
  const activeFilters = Object.entries(examinationFilters).filter(
    ([, mode]) => mode === "include" || mode === "exclude"
  );
  if (activeFilters.length === 0) {
    return true;
  }

  if (!course.examination || course.examination.length === 0) {
    return false;
  }

  for (const [examType, mode] of activeFilters) {
    const courseHasExam = course.examination.includes(
      examType as CourseExaminationType
    );

    if (mode === "include" && !courseHasExam) {
      return false;
    }

    if (mode === "exclude" && courseHasExam) {
      return false;
    }
  }

  return true;
}

function matchesPrograms(coursePrograms: string[], selectedPrograms: string[]) {
  return matchesSimpleStringArray(coursePrograms, selectedPrograms);
}

function matchesHuvudomraden(course: Course, selectedHuvudomraden: string[]) {
  if (selectedHuvudomraden.length === 0) {
    return true;
  }

  const courseHuvudomraden = (course.huvudomrade ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return selectedHuvudomraden.some((huvudomrade) =>
    courseHuvudomraden.includes(huvudomrade)
  );
}

function expandTermAliases(terms: number[]): number[] {
  return uniqueValues(terms.flatMap((term) => (term === 7 ? [7, 9] : [term])));
}

function getExaminationsByMode(
  filters: ExaminationFilters,
  mode: Exclude<ExaminationFilterMode, "ignore">
): string[] {
  return Object.entries(filters)
    .filter(([, filterMode]) => filterMode === mode)
    .map(([examination]) => examination);
}

function sanitizePostgrestFilterValue(value: string): string {
  return value
    .replace(/[(),{}"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueValues<TValue>(values: TValue[]): TValue[] {
  return Array.from(new Set(values));
}
