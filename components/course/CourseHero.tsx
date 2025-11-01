import type { Course } from "@/types/course";
import { Badge } from "@/components/ui/badge";
import { getLevelColor, getCampusColor } from "@/lib/course-utils";

interface CourseHeroProps {
  course: Course;
  children?: React.ReactNode;
}

export function CourseHero({ course, children }: CourseHeroProps) {
  return (
    <div className="mb-8 p-8 rounded-xl bg-card border border-border shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
        <div className="flex-1">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-foreground leading-tight">{course.name}</h1>
          <p className="text-2xl font-mono font-semibold text-muted-foreground">{course.id}</p>
        </div>
        
        {children && (
          <div className="sm:shrink-0 sm:pt-2">
            {children}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2.5">
        <Badge variant="secondary" className={`${getLevelColor(course.level)} px-3 py-1.5 text-sm font-medium`}>
          {course.level}
        </Badge>
        <Badge variant="secondary" className={`${getCampusColor(course.campus)} px-3 py-1.5 text-sm font-medium`}>
          {course.campus}
        </Badge>
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 text-sm font-medium">
          {course.credits}hp
        </Badge>
        <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground px-3 py-1.5 text-sm font-medium">
          {course.pace}
        </Badge>
        {Array.isArray(course.term) && course.term.map((term) => (
          <Badge key={term} variant="secondary" className="bg-accent/15 text-accent-foreground border-accent/25 px-3 py-1.5 text-sm font-medium">
            Term {term}
          </Badge>
        ))}
      </div>
    </div>
  );
}
