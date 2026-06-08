import {
  getPeriodScheduleConflicts,
  type ScheduleConflictInfo,
  type StudyPeriod,
} from "@/lib/term-plan-schedule";
import type { Course } from "@/types/course";

export type ConflictInfo = ScheduleConflictInfo;

export function detectCourseConflicts(
  courses: Course[],
  targetCourse: Course,
  currentPeriod: StudyPeriod
): ConflictInfo | null {
  return (
    getPeriodScheduleConflicts([...courses, targetCourse], currentPeriod).get(
      targetCourse.id
    ) ?? null
  );
}

export function getConflictBorderClass(hasConflict: boolean): string {
  return hasConflict ? "border-destructive/50 shadow-sm" : "";
}

export function getAllPeriodConflicts(
  courses: Course[],
  period: StudyPeriod
): Map<string, ConflictInfo> {
  return getPeriodScheduleConflicts(courses, period);
}
