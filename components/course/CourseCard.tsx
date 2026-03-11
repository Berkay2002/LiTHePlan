import {
  AlertTriangle,
  Check,
  ExternalLink,
  Info,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { useProfile } from "@/components/profile/ProfileContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { TermSelectionModal } from "./TermSelectionModal";
import { TruncatedExaminationBadges } from "./TruncatedExaminationBadges";

interface CourseCardProps {
  course: Course;
}

interface CourseCardActionState {
  isHovered: boolean;
  isPinned: boolean;
  wouldHaveConflicts: boolean;
}

interface CourseMetadataItemProps {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
}

interface CourseSummaryTileProps {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
}

interface CourseNotesIndicatorProps {
  isMobile: boolean;
  note: string;
  onOpenChange: (isOpen: boolean) => void;
  showNotesTooltip: boolean;
}

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

const getCourseLevelLabel = (level: Course["level"]): string =>
  level === "avancerad nivå" ? "Advanced" : "Basic";

const getCourseLevelBadgeClassName = (level: Course["level"]): string =>
  level === "avancerad nivå"
    ? "border-primary/25 bg-primary/10 text-primary"
    : "border-chart-2/30 bg-chart-2/10 text-chart-2";

const formatCourseTerms = (
  isMultiTerm: boolean,
  availableTerms: MasterProgramTerm[],
  course: Course
): string =>
  isMultiTerm
    ? `T${availableTerms.join(", ")}`
    : `T${getPrimaryCourseTerm(course)}`;

const formatCourseSchedule = (course: Course): string => {
  const periodLabel = `P${course.period.join(", ")}`;
  const blockLabel = `B${formatBlocks(course.block)}`;

  return `${periodLabel} • ${blockLabel}`;
};

const getCourseCardActionButtonClassName = ({
  isHovered,
  isPinned,
  wouldHaveConflicts,
}: CourseCardActionState): string => {
  const baseClassName =
    "h-10 w-full justify-center rounded-md border text-sm font-semibold shadow-sm transition-colors";

  if (isPinned && isHovered) {
    return `${baseClassName} border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90`;
  }

  if (isPinned) {
    return `${baseClassName} border-primary bg-primary text-primary-foreground hover:bg-primary/90`;
  }

  if (wouldHaveConflicts) {
    return `${baseClassName} border-chart-4/35 bg-chart-4/15 text-chart-4 hover:bg-chart-4/20`;
  }

  return `${baseClassName} border-primary bg-primary text-primary-foreground hover:bg-primary/90`;
};

const getCourseCardActionButtonContent = ({
  isHovered,
  isPinned,
  wouldHaveConflicts,
}: CourseCardActionState) => {
  if (isPinned && isHovered) {
    return (
      <>
        <Trash2 data-icon="inline-start" />
        Remove
      </>
    );
  }

  if (isPinned) {
    return (
      <>
        <Check data-icon="inline-start" />
        Added
      </>
    );
  }

  if (wouldHaveConflicts) {
    return (
      <>
        <AlertTriangle data-icon="inline-start" />
        Conflict
      </>
    );
  }

  return (
    <>
      <Plus data-icon="inline-start" />
      Add Course
    </>
  );
};

function CourseMetadataItem({ icon, label, value }: CourseMetadataItemProps) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border/40 bg-muted/20 p-3.5">
      <div className="flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
        {icon ? <span className="text-foreground/70">{icon}</span> : null}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium leading-snug text-foreground">
        {value}
      </div>
    </div>
  );
}

function CourseSummaryTile({ icon, label, value }: CourseSummaryTileProps) {
  return (
    <div className="rounded-xl border border-border/45 bg-muted/15 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[0.62rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {icon ? <span className="text-foreground/65">{icon}</span> : null}
        <span>{label}</span>
      </div>
      <div className="mt-1.5 text-sm font-medium leading-tight text-foreground">
        {value}
      </div>
    </div>
  );
}

