import {
  AlertTriangle,
  Check,
  Clock,
  ExternalLink,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
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
import { logger } from "@/lib/logger";

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
    logger.info("🎯 handleAddCourse clicked for course:", course.id);
    logger.info(
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
      logger.info("⚠️ Conflicts detected, showing conflict modal first");
      setConflictingCourses(conflicts);
      setPendingTerm(null); // Will be set after conflict resolution
      setShowConflictModal(true);
      return;
    }

    // No conflicts, proceed with term selection or direct add
    if (isMultiTerm && availableTerms.length > 1) {
      logger.info("📋 No conflicts, showing term selection modal");
      setShowTermModal(true);
    } else {
      // Single term course - add directly
      const termToAdd = Array.isArray(course.term)
        ? course.term[0]
        : course.term;
      const parsedTerm = Number.parseInt(termToAdd, 10);
      logger.info(
        "➕ No conflicts, adding directly - termToAdd:",
        termToAdd,
        "parsedTerm:",
        parsedTerm
      );

      if (
        Number.isInteger(parsedTerm) &&
        MASTER_PROGRAM_TERMS.includes(parsedTerm as MasterProgramTerm)
      ) {
        logger.info("✅ Adding course with:", {
          course: course.id,
          term: parsedTerm,
        });
        addCourse(course, parsedTerm as MasterProgramTerm);
      } else {
        logger.error("❌ Invalid term for course:", {
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
    logger.info(
      "🔄 Term selected:",
      selectedTerm,
      "for course:",
      selectedCourse.id
    );
    setShowTermModal(false);

    // Add course directly since conflicts were already checked
    logger.info("✅ Adding course with selected term (conflicts pre-checked)");
    await addCourse(selectedCourse, selectedTerm);
  };

  // Handle conflict resolution - user chooses new course
  const handleChooseNewCourse = async (newCourse: Course) => {
    logger.info("✅ User chose new course:", newCourse.id);
    setShowConflictModal(false);

    // Remove conflicting courses first
    for (const { conflictingCourseId } of conflictingCourses) {
      logger.info("🗑️ Removing conflicting course:", conflictingCourseId);
      removeCourse(conflictingCourseId);
    }

    // Now handle term selection for the new course
    if (isMultiTerm && availableTerms.length > 1) {
      logger.info(
        "📋 Showing term selection for new course after conflict resolution"
      );
      setShowTermModal(true);
    } else {
      const termToAdd = Array.isArray(newCourse.term)
        ? newCourse.term[0]
        : newCourse.term;
      const parsedTerm = Number.parseInt(termToAdd, 10) as MasterProgramTerm;
      logger.info("➕ Adding new course with default term:", parsedTerm);
      await addCourse(newCourse, parsedTerm);
    }

    // Reset state
    setConflictingCourses([]);
    setPendingTerm(null);
  };

  // Handle conflict resolution - user chooses existing course
  const handleChooseExistingCourse = (existingCourse: Course) => {
    logger.info("📚 User chose to keep existing course:", existingCourse.id);
    setShowConflictModal(false);
    setConflictingCourses([]);
    setPendingTerm(null);
    // No action needed - existing course stays in profile
  };

  // Handle conflict resolution - user cancels
  const handleCancelConflictResolution = () => {
    logger.info("❌ User cancelled conflict resolution");
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
    <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-xl border-2 border-air-superiority-blue/20 bg-card hover:border-picton-blue/40 hover:shadow-picton-blue/10">
      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Main Course Header */}
        <div className="mb-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground line-clamp-3 leading-tight group-hover:text-picton-blue transition-colors duration-300 flex-1 min-h-[4.5rem]">
              {course.name}
            </h3>
            {course.notes && (
              <Tooltip open={isMobile ? showNotesTooltip : undefined}>
                <TooltipTrigger asChild>
                  <button
                    className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-md border border-amber-200 ml-2 flex-shrink-0 hover:bg-amber-200 transition-colors cursor-pointer"
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
            <div className="text-sm text-air-superiority-blue font-mono font-bold">
              {course.id}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(() => {
                const visibleExaminations = getVisibleExaminations(
                  course.examination
                );
                return visibleExaminations.map((exam, index) => (
                  <Badge
                    className="text-xs px-3 py-1 bg-electric-blue/10 text-electric-blue-300 border border-electric-blue/20 hover:bg-electric-blue/20 transition-all duration-200"
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
            <div className="text-center p-3 bg-picton-blue/10 rounded-lg border border-picton-blue/20 hover:border-picton-blue/30 transition-colors duration-200">
              <div className="text-xs text-battleship-gray-400 uppercase tracking-wide font-medium mb-1">
                Term
              </div>
              <div className="text-sm font-bold text-picton-blue">
                {isMultiTerm ? availableTerms.join(", ") : course.term}
              </div>
            </div>
          )}
          {shouldShowPeriod() && !shouldHideField() && (
            <div className="text-center p-3 bg-air-superiority-blue/10 rounded-lg border border-air-superiority-blue/20 hover:border-air-superiority-blue/30 transition-colors duration-200">
              <div className="text-xs text-battleship-gray-400 uppercase tracking-wide font-medium mb-1">
                Period
              </div>
              <div className="text-sm font-bold text-air-superiority-blue">
                {course.period}
              </div>
            </div>
          )}
          {!shouldHideField() && (
            <div className="text-center p-3 bg-electric-blue/10 rounded-lg border border-electric-blue/20 hover:border-electric-blue/30 transition-colors duration-200">
              <div className="text-xs text-battleship-gray-400 uppercase tracking-wide font-medium mb-1">
                {Array.isArray(course.block) ? "Blocks" : "Block"}
              </div>
              <div className="text-sm font-bold text-electric-blue-300">
                {formatBlocks(course.block)}
              </div>
            </div>
          )}
          {!shouldHideField() && (
            <div className="text-center p-3 bg-battleship-gray/10 rounded-lg border border-battleship-gray/20 hover:border-battleship-gray/30 transition-colors duration-200">
              <div className="text-xs text-battleship-gray-400 uppercase tracking-wide font-medium mb-1">
                Level
              </div>
              <div className="text-xs font-bold text-battleship-gray">
                {course.level === "grundnivå" ? "G" : "A"}
              </div>
            </div>
          )}
        </div>

        {/* Secondary Information */}
        <div className="space-y-3 flex-1">
          <div className="p-4 bg-air-superiority-blue/8 rounded-lg border border-air-superiority-blue/10 space-y-3">
            {/* Campus and Pace - only show if not filtered to single values */}
            {!(shouldHideField() && shouldHideField()) && (
              <div className="flex items-center justify-between">
                {!shouldHideField() && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-air-superiority-blue" />
                    <span className="text-sm font-medium text-air-superiority-blue-300">
                      {course.campus}
                    </span>
                  </div>
                )}
                {!shouldHideField() && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-battleship-gray" />
                    <span className="text-sm font-medium text-battleship-gray-300">
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
                  <span className="text-xs text-battleship-gray-400 uppercase tracking-wide font-medium min-w-[60px]">
                    Examiner:
                  </span>
                  <span className="text-xs text-foreground font-medium">
                    {course.examinator}
                  </span>
                </div>
              )}
              {course.studierektor && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-battleship-gray-400 uppercase tracking-wide font-medium min-w-[60px]">
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
                  <div className="mt-3 pt-3 border-t border-air-superiority-blue/15">
                    <div className="space-y-1.5">
                      {displayedItems.map((item, index) => (
                        <Tooltip key={`${item}-${index}`}>
                          <TooltipTrigger asChild>
                            <Badge
                              className="text-xs px-3 py-1 bg-picton-blue/10 text-picton-blue border-picton-blue/30 hover:bg-picton-blue/20 hover:border-picton-blue/40 transition-all duration-200 w-full block cursor-help"
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
                              className="text-xs px-3 py-1 bg-battleship-gray/10 text-battleship-gray border-battleship-gray/30 hover:bg-battleship-gray/20 hover:border-battleship-gray/40 transition-all duration-200 cursor-help w-full block"
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
                              <div className="text-slate-200 leading-relaxed">
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
        <div className="border-t border-air-superiority-blue/20 pt-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              className={`h-10 text-sm font-medium transition-all duration-300 shadow-lg ${
                isPinned
                  ? isHovered
                    ? "bg-custom-red hover:bg-custom-red-600 text-white"
                    : "bg-electric-blue hover:bg-electric-blue-600 text-white"
                  : wouldHaveConflicts
                    ? "bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-400"
                    : "bg-picton-blue hover:bg-picton-blue-600 text-white"
              }`}
              onClick={() => {
                logger.info("🖱️ Button clicked for course:", course.id, {
                  isPinned,
                  isHovered,
                });
                if (isPinned && isHovered) {
                  logger.info("🗑️ Removing course");
                  removeCourse(course.id);
                } else if (isPinned) {
                  logger.info("⚠️ No action taken - button click ignored");
                } else {
                  logger.info("➕ Adding course via handleAddCourse");
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
            <Button
              className="h-10 text-sm font-medium bg-air-superiority-blue/5 border-air-superiority-blue/30 text-air-superiority-blue hover:bg-air-superiority-blue/10 hover:border-air-superiority-blue/40 transition-all duration-300"
              onClick={() => {
                window.open(
                  `https://studieinfo.liu.se/kurs/${course.id}`,
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
              size="default"
              variant="outline"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Course
            </Button>
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