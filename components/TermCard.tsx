// components/TermCard.tsx

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLevelColor } from "@/lib/course-utils";
import type { MasterProgramTerm } from "@/lib/profile-constants";
import {
  createTermPlanSchedule,
  getCourseBlocksForPeriod,
  STUDY_PERIODS,
  type StudyPeriod,
  type TermPlanPeriodSchedule,
} from "@/lib/term-plan-schedule";
import type { Course } from "@/types/course";

interface TermCardProps {
  className?: string;
  courses: Course[];
  termNumber: MasterProgramTerm;
}

export function TermCard({ termNumber, courses, className }: TermCardProps) {
  const schedule = createTermPlanSchedule(courses);
  const totalCredits = schedule.totalCredits;

  const getTermLabel = (term: MasterProgramTerm) => `Termin ${term}`;

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

  const renderBlockIndicators = (
    course: Course,
    currentPeriod: StudyPeriod
  ) => {
    const is50Percent = course.pace === "50%";
    const blocks = getCourseBlocksForPeriod(course, currentPeriod);

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

  const getBlockClassName = (hasConflict: boolean, blockNum: number) => {
    if (hasConflict) {
      return "border-destructive/30 bg-destructive/10 text-destructive";
    }
    return `border-opacity-50 ${getBlockBadgeColor(blockNum).replace("text-", "border-").replace("bg-", "border-")}`;
  };

  const renderPeriodBlockTimeline = (
    periodSchedule: TermPlanPeriodSchedule
  ) => {
    const currentPeriod = periodSchedule.period;

    return (
      <div className="mb-3 p-3 bg-muted/30 rounded-lg">
        <div className="text-xs text-muted-foreground mb-2 font-medium">
          Period {currentPeriod} Block Timeline:
        </div>
        <div className="grid grid-cols-4 gap-1">
          {periodSchedule.blockOccupancy.map((block) => {
            const hasConflict = block.conflict;

            return (
              <div className="text-center" key={block.block}>
                <div
                  className={`text-xs font-medium mb-1 ${hasConflict ? "text-destructive" : "text-muted-foreground"}`}
                >
                  B{block.block}
                </div>
                <div
                  className={`h-8 rounded border-2 border-dashed flex items-center justify-center text-xs ${
                    block.courseCount === 0
                      ? "border-border bg-muted/30"
                      : getBlockClassName(hasConflict, block.block)
                  }`}
                >
                  {block.courseCount > 0 && (
                    <div className="flex flex-col items-center">
                      <div className="font-medium">{block.courseCount}</div>
                      {hasConflict && <div className="text-xs">⚠️</div>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {periodSchedule.conflictBlocks.length > 0 && (
          <div className="text-xs text-destructive mt-2 flex items-center">
            <span className="mr-1">⚠️</span>
            Potential scheduling conflicts detected in Period {currentPeriod}
          </div>
        )}
      </div>
    );
  };

  const renderCoursesList = (periodSchedule: TermPlanPeriodSchedule) => {
    if (periodSchedule.courses.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-xs">No courses</p>
        </div>
      );
    }

    return periodSchedule.courses.map((course) => (
      <div
        className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
        key={`${course.id}-period-${periodSchedule.period}`}
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
        {renderBlockIndicators(course, periodSchedule.period)}

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
          STUDY_PERIODS.map((period) => {
            const periodSchedule = schedule.periods[period];
            return (
              <div key={period}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Period {period}
                  </h4>
                  <Badge className="text-xs" variant="outline">
                    {periodSchedule.credits} hp
                  </Badge>
                </div>
                {periodSchedule.courses.length > 0 &&
                  renderPeriodBlockTimeline(periodSchedule)}
                <div className="space-y-3">
                  {renderCoursesList(periodSchedule)}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
