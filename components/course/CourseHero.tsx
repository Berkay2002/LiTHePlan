import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types/course";

interface CourseHeroProps {
  course: Course;
  children?: React.ReactNode;
}

export function CourseHero({ course, children }: CourseHeroProps) {
  return (
    <div className="mb-8 p-8 rounded-xl bg-background border border-border shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
        <div className="flex-1">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-foreground leading-tight">
            {course.name}
          </h1>
          <p className="text-2xl font-mono font-semibold text-primary">
            {course.id}
          </p>
        </div>

        {children && <div className="sm:shrink-0 sm:pt-2">{children}</div>}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2.5">
        <Badge
          className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 hover:border-primary/30 transition-all duration-200 px-3 py-1.5 text-sm font-medium"
          variant="secondary"
        >
          {course.level}
        </Badge>
        <Badge
          className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 hover:border-primary/30 transition-all duration-200 px-3 py-1.5 text-sm font-medium"
          variant="secondary"
        >
          {course.campus}
        </Badge>
        <Badge
          className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 hover:border-primary/30 transition-all duration-200 px-3 py-1.5 text-sm font-medium"
          variant="secondary"
        >
          {course.credits}hp
        </Badge>
        <Badge
          className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 hover:border-primary/30 transition-all duration-200 px-3 py-1.5 text-sm font-medium"
          variant="secondary"
        >
          {typeof course.pace === "number"
            ? `${course.pace * 100}%`
            : course.pace}
        </Badge>
        {Array.isArray(course.term) &&
          course.term.map((term) => (
            <Badge
              className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 hover:border-primary/30 transition-all duration-200 px-3 py-1.5 text-sm font-medium"
              key={term}
              variant="secondary"
            >
              Term {term}
            </Badge>
          ))}
      </div>
    </div>
  );
}
