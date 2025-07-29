import { Course } from "@/types/course";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MapPin, Clock, Plus, ExternalLink } from "lucide-react";
import { getLevelColor, getCampusColor, formatPace } from "@/lib/course-utils";
import { useState } from "react";

import { FilterState } from "./FilterPanel";

interface CourseCardProps {
  course: Course;
  activeFilters?: FilterState;
}

export function CourseCard({ course, activeFilters = {} }: CourseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper function to check if a field should be hidden based on active filters
  const shouldHideField = (fieldName: keyof typeof activeFilters, fieldValue: string | string[]) => {
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

  // Helper function to filter examination badges - only show non-selected examination types
  const getVisibleExaminations = (examinations: string[]) => {
    const selectedExaminations = activeFilters.examination || [];
    if (selectedExaminations.length === 0) return examinations;
    
    // Return examinations that are NOT in the selected filters
    return examinations.filter(exam => !selectedExaminations.includes(exam));
  };

  return (
    <Card className="group h-full flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border border-border/60 bg-card hover:border-primary/30">
      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Main Course Header */}
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-foreground line-clamp-2 mb-3 leading-tight group-hover:text-primary transition-colors">
            {course.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-base text-muted-foreground font-mono">
              {course.id}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(() => {
                const visibleExaminations = getVisibleExaminations(course.examination);
                return visibleExaminations.map((exam, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1 bg-muted/60 text-muted-foreground hover:bg-muted/80 transition-colors">
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
            !shouldHideField('term', course.term),
            shouldShowPeriod() && !shouldHideField('period', course.period), 
            !shouldHideField('block', Array.isArray(course.block) ? course.block : [course.block]),
            !shouldHideField('level', course.level)
          ].filter(Boolean).length}, minmax(0, 1fr))`
        }}>
          {!shouldHideField('term', course.term) && (
            <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1">Term</div>
              <div className="text-base font-bold text-primary">{course.term}</div>
            </div>
          )}
          {shouldShowPeriod() && !shouldHideField('period', course.period) && (
            <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1">Period</div>
              <div className="text-base font-bold text-primary">{course.period}</div>
            </div>
          )}
          {!shouldHideField('block', Array.isArray(course.block) ? course.block : [course.block]) && (
            <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1">
                {Array.isArray(course.block) ? 'Blocks' : 'Block'}
              </div>
              <div className="text-base font-bold text-primary">{formatBlocks(course.block)}</div>
            </div>
          )}
          {!shouldHideField('level', course.level) && (
            <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1">Level</div>
              <div className="text-sm font-bold text-primary">
                {course.level === 'grundnivå' ? 'G' : 'A'}
              </div>
            </div>
          )}
        </div>

        {/* Secondary Information */}
        <div className="space-y-3 flex-1">
          <div className="p-3 bg-muted/30 rounded-lg space-y-3">
            {/* Campus and Pace - only show if not filtered to single values */}
            {(!shouldHideField('campus', course.campus) || !shouldHideField('pace', course.pace)) && (
              <div className="flex items-center justify-between">
                {!shouldHideField('campus', course.campus) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span className="text-base font-medium text-foreground">{course.campus}</span>
                  </div>
                )}
                {!shouldHideField('pace', course.pace) && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-base font-medium text-foreground">{formatPace(course.pace)}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Programs */}
            {course.programs.length > 0 && (
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {course.programs.map((program, index) => (
                    <Badge key={index} variant="outline" className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 transition-colors">
                      {program}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-border/40 pt-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              size="default" 
              className="h-10 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              onClick={() => {
                console.log('Add to profile:', course.id);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Profile
            </Button>
            <Button 
              variant="outline" 
              size="default" 
              className="h-10 text-base font-medium hover:bg-muted/50 border-border/60 transition-colors"
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
    </Card>
  );
} 