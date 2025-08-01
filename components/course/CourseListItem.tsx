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

interface CourseListItemProps {
  course: Course;
  activeFilters?: FilterState;
}

export function CourseListItem({ course, activeFilters = {
  level: [],
  term: [],
  period: [],
  block: [],
  pace: [],
  campus: [],
  examination: [],
  programs: "",
  search: ""
} }: CourseListItemProps) {
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

  // Helper function to filter examination badges - show only selected examination types when filter is active
  const getVisibleExaminations = (examinations: string[]) => {
    const selectedExaminations = activeFilters.examination || [];
    if (selectedExaminations.length === 0) return examinations;
    
    // Return examinations that ARE in the selected filters
    return examinations.filter(exam => selectedExaminations.includes(exam));
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
               <div className="flex-1 min-w-0">
                 <h3 className="text-sm font-semibold text-foreground group-hover:text-picton-blue transition-colors duration-300 leading-tight">
                   {course.name}
                 </h3>
               </div>
               
               {/* Right side: Examination badges and action buttons */}
               <div className="flex items-center gap-2 flex-shrink-0">
                 {/* Examination badges */}
                 <div className="flex flex-wrap gap-1">
                   {(() => {
                     const visibleExaminations = getVisibleExaminations(course.examination);
                     return visibleExaminations.slice(0, 2).map((exam, index) => (
                       <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5 bg-electric-blue/10 text-electric-blue-300 border border-electric-blue/20">
                         {exam}
                       </Badge>
                     ));
                   })()}
                   {(() => {
                     const visibleExaminations = getVisibleExaminations(course.examination);
                     return visibleExaminations.length > 2 && (
                       <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-electric-blue/10 text-electric-blue-300 border border-electric-blue/20">
                         +{visibleExaminations.length - 2}
                       </Badge>
                     );
                   })()}
                 </div>
                 
                 {/* Action Buttons */}
                 <div className="flex gap-1">
                   <Button 
                     size="sm" 
                     className={`h-7 px-2 text-xs font-medium transition-all duration-300 shadow-sm ${
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
                         <Trash2 className="h-3 w-3" />
                       ) : (
                         <Check className="h-3 w-3" />
                       )
                     ) : (
                       <Plus className="h-3 w-3" />
                     )}
                   </Button>
                   
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className="h-7 px-2 text-xs font-medium bg-air-superiority-blue/5 border-air-superiority-blue/30 text-air-superiority-blue hover:bg-air-superiority-blue/10 hover:border-air-superiority-blue/40 transition-all duration-300"
                     onClick={() => {
                       window.open(`https://studieinfo.liu.se/kurs/${course.id}`, '_blank', 'noopener,noreferrer');
                     }}
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
               
               {!shouldHideField('term') && (
                 <span className="text-picton-blue font-medium">
                   T{isMultiTerm ? availableTerms.join(',') : course.term}
                 </span>
               )}
               
               {shouldShowPeriod() && !shouldHideField('period') && (
                 <span className="text-air-superiority-blue font-medium">
                   P{course.period}
                 </span>
               )}
               
               {!shouldHideField('block') && (
                 <span className="text-electric-blue-300 font-medium">
                   B{formatBlocks(course.block)}
                 </span>
               )}
               
               {!shouldHideField('level') && (
                 <span className="text-battleship-gray font-medium">
                   {course.level === 'grundnivå' ? 'G' : 'A'}
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
                <h3 className="text-base font-semibold text-foreground line-clamp-2 mb-2 leading-tight group-hover:text-picton-blue transition-colors duration-300">
                  {course.name}
                </h3>
                <div className="text-sm text-air-superiority-blue font-mono font-bold mb-2">
                  {course.id}
                </div>
              </div>
              
              {/* Examination badges */}
              <div className="flex flex-wrap gap-1 ml-3">
                {(() => {
                  const visibleExaminations = getVisibleExaminations(course.examination);
                  return visibleExaminations.map((exam, index) => (
                    <Badge key={index} variant="secondary" className="text-xs px-2 py-1 bg-electric-blue/10 text-electric-blue-300 border border-electric-blue/20">
                      {exam}
                    </Badge>
                  ));
                })()}
              </div>
            </div>

            {/* Course Details in horizontal layout */}
            <div className="flex flex-wrap items-center gap-4 mb-3 text-sm">
              {!shouldHideField('term') && (
                <div className="flex items-center gap-1.5">
                  <span className="text-battleship-gray-400 font-medium">Term:</span>
                  <span className="text-picton-blue font-bold">
                    {isMultiTerm ? availableTerms.join(', ') : course.term}
                  </span>
                </div>
              )}
              
              {shouldShowPeriod() && !shouldHideField('period') && (
                <div className="flex items-center gap-1.5">
                  <span className="text-battleship-gray-400 font-medium">Period:</span>
                  <span className="text-air-superiority-blue font-bold">{course.period}</span>
                </div>
              )}
              
              {!shouldHideField('block') && (
                <div className="flex items-center gap-1.5">
                  <span className="text-battleship-gray-400 font-medium">
                    {Array.isArray(course.block) ? 'Blocks:' : 'Block:'}
                  </span>
                  <span className="text-electric-blue-300 font-bold">{formatBlocks(course.block)}</span>
                </div>
              )}
              
              {!shouldHideField('level') && (
                <div className="flex items-center gap-1.5">
                  <span className="text-battleship-gray-400 font-medium">Level:</span>
                  <span className="text-battleship-gray font-bold">
                    {course.level === 'grundnivå' ? 'G' : 'A'}
                  </span>
                </div>
              )}
            </div>

            {/* Campus, Pace, and Programs */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {!shouldHideField('campus') && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-air-superiority-blue" />
                  <span className="text-air-superiority-blue-300 font-medium">{course.campus}</span>
                </div>
              )}
              
              {!shouldHideField('pace') && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-battleship-gray" />
                  <span className="text-battleship-gray-300 font-medium">{formatPace(course.pace)}</span>
                </div>
              )}
              
              {/* Programs */}
              {course.programs.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {course.programs.slice(0, 2).map((program, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-2 py-1 bg-picton-blue/10 text-picton-blue border-picton-blue/30">
                      {program}
                    </Badge>
                  ))}
                  {course.programs.length > 2 && (
                    <div className="relative">
                      <Badge variant="outline" className="text-xs px-2 py-1 bg-picton-blue/10 text-picton-blue border-picton-blue/30 cursor-help hover:bg-picton-blue/20 transition-colors peer">
                        +{course.programs.length - 2} more
                      </Badge>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 peer-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {course.programs.slice(2).join(', ')}
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right section - Action Buttons */}
          <div className="flex flex-col gap-2 ml-4">
            <Button 
              size="sm" 
              className={`h-8 text-xs font-medium transition-all duration-300 shadow-md ${
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
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Added
                  </>
                )
              ) : (
                <>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs font-medium bg-air-superiority-blue/5 border-air-superiority-blue/30 text-air-superiority-blue hover:bg-air-superiority-blue/10 hover:border-air-superiority-blue/40 transition-all duration-300"
              onClick={() => {
                window.open(`https://studieinfo.liu.se/kurs/${course.id}`, '_blank', 'noopener,noreferrer');
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View
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