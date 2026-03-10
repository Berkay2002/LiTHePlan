// types/course.ts

/**
 * Course interface representing a Swedish university course
 * Used for both mock data and final schema
 */
export interface Course {
  /** Block within the period (1-4) - single block for 100% courses, two blocks for 50% courses */
  block: string[];

  /** Campus location or distance learning */
  campus: "Linköping" | "Norrköping" | "Distans";

  /** Number of credits (typically 30 for master's courses) */
  credits: number;

  /** Array of examination types: TEN (written exam), LAB (lab work), PROJ (project), SEM (seminar), UPG (assignment) */
  examination: ("TEN" | "LAB" | "PROJ" | "SEM" | "UPG")[];

  /** Course examiner/instructor */
  examinator?: string | null;

  /** Huvudområde (main subject area) - comma-separated string from database */
  huvudomrade?: string | null;
  /** Unique course identifier (e.g., 'TQXX33') */
  id: string;

  /** Course level in Swedish */
  level: "grundnivå" | "avancerad nivå";

  /** Course name in English */
  name: string;

  /** Optional notes about course restrictions or warnings */
  notes?: string | null;

  /** Orientations (specializations within programs) this course belongs to */
  orientations?: string[];

  /** Study pace (100% = full-time, 50% = part-time) */
  pace: "100%" | "50%";

  /** Period within the term (1 or 2) */
  period: string[];

  /** Programs (main degree programs) this course belongs to */
  programs: string[];

  /** Study director/academic coordinator */
  studierektor?: string | null;

  /** Academic term(s) (7 = first year, 8 = second year, 9 = third year) */
  term: string[];
}

/**
 * Type guard to validate if an object conforms to the Course interface
 */
export function isValidCourse(course: unknown): course is Course {
  if (!course || typeof course !== "object") {
    return false;
  }

  const courseObj = course as Record<string, unknown>;

  return (
    typeof courseObj.id === "string" &&
    typeof courseObj.name === "string" &&
    typeof courseObj.credits === "number" &&
    (courseObj.level === "grundnivå" || courseObj.level === "avancerad nivå") &&
    Array.isArray(courseObj.term) &&
    courseObj.term.every(
      (t) => typeof t === "string" && ["7", "8", "9"].includes(t)
    ) &&
    Array.isArray(courseObj.period) &&
    courseObj.period.every(
      (p) => typeof p === "string" && ["1", "2"].includes(p)
    ) &&
    Array.isArray(courseObj.block) &&
    courseObj.block.every(
      (b) => typeof b === "string" && ["1", "2", "3", "4"].includes(b)
    ) &&
    (courseObj.pace === "100%" || courseObj.pace === "50%") &&
    Array.isArray(courseObj.examination) &&
    courseObj.examination.every(
      (e) =>
        typeof e === "string" &&
        ["TEN", "LAB", "PROJ", "SEM", "UPG"].includes(e)
    ) &&
    ["Linköping", "Norrköping", "Distans"].includes(
      courseObj.campus as string
    ) &&
    Array.isArray(courseObj.programs) &&
    (courseObj.orientations === undefined ||
      Array.isArray(courseObj.orientations)) &&
    (courseObj.notes === undefined ||
      courseObj.notes === null ||
      typeof courseObj.notes === "string")
  );
}
