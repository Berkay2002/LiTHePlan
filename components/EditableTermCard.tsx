// components/EditableTermCard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Course } from "@/types/course";
import { getLevelColor } from "@/lib/course-utils";
import { X, Trash2 } from "lucide-react";

interface EditableTermCardProps {
  termNumber: 7 | 8 | 9;
  courses: Course[];
  onRemoveCourse: (courseId: string) => void;
  onClearTerm: (term: 7 | 8 | 9) => void;
  className?: string;
}

export function EditableTermCard({ 
  termNumber, 
  courses, 
  onRemoveCourse, 
  onClearTerm, 
  className 
}: EditableTermCardProps) {
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  
  const getTermLabel = (term: number) => {
    switch (term) {
      case 7: return "Termin 7";
      case 8: return "Termin 8"; 
      case 9: return "Termin 9";
      default: return `Termin ${term}`;
    }
  };

  // Group courses by period - 50% courses appear in both periods
  const coursesByPeriod = {
    1: courses.filter(course => (Array.isArray(course.period) ? course.period.includes('1') : course.period === '1') || course.pace === '50%'),
    2: courses.filter(course => (Array.isArray(course.period) ? course.period.includes('2') : course.period === '2') || course.pace === '50%')
  };

  const getBlockBadgeColor = (blockNum: number) => {
    switch (blockNum) {
      case 1: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 2: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 3: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 4: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const renderBlockIndicators = (course: Course, currentPeriod: 1 | 2) => {
    const is50Percent = course.pace === '50%';
    let blocks: number[];
    
    if (is50Percent && Array.isArray(course.block)) {
      // For 50% courses: block[0] = period 1, block[1] = period 2
      blocks = [parseInt(course.block[currentPeriod - 1])];
    } else {
      blocks = Array.isArray(course.block) ? course.block.map(b => parseInt(b)) : [parseInt(course.block)];
    }
    
    return (
      <div className="flex items-center gap-1 mt-2">
        <span className="text-xs text-muted-foreground mr-1">Blocks:</span>
        {blocks.map((blockNum) => (
          <Badge
            key={blockNum}
            variant="secondary"
            className={`text-xs font-medium ${getBlockBadgeColor(blockNum)} ${is50Percent ? 'ring-2 ring-blue-300' : ''}`}
          >
            {blockNum}
          </Badge>
        ))}
        {is50Percent && (
          <Badge variant="outline" className="text-xs ml-1 bg-blue-50 text-blue-700 border-blue-300">
            Cross-period
          </Badge>
        )}
      </div>
    );
  };

  const renderPeriodBlockTimeline = (periodCourses: Course[], currentPeriod: 1 | 2) => {
    // Create a visual timeline showing which blocks are occupied for this specific period
    const blockOccupancy: { [key: number]: Array<{ course: Course; is50Percent: boolean }> } = { 1: [], 2: [], 3: [], 4: [] };
    
    periodCourses.forEach(course => {
      let blocks: number[];
      const is50Percent = course.pace === '50%';
      
      if (is50Percent && Array.isArray(course.block)) {
        // For 50% courses: use the block for the current period
        blocks = [parseInt(course.block[currentPeriod - 1])];
      } else {
        blocks = Array.isArray(course.block) ? course.block.map(b => parseInt(b)) : [parseInt(course.block)];
      }
      
      blocks.forEach(blockNum => {
        blockOccupancy[blockNum as keyof typeof blockOccupancy].push({
          course: course,
          is50Percent: is50Percent
        });
      });
    });

    return (
      <div className="mb-3 p-3 bg-muted/30 rounded-lg">
        <div className="text-xs text-muted-foreground mb-2 font-medium">Period {currentPeriod} Block Timeline:</div>
        <div className="grid grid-cols-4 gap-1">
          {[1, 2, 3, 4].map(blockNum => {
            const courses = blockOccupancy[blockNum as keyof typeof blockOccupancy];
            const hasConflict = courses.length > 1 && courses.some(c => !c.is50Percent);
            
            return (
              <div key={blockNum} className="text-center">
                <div className={`text-xs font-medium mb-1 ${hasConflict ? 'text-red-600' : 'text-muted-foreground'}`}>
                  B{blockNum}
                </div>
                <div 
                  className={`h-8 rounded border-2 border-dashed flex items-center justify-center text-xs ${
                    courses.length === 0 
                      ? 'border-gray-200 bg-gray-50' 
                      : hasConflict
                        ? 'border-red-300 bg-red-100 text-red-800'
                        : `border-opacity-50 ${getBlockBadgeColor(blockNum).replace('text-', 'border-').replace('bg-', 'border-')}`
                  }`}
                >
                  {courses.length > 0 && (
                    <div className="flex flex-col items-center">
                      <div className="font-medium">{courses.length}</div>
                      {hasConflict && <div className="text-xs">⚠️</div>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {Object.values(blockOccupancy).some(courses => 
          courses.length > 1 && courses.some(c => !c.is50Percent)
        ) && (
          <div className="text-xs text-red-600 mt-2 flex items-center">
            <span className="mr-1">⚠️</span>
            Potential scheduling conflicts detected in Period {currentPeriod}
          </div>
        )}
      </div>
    );
  };

  const handleClearTerm = () => {
    if (courses.length > 0 && confirm(`Are you sure you want to clear all courses from ${getTermLabel(termNumber)}?`)) {
      onClearTerm(termNumber);
    }
  };

  const renderEditableCoursesList = (periodCourses: Course[], currentPeriod: 1 | 2) => {
    if (periodCourses.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-xs">No courses</p>
        </div>
      );
    }

    return periodCourses.map((course) => (
      <div
        key={`${course.id}-period-${currentPeriod}`}
        className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm leading-tight truncate">
              {course.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {course.id} • {course.credits} hp
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveCourse(course.id)}
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive ml-2"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Enhanced Block Indicators */}
        {renderBlockIndicators(course, currentPeriod)}
        
        <div className="flex flex-wrap gap-1 mt-3">
          <Badge 
            variant="secondary" 
            className={`text-xs ${getLevelColor(course.level)}`}
          >
            {course.level === 'avancerad nivå' ? 'Advanced' : 'Basic'}
          </Badge>
          
          {course.campus && (
            <Badge variant="outline" className="text-xs">
              {course.campus}
            </Badge>
          )}
        </div>
      </div>
    ));
  };

  return (
    <Card className={`h-full bg-card border-border shadow-lg ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center justify-between text-card-foreground">
          {getTermLabel(termNumber)}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {totalCredits} hp
            </Badge>
            {courses.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearTerm}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {courses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No courses selected</p>
            <p className="text-xs mt-1">Add courses from the catalog</p>
          </div>
        ) : (
          <>
            {/* Period 1 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-muted-foreground">Period 1</h4>
                <Badge variant="outline" className="text-xs">
                  {coursesByPeriod[1]
                    .filter(course => (Array.isArray(course.period) ? course.period.includes('1') : course.period === '1') || course.pace === '50%')
                    .reduce((sum, course) => {
                      // For 50% courses, only count half the credits per period
                      return sum + (course.pace === '50%' ? course.credits / 2 : course.credits);
                    }, 0)} hp
                </Badge>
              </div>
              {coursesByPeriod[1].length > 0 && renderPeriodBlockTimeline(coursesByPeriod[1], 1)}
              <div className="space-y-3">
                {renderEditableCoursesList(coursesByPeriod[1], 1)}
              </div>
            </div>

            {/* Period 2 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-muted-foreground">Period 2</h4>
                <Badge variant="outline" className="text-xs">
                  {coursesByPeriod[2]
                    .filter(course => (Array.isArray(course.period) ? course.period.includes('2') : course.period === '2') || course.pace === '50%')
                    .reduce((sum, course) => {
                      // For 50% courses, only count half the credits per period
                      return sum + (course.pace === '50%' ? course.credits / 2 : course.credits);
                    }, 0)} hp
                </Badge>
              </div>
              {coursesByPeriod[2].length > 0 && renderPeriodBlockTimeline(coursesByPeriod[2], 2)}
              <div className="space-y-3">
                {renderEditableCoursesList(coursesByPeriod[2], 2)}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}