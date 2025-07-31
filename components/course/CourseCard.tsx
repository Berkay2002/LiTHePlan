import { useState } from "react";
import { Course } from "@/types/course";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Plus, ExternalLink, Check, Trash2 } from "lucide-react";
import { formatPace, isMultiTermCourse, getAvailableTerms } from "@/lib/course-utils";
import { useProfile } from "@/components/profile/ProfileContext";
import { TermSelectionModal } from "./TermSelectionModal";
import { isCourseInProfile } from "@/lib/profile-utils";

import { FilterState } from "./FilterPanel";

interface CourseCardProps {
  course: Course;
  activeFilters?: FilterState;
}

export function CourseCard({ course, activeFilters = {
  level: [],
  term: [],
  period: [],
  block: [],
  pace: [],
  campus: [],
  examination: [],
  programs: "",
  search: ""
} }: CourseCardProps) {
  const { state, addCourse, removeCourse } = useProfile();
  const isPinned = state.current_profile ? isCourseInProfile(state.current_profile, course.id) : false;
  const [isHovered, setIsHovered] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);
  
  // Check if this course is available in multiple terms
  const isMultiTerm = isMultiTermCourse(course);
  const availableTerms = getAvailableTerms(course);

  // Helper function to check if a field should be hidden based on active filters
  const shouldHideField = (fieldName: keyof typeof activeFilters) => {
    const filterValues = activeFilters[fieldName];
    if (!filterValues || filterValues.length === 0) return false;
    
    // Special handling for examination and programs - never hide these sections
    if (fieldName === 'examination' || fieldName === 'programs') return false;
    
    // If only one filter value is selected, hide the field
    if (filterValues.length === 1) return true;
    
    // If multiple values selected, show the field to distinguish between options
    return false;
  };

  // Helper function to format block display
  const formatBlocks = (block: number | [number, number]) => {
    if (Array.isArray(block)) {
      return `${block[0]} & ${block[1]}`;
    }
    return block.toString();
  };

  // Helper function to determine if period should be shown (not for 50% courses)
  const shouldShowPeriod = () => {
    return course.pace === '100%';
  };

  // Handle adding course - show modal if multi-term, otherwise add directly
  const handleAddCourse = () => {
    if (isMultiTerm && availableTerms.length > 1) {
      setShowTermModal(true);
    } else {
      // Single term course - add directly with the available term
      const termToAdd = Array.isArray(course.term) ? course.term[0] : course.term;
      addCourse(course, termToAdd);
    }
  };

  // Handle term selection from modal
  const handleTermSelected = (selectedCourse: Course, selectedTerm: 7 | 8 | 9) => {
    addCourse(selectedCourse, selectedTerm);
    setShowTermModal(false);
  };

  // Helper function to filter examination badges - only show non-selected examination types
  const getVisibleExaminations = (examinations: string[]) => {
    const selectedExaminations = activeFilters.examination || [];
    if (selectedExaminations.length === 0) return examinations;
    
    // Return examinations that are NOT in the selected filters
    return examinations.filter(exam => !selectedExaminations.includes(exam));
  };

  return (
    <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 border-air-superiority-blue/20 bg-card hover:border-picton-blue/40 hover:shadow-picton-blue/10">
      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Main Course Header */}
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-foreground line-clamp-2 mb-3 leading-tight group-hover:text-picton-blue transition-colors duration-300">
            {course.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-base text-air-superiority-blue font-mono font-bold">
              {course.id}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(() => {
                const visibleExaminations = getVisibleExaminations(course.examination);
                return visibleExaminations.map((exam, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1 bg-electric-blue/10 text-electric-blue-300 border border-electric-blue/20 hover:bg-electric-blue/20 transition-all duration-200">
                    {exam}
                  </Badge>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Key Information Grid */}
        <div className="grid gap-3 mb-4" style={{
          gridTemplateColumns: `repeat(${[
            !shouldHideField('term'),
            shouldShowPeriod() && !shouldHideField('period'), 
            !shouldHideField('block'),
            !shouldHideField('level')
          ].filter(Boolean).length}, minmax(0, 1fr))`
        }}>
          {!shouldHideField('term') && (
            <div className="text-center p-3 bg-picton-blue/10 rounded-lg border border-picton-blue/20 hover:border-picton-blue/30 transition-colors duration-200">
              <div className="text-sm text-battleship-gray-400 uppercase tracking-wide font-medium mb-1">Term</div>
              <div className="text-base font-bold text-picton-blue">
                {isMultiTerm ? availableTerms.join(', ') : course.term}
              </div>
            </div>
          )}
          {shouldShowPeriod() && !shouldHideField('period') && (
            <div className="text-center p-3 bg-air-superiority-blue/10 rounded-lg border border-air-superiority-blue/20 hover:border-air-superiority-blue/30 transition-colors duration-200">
              <div className="text-sm text-battleship-gray-400 uppercase tracking-wide font-medium mb-1">Period</div>
              <div className="text-base font-bold text-air-superiority-blue">{course.period}</div>
            </div>
          )}
          {!shouldHideField('block') && (
            <div className="text-center p-3 bg-electric-blue/10 rounded-lg border border-electric-blue/20 hover:border-electric-blue/30 transition-colors duration-200">
              <div className="text-sm text-battleship-gray-400 uppercase tracking-wide font-medium mb-1">
                {Array.isArray(course.block) ? 'Blocks' : 'Block'}
              </div>
              <div className="text-base font-bold text-electric-blue-300">{formatBlocks(course.block)}</div>
            </div>
          )}
          {!shouldHideField('level') && (
            <div className="text-center p-3 bg-battleship-gray/10 rounded-lg border border-battleship-gray/20 hover:border-battleship-gray/30 transition-colors duration-200">
              <div className="text-sm text-battleship-gray-400 uppercase tracking-wide font-medium mb-1">Level</div>
              <div className="text-sm font-bold text-battleship-gray">
                {course.level === 'grundnivå' ? 'G' : 'A'}
              </div>
            </div>
          )}
        </div>

        {/* Secondary Information */}
        <div className="space-y-3 flex-1">
          <div className="p-4 bg-air-superiority-blue/8 rounded-lg border border-air-superiority-blue/10 space-y-3">
            {/* Campus and Pace - only show if not filtered to single values */}
            {(!shouldHideField('campus') || !shouldHideField('pace')) && (
              <div className="flex items-center justify-between">
                {!shouldHideField('campus') && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-air-superiority-blue" />
                    <span className="text-base font-medium text-air-superiority-blue-300">{course.campus}</span>
                  </div>
                )}
                {!shouldHideField('pace') && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-battleship-gray" />
                    <span className="text-base font-medium text-battleship-gray-300">{formatPace(course.pace)}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Programs */}
            {course.programs.length > 0 && (
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {course.programs.map((program, index) => (
                    <Badge key={index} variant="outline" className="text-sm px-3 py-1 bg-picton-blue/10 text-picton-blue border-picton-blue/30 hover:bg-picton-blue/20 hover:border-picton-blue/40 transition-all duration-200">
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
              className={`h-10 text-base font-medium transition-all duration-300 shadow-lg ${
                isPinned 
                  ? isHovered
                    ? 'bg-custom-red hover:bg-custom-red-600 text-white'
                    : 'bg-electric-blue hover:bg-electric-blue-600 text-white'
                  : 'bg-picton-blue hover:bg-picton-blue-600 text-white'
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
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Added
                  </>
                )
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
              className="h-10 text-base font-medium bg-air-superiority-blue/5 border-air-superiority-blue/30 text-air-superiority-blue hover:bg-air-superiority-blue/10 hover:border-air-superiority-blue/40 transition-all duration-300"
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
    </Card>
  );
} 