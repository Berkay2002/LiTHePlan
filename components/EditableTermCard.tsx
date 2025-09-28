// components/EditableTermCard.tsx

import { ArrowLeft, ArrowRight, ExternalLink, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAllPeriodConflicts,
  getConflictBorderClass,
} from "@/lib/conflict-utils";
import { getLevelColor } from "@/lib/course-utils";
import type { Course } from "@/types/course";

interface EditableTermCardProps {
  termNumber: 7 | 8 | 9;
  courses: Course[];
  onRemoveCourse: (courseId: string) => void;
  onClearTerm: (term: 7 | 8 | 9) => void;
  onMoveCourse?: (
    courseId: string,
    fromTerm: 7 | 8 | 9,
    toTerm: 7 | 8 | 9
  ) => void;
  className?: string;
  showBlockTimeline?: boolean;
}

export function EditableTermCard({
  termNumber,
  courses,
  onRemoveCourse,
  onClearTerm,
  onMoveCourse,
  className,
  showBlockTimeline = true,
}: EditableTermCardProps) {
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);

  const getTermLabel = (term: number) => {
    switch (term) {
      case 7:
        return "Termin 7";
      case 8:
        return "Termin 8";
      case 9:
        return "Termin 9";
      default:
        return `Termin ${term}`;
    }
  };

  // Group courses by period - 50% courses appear in both periods
  const coursesByPeriod = {
    1: courses.filter(
      (course) =>
        (Array.isArray(course.period)
          ? course.period.includes("1")
          : course.period === "1") || course.pace === "50%"
    ),
    2: courses.filter(
      (course) =>
        (Array.isArray(course.period)
          ? course.period.includes("2")
          : course.period === "2") || course.pace === "50%"
    ),
  };

  const getBlockBadgeColor = (blockNum: number) => {
    switch (blockNum) {
      case 1:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case 2:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 3:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case 4:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
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
            className={`text-xs font-medium ${getBlockBadgeColor(blockNum)} ${is50Percent ? "ring-2 ring-blue-300" : ""}`}
            key={blockNum}
            variant="secondary"
          >
            {blockNum}
          </Badge>
        ))}
        {is50Percent && (
          <Badge
            className="text-xs ml-1 bg-blue-50 text-blue-700 border-blue-300"
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
            const hasConflict = courses.length > 1;

            return (
              <div className="text-center" key={blockNum}>
                <div
                  className={`text-xs font-medium mb-1 ${hasConflict ? "text-red-600" : "text-muted-foreground"}`}
                >
                  B{blockNum}
                </div>
                <div
                  className={`h-8 rounded border-2 border-dashed flex items-center justify-center text-xs ${
                    courses.length === 0
                      ? "border-gray-200 bg-gray-50"
                      : hasConflict
                        ? "border-red-300 bg-red-100 text-red-800"
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
        {Object.entries(blockOccupancy).some(
          ([, courses]) => courses.length > 1
        ) && (
          <div className="text-xs text-red-600 mt-2 flex items-center">
            <span className="mr-1">⚠️</span>
            Scheduling conflicts detected in block
            {Object.entries(blockOccupancy)
              .filter(([, courses]) => courses.length > 1)
              .map(([blockNum]) => ` ${blockNum}`)
              .join(",")}
          </div>
        )}
      </div>
    );
  };

  const handleClearTerm = () => {
    if (
      courses.length > 0 &&
      confirm(
        `Are you sure you want to clear all courses from ${getTermLabel(termNumber)}?`
      )
    ) {
      onClearTerm(termNumber);
    }
  };

  const renderEditableCoursesList = (
    periodCourses: Course[],
    currentPeriod: 1 | 2
  ) => {
    if (periodCourses.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-xs">No courses</p>
        </div>
      );
    }

    // Get all conflicts for this period
    const conflictMap = getAllPeriodConflicts(periodCourses, currentPeriod);

    return periodCourses.map((course) => {
      const hasConflict = conflictMap.has(course.id);
      // Only show conflict borders when block timeline is visible
      const conflictBorderClass = showBlockTimeline
        ? getConflictBorderClass(hasConflict)
        : "";

      return (
        <div
          className={`p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group ${conflictBorderClass}`}
          key={`${course.id}-period-${currentPeriod}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm leading-tight truncate">
                    {course.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {course.id} • {course.credits} hp
                  </p>
                </div>
                <Button
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                  onClick={() => {
                    window.open(
                      `https://studieinfo.liu.se/kurs/${course.id}`,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                  size="sm"
                  title="View course on LiU website"
                  variant="ghost"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Button
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive ml-2"
              onClick={() => onRemoveCourse(course.id)}
              size="sm"
              variant="ghost"
            >
              <X className="h-3 w-3" />
            </Button>
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

          {/* Transfer buttons - right-aligned, only show for terms 7 and 9, and when onMoveCourse is available */}
          {onMoveCourse && termNumber !== 8 && (
            <div className="flex justify-end gap-1 mt-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              {termNumber === 7 && (
                <Button
                  className="h-6 px-2 text-xs"
                  onClick={() => onMoveCourse(course.id, 7, 9)}
                  size="sm"
                  title="Move to Term 9"
                  variant="outline"
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Term 9
                </Button>
              )}
              {termNumber === 9 && (
                <Button
                  className="h-6 px-2 text-xs"
                  onClick={() => onMoveCourse(course.id, 9, 7)}
                  size="sm"
                  title="Move to Term 7"
                  variant="outline"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Term 7
                </Button>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Card className={`h-full bg-card border-border shadow-lg ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center justify-between text-card-foreground">
          {getTermLabel(termNumber)}
          <div className="flex items-center gap-2">
            <Badge className="text-xs" variant="secondary">
              {totalCredits} hp
            </Badge>
            {courses.length > 0 && (
              <Button
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                onClick={handleClearTerm}
                size="sm"
                variant="ghost"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {courses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No courses selected</p>
            <p className="text-xs mt-1">Add courses from the catalog</p>
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
                        (Array.isArray(course.period)
                          ? course.period.includes("1")
                          : course.period === "1") || course.pace === "50%"
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
              {showBlockTimeline &&
                coursesByPeriod[1].length > 0 &&
                renderPeriodBlockTimeline(coursesByPeriod[1], 1)}
              <div className="space-y-3">
                {renderEditableCoursesList(coursesByPeriod[1], 1)}
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
                        (Array.isArray(course.period)
                          ? course.period.includes("2")
                          : course.period === "2") || course.pace === "50%"
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
              {showBlockTimeline &&
                coursesByPeriod[2].length > 0 &&
                renderPeriodBlockTimeline(coursesByPeriod[2], 2)}
              <div className="space-y-3">
                {renderEditableCoursesList(coursesByPeriod[2], 2)}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
