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
import type { Course } from "@/types/course";
import { ConflictResolutionModal } from "./ConflictResolutionModal";
import type { FilterState } from "./FilterPanel";
import { TermSelectionModal } from "./TermSelectionModal";

interface CourseListItemProps {
  course: Course;
  activeFilters?: FilterState;
}

export function CourseListItem({
  course,
  activeFilters = {
    level: [],
    term: [],
    period: [],
    block: [],
    pace: [],
    campus: [],
    examination: [],
    programs: [],
    huvudomraden: [],
    search: "",
  },
}: CourseListItemProps) {
  const { state, addCourse, removeCourse } = useProfile();
  const isPinned = state.current_profile
    ? isCourseInProfile(state.current_profile, course.id)
    : false;
  const [isHovered, setIsHovered] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
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

  // Helper function to check if a field should be hidden based on active filters
  const shouldHideField = (fieldName: keyof typeof activeFilters) => {
    const filterValues = activeFilters[fieldName];
    if (!filterValues || filterValues.length === 0) return false;

    // Special handling for examination and programs - never hide these sections
    if (fieldName === "examination" || fieldName === "programs") return false;

    // If only one filter value is selected, hide the field
    if (filterValues.length === 1) return true;

    // If multiple values selected, show the field to distinguish between options
    return false;
  };

  // Helper function to determine if period should be shown (not for 50% courses)
  const shouldShowPeriod = () => course.pace === "100%";

  // Handle adding course - always check conflicts first, then handle term selection
  const handleAddCourse = async () => {
    console.log("🎯 handleAddCourse clicked for course:", course.id);

    // Always check conflicts first, regardless of term count
    const conflicts = state.current_profile
      ? findCourseConflicts(course, state.current_profile)
      : [];

    if (conflicts.length > 0) {
      // Show conflict modal first
      console.log("⚠️ Conflicts detected, showing conflict modal first");
      setConflictingCourses(conflicts);
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
      const parsedTerm = Number.parseInt(termToAdd);
      console.log(
        "➕ No conflicts, adding directly - termToAdd:",
        termToAdd,
        "parsedTerm:",
        parsedTerm
      );

      if (!isNaN(parsedTerm) && [7, 8, 9].includes(parsedTerm)) {
        console.log("✅ Adding course with:", {
          course: course.id,
          term: parsedTerm,
        });
        await addCourse(course, parsedTerm as 7 | 8 | 9);
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
    selectedTerm: 7 | 8 | 9
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
      const parsedTerm = Number.parseInt(termToAdd) as 7 | 8 | 9;
      console.log("➕ Adding new course with default term:", parsedTerm);
      await addCourse(newCourse, parsedTerm);
    }

    // Reset state
    setConflictingCourses([]);
  };

  // Handle conflict resolution - user chooses existing course
  const handleChooseExistingCourse = (existingCourse: Course) => {
    console.log("📚 User chose to keep existing course:", existingCourse.id);
    setShowConflictModal(false);
    setConflictingCourses([]);
    // No action needed - existing course stays in profile
  };

  // Handle conflict resolution - user cancels
  const handleCancelConflictResolution = () => {
    console.log("❌ User cancelled conflict resolution");
    setShowConflictModal(false);
    setConflictingCourses([]);
  };

  // Helper function to filter examination badges - show only selected examination types when filter is active
  const getVisibleExaminations = (examinations: string[]) => {
    const examinationFilters = activeFilters.examination || [];
    if (examinationFilters.length === 0) return examinations;

    // Return examinations that are included in the filters
    return examinations.filter((exam) => examinationFilters.includes(exam));
  };

  return (
    <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-2 border-air-superiority-blue/20 bg-card hover:border-picton-blue/40 hover:shadow-picton-blue/10">
      <CardContent className="p-3 lg:p-4">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Two-row layout for better alignment */}
          <div className="space-y-2">
            {/* Top row: Course name and action elements */}
            <div className="flex items-start justify-between gap-3">
              {/* Course name - takes available space */}
              <div className="flex-1 min-w-0 flex items-start gap-2">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-picton-blue transition-colors duration-300 leading-tight flex-1">
                  {course.name}
                </h3>
                {course.notes && (
                  <Tooltip open={isMobile ? showNotesTooltip : undefined}>
                    <TooltipTrigger asChild>
                      <button
                        className="flex items-center gap-1 bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 flex-shrink-0 hover:bg-amber-200 transition-colors cursor-pointer"
                        onBlur={() => isMobile && setShowNotesTooltip(false)}
                        onClick={() =>
                          isMobile && setShowNotesTooltip(!showNotesTooltip)
                        }
                      >
                        <AlertTriangle className="h-3 w-3" />
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

              {/* Right side: Examination badges and action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Examination badges */}
                <div className="flex flex-wrap gap-1">
                  {(() => {
                    const visibleExaminations = getVisibleExaminations(
                      course.examination
                    );
                    return visibleExaminations
                      .slice(0, 2)
                      .map((exam, index) => (
                        <Badge
                          className="text-xs px-1.5 py-0.5 bg-electric-blue/10 text-electric-blue-300 border border-electric-blue/20"
                          key={`${exam}-${index}`}
                          variant="secondary"
                        >
                          {exam}
                        </Badge>
                      ));
                  })()}
                  {(() => {
                    const visibleExaminations = getVisibleExaminations(
                      course.examination
                    );
                    return (
                      visibleExaminations.length > 2 && (
                        <Badge
                          className="text-xs px-1.5 py-0.5 bg-electric-blue/10 text-electric-blue-300 border border-electric-blue/20"
                          variant="secondary"
                        >
                          +{visibleExaminations.length - 2}
                        </Badge>
                      )
                    );
                  })()}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1">
                  <Button
                    className={`h-7 px-2 text-xs font-medium transition-all duration-300 shadow-sm ${
                      isPinned
                        ? isHovered
                          ? "bg-custom-red hover:bg-custom-red-600 text-white"
                          : "bg-electric-blue hover:bg-electric-blue-600 text-white"
                        : wouldHaveConflicts
                          ? "bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-400"
                          : "bg-picton-blue hover:bg-picton-blue-600 text-white"
                    }`}
                    onClick={() => {
                      if (isPinned && isHovered) {
                        removeCourse(course.id);
                      } else if (!isPinned) {
                        handleAddCourse();
                      }
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    size="sm"
                  >
                    {isPinned ? (
                      isHovered ? (
                        <Trash2 className="h-3 w-3" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )
                    ) : wouldHaveConflicts ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                  </Button>

                  <Button
                    className="h-7 px-2 text-xs font-medium bg-air-superiority-blue/5 border-air-superiority-blue/30 text-air-superiority-blue hover:bg-air-superiority-blue/10 hover:border-air-superiority-blue/40 transition-all duration-300"
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

            {/* Bottom row: Course details */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="text-air-superiority-blue font-mono font-bold">
                {course.id}
              </div>

              {!shouldHideField("term") && (
                <span className="text-picton-blue font-medium">
                  T{isMultiTerm ? availableTerms.join(",") : course.term}
                </span>
              )}

              {shouldShowPeriod() && !shouldHideField("period") && (
                <span className="text-air-superiority-blue font-medium">
                  P{course.period}
                </span>
              )}

              {!shouldHideField("block") && (
                <span className="text-electric-blue-300 font-medium">
                  B{formatBlocks(course.block)}
                </span>
              )}

              {!shouldHideField("level") && (
                <span className="text-battleship-gray font-medium">
                  {course.level === "grundnivå" ? "G" : "A"}
                </span>
              )}

              {course.examinator && (
                <span className="text-electric-blue-300 font-medium">
                  Ex: {course.examinator.split(" ").slice(-1)[0]}
                </span>
              )}

              {course.studierektor && (
                <span className="text-air-superiority-blue font-medium">
                  Dir: {course.studierektor.split(" ").slice(-1)[0]}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-start gap-4">
          {/* Left section - Course Info */}
          <div className="flex-1 min-w-0">
            {/* Course Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2">
                  <h3 className="text-base font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-picton-blue transition-colors duration-300 flex-1">
                    {course.name}
                  </h3>
                  {course.notes && (
                    <Tooltip open={isMobile ? showNotesTooltip : undefined}>
                      <TooltipTrigger asChild>
                        <button
                          className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-md border border-amber-200 flex-shrink-0 hover:bg-amber-200 transition-colors cursor-pointer"
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
                        className="max-w-xs bg-gray-900 text-white border-gray-700"
                        onPointerDownOutside={() =>
                          isMobile && setShowNotesTooltip(false)
                        }
                        side="top"
                      >
                        <p className="text-xs text-white">{course.notes}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="text-sm text-air-superiority-blue font-mono font-bold mb-2">
                  {course.id}
                </div>
              </div>

              {/* Examination badges */}
              <div className="flex flex-wrap gap-1 ml-3">
                {(() => {
                  const visibleExaminations = getVisibleExaminations(
                    course.examination
                  );
                  return visibleExaminations.map((exam, index) => (
                    <Badge
                      className="text-xs px-2 py-1 bg-electric-blue/10 text-electric-blue-300 border border-electric-blue/20"
                      key={`${exam}-${index}`}
                      variant="secondary"
                    >
                      {exam}
                    </Badge>
                  ));
                })()}
              </div>
            </div>

            {/* Course Details in horizontal layout */}
            <div className="flex flex-wrap items-center gap-4 mb-3 text-sm">
              {!shouldHideField("term") && (
                <div className="flex items-center gap-1.5">
                  <span className="text-battleship-gray-400 font-medium">
                    Term:
                  </span>
                  <span className="text-picton-blue font-bold">
                    {isMultiTerm ? availableTerms.join(", ") : course.term}
                  </span>
                </div>
              )}

              {shouldShowPeriod() && !shouldHideField("period") && (
                <div className="flex items-center gap-1.5">
                  <span className="text-battleship-gray-400 font-medium">
                    Period:
                  </span>
                  <span className="text-air-superiority-blue font-bold">
                    {course.period}
                  </span>
                </div>
              )}

              {!shouldHideField("block") && (
                <div className="flex items-center gap-1.5">
                  <span className="text-battleship-gray-400 font-medium">
                    {Array.isArray(course.block) ? "Blocks:" : "Block:"}
                  </span>
                  <span className="text-electric-blue-300 font-bold">
                    {formatBlocks(course.block)}
                  </span>
                </div>
              )}

              {!shouldHideField("level") && (
                <div className="flex items-center gap-1.5">
                  <span className="text-battleship-gray-400 font-medium">
                    Level:
                  </span>
                  <span className="text-battleship-gray font-bold">
                    {course.level === "grundnivå" ? "G" : "A"}
                  </span>
                </div>
              )}

              {course.examinator && (
                <div className="flex items-center gap-1.5">
                  <span className="text-battleship-gray-400 font-medium">
                    Examiner:
                  </span>
                  <span className="text-electric-blue-300 font-bold">
                    {course.examinator}
                  </span>
                </div>
              )}

              {course.studierektor && (
                <div className="flex items-center gap-1.5">
                  <span className="text-battleship-gray-400 font-medium">
                    Director:
                  </span>
                  <span className="text-air-superiority-blue font-bold">
                    {course.studierektor}
                  </span>
                </div>
              )}
            </div>

            {/* Campus, Pace, and Programs */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {!shouldHideField("campus") && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-air-superiority-blue" />
                  <span className="text-air-superiority-blue-300 font-medium">
                    {course.campus}
                  </span>
                </div>
              )}

              {!shouldHideField("pace") && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-battleship-gray" />
                  <span className="text-battleship-gray-300 font-medium">
                    {formatPace(course.pace)}
                  </span>
                </div>
              )}

              {/* Programs and Orientations */}
              {(() => {
                const allProgramsAndOrientations = [
                  ...course.programs,
                  ...(course.orientations || []),
                ];
                return (
                  allProgramsAndOrientations.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {allProgramsAndOrientations
                        .slice(0, 2)
                        .map((item, index) => (
                          <Badge
                            className="text-xs px-2 py-1 bg-picton-blue/10 text-picton-blue border-picton-blue/30"
                            key={`${item}-${index}`}
                            variant="outline"
                          >
                            {item}
                          </Badge>
                        ))}
                      {allProgramsAndOrientations.length > 2 && (
                        <div className="relative">
                          <Badge
                            className="text-xs px-2 py-1 bg-picton-blue/10 text-picton-blue border-picton-blue/30 cursor-help hover:bg-picton-blue/20 transition-colors peer"
                            variant="outline"
                          >
                            +{allProgramsAndOrientations.length - 2} more
                          </Badge>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-slate-900 text-slate-50 border border-slate-700/50 shadow-xl text-sm font-medium px-4 py-2.5 rounded-lg opacity-0 peer-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100] max-w-md w-max">
                            <div className="space-y-1">
                              <p className="font-medium text-slate-100">
                                Additional programs:
                              </p>
                              <div className="text-slate-200 leading-relaxed">
                                {allProgramsAndOrientations.slice(2).join(", ")}
                              </div>
                            </div>
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900" />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                );
              })()}
            </div>
          </div>

          {/* Right section - Action Buttons */}
          <div className="flex flex-col gap-2 ml-4">
            <Button
              className={`h-8 text-xs font-medium transition-all duration-300 shadow-md ${
                isPinned
                  ? isHovered
                    ? "bg-custom-red hover:bg-custom-red-600 text-white"
                    : "bg-electric-blue hover:bg-electric-blue-600 text-white"
                  : wouldHaveConflicts
                    ? "bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-400"
                    : "bg-picton-blue hover:bg-picton-blue-600 text-white"
              }`}
              onClick={() => {
                if (isPinned && isHovered) {
                  removeCourse(course.id);
                } else if (!isPinned) {
                  handleAddCourse();
                }
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              size="sm"
            >
              {isPinned ? (
                isHovered ? (
                  <>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Added
                  </>
                )
              ) : wouldHaveConflicts ? (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Resolve
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </>
              )}
            </Button>

            <Button
              className="h-8 text-xs font-medium bg-air-superiority-blue/5 border-air-superiority-blue/30 text-air-superiority-blue hover:bg-air-superiority-blue/10 hover:border-air-superiority-blue/40 transition-all duration-300"
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
              <ExternalLink className="h-3 w-3 mr-1" />
              View
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
