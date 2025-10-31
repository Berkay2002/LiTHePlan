import type { FilterState } from "@/components/course/FilterPanel";
import type { ViewMode } from "@/components/course/ViewToggle";
import type { Course } from "@/types/course";

export const FILTER_STORAGE_KEY = "litheplan-filters";
export const VIEW_MODE_STORAGE_KEY = "litheplan-view-mode";

const EXAMINATION_TYPES = ["TEN", "LAB", "PROJ", "SEM", "UPG"] as const;

export function createDefaultFilterState(): FilterState {
  return {
    level: [],
    term: [],
    period: [],
    block: [],
    pace: [],
    campus: [],
    examination: [...EXAMINATION_TYPES],
    programs: [],
    huvudomraden: [],
    search: "",
  };
}

export function parseFilterState(serialized: string): FilterState | null {
  try {
    const parsed = JSON.parse(serialized) as Partial<FilterState> | null;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const next: FilterState = {
      ...createDefaultFilterState(),
      ...parsed,
    };

    if (!next.examination?.length) {
      next.examination = [...EXAMINATION_TYPES];
    }

    return next;
  } catch (error) {
    console.warn("Failed to parse filter preferences", error);
    return null;
  }
}

export function parseViewMode(value: string): ViewMode | null {
  return value === "grid" || value === "list" ? value : null;
}

const matchesSearch = (course: Course, searchTerm: string) => {
  const normalizedTerm = searchTerm.toLowerCase().trim();
  if (!normalizedTerm) {
    return true;
  }

  const matchesName = course.name.toLowerCase().includes(normalizedTerm);
  const matchesId = course.id.toLowerCase().includes(normalizedTerm);
  const matchesExaminer = course.examinator
    ?.toLowerCase()
    .includes(normalizedTerm);
  const matchesDirector = course.studierektor
    ?.toLowerCase()
    .includes(normalizedTerm);
  const matchesPrograms = course.programs.some((program) =>
    program.toLowerCase().includes(normalizedTerm)
  );

  return (
    matchesName ||
    matchesId ||
    Boolean(matchesExaminer) ||
    Boolean(matchesDirector) ||
    matchesPrograms
  );
};

const matchesTerm = (course: Course, selectedTerms: FilterState["term"]) => {
  if (selectedTerms.length === 0) {
    return true;
  }

  return selectedTerms.some((selectedTerm) => {
    if (selectedTerm === 7) {
      return course.term.includes("7") || course.term.includes("9");
    }

    return course.term.includes(selectedTerm.toString());
  });
};

const matchesPeriod = (
  course: Course,
  selectedPeriods: FilterState["period"]
) => {
  if (selectedPeriods.length === 0) {
    return true;
  }

  return selectedPeriods.some((period) =>
    course.period.includes(period.toString())
  );
};

const matchesBlock = (course: Course, selectedBlocks: FilterState["block"]) => {
  if (selectedBlocks.length === 0) {
    return true;
  }

  return selectedBlocks.some((block) =>
    course.block.includes(block.toString())
  );
};

const matchesSimpleArray = (
  selectedValues: string[],
  value: string
) => selectedValues.length === 0 || selectedValues.includes(value);

const matchesExamination = (
  course: Course,
  selectedExaminations: FilterState["examination"]
) => {
  // If all examination types are selected, show all courses
  if (selectedExaminations.length === EXAMINATION_TYPES.length) {
    return true;
  }

  // If course has no examination data, include it (assume it matches)
  if (!course.examination || course.examination.length === 0) {
    return true;
  }

  const unselected = EXAMINATION_TYPES.filter(
    (exam) => !selectedExaminations.includes(exam)
  );

  return !unselected.some((exam) => course.examination.includes(exam));
};

const matchesPrograms = (
  coursePrograms: string[],
  selectedPrograms: FilterState["programs"]
) => {
  if (selectedPrograms.length === 0) {
    return true;
  }

  return selectedPrograms.some((program) => coursePrograms.includes(program));
};

const matchesHuvudomraden = (
  course: Course,
  selectedHuvudomraden: FilterState["huvudomraden"]
) => {
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
};

export function filterCourses(
  courses: Course[],
  filterState: FilterState
): Course[] {
  if (!courses || !Array.isArray(courses)) {
    return [];
  }
  
  return courses.filter((course) => {
    if (!matchesSearch(course, filterState.search)) {
      return false;
    }

    if (!matchesSimpleArray(filterState.level, course.level)) {
      return false;
    }

    if (!matchesTerm(course, filterState.term)) {
      return false;
    }

    if (!matchesPeriod(course, filterState.period)) {
      return false;
    }

    if (!matchesBlock(course, filterState.block)) {
      return false;
    }

    if (!matchesSimpleArray(filterState.pace, course.pace)) {
      return false;
    }

    if (!matchesSimpleArray(filterState.campus, course.campus)) {
      return false;
    }

    if (!matchesExamination(course, filterState.examination)) {
      return false;
    }

    if (!matchesPrograms(course.programs ?? [], filterState.programs)) {
      return false;
    }

    if (!matchesHuvudomraden(course, filterState.huvudomraden)) {
      return false;
    }

    return true;
  });
}

export function hasActiveFilters(filterState: FilterState) {
  return Object.entries(filterState).some(([key, value]) =>
    key === "programs" || key === "search"
      ? Boolean(value)
      : (value as (string | number)[]).length > 0
  );
}
