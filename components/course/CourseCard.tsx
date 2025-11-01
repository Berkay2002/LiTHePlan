import {
  AlertTriangle,
  Check,
  Clock,
  ExternalLink,
  Info,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
import { isCourseInProfile } from "@/lib/profile-utils";
import {
  MASTER_PROGRAM_TERMS,
  type MasterProgramTerm,
} from "@/lib/profile-constants";
import type { Course } from "@/types/course";
import { ConflictResolutionModal } from "./ConflictResolutionModal";
import { TermSelectionModal } from "./TermSelectionModal";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const { state, addCourse, removeCourse } = useProfile();
  const isPinned = state.current_profile
    ? isCourseInProfile(state.current_profile, course.id)
    : false;
  const [isHovered, setIsHovered] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [, setPendingTerm] = useState<MasterProgramTerm | null>(null);
  const [conflictingCourses, setConflictingCourses] = useState<
    { conflictingCourse: Course; conflictingCourseId: string }[]
  >([]);
  const [showNotesTooltip, setShowNotesTooltip] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Check if this course is available in multiple terms
  const isMultiTerm = isMultiTermCourse(course);
  const availableTerms = getAvailableTerms(course);

  // Check if adding this course would cause conflicts
  const wouldHaveConflicts = state.current_profile
    ? findCourseConflicts(course, state.current_profile).length > 0
    : false;

  // Helper function to check if a field should be hidden
  const shouldHideField = () => {
    // Never hide any fields - always show course information
    return false;
  };

  // Helper function to determine if period should be shown (not for 50% courses)
  const shouldShowPeriod = () => course.pace === "100%";

  // This function is no longer used since we always check conflicts first

  // Handle adding course - always check conflicts first, then handle term selection
  const handleAddCourse = () => {
    console.log("🎯 handleAddCourse clicked for course:", course.id);
    console.log(
      "🔄 isMultiTerm:",
      isMultiTerm,
      "availableTerms:",
      availableTerms
    );

    // Always check conflicts first, regardless of term count
    const conflicts = state.current_profile
      ? findCourseConflicts(course, state.current_profile)
      : [];

    if (conflicts.length > 0) {
      // Show conflict modal first
      console.log("⚠️ Conflicts detected, showing conflict modal first");
      setConflictingCourses(conflicts);
      setPendingTerm(null); // Will be set after conflict resolution
      setShowConflictModal(true);
      return;
    }

    // No conflicts, proceed with term selection or direct add
    if (isMultiTerm && availableTerms.length > 1) {
      console.log("📋 No conflicts, showing term selection modal");
      setShowTermModal(true);
    } else {
      // Single term course - add directly
      const termToAdd = Array.isArray(course.term)
        ? course.term[0]
        : course.term;
      const parsedTerm = Number.parseInt(termToAdd, 10);
      console.log(
        "➕ No conflicts, adding directly - termToAdd:",
        termToAdd,
        "parsedTerm:",
        parsedTerm
      );

      if (
        Number.isInteger(parsedTerm) &&
        MASTER_PROGRAM_TERMS.includes(parsedTerm as MasterProgramTerm)
      ) {
        console.log("✅ Adding course with:", {
          course: course.id,
          term: parsedTerm,
        });
        addCourse(course, parsedTerm as MasterProgramTerm);
      } else {
        console.error("❌ Invalid term for course:", {
          courseId: course.id,
          termToAdd,
          parsedTerm,
        });
      }
    }
  };

  // Handle term selection from modal (conflicts already checked)
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

    // Add course directly since conflicts were already checked
    console.log("✅ Adding course with selected term (conflicts pre-checked)");
    await addCourse(selectedCourse, selectedTerm);
  };

  // Handle conflict resolution - user chooses new course
  const handleChooseNewCourse = async (newCourse: Course) => {
    console.log("✅ User chose new course:", newCourse.id);
    setShowConflictModal(false);

    // Remove conflicting courses first
    for (const { conflictingCourseId } of conflictingCourses) {
      console.log("🗑️ Removing conflicting course:", conflictingCourseId);
      removeCourse(conflictingCourseId);
    }

    // Now handle term selection for the new course
    if (isMultiTerm && availableTerms.length > 1) {
      console.log(
        "📋 Showing term selection for new course after conflict resolution"
      );
      setShowTermModal(true);
    } else {
      const termToAdd = Array.isArray(newCourse.term)
        ? newCourse.term[0]
        : newCourse.term;
      const parsedTerm = Number.parseInt(termToAdd, 10) as MasterProgramTerm;
      console.log("➕ Adding new course with default term:", parsedTerm);
      await addCourse(newCourse, parsedTerm);
    }

    // Reset state
    setConflictingCourses([]);
    setPendingTerm(null);
  };

  // Handle conflict resolution - user chooses existing course
  const handleChooseExistingCourse = (existingCourse: Course) => {
    console.log("📚 User chose to keep existing course:", existingCourse.id);
    setShowConflictModal(false);
    setConflictingCourses([]);
    setPendingTerm(null);
    // No action needed - existing course stays in profile
  };

  // Handle conflict resolution - user cancels
  const handleCancelConflictResolution = () => {
    console.log("❌ User cancelled conflict resolution");
    setShowConflictModal(false);
    setConflictingCourses([]);
    setPendingTerm(null);
  };

  // Helper function to get all examination badges - always show all examinations for the course
  const getVisibleExaminations = (examinations: string[]) => {
    // Always show all examinations that the course actually has
    return examinations;
  };

  return (
    <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-xl border-2 border-primary/20 bg-background hover:border-primary/40 hover:shadow-primary/10">
      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Main Course Header */}
        <div className="mb-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground line-clamp-3 leading-tight group-hover:text-primary transition-colors duration-300 flex-1 min-h-18">
              {course.name}
            </h3>
            {course.notes && (
              <Tooltip open={isMobile ? showNotesTooltip : undefined}>
                <TooltipTrigger asChild>
                  <button
                    className="flex items-center gap-1 bg-accent/20 text-accent-foreground px-2 py-1 rounded-md border border-accent/30 ml-2 shrink-0 hover:bg-accent/30 transition-colors cursor-pointer"
                    onBlur={() => isMobile && setShowNotesTooltip(false)}
                    onClick={() =>
                      isMobile && setShowNotesTooltip(!showNotesTooltip)
                    }
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs font-bold">OBS</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  onPointerDownOutside={() =>
                    isMobile && setShowNotesTooltip(false)
                  }
                  side="top"
                >
                  <p>{course.notes}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-sm text-primary font-mono font-bold">
                {course.id}
              </div>
              <a
                href={`https://studieinfo.liu.se/kurs/${course.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/60 hover:text-primary transition-colors"
                title="View on LiU official site"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(() => {
                const visibleExaminations = getVisibleExaminations(
                  course.examination
                );
                return visibleExaminations.map((exam, index) => (
                  <Badge
                    className="text-xs px-3 py-1 bg-secondary/50 text-secondary-foreground border border-secondary/30 hover:bg-secondary/60 transition-all duration-200"
                    key={`${exam}-${index}`}
                    variant="secondary"
                  >
                    {exam}
                  </Badge>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Key Information Grid */}
        <div
          className="grid gap-3 mb-4"
          style={{
            gridTemplateColumns: `repeat(${Math.max(
              1,
              [
                !shouldHideField(),
                shouldShowPeriod() && !shouldHideField(),
                !shouldHideField(),
                !shouldHideField(),
              ].filter(Boolean).length
            )}, minmax(0, 1fr))`,
          }}
        >
          {!shouldHideField() && (
            <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20 hover:border-primary/30 transition-colors duration-200">
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                Term
              </div>
              <div className="text-sm font-bold text-primary">
                {isMultiTerm ? availableTerms.join(", ") : course.term}
              </div>
            </div>
          )}
          {shouldShowPeriod() && !shouldHideField() && (
            <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20 hover:border-primary/30 transition-colors duration-200">
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                Period
              </div>
              <div className="text-sm font-bold text-primary">
                {course.period}
              </div>
            </div>
          )}
          {!shouldHideField() && (
            <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20 hover:border-primary/30 transition-colors duration-200">
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                {Array.isArray(course.block) ? "Blocks" : "Block"}
              </div>
              <div className="text-sm font-bold text-primary">
                {formatBlocks(course.block)}
              </div>
            </div>
          )}
          {!shouldHideField() && (
            <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20 hover:border-primary/30 transition-colors duration-200">
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                Level
              </div>
              <div className="text-sm font-bold text-primary">
                {course.level === "grundnivå" ? "G" : "A"}
              </div>
            </div>
          )}
        </div>

        {/* Secondary Information */}
        <div className="space-y-3 flex-1">
          <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
            {/* Campus and Pace - only show if not filtered to single values */}
            {!(shouldHideField() && shouldHideField()) && (
              <div className="flex items-center justify-between">
                {!shouldHideField() && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {course.campus}
                    </span>
                  </div>
                )}
                {!shouldHideField() && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {formatPace(course.pace)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Examinator and Studierektor */}
            <div className="space-y-2">
              {course.examinator && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium min-w-[60px]">
                    Examiner:
                  </span>
                  <span className="text-xs text-foreground font-medium">
                    {course.examinator}
                  </span>
                </div>
              )}
              {course.studierektor && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium min-w-[60px]">
                    Director:
                  </span>
                  <span className="text-xs text-foreground font-medium">
                    {course.studierektor}
                  </span>
                </div>
              )}
            </div>

            {/* Programs and Orientations */}
            {(() => {
              const allProgramsAndOrientations = [
                ...course.programs,
                ...(course.orientations || []),
              ];
              const maxDisplayItems = 1;
              const displayedItems = allProgramsAndOrientations.slice(
                0,
                maxDisplayItems
              );
              const remainingItems =
                allProgramsAndOrientations.slice(maxDisplayItems);

              return (
                allProgramsAndOrientations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="space-y-1.5">
                      {displayedItems.map((item, index) => (
                        <Tooltip key={`${item}-${index}`}>
                          <TooltipTrigger asChild>
                            <Badge
                              className="text-xs px-3 py-1 bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:border-primary/40 transition-all duration-200 w-full block cursor-help"
                              variant="outline"
                            >
                              <span className="truncate text-center block w-full">
                                {item}
                              </span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>{item}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                      {remainingItems.length > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              className="text-xs px-3 py-1 bg-muted text-muted-foreground border-border hover:bg-muted/80 hover:border-border/60 transition-all duration-200 cursor-help w-full block"
                              variant="outline"
                            >
                              +{remainingItems.length} more
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <div className="space-y-1">
                              <p className="font-medium">
                                Additional programs:
                              </p>
                              <div className="text-muted-foreground leading-relaxed">
                                {remainingItems.join(", ")}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                )
              );
            })()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-border pt-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              className={`h-10 text-sm font-medium transition-all duration-300 shadow-lg ${
                isPinned
                  ? isHovered
                    ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : wouldHaveConflicts
                    ? "bg-accent hover:bg-accent/90 text-accent-foreground border-2 border-accent/40"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
              onClick={() => {
                console.log("🖱️ Button clicked for course:", course.id, {
                  isPinned,
                  isHovered,
                });
                if (isPinned && isHovered) {
                  console.log("🗑️ Removing course");
                  removeCourse(course.id);
                } else if (isPinned) {
                  console.log("⚠️ No action taken - button click ignored");
                } else {
                  console.log("➕ Adding course via handleAddCourse");
                  handleAddCourse();
                }
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              size="default"
            >
              {isPinned ? (
                isHovered ? (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Added
                  </>
                )
              ) : wouldHaveConflicts ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Resolve Conflict
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Profile
                </>
              )}
            </Button>
            <Link href={`/course/${course.id}`} className="w-full">
              <Button
                className="h-10 text-sm font-medium bg-secondary/20 border-border text-secondary-foreground hover:bg-secondary/30 hover:border-border/60 transition-all duration-300 w-full"
                size="default"
                variant="outline"
              >
                <Info className="h-4 w-4 mr-2" />
                Course Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>

      {/* Term Selection Modal */}
      <TermSelectionModal
        availableTerms={availableTerms}
        course={course}
        isOpen={showTermModal}
        onClose={() => setShowTermModal(false)}
        onTermSelected={handleTermSelected}
      />

      {/* Conflict Resolution Modal */}
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