function CourseNotesIndicator({
  isMobile,
  note,
  onOpenChange,
  showNotesTooltip,
}: CourseNotesIndicatorProps) {
  return (
    <Tooltip
      key={isMobile ? "mobile" : "desktop"}
      onOpenChange={isMobile ? onOpenChange : undefined}
      open={isMobile ? showNotesTooltip : undefined}
    >
      <TooltipTrigger
        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-chart-4/30 bg-chart-4/10 px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.18em] text-chart-4 uppercase transition-colors hover:bg-chart-4/15"
        onClick={() => {
          if (isMobile) {
            onOpenChange(!showNotesTooltip);
          }
        }}
        type="button"
      >
        <AlertTriangle className="size-3" />
        <span>Note</span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs" side="top">
        <p>{note}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function CourseCard({ course }: CourseCardProps) {
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
  const wouldHaveConflicts = state.current_profile
    ? findCourseConflicts(course, state.current_profile).length > 0
    : false;
  const actionState = { isHovered, isPinned, wouldHaveConflicts };
  const courseLevelLabel = getCourseLevelLabel(course.level);
  const courseLevelBadgeClassName = getCourseLevelBadgeClassName(course.level);
  const courseTermLabel = formatCourseTerms(
    isMultiTerm,
    availableTerms,
    course
  );
  const courseScheduleLabel = formatCourseSchedule(course);
  const coursePaceLabel = formatPace(course.pace);

  const resetConflictState = () => {
    setConflictingCourses([]);
    setShowConflictModal(false);
  };

  const handleAddCourse = async () => {
    const conflicts = state.current_profile
      ? findCourseConflicts(course, state.current_profile)
      : [];

    if (conflicts.length > 0) {
      setConflictingCourses(conflicts);
      setShowConflictModal(true);
      return;
    }

    if (isMultiTerm && availableTerms.length > 1) {
      setShowTermModal(true);
      return;
    }

    const defaultTerm = getDefaultCourseTerm(course);

    if (defaultTerm !== null) {
      await addCourse(course, defaultTerm);
    }
  };

  const handleTermSelected = async (
    selectedCourse: Course,
    selectedTerm: MasterProgramTerm
  ) => {
    setShowTermModal(false);
    await addCourse(selectedCourse, selectedTerm);
  };

  const handleChooseNewCourse = async (newCourse: Course) => {
    resetConflictState();

    for (const { conflictingCourseId } of conflictingCourses) {
      removeCourse(conflictingCourseId);
    }

    if (isMultiTerm && availableTerms.length > 1) {
      setShowTermModal(true);
      return;
    }

    const defaultTerm = getDefaultCourseTerm(newCourse);

    if (defaultTerm !== null) {
      await addCourse(newCourse, defaultTerm);
    }
  };

  const handleChooseExistingCourse = () => {
    resetConflictState();
  };

  const handleCancelConflictResolution = () => {
    resetConflictState();
  };

  const handlePrimaryAction = async () => {
    if (isPinned && isHovered) {
      removeCourse(course.id);
      return;
    }

    if (!isPinned) {
      await handleAddCourse();
    }
  };

  return (
    <Card className="h-full w-full border border-primary/15 bg-card/95 py-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-xl hover:shadow-primary/5">
      <div className="flex h-full flex-col md:hidden">
        <CardHeader className="gap-3 border-b border-border/40 px-3.5 py-3.5">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <span className="font-mono text-[0.78rem] font-semibold tracking-[0.24em] text-primary/90 uppercase">
                {course.id}
              </span>
              <Badge className={courseLevelBadgeClassName} variant="outline">
                {courseLevelLabel}
              </Badge>
              {course.notes ? (
                <CourseNotesIndicator
                  isMobile={isMobile}
                  note={course.notes}
                  onOpenChange={setShowNotesTooltip}
                  showNotesTooltip={showNotesTooltip}
                />
              ) : null}
            </div>

            <a
              aria-label={`Open ${course.id} on LiU`}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-background/80 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
              href={`https://studieinfo.liu.se/kurs/${course.id}`}
              rel="noopener noreferrer"
              target="_blank"
              title="View on LiU"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>

          <div className="space-y-1.5">
            <p className="text-[0.67rem] font-medium tracking-[0.22em] text-muted-foreground uppercase">
              {course.credits} credits
            </p>
            <CardTitle className="text-[1.05rem] font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover/card:text-primary">
              {course.name}
            </CardTitle>
            {course.examinator ? (
              <p className="text-xs leading-snug text-muted-foreground">
                Examiner {course.examinator}
              </p>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-3 px-3.5 py-3">
          <div className="grid grid-cols-2 gap-2">
            <CourseSummaryTile label="Term" value={courseTermLabel} />
            <CourseSummaryTile label="Schedule" value={courseScheduleLabel} />
            <CourseSummaryTile
              icon={<MapPin className="size-3.5" />}
              label="Campus"
              value={course.campus}
            />
            <CourseSummaryTile label="Pace" value={coursePaceLabel} />
          </div>

          {course.examination.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[0.66rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Assessment
                </p>
                <p className="text-[0.68rem] text-muted-foreground">
                  {course.examination.length} type
                  {course.examination.length === 1 ? "" : "s"}
                </p>
              </div>
              <TruncatedExaminationBadges
                className="gap-1.5"
                examinations={course.examination}
                maxVisible={2}
                shortMode={true}
              />
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="border-t border-border/40 px-3.5 py-3">
          <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2">
            <Button
              className={`${getCourseCardActionButtonClassName(actionState)} h-11 rounded-lg text-sm`}
              onClick={handlePrimaryAction}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              size="lg"
            >
              {getCourseCardActionButtonContent(actionState)}
            </Button>

            <Link className="min-w-0" href={`/course/${course.id}`}>
              <Button
                className="h-11 min-w-[5.5rem] justify-center rounded-lg border-border/50 bg-transparent px-3 text-sm text-muted-foreground hover:border-primary/20 hover:bg-muted/30 hover:text-foreground"
                size="lg"
                variant="outline"
              >
                <Info data-icon="inline-start" />
                Details
              </Button>
            </Link>
          </div>
        </CardFooter>
      </div>

      <div className="hidden h-full flex-col md:flex">
        <CardHeader className="gap-4 border-b border-border/40 px-4 py-4">
          <div className="flex items-start justify-between gap-3 border-b border-border/35 pb-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
              <span className="font-mono text-[0.9rem] font-semibold tracking-[0.28em] text-primary/90 uppercase lg:text-[0.98rem]">
                {course.id}
              </span>
              <Badge className={courseLevelBadgeClassName} variant="outline">
                {courseLevelLabel}
              </Badge>
              {course.notes ? (
                <CourseNotesIndicator
                  isMobile={isMobile}
                  note={course.notes}
                  onOpenChange={setShowNotesTooltip}
                  showNotesTooltip={showNotesTooltip}
                />
              ) : null}
            </div>

            <a
              aria-label={`Open ${course.id} on LiU`}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-background/80 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
              href={`https://studieinfo.liu.se/kurs/${course.id}`}
              rel="noopener noreferrer"
              target="_blank"
              title="View on LiU"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[0.68rem] font-medium tracking-[0.26em] text-muted-foreground uppercase">
              {course.credits} credits
            </p>
            <CardTitle className="line-clamp-2 text-balance text-xl font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover/card:text-primary">
              {course.name}
            </CardTitle>
            {course.examinator ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Examiner {course.examinator}
              </p>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4 px-4 py-4">
          <div className="grid gap-3 lg:grid-cols-2">
            <CourseMetadataItem label="Term" value={courseTermLabel} />
            <CourseMetadataItem label="Schedule" value={courseScheduleLabel} />
            <CourseMetadataItem
              icon={<MapPin className="size-3.5" />}
              label="Campus"
              value={course.campus}
            />
            <CourseMetadataItem label="Pace" value={coursePaceLabel} />
          </div>

          <CourseMetadataItem
            label="Assessment"
            value={
              <div className="flex flex-col gap-2">
                <TruncatedExaminationBadges
                  className="gap-1.5"
                  examinations={course.examination}
                  maxVisible={4}
                  shortMode={true}
                />
                {course.studierektor ? (
                  <p className="text-xs font-normal text-muted-foreground">
                    Director {course.studierektor}
                  </p>
                ) : null}
              </div>
            }
          />
        </CardContent>

        <CardFooter className="border-t border-border/40 px-4 py-4">
          <div className="grid w-full gap-2 lg:grid-cols-[minmax(0,1fr)_auto]">
            <Button
              className={getCourseCardActionButtonClassName(actionState)}
              onClick={handlePrimaryAction}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              size="lg"
            >
              {getCourseCardActionButtonContent(actionState)}
            </Button>

            <Link className="w-full lg:w-auto" href={`/course/${course.id}`}>
              <Button
                className="h-10 w-full min-w-32 justify-center rounded-md border-border/50 bg-transparent text-muted-foreground hover:border-primary/20 hover:bg-muted/30 hover:text-foreground"
                size="lg"
                variant="outline"
              >
                <Info data-icon="inline-start" />
                Details
              </Button>
            </Link>
          </div>
        </CardFooter>
      </div>

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
        onClose={handleCancelConflictResolution}
      />
    </Card>
  );
}
