import { describe, expect, it } from "vitest";
import type { Course } from "@/types/course";
import type { StudentProfile } from "@/types/profile";
import {
  getCourseProfileActionState,
  getDefaultCourseProfileTerm,
  planCourseProfileAdd,
  planCourseProfileAddAfterConflictResolution,
} from "./profile-planning-command";

const createCourse = (overrides: Partial<Course> = {}): Course => ({
  block: ["1"],
  campus: "Linköping",
  credits: 6,
  examination: ["TEN"],
  id: "TDDD00",
  level: "avancerad nivå",
  name: "Reliable Systems",
  pace: "100%",
  period: ["1"],
  programs: ["Civilingenjör i mjukvaruteknik"],
  term: ["7"],
  ...overrides,
});

const createProfile = (courses: Course[] = []): StudentProfile => ({
  created_at: new Date("2026-01-01T00:00:00.000Z"),
  id: "profile-1",
  metadata: {
    advanced_credits: courses.reduce(
      (sum, course) =>
        sum + (course.level === "avancerad nivå" ? course.credits : 0),
      0
    ),
    is_valid: true,
    total_credits: courses.reduce((sum, course) => sum + course.credits, 0),
  },
  name: "My Master's Plan",
  terms: {
    7: courses,
    8: [],
    9: [],
  },
  updated_at: new Date("2026-01-02T00:00:00.000Z"),
});

describe("profile planning command", () => {
  it("returns already-in-profile before any other decision", () => {
    const course = createCourse({ id: "TDDD01" });
    expect(planCourseProfileAdd(createProfile([course]), course)).toEqual({
      courseId: "TDDD01",
      type: "already-in-profile",
    });
  });

  it("requires conflict resolution before term selection", () => {
    const existing = createCourse({ id: "TDDD10" });
    const next = createCourse({
      id: "TDDD20",
      notes: "The course may not be included in a degree together with: TDDD10",
      term: ["7", "9"],
    });

    const decision = planCourseProfileAdd(createProfile([existing]), next);

    expect(decision.type).toBe("conflict-resolution-required");
    if (decision.type === "conflict-resolution-required") {
      expect(
        decision.conflicts.map((conflict) => conflict.conflictingCourseId)
      ).toEqual(["TDDD10"]);
    }
  });

  it("requires term selection for multi-term courses without conflicts", () => {
    const course = createCourse({ term: ["7", "9"] });
    expect(planCourseProfileAdd(null, course)).toEqual({
      availableTerms: [7, 9],
      course,
      type: "term-selection-required",
    });
  });

  it("is ready to add a single-term course", () => {
    const course = createCourse({ term: ["8"] });
    expect(planCourseProfileAdd(null, course)).toEqual({
      course,
      term: 8,
      type: "ready-to-add",
    });
  });

  it("plans term selection after conflicts have been resolved", () => {
    const course = createCourse({ term: ["7", "9"] });
    expect(planCourseProfileAddAfterConflictResolution(course)).toEqual({
      availableTerms: [7, 9],
      course,
      type: "term-selection-required",
    });
  });

  it("reports pinned and conflict state for renderers", () => {
    const existing = createCourse({ id: "TDDD10" });
    const next = createCourse({
      id: "TDDD20",
      notes: "The course may not be included in a degree together with: TDDD10",
    });

    expect(
      getCourseProfileActionState(createProfile([existing]), next)
    ).toMatchObject({
      availableTerms: [7],
      isPinned: false,
      wouldHaveConflicts: true,
    });
    expect(getDefaultCourseProfileTerm(next)).toBe(7);
  });
});
