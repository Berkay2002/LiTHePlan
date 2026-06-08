import { describe, expect, it } from "vitest";
import type { Course } from "@/types/course";
import type { StudentProfile } from "@/types/profile";
import {
  createProfileMetadata,
  evaluateProfile,
  withEvaluatedProfileMetadata,
} from "./profile-evaluation";

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

const createProfile = (
  courses: Course[],
  metadata = {
    advanced_credits: 999,
    is_valid: false,
    total_credits: 999,
  }
): StudentProfile => ({
  created_at: new Date("2026-01-01T00:00:00.000Z"),
  id: "profile-1",
  metadata,
  name: "My Master's Plan",
  terms: {
    7: courses,
    8: [],
    9: [],
  },
  updated_at: new Date("2026-01-02T00:00:00.000Z"),
});

describe("profile evaluation", () => {
  it("computes totals from terms instead of stored metadata", () => {
    const profile = createProfile([
      createCourse({ credits: 6, id: "ADV", level: "avancerad nivå" }),
      createCourse({ credits: 6, id: "BASIC", level: "grundnivå" }),
    ]);

    expect(evaluateProfile(profile)).toMatchObject({
      advancedCredits: 6,
      basicCredits: 6,
      totalCourses: 2,
      totalCredits: 12,
    });
  });

  it("reports duplicate courses as invalid", () => {
    const duplicate = createCourse({ id: "TDDD11" });
    const profile = createProfile([duplicate, duplicate]);

    const evaluation = evaluateProfile(profile);

    expect(evaluation.isValid).toBe(false);
    expect(evaluation.errors).toContain(
      "Duplicate course found: TDDD11 (Reliable Systems)"
    );
  });

  it("creates metadata from evaluation", () => {
    const profile = createProfile([
      createCourse({ credits: 6, id: "ADV", level: "avancerad nivå" }),
      createCourse({ credits: 6, id: "BASIC", level: "grundnivå" }),
    ]);

    expect(createProfileMetadata(profile)).toEqual({
      advanced_credits: 6,
      is_valid: true,
      total_credits: 12,
    });
  });

  it("rewrites stale metadata without changing the profile identity", () => {
    const profile = createProfile([createCourse({ credits: 6 })]);
    const evaluated = withEvaluatedProfileMetadata(profile);

    expect(evaluated).toMatchObject({
      id: "profile-1",
      metadata: {
        advanced_credits: 6,
        is_valid: true,
        total_credits: 6,
      },
      name: "My Master's Plan",
    });
  });

  it("computes program credit leaders from advanced courses only", () => {
    const profile = createProfile([
      createCourse({
        credits: 6,
        id: "ADV1",
        level: "avancerad nivå",
        orientations: ["AI"],
        programs: ["D"],
      }),
      createCourse({
        credits: 6,
        id: "BASIC1",
        level: "grundnivå",
        orientations: ["Ignored"],
        programs: ["Ignored"],
      }),
    ]);

    expect(evaluateProfile(profile).topPrograms).toEqual([
      { credits: 6, percentage: 20, program: "D" },
      { credits: 6, percentage: 20, program: "AI" },
    ]);
  });
});
