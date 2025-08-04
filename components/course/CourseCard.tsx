import { useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Course } from "@/types/course";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Clock, Plus, ExternalLink, Check, Trash2, AlertTriangle } from "lucide-react";
import { formatPace, isMultiTermCourse, getAvailableTerms, formatBlocks } from "@/lib/course-utils";
import { useProfile } from "@/components/profile/ProfileContext";
import { TermSelectionModal } from "./TermSelectionModal";
import { ConflictResolutionModal } from "./ConflictResolutionModal";
import { isCourseInProfile } from "@/lib/profile-utils";
import { findCourseConflicts } from "@/lib/course-conflict-utils";


interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const { state, addCourse, removeCourse } = useProfile();
  const isPinned = state.current_profile ? isCourseInProfile(state.current_profile, course.id) : false;
  const [isHovered, setIsHovered] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [, setPendingTerm] = useState<7 | 8 | 9 | null>(null);
  const [conflictingCourses, setConflictingCourses] = useState<{ conflictingCourse: Course; conflictingCourseId: string }[]>([]);
  const [showNotesTooltip, setShowNotesTooltip] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Check if this course is available in multiple terms
  const isMultiTerm = isMultiTermCourse(course);
  const availableTerms = getAvailableTerms(course);
  
  // Check if adding this course would cause conflicts
  const wouldHaveConflicts = state.current_profile ? findCourseConflicts(course, state.current_profile).length > 0 : false;

  // Helper function to check if a field should be hidden
  const shouldHideField = () => {
    // Never hide any fields - always show course information
    return false;
  };

  // Helper function to determine if period should be shown (not for 50% courses)
  const shouldShowPeriod = () => {
    return course.pace === '100%';
  };

  // This function is no longer used since we always check conflicts first

  // Handle adding course - always check conflicts first, then handle term selection
  const handleAddCourse = () => {
    console.log('🎯 handleAddCourse clicked for course:', course.id);
    console.log('🔄 isMultiTerm:', isMultiTerm, 'availableTerms:', availableTerms);
    
    // Always check conflicts first, regardless of term count
    const conflicts = state.current_profile ? findCourseConflicts(course, state.current_profile) : [];
    
    if (conflicts.length > 0) {
      // Show conflict modal first
      console.log('⚠️ Conflicts detected, showing conflict modal first');
      setConflictingCourses(conflicts);
      setPendingTerm(null); // Will be set after conflict resolution
      setShowConflictModal(true);
      return;
    }
    
    // No conflicts, proceed with term selection or direct add
    if (isMultiTerm && availableTerms.length > 1) {
      console.log('📋 No conflicts, showing term selection modal');
      setShowTermModal(true);
    } else {
      // Single term course - add directly
      const termToAdd = Array.isArray(course.term) ? course.term[0] : course.term;
      const parsedTerm = parseInt(termToAdd);
      console.log('➕ No conflicts, adding directly - termToAdd:', termToAdd, 'parsedTerm:', parsedTerm);
      
      if (!isNaN(parsedTerm) && [7, 8, 9].includes(parsedTerm)) {
        console.log('✅ Adding course with:', { course: course.id, term: parsedTerm });
        addCourse(course, parsedTerm as 7 | 8 | 9);
      } else {
        console.error('❌ Invalid term for course:', { courseId: course.id, termToAdd, parsedTerm });
      }
    }
  };

  // Handle term selection from modal (conflicts already checked)
  const handleTermSelected = async (selectedCourse: Course, selectedTerm: 7 | 8 | 9) => {
    console.log('🔄 Term selected:', selectedTerm, 'for course:', selectedCourse.id);
    setShowTermModal(false);
    
    // Add course directly since conflicts were already checked
    console.log('✅ Adding course with selected term (conflicts pre-checked)');
    await addCourse(selectedCourse, selectedTerm);
  };

  // Handle conflict resolution - user chooses new course
  const handleChooseNewCourse = async (newCourse: Course) => {
    console.log('✅ User chose new course:', newCourse.id);
    setShowConflictModal(false);
    
    // Remove conflicting courses first
    for (const { conflictingCourseId } of conflictingCourses) {
      console.log('🗑️ Removing conflicting course:', conflictingCourseId);
      removeCourse(conflictingCourseId);
    }
    
    // Now handle term selection for the new course
    if (isMultiTerm && availableTerms.length > 1) {
      console.log('📋 Showing term selection for new course after conflict resolution');
      setShowTermModal(true);
    } else {
      const termToAdd = Array.isArray(newCourse.term) ? newCourse.term[0] : newCourse.term;
      const parsedTerm = parseInt(termToAdd) as 7 | 8 | 9;
      console.log('➕ Adding new course with default term:', parsedTerm);
      await addCourse(newCourse, parsedTerm);
    }
    
    // Reset state
    setConflictingCourses([]);
    setPendingTerm(null);
  };

  // Handle conflict resolution - user chooses existing course
  const handleChooseExistingCourse = (existingCourse: Course) => {
    console.log('📚 User chose to keep existing course:', existingCourse.id);
    setShowConflictModal(false);
    setConflictingCourses([]);
    setPendingTerm(null);
    // No action needed - existing course stays in profile
  };

  // Handle conflict resolution - user cancels
  const handleCancelConflictResolution = () => {
    console.log('❌ User cancelled conflict resolution');
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
    <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 border-air-superiority-blue/20 bg-card hover:border-picton-blue/40 hover:shadow-picton-blue/10">
      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Main Course Header */}
        <div className="mb-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-picton-blue transition-colors duration-300 flex-1">
              {course.name}
            </h3>
            {course.notes && (
              <Tooltip open={isMobile ? showNotesTooltip : undefined}>
                <TooltipTrigger asChild>
                  <button
                    className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-md border border-amber-200 ml-2 flex-shrink-0 hover:bg-amber-200 transition-colors cursor-pointer"
                    onClick={() => isMobile && setShowNotesTooltip(!showNotesTooltip)}
                    onBlur={() => isMobile && setShowNotesTooltip(false)}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs font-bold">OBS</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="max-w-xs bg-gray-900 text-white border-gray-700"
                  onPointerDownOutside={() => isMobile && setShowNotesTooltip(false)}
                >
                  <p className="text-xs text-white">{course.notes}</p>
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
                const visibleExaminations = getVisibleExaminations(course.examination);
                return visibleExaminations.map((exam, index) => (
                  <Badge key={`${exam}-${index}`} variant="secondary" className="text-xs px-3 py-1 bg-electric-blue/10 text-electric-blue-300 border border-electric-blue/20 hover:bg-electric-blue/20 transition-all duration-200">
                    {exam}
                  </Badge>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Key Information Grid */}
        <div className="grid gap-3 mb-4" style={{
          gridTemplateColumns: `repeat(${Math.max(1, [
            !shouldHideField(),
            shouldShowPeriod() && !shouldHideField(), 
            !shouldHideField(),
            !shouldHideField()
          ].filter(Boolean).length)}, minmax(0, 1fr))`
        }}>
          {!shouldHideField() && (
            <div className="text-center p-3 bg-picton-blue/10 rounded-lg border border-picton-blue/20 hover:border-picton-blue/30 transition-colors duration-200">
              <div className="text-xs text-battleship-gray-400 uppercase tracking-wide font-medium mb-1">Term</div>
              <div className="text-sm font-bold text-picton-blue">
                {isMultiTerm ? availableTerms.join(', ') : course.term}
              </div>
            </div>
          )}
          {shouldShowPeriod() && !shouldHideField() && (
            <div className="text-center p-3 bg-air-superiority-blue/10 rounded-lg border border-air-superiority-blue/20 hover:border-air-superiority-blue/30 transition-colors duration-200">
              <div className="text-xs text-battleship-gray-400 uppercase tracking-wide font-medium mb-1">Period</div>
              <div className="text-sm font-bold text-air-superiority-blue">{course.period}</div>
            </div>
          )}
          {!shouldHideField() && (
            <div className="text-center p-3 bg-electric-blue/10 rounded-lg border border-electric-blue/20 hover:border-electric-blue/30 transition-colors duration-200">
              <div className="text-xs text-battleship-gray-400 uppercase tracking-wide font-medium mb-1">
                {Array.isArray(course.block) ? 'Blocks' : 'Block'}
              </div>
              <div className="text-sm font-bold text-electric-blue-300">{formatBlocks(course.block)}</div>
            </div>
          )}
          {!shouldHideField() && (
            <div className="text-center p-3 bg-battleship-gray/10 rounded-lg border border-battleship-gray/20 hover:border-battleship-gray/30 transition-colors duration-200">
              <div className="text-xs text-battleship-gray-400 uppercase tracking-wide font-medium mb-1">Level</div>
              <div className="text-xs font-bold text-battleship-gray">
                {course.level === 'grundnivå' ? 'G' : 'A'}
              </div>
            </div>
          )}
        </div>

        {/* Secondary Information */}
        <div className="space-y-3 flex-1">
          <div className="p-4 bg-air-superiority-blue/8 rounded-lg border border-air-superiority-blue/10 space-y-3">
            {/* Campus and Pace - only show if not filtered to single values */}
            {(!shouldHideField() || !shouldHideField()) && (
              <div className="flex items-center justify-between">
                {!shouldHideField() && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-air-superiority-blue" />
                    <span className="text-sm font-medium text-air-superiority-blue-300">{course.campus}</span>
                  </div>
                )}
                {!shouldHideField() && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-battleship-gray" />
                    <span className="text-sm font-medium text-battleship-gray-300">{formatPace(course.pace)}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Programs */}
            {course.programs.length > 0 && (
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {course.programs.map((program, index) => (
                    <Badge key={`${program}-${index}`} variant="outline" className="text-xs px-3 py-1 bg-picton-blue/10 text-picton-blue border-picton-blue/30 hover:bg-picton-blue/20 hover:border-picton-blue/40 transition-all duration-200">
                      {program}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-air-superiority-blue/20 pt-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              size="default" 
              className={`h-10 text-sm font-medium transition-all duration-300 shadow-lg ${
                isPinned 
                  ? isHovered
                    ? 'bg-custom-red hover:bg-custom-red-600 text-white'
                    : 'bg-electric-blue hover:bg-electric-blue-600 text-white'
                  : wouldHaveConflicts
                    ? 'bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-400'
                    : 'bg-picton-blue hover:bg-picton-blue-600 text-white'
              }`}
              onClick={() => {
                console.log('🖱️ Button clicked for course:', course.id, { isPinned, isHovered });
                if (isPinned && isHovered) {
                  console.log('🗑️ Removing course');
                  removeCourse(course.id);
                } else if (!isPinned) {
                  console.log('➕ Adding course via handleAddCourse');
                  handleAddCourse();
                } else {
                  console.log('⚠️ No action taken - button click ignored');
                }
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
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
              variant="outline" 
              size="default" 
              className="h-10 text-sm font-medium bg-air-superiority-blue/5 border-air-superiority-blue/30 text-air-superiority-blue hover:bg-air-superiority-blue/10 hover:border-air-superiority-blue/40 transition-all duration-300"
              onClick={() => {
                window.open(`https://studieinfo.liu.se/kurs/${course.id}`, '_blank', 'noopener,noreferrer');
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Course
            </Button>
          </div>
        </div>
      </CardContent>
      
      {/* Term Selection Modal */}
      <TermSelectionModal
        isOpen={showTermModal}
        onClose={() => setShowTermModal(false)}
        course={course}
        availableTerms={availableTerms}
        onTermSelected={handleTermSelected}
      />
      
      {/* Conflict Resolution Modal */}
      <ConflictResolutionModal
        isOpen={showConflictModal}
        onClose={() => setShowConflictModal(false)}
        newCourse={course}
        conflictingCourses={conflictingCourses}
        onChooseNew={handleChooseNewCourse}
        onChooseExisting={handleChooseExistingCourse}
        onCancel={handleCancelConflictResolution}
      />
    </Card>
  );
} 