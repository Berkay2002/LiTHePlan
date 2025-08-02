// components/SimpleTermCard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/types/course";
import { getLevelColor } from "@/lib/course-utils";

interface SimpleTermCardProps {
  termNumber: 7 | 8 | 9;
  courses: Course[];
  className?: string;
}

export function SimpleTermCard({ termNumber, courses, className }: SimpleTermCardProps) {
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
    1: courses.filter(course => course.period.includes('1') || course.pace === '50%'),
    2: courses.filter(course => course.period.includes('2') || course.pace === '50%')
  };

  const renderCoursesList = (periodCourses: Course[]) => {
    if (periodCourses.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-xs">No courses</p>
        </div>
      );
    }

    return periodCourses.map((course) => (
      <div
        key={course.id}
        className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
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
        </div>
        
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
          
          {course.pace === '50%' && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
              Cross-period
            </Badge>
          )}
        </div>
      </div>
    ));
  };

  return (
    <Card className={`h-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          {getTermLabel(termNumber)}
          <Badge variant="secondary" className="text-xs">
            {totalCredits} hp
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {courses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No courses selected</p>
          </div>
        ) : (
          <>
            {/* Period 1 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-muted-foreground">Period 1</h4>
                <Badge variant="outline" className="text-xs">
                  {coursesByPeriod[1]
                    .filter(course => course.period.includes('1') || course.pace === '50%')
                    .reduce((sum, course) => {
                      // For 50% courses, only count half the credits per period
                      return sum + (course.pace === '50%' ? course.credits / 2 : course.credits);
                    }, 0)} hp
                </Badge>
              </div>
              <div className="space-y-3">
                {renderCoursesList(coursesByPeriod[1])}
              </div>
            </div>

            {/* Period 2 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-muted-foreground">Period 2</h4>
                <Badge variant="outline" className="text-xs">
                  {coursesByPeriod[2]
                    .filter(course => course.period.includes('2') || course.pace === '50%')
                    .reduce((sum, course) => {
                      // For 50% courses, only count half the credits per period
                      return sum + (course.pace === '50%' ? course.credits / 2 : course.credits);
                    }, 0)} hp
                </Badge>
              </div>
              <div className="space-y-3">
                {renderCoursesList(coursesByPeriod[2])}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}