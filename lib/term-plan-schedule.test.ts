import { describe, expect, it } from "vitest";
import type { Course } from "@/types/course";
import {
  createTermPlanSchedule,
  getCourseBlocksForPeriod,
  getPeriodScheduleConflicts,
} from "./term-plan-schedule";

const createCourse = (overrides: Partial<Course>): Course => ({
  block: ["1"],
  campus: "Linköping",
  credits: 6,
  examination: ["TEN"],
  examinator: "Ada Lovelace",
  huvudomrade: "Computer Science",
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

describe("term plan schedule facts", () => {
  it("groups courses by period and splits half-pace credits per period", () => {
    const fullP1 = createCourse({
      credits: 6,
      id: "FULLP1",
      period: ["1"],
    });
    const fullP2 = createCourse({
      credits: 6,
      id: "FULLP2",
      period: ["2"],
    });
    const halfPace = createCourse({
      block: ["2", "3"],
      credits: 6,
      id: "HALF",
      pace: "50%",
      period: ["1", "2"],
    });

    const schedule = createTermPlanSchedule([fullP1, fullP2, halfPace]);

    expect(schedule.totalCredits).toBe(18);
    expect(schedule.periods[1].courses.map((course) => course.id)).toEqual([
      "FULLP1",
      "HALF",
    ]);
    expect(schedule.periods[2].courses.map((course) => course.id)).toEqual([
      "FULLP2",
      "HALF",
    ]);
    expect(schedule.periods[1].credits).toBe(9);
    expect(schedule.periods[2].credits).toBe(9);
    expect(getCourseBlocksForPeriod(halfPace, 1)).toEqual([2]);
    expect(getCourseBlocksForPeriod(halfPace, 2)).toEqual([3]);
  });

  it("reports block occupancy and strict schedule conflicts for overlapping blocks", () => {
    const firstCourse = createCourse({
      block: ["2"],
      id: "FIRST",
      period: ["1"],
    });
    const secondCourse = createCourse({
      block: ["2"],
      id: "SECOND",
      period: ["1"],
    });
    const nonConflictingCourse = createCourse({
      block: ["3"],
      id: "THIRD",
      period: ["1"],
    });

    const schedule = createTermPlanSchedule([
      firstCourse,
      secondCourse,
      nonConflictingCourse,
    ]);

    expect(
      schedule.periods[1].blockOccupancy.find((block) => block.block === 2)
    ).toMatchObject({
      block: 2,
      conflict: true,
      courseCount: 2,
    });
    expect(schedule.periods[1].conflictBlocks).toEqual([2]);
    expect(schedule.periods[1].conflicts.get("FIRST")).toMatchObject({
      conflictDetails: {
        blockConflicts: [2],
        conflictingCourses: ["SECOND"],
      },
      conflictType: "block",
      courseId: "FIRST",
    });
    expect(
      getPeriodScheduleConflicts(schedule.periods[1].courses, 1).size
    ).toBe(2);
  });
});
