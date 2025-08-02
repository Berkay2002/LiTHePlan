// components/profile/PinnedCourseCard.tsx

import { Course } from '@/types/course';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink, Clock, MapPin } from 'lucide-react';
import { formatBlocks } from '@/lib/course-utils';

interface PinnedCourseCardProps {
  course: Course;
  onRemove: (courseId: string) => void;
  term: 7 | 8 | 9;
  readOnly?: boolean;
}

export function PinnedCourseCard({ course, onRemove, term, readOnly = false }: PinnedCourseCardProps) {
  const formatPace = (pace: string) => {
    return pace === '100%' ? 'Full-time' : 'Part-time';
  };

  return (
    <Card className="w-full bg-card border-border/60 hover:border-border transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-foreground line-clamp-2 leading-tight">
              {course.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {course.id} • {course.credits}hp
            </p>
          </div>
                     {!readOnly && (
             <Button
               variant="ghost"
               size="sm"
               onClick={() => onRemove(course.id)}
               className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
               aria-label="Remove course from profile"
             >
               <X className="h-4 w-4" />
             </Button>
           )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Course Level Badge */}
        <div className="flex items-center gap-2">
          <Badge 
            variant={course.level === 'avancerad nivå' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {course.level === 'avancerad nivå' ? 'Advanced' : 'Basic'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Term {course.term}
          </Badge>
        </div>

        {/* Course Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatPace(course.pace)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{course.campus}</span>
          </div>
        </div>

        {/* Period and Block Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Period {course.period}</span>
          <span>•</span>
          <span>Block {formatBlocks(course.block)}</span>
        </div>

        {/* Programs */}
        {course.programs.length > 0 && (
          <div className="flex flex-wrap gap-1">
                      {course.programs.slice(0, 2).map((program, index) => (
            <Badge key={`${program}-${index}`} variant="outline" className="text-xs px-2 py-0.5">
              {program}
            </Badge>
          ))}
            {course.programs.length > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{course.programs.length - 2} more
              </Badge>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs"
          onClick={() => {
            window.open(`https://studieinfo.liu.se/kurs/${course.id}`, '_blank', 'noopener,noreferrer');
          }}
        >
          <ExternalLink className="h-3 w-3 mr-1.5" />
          View Course
        </Button>
      </CardContent>
    </Card>
  );
} 