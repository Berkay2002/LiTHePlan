import { describe, expect, it } from "vitest";
import type { Course } from "../types/course";
import {
  createCourseDatabaseConstraints,
  createCourseFiltersFromSearchParams,
  filterCourses,
  parseStoredCourseFilters,
} from "./course-discovery";

const createCourse = (overrides: Partial<Course>): Course => ({
  block: ["1"],
  campus: "Linköping",
  credits: 6,
  examination: ["TEN"],
  examinator: "Ada Lovelace",
  huvudomrade: "Computer Science, Software Engineering",
  id: "TDDD00",
  level: "avancerad nivå",
  name: "Reliable Systems",
  orientations: ["AI"],
  pace: "100%",
  period: ["1"],
  programs: ["Civilingenjör i mjukvaruteknik"],
  studierektor: "Grace Hopper",
  term: ["7"],
  ...overrides,
});

describe("course discovery filters", () => {
  it("parses URL filters into the same grammar used by in-memory matching", () => {
    const params = new URLSearchParams([
      ["programs", "Civilingenjör i mjukvaruteknik"],
      ["huvudomraden", "Software Engineering"],
      ["term", "7"],
      ["examinationInclude", "TEN"],
      ["examinationExclude", "LAB"],
      ["orientations", "AI"],
      ["search", "systems"],
    ]);

    expect(createCourseFiltersFromSearchParams(params)).toMatchObject({
      examination: {
        LAB: "exclude",
        TEN: "include",
      },
      huvudomraden: ["Software Engineering"],
      orientations: ["AI"],
      programs: ["Civilingenjör i mjukvaruteknik"],
      search: "systems",
      term: [7],
    });
  });

  it("matches subject areas, examination modes, orientations, and term aliases in memory", () => {
    const courses = [
      createCourse({ id: "MATCH", term: ["9"] }),
      createCourse({
        examination: ["TEN", "LAB"],
        id: "HAS_LAB",
        term: ["9"],
      }),
      createCourse({
        huvudomrade: "Mathematics",
        id: "WRONG_SUBJECT",
        term: ["9"],
      }),
      createCourse({
        id: "WRONG_ORIENTATION",
        orientations: ["Sustainability"],
        term: ["9"],
      }),
    ];

    const result = filterCourses(courses, {
      block: [],
      campus: [],
      examination: {
        LAB: "exclude",
        TEN: "include",
      },
      huvudomraden: ["Software Engineering"],
      level: [],
      orientations: ["AI"],
      pace: [],
      period: [],
      programs: [],
      search: "",
      term: [7],
    });

    expect(result.map((course) => course.id)).toEqual(["MATCH"]);
  });

  it("translates the same grammar into route database constraints", () => {
    expect(
      createCourseDatabaseConstraints({
        block: [],
        campus: [],
        examination: {
          LAB: "exclude",
          TEN: "include",
        },
        huvudomraden: ["Software Engineering"],
        level: [],
        orientations: ["AI"],
        pace: ["100%"],
        period: [],
        programs: ["Civilingenjör i mjukvaruteknik"],
        search: "",
        term: [7],
      })
    ).toEqual([
      { column: "term", kind: "overlaps", values: ["7", "9"] },
      { column: "pace", kind: "in", values: [1] },
      {
        column: "programs",
        kind: "overlaps",
        values: ["Civilingenjör i mjukvaruteknik"],
      },
      { column: "orientations", kind: "overlaps", values: ["AI"] },
      { column: "examination", kind: "contains", values: ["TEN"] },
      {
        column: "examination",
        kind: "notOverlaps",
        values: ["LAB"],
      },
      {
        column: "huvudomrade",
        kind: "subjectArea",
        values: ["Software Engineering"],
      },
    ]);
  });

  it("keeps legacy stored numeric filter strings", () => {
    expect(
      parseStoredCourseFilters(
        JSON.stringify({
          block: ["1", 2, "not-a-block"],
          period: ["1", "2"],
          term: ["7", "8"],
        })
      )
    ).toMatchObject({
      block: [1, 2],
      period: [1, 2],
      term: [7, 8],
    });
  });
});
