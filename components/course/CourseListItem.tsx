import {
  AlertTriangle,
  Check,
  Clock,
  ExternalLink,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { useProfile } from "@/components/profile/ProfileContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { findCourseConflicts } from "@/lib/course-conflict-utils";
import {
  formatBlocks,
  formatPace,
  getAvailableTerms,
  isMultiTermCourse,
} from "@/lib/course-utils";
import {
  MASTER_PROGRAM_TERMS,
  type MasterProgramTerm,
} from "@/lib/profile-constants";
import { isCourseInProfile } from "@/lib/profile-utils";
import type { Course } from "@/types/course";
import { ConflictResolutionModal } from "./ConflictResolutionModal";
import type { FilterState } from "./FilterPanel";
import { TermSelectionModal } from "./TermSelectionModal";
import { TruncatedExaminationBadges } from "./TruncatedExaminationBadges";

interface CourseListItemProps {
  activeFilters?: FilterState;
  course: Course;
}

interface CourseActionButtonProps {
  compact: boolean;
  isHovered: boolean;
  isPinned: boolean;
  onClick: () => void;
  onHoverChange: (isHovered: boolean) => void;
  wouldHaveConflicts: boolean;
}

interface CourseListLayoutProps {
  activeFilters: FilterState;
  availableTerms: (number | string)[];
  course: Course;
  isHovered: boolean;
  isMobile: boolean;
  isMultiTerm: boolean;
  isPinned: boolean;
  onActionClick: () => void;
  onHoverChange: (isHovered: boolean) => void;
  onNotesTooltipChange: (isOpen: boolean) => void;
  showNotesTooltip: boolean;
  visibleExaminations: string[];
  wouldHaveConflicts: boolean;
}

interface CourseNotesBadgeProps {
  buttonClassName: string;
  iconClassName: string;
  isMobile: boolean;
  note: string;
  onOpenChange: (isOpen: boolean) => void;
  showNotesTooltip: boolean;
  textClassName?: string;
  tooltipClassName?: string;
}

const DEFAULT_FILTER_STATE: FilterState = {
  block: [],
  campus: [],
  examination: {},
  huvudomraden: [],
  level: [],
  pace: [],
  period: [],
  programs: [],
  search: "",
  term: [],
};

type HideableFilterField =
  | "block"
  | "campus"
  | "level"
  | "pace"
  | "period"
  | "term";

const getPrimaryCourseTerm = (course: Course): string =>
  Array.isArray(course.term) ? course.term[0] : course.term;

const getDefaultCourseTerm = (course: Course): MasterProgramTerm | null => {
  const parsedTerm = Number.parseInt(getPrimaryCourseTerm(course), 10);

  if (
    !(
      Number.isInteger(parsedTerm) &&
      MASTER_PROGRAM_TERMS.includes(parsedTerm as MasterProgramTerm)
    )
  ) {
    return null;
  }

  return parsedTerm as MasterProgramTerm;
};

const shouldHideField = (
  activeFilters: FilterState,
  fieldName: HideableFilterField
): boolean => activeFilters[fieldName].length === 1;

const shouldShowPeriod = (course: Course): boolean => course.pace === "100%";

const getVisibleExaminations = (
  examinations: string[],
  examinationFilters: FilterState["examination"]
): string[] => {
  if (Object.keys(examinationFilters).length === 0) {
    return examinations;
  }

  return examinations.filter(
    (exam) =>
      examinationFilters[exam] === "include" || !examinationFilters[exam]
  );
};

const getProgramsAndOrientations = (course: Course): string[] =>
  Array.from(
    new Set([...(course.programs ?? []), ...(course.orientations ?? [])])
  );

const getActionButtonClassName = ({
  compact,
  isHovered,
  isPinned,
  wouldHaveConflicts,
}: Omit<CourseActionButtonProps, "onClick" | "onHoverChange">): string => {
  const baseClassName = compact
    ? "h-7 px-2 text-xs font-medium transition-all duration-300 shadow-sm"
    : "h-8 text-xs font-medium transition-all duration-300 shadow-md";

  if (isPinned) {
    const pinnedClassName = isHovered
      ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
      : "bg-primary hover:bg-primary/90 text-primary-foreground";

    return `${baseClassName} ${pinnedClassName}`;
  }

  if (wouldHaveConflicts) {
    return compact
      ? `${baseClassName} bg-accent hover:bg-accent/90 text-accent-foreground border-2 border-accent/40`
      : `${baseClassName} bg-accent hover:bg-accent/90 text-accent-foreground border-2 border-accent/40`;
  }

  const defaultClassName = compact
    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
    : "bg-primary hover:bg-primary/90 text-primary-foreground";

  return `${baseClassName} ${defaultClassName}`;
};

const getActionButtonContent = ({
  compact,
  isHovered,
  isPinned,
  wouldHaveConflicts,
}: Omit<CourseActionButtonProps, "onClick" | "onHoverChange">): ReactNode => {
  if (isPinned && isHovered) {
    if (compact) {
      return <Trash2 className="h-3 w-3" />;
    }

    return (
      <>
        <Trash2 className="mr-1 h-3 w-3" />
        Delete
      </>
    );
  }

  if (isPinned) {
    if (compact) {
      return <Check className="h-3 w-3" />;
    }

    return (
      <>
        <Check className="mr-1 h-3 w-3" />
        Added
      </>
    );
  }

  if (wouldHaveConflicts) {
    if (compact) {
      return <AlertTriangle className="h-3 w-3" />;
    }

    return (
      <>
        <AlertTriangle className="mr-1 h-3 w-3" />
        Resolve
      </>
    );
  }

  if (compact) {
    return <Plus className="h-3 w-3" />;
  }

  return (
    <>
      <Plus className="mr-1 h-3 w-3" />
      Add to Profile
    </>
  );
};

function CourseNotesBadge({
  buttonClassName,
  iconClassName,
  isMobile,
  note,
  showNotesTooltip,
  textClassName,
  tooltipClassName,
  onOpenChange,
}: CourseNotesBadgeProps) {
  return (
    <Tooltip
      key={isMobile ? "mobile" : "desktop"}
      onOpenChange={isMobile ? onOpenChange : undefined}
      open={isMobile ? showNotesTooltip : undefined}
    >
      <TooltipTrigger asChild>
        <button
          className={buttonClassName}
          onBlur={() => {
            if (isMobile) {
              onOpenChange(false);
            }
          }}
          onClick={() => {
            if (isMobile) {
              onOpenChange(!showNotesTooltip);
            }
          }}
          type="button"
        >
          <AlertTriangle className={iconClassName} />
          <span className="text-xs font-bold">OBS</span>
        </button>
      </TooltipTrigger>
      <TooltipContent className={tooltipClassName} side="top">
        <p className={textClassName}>{note}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function CourseActionButton({
  compact,
  isHovered,
  isPinned,
  onClick,
  onHoverChange,
  wouldHaveConflicts,
}: CourseActionButtonProps) {
  return (
    <Button
      className={getActionButtonClassName({
        compact,
        isHovered,
        isPinned,
        wouldHaveConflicts,
      })}
      onClick={onClick}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      size="sm"
    >
      {getActionButtonContent({
        compact,
        isHovered,
        isPinned,
        wouldHaveConflicts,
      })}
    </Button>
  );
}

function ProgramsAndOrientationsBadges({ course }: { course: Course }) {
  const items = getProgramsAndOrientations(course);

  if (items.length === 0) {
    return null;
  }

  const visibleItems = items.slice(0, 2);
  const hiddenItems = items.slice(2);

  return (
    <div className="flex flex-wrap gap-1">
      {visibleItems.map((item) => (
        <Badge
          className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/30"
          key={item}
          variant="outline"
        >
          {item}
        </Badge>
      ))}
      {hiddenItems.length > 0 && (
        <div className="relative">
          <Badge
            className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/30 cursor-help hover:bg-primary/20 transition-colors peer"
            variant="outline"
          >
            +{hiddenItems.length} more
          </Badge>
          <div className="absolute bottom-full left-1/2 z-100 mb-3 w-max max-w-md -translate-x-1/2 transform rounded-lg border border-border bg-popover px-4 py-2.5 text-sm font-medium text-popover-foreground opacity-0 shadow-xl transition-opacity duration-200 pointer-events-none peer-hover:opacity-100">
            <div className="space-y-1">
              <p className="font-medium text-popover-foreground">
                Additional programs:
              </p>
              <div className="leading-relaxed text-popover-foreground/80">
                {hiddenItems.join(", ")}
              </div>
            </div>
            <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-popover" />
          </div>
        </div>
      )}
    </div>
  );
}

function MobileCourseListLayout({
  activeFilters,
  availableTerms,
  course,
  isHovered,
  isMobile,
  isMultiTerm,
  isPinned,
  onActionClick,
  onHoverChange,
  onNotesTooltipChange,
  showNotesTooltip,
  visibleExaminations,
  wouldHaveConflicts,
}: CourseListLayoutProps) {
  return (
    <div className="lg:hidden">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            <h3 className="flex-1 text-sm font-semibold leading-tight text-foreground transition-colors duration-300 group-hover:text-primary">
              {course.name}
            </h3>
            {course.notes && (
              <CourseNotesBadge
                buttonClassName="flex shrink-0 items-center gap-1 rounded border border-chart-4/30 bg-chart-4/15 px-1.5 py-0.5 text-chart-4 transition-colors cursor-pointer hover:bg-chart-4/20"
                iconClassName="h-3 w-3"
                isMobile={isMobile}
                note={course.notes}
                onOpenChange={onNotesTooltipChange}
                showNotesTooltip={showNotesTooltip}
              />
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <TruncatedExaminationBadges
              className="gap-1"
              examinations={visibleExaminations}
              maxVisible={2}
              shortMode={true}
            />

            <div className="flex gap-1">
              <CourseActionButton
                compact={true}
                isHovered={isHovered}
                isPinned={isPinned}
                onClick={onActionClick}
                onHoverChange={onHoverChange}
                wouldHaveConflicts={wouldHaveConflicts}
              />

              <Button
                className="h-7 px-2 text-xs font-medium bg-secondary/20 border-border text-secondary-foreground hover:bg-secondary/30 hover:border-border/60 transition-all duration-300"
                onClick={() => {
                  window.open(
                    `https://studieinfo.liu.se/kurs/${course.id}`,
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
                size="sm"
                variant="outline"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="font-mono font-bold text-primary">{course.id}</div>

          {!shouldHideField(activeFilters, "term") && (
            <span className="font-medium text-primary">
              T{isMultiTerm ? availableTerms.join(",") : course.term}
            </span>
          )}

          {shouldShowPeriod(course) &&
            !shouldHideField(activeFilters, "period") && (
              <span className="font-medium text-primary">P{course.period}</span>
            )}

          {!shouldHideField(activeFilters, "block") && (
            <span className="font-medium text-primary">
              B{formatBlocks(course.block)}
            </span>
          )}

          {!shouldHideField(activeFilters, "level") && (
            <span className="font-medium text-foreground">
              {course.level === "grundnivå" ? "G" : "A"}
            </span>
          )}

          {course.examinator && (
            <span className="font-medium text-foreground">
              Ex: {course.examinator.split(" ").at(-1)}
            </span>
          )}

          {course.studierektor && (
            <span className="font-medium text-foreground">
              Dir: {course.studierektor.split(" ").at(-1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DesktopCourseListLayout({
  activeFilters,
  availableTerms,
  course,
  isHovered,
  isMobile,
  isMultiTerm,
  isPinned,
  onActionClick,
  onHoverChange,
  onNotesTooltipChange,
  showNotesTooltip,
  visibleExaminations,
  wouldHaveConflicts,
}: CourseListLayoutProps) {
  return (
    <div className="hidden items-start gap-4 lg:flex">
      <div className="min-w-0 flex-1">
        <div className="mb-3 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-start gap-2">
              <h3 className="flex-1 line-clamp-2 text-base font-semibold leading-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                {course.name}
              </h3>
              {course.notes && (
                <CourseNotesBadge
                  buttonClassName="flex shrink-0 items-center gap-1 rounded-md border border-chart-4/30 bg-chart-4/15 px-2 py-1 text-chart-4 transition-colors cursor-pointer hover:bg-chart-4/20"
                  iconClassName="h-4 w-4"
                  isMobile={isMobile}
                  note={course.notes}
                  onOpenChange={onNotesTooltipChange}
                  showNotesTooltip={showNotesTooltip}
                  textClassName="text-xs text-popover-foreground/80"
                  tooltipClassName="max-w-xs border border-border bg-popover text-popover-foreground"
                />
              )}
            </div>
            <div className="mb-2 text-sm font-bold text-primary font-mono">
              {course.id}
            </div>
          </div>

          <TruncatedExaminationBadges
            className="ml-3 gap-1"
            examinations={visibleExaminations}
            maxVisible={3}
            shortMode={true}
          />
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-4 text-sm">
          {!shouldHideField(activeFilters, "term") && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-muted-foreground">Term:</span>
              <span className="font-bold text-primary">
                {isMultiTerm ? availableTerms.join(", ") : course.term}
              </span>
            </div>
          )}

          {shouldShowPeriod(course) &&
            !shouldHideField(activeFilters, "period") && (
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-muted-foreground">
                  Period:
                </span>
                <span className="font-bold text-primary">{course.period}</span>
              </div>
            )}

          {!shouldHideField(activeFilters, "block") && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-muted-foreground">
                {Array.isArray(course.block) ? "Blocks:" : "Block:"}
              </span>
              <span className="font-bold text-primary">
                {formatBlocks(course.block)}
              </span>
            </div>
          )}

          {!shouldHideField(activeFilters, "level") && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-muted-foreground">Level:</span>
              <span className="font-bold text-foreground">
                {course.level === "grundnivå" ? "G" : "A"}
              </span>
            </div>
          )}

          {course.examinator && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-muted-foreground">
                Examiner:
              </span>
              <span className="font-bold text-foreground">
                {course.examinator}
              </span>
            </div>
          )}

          {course.studierektor && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-muted-foreground">
                Director:
              </span>
              <span className="font-bold text-foreground">
                {course.studierektor}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          {!shouldHideField(activeFilters, "campus") && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">
                {course.campus}
              </span>
            </div>
          )}

          {!shouldHideField(activeFilters, "pace") && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {formatPace(course.pace)}
              </span>
            </div>
          )}

          <ProgramsAndOrientationsBadges course={course} />
        </div>
      </div>

      <div className="ml-4 flex items-center gap-2">
        <CourseActionButton
          compact={false}
          isHovered={isHovered}
          isPinned={isPinned}
          onClick={onActionClick}
          onHoverChange={onHoverChange}
          wouldHaveConflicts={wouldHaveConflicts}
        />

        <Button
          className="h-8 text-xs font-medium bg-secondary/20 border-border text-secondary-foreground hover:bg-secondary/30 hover:border-border/60 transition-all duration-300"
          onClick={() => {
            window.open(
              `https://studieinfo.liu.se/kurs/${course.id}`,
              "_blank",
              "noopener,noreferrer"
            );
          }}
          size="sm"
          variant="outline"
        >
          <ExternalLink className="mr-1 h-3 w-3" />
          View on LiU
        </Button>
      </div>
    </div>
  );
}

export function CourseListItem({
  activeFilters = DEFAULT_FILTER_STATE,
  course,
}: CourseListItemProps) {
  const { state, addCourse, removeCourse } = useProfile();
  const [isHovered, setIsHovered] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictingCourses, setConflictingCourses] = useState<
    { conflictingCourse: Course; conflictingCourseId: string }[]
  >([]);
  const [showNotesTooltip, setShowNotesTooltip] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const isPinned = state.current_profile
    ? isCourseInProfile(state.current_profile, course.id)
    : false;
  const isMultiTerm = isMultiTermCourse(course);
  const availableTerms = getAvailableTerms(course);
  const visibleExaminations = getVisibleExaminations(
    course.examination,
    activeFilters.examination
  );
  const wouldHaveConflicts = state.current_profile
    ? findCourseConflicts(course, state.current_profile).length > 0
    : false;

  const handleAddCourse = async () => {
    console.log("🎯 handleAddCourse clicked for course:", course.id);

    const conflicts = state.current_profile
      ? findCourseConflicts(course, state.current_profile)
      : [];

    if (conflicts.length > 0) {
      console.log("⚠️ Conflicts detected, showing conflict modal first");
      setConflictingCourses(conflicts);
      setShowConflictModal(true);
      return;
    }

    if (isMultiTerm && availableTerms.length > 1) {
      console.log("📋 No conflicts, showing term selection modal");
      setShowTermModal(true);
      return;
    }

    const defaultTerm = getDefaultCourseTerm(course);

    if (defaultTerm !== null) {
      console.log("✅ Adding course with:", {
        course: course.id,
        term: defaultTerm,
      });
      await addCourse(course, defaultTerm);
      return;
    }

    console.error("❌ Invalid term for course:", {
      courseId: course.id,
      parsedTerm: Number.parseInt(getPrimaryCourseTerm(course), 10),
      termToAdd: getPrimaryCourseTerm(course),
    });
  };

  const handleTermSelected = async (
    selectedCourse: Course,
    selectedTerm: MasterProgramTerm
  ) => {
    console.log(
      "🔄 Term selected:",
      selectedTerm,
      "for course:",
      selectedCourse.id
    );
    setShowTermModal(false);
    console.log("✅ Adding course with selected term (conflicts pre-checked)");
    await addCourse(selectedCourse, selectedTerm);
  };

  const handleChooseNewCourse = async (newCourse: Course) => {
    console.log("✅ User chose new course:", newCourse.id);
    setShowConflictModal(false);

    for (const { conflictingCourseId } of conflictingCourses) {
      console.log("🗑️ Removing conflicting course:", conflictingCourseId);
      removeCourse(conflictingCourseId);
    }

    if (isMultiTerm && availableTerms.length > 1) {
      console.log(
        "📋 Showing term selection for new course after conflict resolution"
      );
      setShowTermModal(true);
    } else {
      const defaultTerm = getDefaultCourseTerm(newCourse);

      if (defaultTerm !== null) {
        console.log("➕ Adding new course with default term:", defaultTerm);
        await addCourse(newCourse, defaultTerm);
      }
    }

    setConflictingCourses([]);
  };

  const handleChooseExistingCourse = (existingCourse: Course) => {
    console.log("📚 User chose to keep existing course:", existingCourse.id);
    setShowConflictModal(false);
    setConflictingCourses([]);
  };

  const handleCancelConflictResolution = () => {
    console.log("❌ User cancelled conflict resolution");
    setShowConflictModal(false);
    setConflictingCourses([]);
  };

  const handleActionClick = () => {
    if (isPinned && isHovered) {
      removeCourse(course.id);
      return;
    }

    if (!isPinned) {
      handleAddCourse();
    }
  };

  return (
    <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-2 border-primary/20 bg-background hover:border-primary/40 hover:shadow-primary/10">
      <CardContent className="p-3 lg:p-4">
        <MobileCourseListLayout
          activeFilters={activeFilters}
          availableTerms={availableTerms}
          course={course}
          isHovered={isHovered}
          isMobile={isMobile}
          isMultiTerm={isMultiTerm}
          isPinned={isPinned}
          onActionClick={handleActionClick}
          onHoverChange={setIsHovered}
          onNotesTooltipChange={setShowNotesTooltip}
          showNotesTooltip={showNotesTooltip}
          visibleExaminations={visibleExaminations}
          wouldHaveConflicts={wouldHaveConflicts}
        />

        <DesktopCourseListLayout
          activeFilters={activeFilters}
          availableTerms={availableTerms}
          course={course}
          isHovered={isHovered}
          isMobile={isMobile}
          isMultiTerm={isMultiTerm}
          isPinned={isPinned}
          onActionClick={handleActionClick}
          onHoverChange={setIsHovered}
          onNotesTooltipChange={setShowNotesTooltip}
          showNotesTooltip={showNotesTooltip}
          visibleExaminations={visibleExaminations}
          wouldHaveConflicts={wouldHaveConflicts}
        />
      </CardContent>

      <TermSelectionModal
        availableTerms={availableTerms}
        course={course}
        isOpen={showTermModal}
        onClose={() => setShowTermModal(false)}
        onTermSelected={handleTermSelected}
      />

      <ConflictResolutionModal
        conflictingCourses={conflictingCourses}
        isOpen={showConflictModal}
        newCourse={course}
        onCancel={handleCancelConflictResolution}
        onChooseExisting={handleChooseExistingCourse}
        onChooseNew={handleChooseNewCourse}
        onClose={() => setShowConflictModal(false)}
      />
    </Card>
  );
}
