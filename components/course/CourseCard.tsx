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

  return (
    <Card className="group h-full flex flex-col transition-all duration-200 hover:shadow-xl border-2 border-primary/20 bg-background hover:border-primary/50 hover:scale-[1.01]">
      <CardContent className="flex-1 flex flex-col gap-2.5 p-4">
        {/* SCANNABLE HEADER - Course ID + Level + Warnings in single row */}
        <div className="flex items-center justify-between gap-2 -mb-1">
          {/* Left: Course ID + Level Badge */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-mono font-extrabold text-primary tracking-tight">
              {course.id}
            </span>
            <Badge
              className={`px-2 py-0.5 text-xs font-bold border-0 shadow-sm ${
                course.level === "avancerad nivå"
                  ? "bg-primary text-primary-foreground"
                  : "bg-chart-2 text-white"
              }`}
            >
              {course.level === "avancerad nivå" ? "ADVANCED" : "BASIC"}
            </Badge>
            {course.notes && (
              <Tooltip open={isMobile ? showNotesTooltip : undefined}>
                <TooltipTrigger asChild>
                  <button
                    className="shrink-0 flex items-center gap-1 bg-chart-4/20 text-chart-4 px-2 py-0.5 rounded border border-chart-4/40 hover:bg-chart-4/30 transition-colors"
                    onBlur={() => isMobile && setShowNotesTooltip(false)}
                    onClick={() =>
                      isMobile && setShowNotesTooltip(!showNotesTooltip)
                    }
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span className="text-xs font-bold">NOTE</span>
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

          {/* Right: External link */}
          <a
            className="shrink-0 text-muted-foreground/60 hover:text-primary transition-colors hover:scale-110"
            href={`https://studieinfo.liu.se/kurs/${course.id}`}
            rel="noopener noreferrer"
            target="_blank"
            title="View on LiU"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* COURSE NAME - Prominent, readable */}
        <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
          {course.name}
        </h3>

        {/* CRITICAL METADATA - Visual badges for instant recognition */}
        <div className="flex items-center flex-wrap gap-1.5">
          {/* Term Badge - Most critical for planning */}
          <Badge className="px-2.5 py-1 font-bold text-xs bg-primary/95 text-primary-foreground border-0 shadow-sm">
            T{isMultiTerm ? availableTerms.join(",") : course.term}
          </Badge>

          {/* Period Badge - Only for 100% courses */}
          {course.pace === "100%" && (
            <Badge className="px-2.5 py-1 font-bold text-xs bg-primary/85 text-primary-foreground border-0">
              P{course.period}
            </Badge>
          )}

          {/* Block Badge - Same color family for visual grouping */}
          <Badge className="px-2.5 py-1 font-bold text-xs bg-primary/75 text-primary-foreground border-0">
            B{formatBlocks(course.block)}
          </Badge>

          {/* Campus + Pace - Condensed info */}
          <div className="flex items-center gap-1.5 ml-auto text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="font-semibold">{course.campus.slice(0, 3)}</span>
            </div>
            {course.pace !== "100%" && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-semibold">{course.pace}</span>
              </div>
            )}
          </div>
        </div>

        {/* EXAMINATION TYPES - Subdued secondary info */}
        <div className="flex items-center gap-1 pt-0.5">
          <TruncatedExaminationBadges
            examinations={course.examination}
            maxVisible={5}
            shortMode={true}
          />
        </div>

        {/* SECONDARY INFO - Clear separation with subtle styling */}
        <div className="flex-1 min-h-0 pt-1 border-t border-border/20">
          {course.examinator && (
            <div className="text-[11px] text-muted-foreground/80 truncate">
              <span className="font-medium">Examiner:</span> <span className="font-normal">{course.examinator}</span>
            </div>
          )}
        </div>

        {/* ACTIONS - Clear, large touch targets */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
          <Button
            className={`h-9 text-xs font-bold transition-all duration-200 shadow-md ${
              isPinned
                ? isHovered
                  ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
                : wouldHaveConflicts
                  ? "bg-chart-4 hover:bg-chart-4/90 text-white border-2 border-chart-4/60"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-lg"
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
          >
            {isPinned ? (
              isHovered ? (
                <>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Remove
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Added
                </>
              )
            ) : wouldHaveConflicts ? (
              <>
                <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                Conflict
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add
              </>
            )}
          </Button>
          <Link className="w-full" href={`/course/${course.id}`}>
            <Button
              className="h-9 text-xs font-semibold bg-secondary/20 border-2 border-border/50 text-secondary-foreground hover:bg-secondary/30 hover:border-primary/30 transition-all w-full"
              size="sm"
              variant="ghost"
            >
              <Info className="h-3.5 w-3.5 mr-1.5" />
              Details
            </Button>
          </Link>
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
