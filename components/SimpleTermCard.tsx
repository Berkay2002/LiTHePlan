// components/SimpleTermCard.tsx

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLevelColor } from "@/lib/course-utils";
import type { MasterProgramTerm } from "@/lib/profile-constants";
import {
  createTermPlanSchedule,
  STUDY_PERIODS,
  type TermPlanPeriodSchedule,
} from "@/lib/term-plan-schedule";
import type { Course } from "@/types/course";

interface SimpleTermCardProps {
  className?: string;
  courses: Course[];
  termNumber: MasterProgramTerm;
}

export function SimpleTermCard({
  termNumber,
  courses,
  className,
}: SimpleTermCardProps) {
  const schedule = createTermPlanSchedule(courses);
  const totalCredits = schedule.totalCredits;

  const getTermLabel = (term: MasterProgramTerm) => `Termin ${term}`;

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
        className="p-4 rounded-lg border hover:bg-background/30 transition-colors"
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

          {course.pace === "50%" && (
            <Badge
              className="text-xs bg-accent/10 text-accent border-accent/30"
              variant="outline"
            >
              Cross-period
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
