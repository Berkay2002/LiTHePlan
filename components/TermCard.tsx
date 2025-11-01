// components/TermCard.tsx

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLevelColor } from "@/lib/course-utils";
import { type MasterProgramTerm } from "@/lib/profile-constants";
import type { Course } from "@/types/course";

interface TermCardProps {
  termNumber: MasterProgramTerm;
  courses: Course[];
  className?: string;
}

export function TermCard({ termNumber, courses, className }: TermCardProps) {
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);

  const getTermLabel = (term: MasterProgramTerm) => `Termin ${term}`;

  // Group courses by period - 50% courses appear in both periods
  const coursesByPeriod = {
    1: courses.filter(
      (course) => course.period.includes("1") || course.pace === "50%"
    ),
    2: courses.filter(
      (course) => course.period.includes("2") || course.pace === "50%"
    ),
  };

  const getBlockBadgeColor = (blockNum: number) => {
    switch (blockNum) {
      case 1:
        return "bg-chart-1/10 text-chart-1 dark:bg-chart-1/20 dark:text-chart-1";
      case 2:
        return "bg-chart-2/10 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2";
      case 3:
        return "bg-chart-3/10 text-chart-3 dark:bg-chart-3/20 dark:text-chart-3";
      case 4:
        return "bg-chart-4/10 text-chart-4 dark:bg-chart-4/20 dark:text-chart-4";
      default:
        return "bg-muted/50 text-muted-foreground dark:bg-muted dark:text-muted-foreground";
    }
  };

  const renderBlockIndicators = (course: Course, currentPeriod: 1 | 2) => {
    const is50Percent = course.pace === "50%";
    let blocks: number[];

    if (is50Percent && Array.isArray(course.block)) {
      // For 50% courses: block[0] = period 1, block[1] = period 2
      blocks = [Number.parseInt(course.block[currentPeriod - 1])];
    } else {
      blocks = Array.isArray(course.block)
        ? course.block.map((b) => Number.parseInt(b))
        : [Number.parseInt(course.block)];
    }

    return (
      <div className="flex items-center gap-1 mt-2">
        <span className="text-xs text-muted-foreground mr-1">Blocks:</span>
        {blocks.map((blockNum) => (
          <Badge
            className={`text-xs font-medium ${getBlockBadgeColor(blockNum)} ${is50Percent ? "ring-2 ring-primary/30" : ""}`}
            key={blockNum}
            variant="secondary"
          >
            {blockNum}
          </Badge>
        ))}
        {is50Percent && (
          <Badge
            className="text-xs ml-1 bg-primary/10 text-primary border-primary/30"
            variant="outline"
          >
            Cross-period
          </Badge>
        )}
      </div>
    );
  };

  const renderPeriodBlockTimeline = (
    periodCourses: Course[],
    currentPeriod: 1 | 2
  ) => {
    // Create a visual timeline showing which blocks are occupied for this specific period
    const blockOccupancy: {
      [key: number]: Array<{ course: Course; is50Percent: boolean }>;
    } = { 1: [], 2: [], 3: [], 4: [] };

    periodCourses.forEach((course) => {
      let blocks: number[];
      const is50Percent = course.pace === "50%";

      if (is50Percent && Array.isArray(course.block)) {
        // For 50% courses: use the block for the current period
        blocks = [Number.parseInt(course.block[currentPeriod - 1])];
      } else {
        blocks = Array.isArray(course.block)
          ? course.block.map((b) => Number.parseInt(b))
          : [Number.parseInt(course.block)];
      }

      blocks.forEach((blockNum) => {
        blockOccupancy[blockNum as keyof typeof blockOccupancy].push({
          course,
          is50Percent,
        });
      });
    });

    return (
      <div className="mb-3 p-3 bg-muted/30 rounded-lg">
        <div className="text-xs text-muted-foreground mb-2 font-medium">
          Period {currentPeriod} Block Timeline:
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((blockNum) => {
            const courses =
              blockOccupancy[blockNum as keyof typeof blockOccupancy];
            const hasConflict =
              courses.length > 1 && courses.some((c) => !c.is50Percent);

            return (
              <div className="text-center" key={blockNum}>
                <div
                  className={`text-xs font-medium mb-1 ${hasConflict ? "text-destructive" : "text-muted-foreground"}`}
                >
                  B{blockNum}
                </div>
                <div
                  className={`h-8 rounded border-2 border-dashed flex items-center justify-center text-xs ${
                    courses.length === 0
                      ? "border-border bg-muted/30"
                      : hasConflict
                        ? "border-destructive/30 bg-destructive/10 text-destructive"
                        : `border-opacity-50 ${getBlockBadgeColor(blockNum).replace("text-", "border-").replace("bg-", "border-")}`
                  }`}
                >
                  {courses.length > 0 && (
                    <div className="flex flex-col items-center">
                      <div className="font-medium">{courses.length}</div>
                      {hasConflict && <div className="text-xs">⚠️</div>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {Object.values(blockOccupancy).some(
          (courses) => courses.length > 1 && courses.some((c) => !c.is50Percent)
        ) && (
          <div className="text-xs text-destructive mt-2 flex items-center">
            <span className="mr-1">⚠️</span>
            Potential scheduling conflicts detected in Period {currentPeriod}
          </div>
        )}
      </div>
    );
  };

  const renderCoursesList = (periodCourses: Course[], currentPeriod: 1 | 2) => {
    if (periodCourses.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-xs">No courses</p>
        </div>
      );
    }

    return periodCourses.map((course) => (
      <div
        className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
        key={`${course.id}-period-${currentPeriod}`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm leading-tight truncate text-foreground">
              {course.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {course.id} • {course.credits} hp
            </p>
          </div>
        </div>

        {/* Enhanced Block Indicators */}
        {renderBlockIndicators(course, currentPeriod)}

        <div className="flex flex-wrap gap-1 mt-3">
          <Badge
            className={`text-xs ${getLevelColor(course.level)}`}
            variant="secondary"
          >
            {course.level === "avancerad nivå" ? "Advanced" : "Basic"}
          </Badge>

          {course.campus && (
            <Badge className="text-xs" variant="outline">
              {course.campus}
            </Badge>
          )}
        </div>
      </div>
    ));
  };

  return (
    <Card className={`h-full bg-background ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center justify-between text-foreground">
          {getTermLabel(termNumber)}
          <Badge className="text-xs" variant="secondary">
            {totalCredits} hp
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {courses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No courses selected</p>
          </div>
        ) : (
          <>
            {/* Period 1 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Period 1
                </h4>
                <Badge className="text-xs" variant="outline">
                  {coursesByPeriod[1]
                    .filter(
                      (course) =>
                        course.period.includes("1") || course.pace === "50%"
                    )
                    .reduce((sum, course) => {
                      // For 50% courses, only count half the credits per period
                      return (
                        sum +
                        (course.pace === "50%"
                          ? course.credits / 2
                          : course.credits)
                      );
                    }, 0)}{" "}
                  hp
                </Badge>
              </div>
              {coursesByPeriod[1].length > 0 &&
                renderPeriodBlockTimeline(coursesByPeriod[1], 1)}
              <div className="space-y-3">
                {renderCoursesList(coursesByPeriod[1], 1)}
              </div>
            </div>

            {/* Period 2 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Period 2
                </h4>
                <Badge className="text-xs" variant="outline">
                  {coursesByPeriod[2]
                    .filter(
                      (course) =>
                        course.period.includes("2") || course.pace === "50%"
                    )
                    .reduce((sum, course) => {
                      // For 50% courses, only count half the credits per period
                      return (
                        sum +
                        (course.pace === "50%"
                          ? course.credits / 2
                          : course.credits)
                      );
                    }, 0)}{" "}
                  hp
                </Badge>
              </div>
              {coursesByPeriod[2].length > 0 &&
                renderPeriodBlockTimeline(coursesByPeriod[2], 2)}
              <div className="space-y-3">
                {renderCoursesList(coursesByPeriod[2], 2)}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
