// components/DraggableTermCard.tsx

import { Draggable, Droppable } from "@hello-pangea/dnd";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  GripVertical,
  Info,
  Trash2,
  X,
} from "lucide-react";
import type { CSSProperties } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type ConflictInfo,
  getConflictBorderClass,
} from "@/lib/conflict-utils";
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

interface DraggableTermCardProps {
  className?: string;
  courses: Course[];
  isDragDisabled?: boolean;
  onClearTerm: (term: MasterProgramTerm) => void;
  onMoveCourse?: (
    courseId: string,
    fromTerm: MasterProgramTerm,
    toTerm: MasterProgramTerm
  ) => void;
  onRemoveCourse: (courseId: string) => void;
  showBlockTimeline?: boolean;
  termNumber: MasterProgramTerm;
}

export function DraggableTermCard({
  termNumber,
  courses,
  onRemoveCourse,
  onClearTerm,
  onMoveCourse,
  className,
  isDragDisabled = false,
  showBlockTimeline = true,
}: DraggableTermCardProps) {
  const schedule = createTermPlanSchedule(courses);
  const totalCredits = schedule.totalCredits;

  const getTermLabel = (term: MasterProgramTerm) => `Termin ${term}`;

  const getBlockBadgeColor = (_blockNum: number) => {
    // Use muted colors for all blocks - no color overload
    return "bg-muted text-muted-foreground";
  };

  const getBlockClassName = (isActive: boolean, hasConflict: boolean) => {
    if (!isActive) {
      return "border-muted bg-muted/50 text-muted-foreground shadow-sm hover:bg-muted hover:border-muted-foreground/20";
    }
    if (hasConflict) {
      return "border-destructive/50 bg-destructive/10 text-destructive shadow-sm";
    }
    return "border-primary/30 bg-primary/10 text-primary shadow-sm hover:bg-primary/15 hover:border-primary/40";
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
            className={`text-xs font-medium ${getBlockBadgeColor(blockNum)}`}
            key={blockNum}
            variant="secondary"
          >
            {blockNum}
          </Badge>
        ))}
        {is50Percent && (
          <Badge
            className="text-xs ml-1 bg-accent/10 text-accent border-accent/30"
            variant="outline"
          >
            Cross-period
          </Badge>
        )}
      </div>
    );
  };

  const renderPeriodBlockTimeline = (
    periodSchedule: TermPlanPeriodSchedule
  ) => {
    const currentPeriod = periodSchedule.period;

    return (
      <div className="mb-3 p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-muted-foreground font-medium">
            Period {currentPeriod} Block Timeline:
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Shows course distribution across 4 study blocks. Number
                indicates courses per block. Red = scheduling conflict.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {periodSchedule.blockOccupancy.map((block) => {
            const hasConflict = block.conflict;
            const isActive = block.courseCount > 0;

            return (
              <div className="text-center" key={block.block}>
                <div
                  className={`text-xs font-medium mb-1 ${hasConflict ? "text-destructive" : "text-foreground"}`}
                >
                  B{block.block}
                </div>
                <div
                  className={`h-8 rounded border flex items-center justify-center text-xs transition-all duration-200 ${getBlockClassName(isActive, hasConflict)}`}
                >
                  {block.courseCount > 0 && (
                    <div className="flex flex-col items-center">
                      <div className="font-medium">{block.courseCount}</div>
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
            Scheduling conflicts detected in block
            {periodSchedule.conflictBlocks
              .map((block) => ` ${block}`)
              .join(",")}
          </div>
        )}
      </div>
    );
  };

  const handleClearTerm = () => {
    if (
      courses.length > 0 &&
      // biome-ignore lint/suspicious/noAlert: Intentional use of confirm for destructive action
      confirm(
        `Are you sure you want to clear all courses from ${getTermLabel(termNumber)}?`
      )
    ) {
      onClearTerm(termNumber);
    }
  };

  const renderDraggableCourse = (
    course: Course,
    index: number,
    currentPeriod: StudyPeriod,
    conflictMap: Map<string, ConflictInfo>
  ) => {
    const uniqueId = `${course.id}-term${termNumber}-period${currentPeriod}`;
    const hasConflict = conflictMap.has(course.id);
    // Only show conflict borders when block timeline is visible
    const conflictBorderClass = showBlockTimeline
      ? getConflictBorderClass(hasConflict)
      : "";

    return (
      <Draggable
        draggableId={uniqueId}
        index={index}
        isDragDisabled={isDragDisabled || termNumber === 8}
        key={uniqueId} // Disable drag for term 8
      >
        {(provided, snapshot) => {
          const { style, ...draggableProps } = provided.draggableProps;

          return (
            <div
              ref={provided.innerRef}
              {...draggableProps}
              className={`p-4 rounded-lg border transition-colors group ${
                snapshot.isDragging
                  ? "shadow-lg border-primary/50 bg-primary/5"
                  : "hover:bg-card/10"
              } ${isDragDisabled || termNumber === 8 ? "opacity-75" : ""} ${conflictBorderClass}`}
              style={style as CSSProperties | undefined}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  {!isDragDisabled && termNumber !== 8 && (
                    <div
                      {...provided.dragHandleProps}
                      className="mt-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <h4 className="font-medium text-sm leading-tight text-foreground truncate cursor-default">
                              {course.name}
                            </h4>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{course.name}</p>
                          </TooltipContent>
                        </Tooltip>
                        <p className="text-xs text-muted-foreground mt-1">
                          {course.id} • {course.credits} hp
                        </p>
                      </div>
                      <Button
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground! hover:bg-transparent!"
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
                </div>
                <Button
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground! hover:bg-transparent! ml-2"
                  onClick={() => onRemoveCourse(course.id)}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* Enhanced Block Indicators */}
              {renderBlockIndicators(course, currentPeriod)}

              <div className="flex items-center justify-between gap-2 mt-3">
                <div className="flex flex-wrap gap-1">
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

                {/* Transfer buttons - aligned with badges, only show for terms 7 and 9, and when onMoveCourse is available */}
                {onMoveCourse && termNumber !== 8 && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {termNumber === 7 && (
                      <Button
                        className="h-6 px-2 text-xs bg-muted text-muted-foreground hover:bg-muted/70 border border-border"
                        onClick={() => onMoveCourse(course.id, 7, 9)}
                        size="sm"
                        title="Move to Term 9"
                      >
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Term 9
                      </Button>
                    )}
                    {termNumber === 9 && (
                      <Button
                        className="h-6 px-2 text-xs bg-muted text-muted-foreground hover:bg-muted/70 border border-border"
                        onClick={() => onMoveCourse(course.id, 9, 7)}
                        size="sm"
                        title="Move to Term 7"
                      >
                        <ArrowLeft className="h-3 w-3 mr-1" />
                        Term 7
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        }}
      </Draggable>
    );
  };

  const renderNonDraggableCourse = (
    course: Course,
    currentPeriod: StudyPeriod,
    conflictMap: Map<string, ConflictInfo>
  ) => {
    const hasConflict = conflictMap.has(course.id);
    // Only show conflict borders when block timeline is visible
    const conflictBorderClass = showBlockTimeline
      ? getConflictBorderClass(hasConflict)
      : "";

    return (
      <div
        className={`p-4 rounded-lg border transition-colors group hover:bg-card/10 ${conflictBorderClass}`}
        key={`${course.id}-term${termNumber}-period${currentPeriod}`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h4 className="font-medium text-sm leading-tight text-foreground truncate cursor-default">
                      {course.name}
                    </h4>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{course.name}</p>
                  </TooltipContent>
                </Tooltip>
                <p className="text-xs text-muted-foreground mt-1">
                  {course.id} • {course.credits} hp
                </p>
              </div>
              <Button
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground! hover:bg-transparent!"
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
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground! hover:bg-transparent! ml-2"
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
      </div>
    );
  };

  const renderPeriodCourses = (
    periodSchedule: TermPlanPeriodSchedule,
    isDraggable = true
  ) => {
    if (periodSchedule.courses.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-xs">No courses</p>
        </div>
      );
    }

    const conflictMap = periodSchedule.conflicts;
    const currentPeriod = periodSchedule.period;

    if (!isDraggable) {
      return periodSchedule.courses.map((course) =>
        renderNonDraggableCourse(course, currentPeriod, conflictMap)
      );
    }

    return periodSchedule.courses.map((course, index) =>
      renderDraggableCourse(course, index, currentPeriod, conflictMap)
    );
  };

  const renderPeriodSection = (
    periodSchedule: TermPlanPeriodSchedule,
    isDraggable = true
  ) => (
    <div key={periodSchedule.period}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-muted-foreground">
          Period {periodSchedule.period}
        </h4>
        <Badge className="text-xs" variant="outline">
          {periodSchedule.credits} hp
        </Badge>
      </div>
      {showBlockTimeline &&
        periodSchedule.courses.length > 0 &&
        renderPeriodBlockTimeline(periodSchedule)}
      <div className="space-y-3 min-h-[60px]">
        {renderPeriodCourses(periodSchedule, isDraggable)}
      </div>
    </div>
  );

  return (
    <Card
      className={`h-full bg-background border-border shadow-lg flex flex-col ${className}`}
    >
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-lg font-semibold flex items-center justify-between text-foreground">
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
        {isDragDisabled && termNumber !== 8 && (
          <p className="text-xs text-muted-foreground">
            Desktop only: Drag courses between terms
          </p>
        )}
        {termNumber === 8 && <p className="text-xs text-muted-foreground" />}
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col">
        {courses.length === 0 && termNumber === 8 && (
          <div className="flex-1 text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg border-border">
            <p className="text-sm">No courses selected</p>
            <p className="text-xs mt-1" />
          </div>
        )}
        {courses.length === 0 && termNumber !== 8 && (
          <Droppable droppableId={`term-${termNumber}`} type="COURSE">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg transition-colors ${
                  snapshot.isDraggingOver
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <p className="text-sm">No courses selected</p>
                <p className="text-xs mt-1">
                  Add courses from the catalog or drag them here
                </p>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
        {/* Only make terms 7 and 9 droppable, term 8 should not be droppable */}
        {courses.length > 0 && termNumber === 8 && (
          <div className="space-y-4">
            {STUDY_PERIODS.map((period) =>
              renderPeriodSection(schedule.periods[period], false)
            )}
          </div>
        )}
        {courses.length > 0 && termNumber !== 8 && (
          <Droppable droppableId={`term-${termNumber}`} type="COURSE">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-4 flex-1 rounded-lg transition-colors ${
                  snapshot.isDraggingOver
                    ? "bg-primary/5 border-2 border-dashed border-primary"
                    : ""
                }`}
              >
                {STUDY_PERIODS.map((period) =>
                  renderPeriodSection(schedule.periods[period])
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
      </CardContent>
    </Card>
  );
}
